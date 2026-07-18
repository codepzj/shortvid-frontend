import {
  ArrowLeft,
  Captions,
  CheckCircle2,
  CloudUpload,
  FileVideo,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Link } from "react-router-dom";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useMultipartUpload } from "@/hooks/use-multipart-upload";
import type { MultipartUploadStatus } from "@/hooks/use-multipart-upload";
import { cn } from "@/lib/utils";
import type { S3UploadedObject } from "@/third_party/s3";
import { generateVgroup } from "@/third_party/vgroup";

type UploadedVideo = {
  file: File;
  url: string;
  title: string;
  sizeLabel: string;
  durationLabel: string;
};

type UploadStep = "video" | "details";
type UploadStatus = MultipartUploadStatus | "reading";

const selectedTags = ["生活记录", "学习", "直播"];
const recommendedTags = ["生活记录", "科技", "学习", "音乐", "记录", "新人", "原创", "自用"];

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const restSeconds = total % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(restSeconds).padStart(2, "0");

  return hours > 0 ? `${String(hours).padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
}

function titleFromFileName(name: string) {
  return name.replace(/\.[^.]+$/, "") || name;
}

function waitForVideo(video: HTMLVideoElement, eventName: "loadedmetadata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(eventName, handleSuccess);
      video.removeEventListener("error", handleError);
    };
    const handleSuccess = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("视频读取失败，请换一个视频试试"));
    };

    video.addEventListener(eventName, handleSuccess, { once: true });
    video.addEventListener("error", handleError, { once: true });
  });
}

async function readVideoFile(file: File): Promise<UploadedVideo> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");

  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = url;

  await waitForVideo(video, "loadedmetadata");

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;

  return {
    file,
    url,
    title: titleFromFileName(file.name),
    sizeLabel: formatFileSize(file.size),
    durationLabel: formatDuration(duration),
  };
}

function FieldLabel({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="w-24 shrink-0 pt-2 text-sm text-foreground">
      {required ? <span className="mr-1 text-destructive">*</span> : null}
      {children}
    </div>
  );
}

function getAttachmentState(status: UploadStatus) {
  if (status === "error") return "error";
  if (status === "done") return "done";
  if (status === "uploading") return "uploading";
  if (status === "idle" || status === "paused" || status === "cancelled") return "idle";
  return "processing";
}

function isProcessingStatus(status: UploadStatus) {
  return (
    status === "reading" ||
    status === "session" ||
    status === "preparing" ||
    status === "uploading" ||
    status === "retrying" ||
    status === "completing" ||
    status === "cancelling"
  );
}

function getUploadDescription(
  status: UploadStatus,
  progress: number,
  loadedBytes: number,
  totalBytes: number,
  object?: S3UploadedObject | null,
) {
  if (status === "reading") return "正在读取视频信息";
  if (status === "session") return "正在获取上传凭证";
  if (status === "preparing") return "正在创建或恢复分片会话";
  if (status === "retrying") return "上传凭证已过期，正在自动刷新";
  if (status === "completing") return "分片已上传，正在合并视频";
  if (status === "cancelling") return "正在取消分片上传";
  if (status === "cancelled") return "上传已取消，可重新开始";
  if (status === "paused") return `已暂停 · ${progress}%`;
  if (status === "uploading") {
    return `正在上传 ${progress}% · ${formatFileSize(loadedBytes)}/${formatFileSize(totalBytes)}`;
  }
  if (status === "done" && object) return `上传成功 · ${object.path}`;
  if (status === "error") return "上传失败，可从已完成分片继续";
  return "等待选择视频";
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const uploadRequestRef = useRef(0);
  const multipartUpload = useMultipartUpload();
  const [step, setStep] = useState<UploadStep>("video");
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [title, setTitle] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [readError, setReadError] = useState("");

  const uploadStatus: UploadStatus = isReading ? "reading" : multipartUpload.status;
  const uploadedObject = multipartUpload.uploadedObject;
  const uploadProgress = multipartUpload.progress.progress;
  const error = readError || multipartUpload.error;
  const isBusy = isReading || multipartUpload.isActive;
  const canGoNext = Boolean(video && uploadedObject && uploadStatus === "done");
  const canPublish = Boolean(video && uploadedObject && step === "details");
  const uploadButtonText = isReading
    ? "正在读取视频..."
    : multipartUpload.isActive
      ? "正在分片上传..."
      : "上传视频";
  const showProgress = Boolean(video && multipartUpload.progress.totalBytes > 0 && uploadStatus !== "idle");
  const canCancelUpload =
    Boolean(video) &&
    uploadStatus !== "idle" &&
    uploadStatus !== "done" &&
    uploadStatus !== "cancelled" &&
    uploadStatus !== "cancelling" &&
    uploadStatus !== "reading";

  useEffect(() => {
    return () => {
      if (video) URL.revokeObjectURL(video.url);
    };
  }, [video]);

  const handleFile = async (file?: File) => {
    if (isBusy) return;
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setReadError("请选择视频文件");
      return;
    }

    const requestId = uploadRequestRef.current + 1;
    uploadRequestRef.current = requestId;
    if (video && multipartUpload.status !== "idle" && multipartUpload.status !== "done" && multipartUpload.status !== "cancelled") {
      await multipartUpload.cancel();
    }
    multipartUpload.reset();
    setReadError("");
    setStep("video");
    setIsReading(true);
    try {
      const nextVideo = await readVideoFile(file);
      if (requestId !== uploadRequestRef.current) {
        URL.revokeObjectURL(nextVideo.url);
        return;
      }

      setVideo((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return nextVideo;
      });
      setTitle(nextVideo.title);

      const vgroup = await generateVgroup(file);
      setIsReading(false);
      if (requestId !== uploadRequestRef.current) return;
      await multipartUpload.start(file, vgroup);
    } catch (error) {
      setReadError(error instanceof Error ? error.message : "视频读取失败");
    } finally {
      if (requestId === uploadRequestRef.current) setIsReading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isBusy) return;
    void handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <main className="min-h-screen bg-muted/30 text-foreground">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/home" aria-label="返回首页">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">上传视频</h1>
            <p className="text-sm text-muted-foreground">选择视频并填写发布信息</p>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
        <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
            <span className={step === "video" ? "font-medium" : "text-muted-foreground"}>上传视频</span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-6 place-items-center rounded-full text-xs font-medium",
                step === "details" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              2
            </span>
            <span className={step === "details" ? "font-medium" : "text-muted-foreground"}>基本信息</span>
          </div>
        </div>

        {step === "video" ? (
          <>
            <div
              className="grid min-h-[420px] place-items-center rounded-lg border border-dashed bg-background transition hover:border-primary/50"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center text-center">
                <CloudUpload className="size-20 text-muted-foreground" strokeWidth={1.4} />
                <h2 className="mt-4 text-xl font-semibold">上传视频</h2>
                <p className="mt-2 text-sm text-muted-foreground">点击上传或将视频拖拽到此区域</p>
                <Button className="mt-6 w-64" disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
                  <Upload data-icon="inline-start" />
                  {uploadButtonText}
                </Button>
                {multipartUpload.hasResumeRecord && !video ? (
                  <p className="mt-3 text-sm text-muted-foreground">检测到未完成上传，重新选择原文件即可续传</p>
                ) : null}
                {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
                <input ref={fileInputRef} className="hidden" type="file" accept="video/*" onChange={handleInputChange} />
              </div>
            </div>
            {video ? (
              <section className="flex flex-col gap-4 rounded-lg border bg-background p-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted lg:w-96">
                  <video className="size-full object-cover" controls src={video.url} />
                </div>
                <Attachment className="w-full" state={getAttachmentState(uploadStatus)}>
                  <AttachmentMedia>
                    {isProcessingStatus(uploadStatus) ? (
                      <Loader2 className="animate-spin" />
                    ) : uploadStatus === "done" ? (
                      <CheckCircle2 />
                    ) : (
                      <FileVideo />
                    )}
                  </AttachmentMedia>
                  <div className="min-w-0 flex-1">
                    <AttachmentContent>
                      <AttachmentTitle>{video.file.name}</AttachmentTitle>
                      <AttachmentDescription>
                        {video.sizeLabel} · {video.durationLabel} ·{" "}
                        {getUploadDescription(
                          uploadStatus,
                          uploadProgress,
                          multipartUpload.progress.loadedBytes,
                          multipartUpload.progress.totalBytes,
                          uploadedObject,
                        )}
                      </AttachmentDescription>
                    </AttachmentContent>
                    {showProgress ? (
                      <Progress
                        className="mt-3 h-1.5"
                        value={uploadProgress}
                        aria-label={`视频上传进度 ${uploadProgress}%`}
                      />
                    ) : null}
                  </div>
                </Attachment>
                <div className="flex flex-wrap justify-end gap-3">
                  {multipartUpload.canPause ? (
                    <Button variant="outline" onClick={multipartUpload.pause}>
                      <Pause data-icon="inline-start" />
                      暂停上传
                    </Button>
                  ) : null}
                  {multipartUpload.canResume ? (
                    <Button variant="outline" onClick={() => void multipartUpload.resume()}>
                      <Play data-icon="inline-start" />
                      {uploadStatus === "paused" ? "继续上传" : "重新上传"}
                    </Button>
                  ) : null}
                  {canCancelUpload ? (
                    <Button variant="outline" onClick={() => void multipartUpload.cancel()}>
                      <Trash2 data-icon="inline-start" />
                      取消上传
                    </Button>
                  ) : null}
                  <Button variant="outline" disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
                    <RotateCcw data-icon="inline-start" />
                    重新选择
                  </Button>
                  <Button disabled={!canGoNext} onClick={() => setStep("details")}>
                    下一步
                  </Button>
                </div>
              </section>
            ) : null}
          </>
        ) : video ? (
          <>
            <section className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted lg:w-80">
                  <video className="size-full object-cover" controls src={video.url} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-green-600" />
                    <span className="font-medium">视频已选择</span>
                  </div>
                  <p className="mt-3 truncate text-sm text-muted-foreground">{video.file.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {video.sizeLabel} · {video.durationLabel}
                  </p>
                  <div className="mt-4 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    {uploadedObject ? (
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex gap-2">
                          <span className="shrink-0 text-foreground">视频上传</span>
                          <span className="text-green-600">已就绪</span>
                        </div>
                        <div className="truncate">Bucket: {uploadedObject.bucket}</div>
                        <div className="truncate">Path: {uploadedObject.path}</div>
                        <div className="truncate">VGroup: {uploadedObject.vgroup}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">等待上传完成</span>
                    )}
                  </div>
                  <Button className="mt-5" variant="outline" disabled={isBusy} onClick={() => replaceInputRef.current?.click()}>
                    <RotateCcw data-icon="inline-start" />
                    {isBusy ? "上传中..." : "重新上传"}
                  </Button>
                  {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
                  <input ref={replaceInputRef} className="hidden" type="file" accept="video/*" onChange={handleInputChange} />
                </div>
              </div>
            </section>

            <section className="rounded-lg border bg-background p-6">
              <h2 className="text-lg font-semibold">基本设置</h2>
              <div className="mt-6 flex flex-col gap-6">
                <div className="flex items-center">
                  <FieldLabel required>标题</FieldLabel>
                  <div className="flex h-10 w-full max-w-3xl items-center rounded-md border bg-background px-3">
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      maxLength={80}
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">{title.length}/80</span>
                  </div>
                </div>

                <div className="flex items-start">
                  <FieldLabel required>标签</FieldLabel>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-h-10 max-w-3xl flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-1.5">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} className="rounded-sm">
                          {tag}
                          <X className="ml-1 size-3" />
                        </Badge>
                      ))}
                      <span className="text-sm text-muted-foreground">按回车创建标签</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recommendedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <FieldLabel>简介</FieldLabel>
                  <Textarea className="h-36 max-w-3xl resize-none" placeholder="填写视频简介" />
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <Button variant="outline">存草稿</Button>
              <Button disabled={!canPublish}>
                <Captions data-icon="inline-start" />
                立即投稿
              </Button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
