import { AwsClient } from "aws4fetch";

export type S3UploadSession = {
  accessKey: string;
  secretKey: string;
  token: string;
  bucket: string;
  path: string;
  vgroup: string;
};

export type S3UploadedObject = {
  bucket: string;
  path: string;
  vgroup: string;
};

export type MultipartUploadPart = {
  partNumber: number;
  etag: string;
  size: number;
};

export type MultipartUploadRecord = {
  version: 1;
  vgroup: string;
  fileName: string;
  fileSize: number;
  lastModified: number;
  fileType: string;
  bucket: string;
  path: string;
  uploadId: string;
  partSize: number;
  parts: MultipartUploadPart[];
  updatedAt: number;
};

export type MultipartUploadProgress = {
  loadedBytes: number;
  totalBytes: number;
  progress: number;
  completedParts: number;
  totalParts: number;
};

export type MultipartUploadPhase = "preparing" | "uploading" | "completing";

export type MultipartUploadOptions = {
  signal: AbortSignal;
  resumeRecord?: MultipartUploadRecord | null;
  concurrency?: number;
  onPhaseChange?: (phase: MultipartUploadPhase) => void;
  onProgress?: (progress: MultipartUploadProgress) => void;
  onRecordChange?: (record: MultipartUploadRecord) => void;
};

type S3Config = {
  endpoint: string;
  region: string;
  usePathStyle: boolean;
};

const MEBIBYTE = 1024 * 1024;
const DEFAULT_PART_SIZE = 16 * MEBIBYTE;
const MAX_PARTS = 10_000;
const DEFAULT_CONCURRENCY = 3;
const MAX_RETRIES = 3;

export class S3RequestError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "") {
    super(message);
    this.name = "S3RequestError";
    this.status = status;
    this.code = code;
  }
}

function isCredentialRequestError(error: unknown) {
  return (
    error instanceof S3RequestError &&
    (error.status === 401 ||
      error.status === 403 ||
      error.code === "ExpiredToken" ||
      error.code === "InvalidToken" ||
      error.code === "RequestExpired")
  );
}

function getS3Config(): S3Config {
  const endpoint = import.meta.env.VITE_S3_ENDPOINT;
  if (!endpoint) throw new Error("缺少 S3 上传配置 VITE_S3_ENDPOINT");

  return {
    endpoint: endpoint.replace(/\/+$/, ""),
    region: import.meta.env.VITE_S3_REGION || "auto",
    usePathStyle: import.meta.env.VITE_S3_USE_PATH_STYLE === "true",
  };
}

