import type { MultipartUploadRecord } from "@/third_party/s3";

const STORAGE_PREFIX = "shortvid:multipart-upload:v1:";
const RECORD_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function storageKey(vgroup: string) {
  return `${STORAGE_PREFIX}${vgroup}`;
}

function isMultipartUploadRecord(value: unknown): value is MultipartUploadRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<MultipartUploadRecord>;
  return (
    record.version === 1 &&
    typeof record.vgroup === "string" &&
    typeof record.fileName === "string" &&
    typeof record.fileSize === "number" &&
    typeof record.bucket === "string" &&
    typeof record.path === "string" &&
    typeof record.uploadId === "string" &&
    typeof record.partSize === "number" &&
    record.partSize > 0 &&
    Array.isArray(record.parts) &&
    record.parts.every(
      (part) =>
        part &&
        typeof part.partNumber === "number" &&
        part.partNumber > 0 &&
        typeof part.etag === "string" &&
        typeof part.size === "number",
    ) &&
    typeof record.updatedAt === "number"
  );
}

export function loadMultipartUploadRecord(vgroup: string) {
  try {
    const value = localStorage.getItem(storageKey(vgroup));
    if (!value) return null;
    const record: unknown = JSON.parse(value);
    if (!isMultipartUploadRecord(record) || Date.now() - record.updatedAt > RECORD_MAX_AGE) {
      localStorage.removeItem(storageKey(vgroup));
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

export function saveMultipartUploadRecord(record: MultipartUploadRecord) {
  try {
    localStorage.setItem(storageKey(record.vgroup), JSON.stringify(record));
  } catch {
    // 上传仍可继续；仅在浏览器存储不可用时失去跨刷新续传能力。
  }
}

export function removeMultipartUploadRecord(vgroup: string) {
  try {
    localStorage.removeItem(storageKey(vgroup));
  } catch {
    // 忽略浏览器存储异常。
  }
}

export function findLatestMultipartUploadRecord() {
  let latest: MultipartUploadRecord | null = null;
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(STORAGE_PREFIX)) continue;
      const value = localStorage.getItem(key);
      if (!value) continue;
      const record: unknown = JSON.parse(value);
      if (!isMultipartUploadRecord(record) || Date.now() - record.updatedAt > RECORD_MAX_AGE) {
        localStorage.removeItem(key);
        continue;
      }
      if (!latest || record.updatedAt > latest.updatedAt) latest = record;
    }
  } catch {
    return null;
  }
  return latest;
}
