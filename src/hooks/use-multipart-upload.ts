import { useCallback, useEffect, useRef, useState } from "react";
import { getUploadSessionAPI } from "@/api/upload";
import {
  abortMultipartUpload,
  S3RequestError,
  uploadMultipartToS3,
} from "@/third_party/s3";
import type {
  MultipartUploadProgress,
  S3UploadedObject,
  S3UploadSession,
} from "@/third_party/s3";
import {
  findLatestMultipartUploadRecord,
  loadMultipartUploadRecord,
  removeMultipartUploadRecord,
  saveMultipartUploadRecord,
} from "@/utils/upload-storage";
import { useUserStore } from "@/store/user";

export type MultipartUploadStatus =
  | "idle"
  | "session"
  | "preparing"
  | "uploading"
  | "paused"
  | "retrying"
  | "completing"
  | "cancelling"
  | "cancelled"
  | "done"
  | "error";

const EMPTY_PROGRESS: MultipartUploadProgress = {
  loadedBytes: 0,
  totalBytes: 0,
  progress: 0,
  completedParts: 0,
  totalParts: 0,
};

type UploadSessionResult =
  | { exists: true; object: S3UploadedObject }
  | { exists: false; session: S3UploadSession };

async function getSession(uid: number, vgroup: string): Promise<UploadSessionResult> {
  const response = await getUploadSessionAPI({ uid, vgroup });
  const { data } = response;
  if (data.exists) {
    return {
      exists: true,
      object: { bucket: data.bucket, path: data.path, vgroup },
    };
  }
  return {
    exists: false,
    session: {
      accessKey: data.access_key,
      secretKey: data.secret_key,
      token: data.token,
      bucket: data.bucket,
      path: data.path,
      vgroup,
    },
  };
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isCredentialError(error: unknown) {
  return (
    error instanceof S3RequestError &&
    (error.status === 401 ||
      error.status === 403 ||
      error.code === "ExpiredToken" ||
      error.code === "InvalidToken" ||
      error.code === "RequestExpired")
  );
}

export function useMultipartUpload() {
  const uid = useUserStore((state) => state.user?.uid);
  const [status, setStatus] = useState<MultipartUploadStatus>("idle");
  const [progress, setProgress] = useState<MultipartUploadProgress>(EMPTY_PROGRESS);
  const [uploadedObject, setUploadedObject] = useState<S3UploadedObject | null>(null);
  const [isInstantUpload, setIsInstantUpload] = useState(false);
  const [error, setError] = useState("");
  const [hasResumeRecord, setHasResumeRecord] = useState(() => Boolean(findLatestMultipartUploadRecord()));
  const fileRef = useRef<File | null>(null);
  const vgroupRef = useRef("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const intentRef = useRef<"none" | "pause" | "cancel">("none");

  const execute = useCallback(async (file: File, vgroup: string) => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    intentRef.current = "none";
    setError("");

    try {
      if (!uid) throw new Error("用户信息无效，请重新登录后再上传");

      for (let credentialAttempt = 0; credentialAttempt < 2; credentialAttempt += 1) {
        if (runId !== runIdRef.current) return;
        setStatus(credentialAttempt === 0 ? "session" : "retrying");
        const sessionResult = await getSession(uid, vgroup);
        if (runId !== runIdRef.current) return;

        if (sessionResult.exists) {
          removeMultipartUploadRecord(vgroup);
          setHasResumeRecord(Boolean(findLatestMultipartUploadRecord()));
          setProgress({
            loadedBytes: file.size,
            totalBytes: file.size,
            progress: 100,
            completedParts: 1,
            totalParts: 1,
          });
          setUploadedObject(sessionResult.object);
          setIsInstantUpload(true);
          setStatus("done");
          return "instant" as const;
        }

        const { session } = sessionResult;

        try {
          const object = await uploadMultipartToS3(file, session, {
            signal: controller.signal,
            resumeRecord: loadMultipartUploadRecord(vgroup),
            onPhaseChange: (phase) => {
              if (runId === runIdRef.current) setStatus(phase);
            },
            onProgress: (nextProgress) => {
              if (runId === runIdRef.current) setProgress(nextProgress);
            },
            onRecordChange: (record) => {
              saveMultipartUploadRecord(record);
              if (runId === runIdRef.current) setHasResumeRecord(true);
            },
          });
          if (runId !== runIdRef.current) return;
          removeMultipartUploadRecord(vgroup);
          setHasResumeRecord(Boolean(findLatestMultipartUploadRecord()));
          setUploadedObject(object);
          setIsInstantUpload(false);
          setStatus("done");
          return "uploaded" as const;
        } catch (uploadError) {
          if (isCredentialError(uploadError) && credentialAttempt === 0 && !controller.signal.aborted) {
            continue;
          }
          throw uploadError;
        }
      }
    } catch (uploadError) {
      if (runId !== runIdRef.current) return;
      if (isAbortError(uploadError)) {
        const intent = intentRef.current as "none" | "pause" | "cancel";
        if (intent === "pause") setStatus("paused");
        if (intent === "cancel") setStatus("cancelled");
        return;
      }
      setError(uploadError instanceof Error ? uploadError.message : "视频分片上传失败");
      setStatus("error");
    } finally {
      if (runId === runIdRef.current && abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [uid]);

  const start = useCallback(
    async (file: File, vgroup: string) => {
      fileRef.current = file;
      vgroupRef.current = vgroup;
      setUploadedObject(null);
      setIsInstantUpload(false);
      setProgress({ ...EMPTY_PROGRESS, totalBytes: file.size });
      return execute(file, vgroup);
    },
    [execute],
  );

  const pause = useCallback(() => {
    if (status !== "uploading") return;
    intentRef.current = "pause";
    setStatus("paused");
    abortControllerRef.current?.abort();
  }, [status]);

  const resume = useCallback(async () => {
    const file = fileRef.current;
    const vgroup = vgroupRef.current;
    if (!file || !vgroup) return;
    await execute(file, vgroup);
  }, [execute]);

  const cancel = useCallback(async () => {
    const vgroup = vgroupRef.current;
    const record = vgroup ? loadMultipartUploadRecord(vgroup) : null;
    runIdRef.current += 1;
    intentRef.current = "cancel";
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus("cancelling");
    setError("");

    try {
      if (record && vgroup) {
        if (!uid) throw new Error("用户信息无效，请重新登录后再上传");
        const sessionResult = await getSession(uid, vgroup);
        if (sessionResult.exists) {
          removeMultipartUploadRecord(vgroup);
          setHasResumeRecord(Boolean(findLatestMultipartUploadRecord()));
          setProgress((current) => ({ ...EMPTY_PROGRESS, totalBytes: current.totalBytes }));
          setUploadedObject(null);
          setIsInstantUpload(false);
          setStatus("cancelled");
          return;
        }
        try {
          await abortMultipartUpload(sessionResult.session, record.uploadId);
        } catch (abortError) {
          if (!(abortError instanceof S3RequestError) || abortError.status !== 404) throw abortError;
        }
        removeMultipartUploadRecord(vgroup);
      }
      setHasResumeRecord(Boolean(findLatestMultipartUploadRecord()));
      setProgress((current) => ({ ...EMPTY_PROGRESS, totalBytes: current.totalBytes }));
      setUploadedObject(null);
      setIsInstantUpload(false);
      setStatus("cancelled");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "取消分片上传失败");
      setStatus("error");
    }
  }, [uid]);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    intentRef.current = "none";
    fileRef.current = null;
    vgroupRef.current = "";
    setStatus("idle");
    setProgress(EMPTY_PROGRESS);
    setUploadedObject(null);
    setIsInstantUpload(false);
    setError("");
    setHasResumeRecord(Boolean(findLatestMultipartUploadRecord()));
  }, []);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const isActive =
    status === "session" ||
    status === "preparing" ||
    status === "uploading" ||
    status === "retrying" ||
    status === "completing" ||
    status === "cancelling";

  return {
    status,
    progress,
    uploadedObject,
    isInstantUpload,
    error,
    hasResumeRecord,
    isActive,
    canPause: status === "uploading",
    canResume: status === "paused" || status === "error" || status === "cancelled",
    start,
    pause,
    resume,
    retry: resume,
    cancel,
    reset,
  };
}