function encodeS3Key(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function buildS3ObjectUrl(session: S3UploadSession) {
  const { endpoint, usePathStyle } = getS3Config();
  const key = encodeS3Key(session.path);

  if (usePathStyle) return `${endpoint}/${encodeURIComponent(session.bucket)}/${key}`;

  const endpointUrl = new URL(endpoint);
  endpointUrl.hostname = `${session.bucket}.${endpointUrl.hostname}`;
  endpointUrl.pathname = `${endpointUrl.pathname.replace(/\/+$/, "")}/${key}`;
  return endpointUrl.toString();
}

function createAwsClient(session: S3UploadSession) {
  const { region } = getS3Config();
  return new AwsClient({
    accessKeyId: session.accessKey,
    secretAccessKey: session.secretKey,
    sessionToken: session.token,
    region,
    service: "s3",
  });
}

function buildMultipartUrl(session: S3UploadSession, params: Record<string, string>) {
  const url = new URL(buildS3ObjectUrl(session));
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

function parseXml(xml: string) {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error("对象存储返回了无法解析的响应");
  }
  return document;
}

function xmlText(document: Document, name: string) {
  return document.getElementsByTagName(name)[0]?.textContent?.trim() || "";
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function responseError(response: Response, fallback: string) {
  const body = await response.text().catch(() => "");
  let message = body;
  let code = "";
  if (body.startsWith("<")) {
    try {
      const document = parseXml(body);
      code = xmlText(document, "Code");
      message = xmlText(document, "Message") || code || body;
    } catch {
      message = body;
    }
  }
  return new S3RequestError(message ? `${fallback}：${message}` : fallback, response.status, code);
}

async function signedFetch(
  session: S3UploadSession,
  url: string,
  init: RequestInit,
  errorMessage: string,
) {
  const request = await createAwsClient(session).sign(url, init);
  const response = await fetch(request);
  if (!response.ok) throw await responseError(response, errorMessage);
  return response;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("上传已中止", "AbortError");
}

function waitWithSignal(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("上传已中止", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);
    const handleAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("上传已中止", "AbortError"));
    };
    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

export function calculateMultipartPartSize(fileSize: number) {
  const requiredSize = Math.ceil(fileSize / MAX_PARTS / MEBIBYTE) * MEBIBYTE;
  return Math.max(DEFAULT_PART_SIZE, requiredSize);
}

function getPartSize(fileSize: number, partSize: number, partNumber: number) {
  const start = (partNumber - 1) * partSize;
  return Math.max(0, Math.min(partSize, fileSize - start));
}

async function createMultipartUpload(file: File, session: S3UploadSession, signal: AbortSignal) {
  throwIfAborted(signal);
  const response = await signedFetch(
    session,
    buildMultipartUrl(session, { uploads: "" }),
    {
      method: "POST",
      headers: { "content-type": file.type || "application/octet-stream" },
      signal,
    },
    "创建分片上传会话失败",
  );
  const uploadId = xmlText(parseXml(await response.text()), "UploadId");
  if (!uploadId) throw new Error("对象存储未返回 uploadId");
  return uploadId;
}

export async function listMultipartUploadParts(
  session: S3UploadSession,
  uploadId: string,
  signal: AbortSignal,
) {
  const parts: MultipartUploadPart[] = [];
  let marker = "";

  do {
    throwIfAborted(signal);
    const params: Record<string, string> = { uploadId };
    if (marker) params["part-number-marker"] = marker;
    const response = await signedFetch(
      session,
      buildMultipartUrl(session, params),
      { method: "GET", signal },
      "读取已上传分片失败",
    );
    const document = parseXml(await response.text());
    for (const node of Array.from(document.getElementsByTagName("Part"))) {
      const partNumber = Number(node.getElementsByTagName("PartNumber")[0]?.textContent);
      const etag = node.getElementsByTagName("ETag")[0]?.textContent?.trim() || "";
      const size = Number(node.getElementsByTagName("Size")[0]?.textContent);
      if (Number.isInteger(partNumber) && partNumber > 0 && etag) {
        parts.push({ partNumber, etag, size: Number.isFinite(size) ? size : 0 });
      }
    }
    marker = xmlText(document, "IsTruncated") === "true" ? xmlText(document, "NextPartNumberMarker") : "";
  } while (marker);

  return parts.sort((left, right) => left.partNumber - right.partNumber);
}

async function uploadPartRequest(
  body: ArrayBuffer,
  session: S3UploadSession,
  uploadId: string,
  partNumber: number,
  signal: AbortSignal,
  onProgress: (loaded: number) => void,
) {
  throwIfAborted(signal);
  const request = await createAwsClient(session).sign(
    buildMultipartUrl(session, { partNumber: String(partNumber), uploadId }),
    {
      method: "PUT",
      body,
      headers: { "content-type": "application/octet-stream" },
    },
  );
  throwIfAborted(signal);

  return new Promise<string>((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      const handleAbort = () => xhr.abort();
      signal.addEventListener("abort", handleAbort, { once: true });
      xhr.open("PUT", request.url);
      request.headers.forEach((value, key) => {
        if (key !== "host" && key !== "content-length") xhr.setRequestHeader(key, value);
      });
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(event.loaded);
      };
      xhr.onload = () => {
        signal.removeEventListener("abort", handleAbort);
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag = xhr.getResponseHeader("ETag")?.trim();
          if (!etag) {
            reject(new Error("分片上传成功，但浏览器无法读取 ETag，请检查对象存储 CORS ExposeHeaders"));
            return;
          }
          resolve(etag);
          return;
        }
        let code = "";
        let message = `第 ${partNumber} 个分片上传失败，状态码 ${xhr.status}`;
        if (xhr.responseText.startsWith("<")) {
          try {
            const document = parseXml(xhr.responseText);
            code = xmlText(document, "Code");
            message = xmlText(document, "Message") || message;
          } catch {
            // 保留状态码错误信息。
          }
        }
        reject(new S3RequestError(message, xhr.status, code));
      };
      xhr.onerror = () => {
        signal.removeEventListener("abort", handleAbort);
        reject(new S3RequestError(`第 ${partNumber} 个分片上传失败，请检查网络或对象存储 CORS`, 0));
      };
      xhr.onabort = () => {
        signal.removeEventListener("abort", handleAbort);
        reject(new DOMException("上传已中止", "AbortError"));
      };
      xhr.send(body);
    } catch (error) {
      reject(error);
    }
  });
}

