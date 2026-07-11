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

type S3Config = {
  endpoint: string;
  region: string;
  usePathStyle: boolean;
};

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

export async function uploadObjectToS3(
  file: File,
  session: S3UploadSession,
  onProgress: (progress: number) => void,
): Promise<S3UploadedObject> {
  const { region } = getS3Config();
  const objectUrl = buildS3ObjectUrl(session);
  const aws = new AwsClient({
    accessKeyId: session.accessKey,
    secretAccessKey: session.secretKey,
    sessionToken: session.token,
    region,
    service: "s3",
  });
  const signedRequest = await aws.sign(objectUrl, {
    method: "PUT",
    body: file,
    headers: {
      "content-type": file.type || "application/octet-stream",
    },
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedRequest.url);
    signedRequest.headers.forEach((value, key) => {
      if (key !== "host" && key !== "content-length") {
        xhr.setRequestHeader(key, value);
      }
    });
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      reject(new Error(`视频上传失败，状态码 ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("视频上传失败，请检查对象存储配置和跨域设置"));
    xhr.send(file);
  });

  return {
    bucket: session.bucket,
    path: session.path,
    vgroup: session.vgroup,
  };
}
