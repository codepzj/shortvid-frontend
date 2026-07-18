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

async function getSession(vgroup: string): Promise<S3UploadSession> {
  const response = await getUploadSessionAPI({ vgroup });
  return {
    accessKey: response.data.access_key,
    secretKey: response.data.secret_key,
    token: response.data.token,
    bucket: response.data.bucket,
    path: response.data.path,
    vgroup,
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
  const [status, setStatus] = useState<MultipartUploadStatus>("idle");
  const [progress, setProgress] = useState<MultipartUploadProgress>(EMPTY_PROGRESS);
  const [uploadedObject, setUploadedObject] = useState<S3UploadedObject | null>(null);
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
      for (let credentialAttempt = 0; credentialAttempt < 2; credentialAttempt += 1) {
        if (runId !== runIdRef.current) return;
        setStatus(credentialAttempt === 0 ? "session" : "retrying");
        const session = await getSession(vgroup);
        if (runId !== runIdRef.current) return;

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
          setStatus("done");
          return;
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
  }, []);

  const start = useCallback(
    async (file: File, vgroup: string) => {
      fileRef.current = file;
      vgroupRef.current = vgroup;
      setUploadedObject(null);
      setProgress({ ...EMPTY_PROGRESS, totalBytes: file.size });
      await execute(file, vgroup);
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
        const session = await getSession(vgroup);
        try {
          await abortMultipartUpload(session, record.uploadId);
        } catch (abortError) {
          if (!(abortError instanceof S3RequestError) || abortError.status !== 404) throw abortError;
        }
        removeMultipartUploadRecord(vgroup);
      }
      setHasResumeRecord(Boolean(findLatestMultipartUploadRecord()));
      setProgress((current) => ({ ...EMPTY_PROGRESS, totalBytes: current.totalBytes }));
      setUploadedObject(null);
      setStatus("cancelled");
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "取消分片上传失败");
      setStatus("error");
    }
  }, []);

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