async function uploadPartWithRetry(
  file: File,
  session: S3UploadSession,
  uploadId: string,
  partSize: number,
  partNumber: number,
  signal: AbortSignal,
  onProgress: (loaded: number) => void,
) {
  const start = (partNumber - 1) * partSize;
  const body = await file.slice(start, Math.min(start + partSize, file.size)).arrayBuffer();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    throwIfAborted(signal);
    try {
      return await uploadPartRequest(body, session, uploadId, partNumber, signal, onProgress);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      if (isCredentialRequestError(error)) throw error;
      lastError = error;
      onProgress(0);
      if (attempt === MAX_RETRIES) break;
      await waitWithSignal(600 * 2 ** attempt, signal);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`第 ${partNumber} 个分片上传失败`);
}

async function completeMultipartUpload(
  session: S3UploadSession,
  uploadId: string,
  parts: MultipartUploadPart[],
  signal: AbortSignal,
) {
  const body = `<CompleteMultipartUpload>${parts
    .map((part) => `<Part><PartNumber>${part.partNumber}</PartNumber><ETag>${escapeXml(part.etag)}</ETag></Part>`)
    .join("")}</CompleteMultipartUpload>`;
  const response = await signedFetch(
    session,
    buildMultipartUrl(session, { uploadId }),
    {
      method: "POST",
      body,
      headers: { "content-type": "application/xml" },
      signal,
    },
    "合并视频分片失败",
  );
  const responseBody = await response.text();
  if (responseBody) {
    const document = parseXml(responseBody);
    if (document.getElementsByTagName("Error").length > 0) {
      throw new S3RequestError(
        xmlText(document, "Message") || "合并视频分片失败",
        response.status,
        xmlText(document, "Code"),
      );
    }
  }
}

export async function abortMultipartUpload(session: S3UploadSession, uploadId: string) {
  await signedFetch(
    session,
    buildMultipartUrl(session, { uploadId }),
    { method: "DELETE" },
    "取消分片上传失败",
  );
}

function isCompatibleRecord(record: MultipartUploadRecord, file: File, session: S3UploadSession) {
  return (
    record.version === 1 &&
    record.vgroup === session.vgroup &&
    record.fileSize === file.size &&
    record.bucket === session.bucket &&
    record.path === session.path
  );
}

export async function uploadMultipartToS3(
  file: File,
  session: S3UploadSession,
  options: MultipartUploadOptions,
): Promise<S3UploadedObject> {
  const { signal, onPhaseChange, onProgress, onRecordChange } = options;
  const concurrency = Math.max(1, Math.min(options.concurrency || DEFAULT_CONCURRENCY, 6));
  throwIfAborted(signal);
  onPhaseChange?.("preparing");

  let record = options.resumeRecord && isCompatibleRecord(options.resumeRecord, file, session)
    ? options.resumeRecord
    : null;

  if (record) {
    try {
      const remoteParts = await listMultipartUploadParts(session, record.uploadId, signal);
      record = { ...record, parts: remoteParts, updatedAt: Date.now() };
      onRecordChange?.(record);
    } catch (error) {
      if (!(error instanceof S3RequestError) || error.status !== 404) throw error;
      record = null;
    }
  }

  if (!record) {
    const partSize = calculateMultipartPartSize(file.size);
    record = {
      version: 1,
      vgroup: session.vgroup,
      fileName: file.name,
      fileSize: file.size,
      lastModified: file.lastModified,
      fileType: file.type,
      bucket: session.bucket,
      path: session.path,
      uploadId: await createMultipartUpload(file, session, signal),
      partSize,
      parts: [],
      updatedAt: Date.now(),
    };
    onRecordChange?.(record);
  }

  const currentRecord = record;
  const totalParts = Math.ceil(file.size / currentRecord.partSize);
  const completed = new Map(currentRecord.parts.map((part) => [part.partNumber, part]));
  const inFlight = new Map<number, number>();
  const missingParts = Array.from({ length: totalParts }, (_, index) => index + 1).filter(
    (partNumber) => !completed.has(partNumber),
  );
  let cursor = 0;
  let lastProgressAt = 0;

  const emitProgress = (force = false) => {
    const now = performance.now();
    if (!force && now - lastProgressAt < 100) return;
    lastProgressAt = now;
    let loadedBytes = 0;
    completed.forEach((part) => {
      loadedBytes += part.size || getPartSize(file.size, currentRecord.partSize, part.partNumber);
    });
    inFlight.forEach((loaded) => {
      loadedBytes += loaded;
    });
    loadedBytes = Math.min(file.size, loadedBytes);
    onProgress?.({
      loadedBytes,
      totalBytes: file.size,
      progress: file.size > 0 ? Math.round((loadedBytes / file.size) * 100) : 100,
      completedParts: completed.size,
      totalParts,
    });
  };

  emitProgress(true);
  if (missingParts.length > 0) {
    onPhaseChange?.("uploading");
    const workersController = new AbortController();
    const handleExternalAbort = () => workersController.abort();
    signal.addEventListener("abort", handleExternalAbort, { once: true });
    const workersSignal = workersController.signal;
    const worker = async () => {
      while (cursor < missingParts.length) {
        throwIfAborted(workersSignal);
        const partNumber = missingParts[cursor];
        cursor += 1;
        const size = getPartSize(file.size, currentRecord.partSize, partNumber);
        const etag = await uploadPartWithRetry(
          file,
          session,
          currentRecord.uploadId,
          currentRecord.partSize,
          partNumber,
          workersSignal,
          (loaded) => {
            inFlight.set(partNumber, Math.min(size, loaded));
            emitProgress();
          },
        );
        inFlight.delete(partNumber);
        completed.set(partNumber, { partNumber, etag, size });
        currentRecord.parts = Array.from(completed.values()).sort((left, right) => left.partNumber - right.partNumber);
        currentRecord.updatedAt = Date.now();
        onRecordChange?.({ ...currentRecord, parts: [...currentRecord.parts] });
        emitProgress(true);
      }
    };
    const workers = Array.from({ length: Math.min(concurrency, missingParts.length) }, () => worker());
    try {
      await Promise.all(workers);
    } catch (error) {
      workersController.abort();
      await Promise.allSettled(workers);
      throw error;
    } finally {
      signal.removeEventListener("abort", handleExternalAbort);
    }
  }

  throwIfAborted(signal);
  onPhaseChange?.("completing");
  const parts = Array.from(completed.values()).sort((left, right) => left.partNumber - right.partNumber);
  await completeMultipartUpload(session, currentRecord.uploadId, parts, signal);
  onProgress?.({
    loadedBytes: file.size,
    totalBytes: file.size,
    progress: 100,
    completedParts: totalParts,
    totalParts,
  });

  return { bucket: session.bucket, path: session.path, vgroup: session.vgroup };
}
