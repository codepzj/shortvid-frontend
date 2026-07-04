import {
  BarChart3,
  ChevronDown,
  CloudUpload,
  Download,
  FileText,
  Flag,
  GraduationCap,
  Home,
  Image,
  Inbox,
  MessageSquare,
  MonitorUp,
  Plus,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Upload,
  Users,
  Video,
  WalletCards,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const tabs = ["视频投稿", "短剧投稿", "专栏投稿", "UP动画", "互动视频投稿", "贴纸投稿", "视频素材投稿"];

const uploadTips = [
  {
    title: "视频大小",
    description: "视频大小 16G 以内，时长 10 小时以内",
    icon: Image,
  },
  {
    title: "视频格式",
    description: "推荐上传 MP4/MOV/MKV 格式，转码更快",
    icon: Video,
  },
  {
    title: "视频分辨率",
    description: "推荐 1080P、4K，高分辨率更清晰流畅",
    icon: MonitorUp,
  },
];

const sidebarTop = [
  { label: "投稿", icon: Upload, active: true },
  { label: "首页", icon: Home },
  { label: "内容管理", icon: FileText, expandable: true },
  { label: "数据中心", icon: BarChart3 },
  { label: "粉丝管理", icon: Users },
  { label: "互动管理", icon: MessageSquare, expandable: true },
  { label: "收益管理", icon: WalletCards, expandable: true },
];

const sidebarLinks = [
  { label: "花生", icon: Sparkles, badge: "视频创作" },
  { label: "updream", icon: WandSparkles },
  { label: "创作成长", icon: GraduationCap, expandable: true },
  { label: "创作权益", icon: Flag, expandable: true },
  { label: "社区公约", icon: ShieldCheck },
  { label: "创作设置", icon: Settings },
];

const selectedTags = ["生活记录", "学习", "直播"];
const recommendTags = ["生活记录", "科技", "学习", "音乐", "记录", "新人", "原创", "自用"];
const topics = ["世界林科技坦白局", "万物研究所", "上B站看播客", "开麦聊体育", "分享我的专业知识", "高能量自律"];

type UploadedVideo = {
  file: File;
  url: string;
  name: string;
  title: string;
  sizeLabel: string;
  durationLabel: string;
  covers: string[];
};

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const restSeconds = total % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(restSeconds).padStart(2, "0");

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

function fileNameToTitle(name: string) {
  return name.replace(/\.[^.]+$/, "") || name;
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: "loadedmetadata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const handleSuccess = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("视频读取失败，请换一个视频试试"));
    };
    const cleanup = () => {
      video.removeEventListener(eventName, handleSuccess);
      video.removeEventListener("error", handleError);
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

  await waitForVideoEvent(video, "loadedmetadata");

  const canvas = document.createElement("canvas");
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    URL.revokeObjectURL(url);
    throw new Error("当前浏览器不支持生成视频封面");
  }

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
  const captureTimes = duration > 2 ? [duration * 0.1, duration * 0.5, duration * 0.9] : [Math.min(duration / 2, 0.1)];
  const covers: string[] = [];

  for (const time of captureTimes) {
    const targetTime = Math.min(Math.max(time, 0), Math.max(duration - 0.1, 0));
    if (Math.abs(video.currentTime - targetTime) > 0.01) {
      video.currentTime = targetTime;
      await waitForVideoEvent(video, "seeked");
    }
    context.drawImage(video, 0, 0, width, height);
    covers.push(canvas.toDataURL("image/jpeg", 0.86));
  }

  return {
    file,
    url,
    name: file.name,
    title: fileNameToTitle(file.name),
    sizeLabel: formatFileSize(file.size),
    durationLabel: formatDuration(duration),
    covers,
  };
}

function FieldLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <div className="w-24 shrink-0 pt-2 text-sm text-zinc-700">
      {required ? <span className="mr-1 text-red-500">*</span> : null}
      {children}
    </div>
  );
}

function SelectLike({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={`flex h-9 items-center justify-between rounded-sm border border-zinc-300 bg-white px-3 text-sm text-zinc-700 ${className}`}
    >
      {children}
      <ChevronDown className="size-4 text-zinc-400" />
    </button>
  );
}

function UploadEntry({ onVideoSelected }: { onVideoSelected: (file: File) => Promise<void> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("请选择视频文件");
      return;
    }

    setError("");
    setIsReading(true);
    try {
      await onVideoSelected(file);
    } catch (error) {
      setError(error instanceof Error ? error.message : "视频读取失败");
    } finally {
      setIsReading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="px-16 py-16">
      <div
        className="grid min-h-[426px] place-items-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 transition hover:border-sky-300 hover:bg-sky-50/40"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <CloudUpload className="size-24 text-zinc-200" strokeWidth={1.4} />
          <p className="mt-4 text-sm text-zinc-400">点击上传或将视频拖拽到此区域</p>
          <p className="mt-2 text-xs text-zinc-400">支持 MP4、MOV、MKV 等浏览器可预览的视频格式</p>
          <Button
            className="mt-7 h-12 w-[304px] rounded-md bg-sky-500 text-base text-white hover:bg-sky-400"
            disabled={isReading}
            onClick={() => inputRef.current?.click()}
          >
            {isReading ? "正在读取视频..." : "上传视频"}
          </Button>
          {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
          <input ref={inputRef} className="hidden" type="file" accept="video/*" onChange={handleInputChange} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between bg-sky-50 px-5 py-4">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-lg bg-zinc-950 text-sky-300">
            <WandSparkles className="size-7" />
          </span>
          <div>
            <h3 className="font-semibold">updream</h3>
            <p className="mt-1 text-xs text-zinc-500">你的一站式AI视频创作平台</p>
          </div>
        </div>
        <Button variant="outline" className="h-9 rounded-sm border-sky-400 bg-white px-5 text-sky-500 hover:bg-sky-50 hover:text-sky-500">
          立即使用
        </Button>
      </div>
    </div>
  );
}

function PublishForm({
  selectedCover,
  video,
  onCoverSelect,
  onReplaceVideo,
}: {
  selectedCover: string;
  video: UploadedVideo;
  onCoverSelect: (cover: string) => void;
  onReplaceVideo: (file: File) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(video.title);
  const [isReplacing, setIsReplacing] = useState(false);

  const handleReplace = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsReplacing(true);
    try {
      await onReplaceVideo(file);
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div className="border-t border-zinc-100">
      <div className="flex h-[72px] items-center justify-between border-b border-zinc-100 px-8">
        <h1 className="text-lg font-semibold">发布视频</h1>
        <Button variant="outline" className="h-10 rounded-sm px-6 text-zinc-700">
          批量操作
        </Button>
      </div>

      <div className="px-8 py-6">
        <section className="rounded-lg bg-zinc-50 p-3">
          <div className="flex gap-3">
            <div className="flex h-[60px] w-52 flex-col justify-center rounded-md bg-sky-500 px-3 text-white">
              <span className="truncate">{video.title}</span>
              <span className="mt-1 text-xs text-white/90">{video.sizeLabel} · {video.durationLabel}</span>
            </div>
            <button className="flex h-[60px] w-24 flex-col items-center justify-center rounded-md bg-white text-sm text-zinc-500" type="button" onClick={() => inputRef.current?.click()}>
              <Plus className="size-4" />
              添加视频
            </button>
          </div>

          <Button className="mt-5 h-8 rounded-sm bg-sky-500 px-4 text-white hover:bg-sky-400">
            <Plus className="size-4" />
            添加分P
          </Button>

          <div className="mt-9 flex items-center gap-4">
            <span className="grid size-9 place-items-center rounded-sm bg-sky-500 text-white">
              <Video className="size-5 fill-current" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-700">{video.name}</p>
              <p className="mt-1 text-xs text-emerald-500">上传完成 · {video.sizeLabel} · {video.durationLabel}</p>
              <div className="mt-2 h-0.5 w-full max-w-[790px] bg-emerald-500" />
            </div>
            <button className="mr-28 flex items-center gap-2 text-sm text-sky-500 disabled:text-zinc-400" type="button" disabled={isReplacing} onClick={() => inputRef.current?.click()}>
              <RotateCcw className="size-5" />
              {isReplacing ? "读取中..." : "更换视频"}
            </button>
            <input ref={inputRef} className="hidden" type="file" accept="video/*" onChange={handleReplace} />
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-5 flex items-center gap-12">
            <h2 className="text-lg font-semibold">基本设置</h2>
            <Button variant="outline" className="h-8 rounded-sm px-5 text-zinc-500">
              一键填写
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-start">
              <FieldLabel required>封面</FieldLabel>
              <div>
                <div className="relative h-[108px] w-[144px] overflow-hidden rounded-sm bg-zinc-200">
                  <img src={selectedCover} alt="封面预览" className="size-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/55 py-2 text-center text-sm text-white">封面设置</div>
                </div>
                <div className="mt-4 rounded-md bg-zinc-50 p-3">
                  <p className="text-sm text-zinc-700">系统默认选中第一张为封面，以下为更多封面推荐</p>
                  <div className="mt-3 flex gap-2">
                    {video.covers.map((image, index) => (
                      <button
                        key={image}
                        type="button"
                        className={`overflow-hidden rounded-sm border-2 ${selectedCover === image ? "border-sky-500" : "border-transparent"}`}
                        onClick={() => onCoverSelect(image)}
                      >
                        <img src={image} alt={`推荐封面 ${index + 1}`} className="h-[78px] w-[100px] object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <FieldLabel required>标题</FieldLabel>
              <div className="flex h-10 w-full max-w-[746px] items-center rounded-sm border border-zinc-300 bg-white px-3">
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  maxLength={80}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
                <span className="text-sm text-zinc-400">{title.length}/80</span>
              </div>
            </div>

            <div className="flex items-center">
              <FieldLabel required>创作声明</FieldLabel>
              <SelectLike className="w-[360px] text-zinc-400">请选择符合您视频内容的创作声明</SelectLike>
            </div>

            <div className="flex items-center">
              <FieldLabel required>分区</FieldLabel>
              <SelectLike className="w-[226px]">科技数码</SelectLike>
            </div>

            <div className="flex items-start">
              <FieldLabel required>标签</FieldLabel>
              <div className="min-w-0 flex-1">
                <div className="flex h-10 max-w-[746px] items-center rounded-sm border border-zinc-300 bg-white px-3">
                  <div className="flex gap-2">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="flex h-8 items-center gap-1 rounded-sm bg-sky-500 px-3 text-sm text-white">
                        {tag}
                        <X className="size-3.5" />
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 min-w-0 flex-1 text-sm text-zinc-300">按回车键Enter创建标签</span>
                  <span className="text-sm text-zinc-500">还可以添加7个标签</span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="shrink-0 text-zinc-700">推荐标签:</span>
                  <div className="flex flex-wrap gap-3">
                    {recommendTags.map((tag, index) => (
                      <button
                        key={tag}
                        type="button"
                        className={`h-8 rounded-sm px-4 ${index === 0 || index === 2 ? "bg-sky-500 text-white" : "bg-zinc-50 text-zinc-500"}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-3 text-sm">
                  <span className="shrink-0 pt-1 text-zinc-700">参与话题:</span>
                  <div className="flex flex-wrap gap-3">
                    {topics.map((topic) => (
                      <button key={topic} type="button" className="flex h-8 items-center gap-1 rounded-sm bg-zinc-50 px-3 text-zinc-600">
                        <Tag className="size-3.5" />
                        {topic}
                        <span className="rounded-sm border border-rose-200 px-1 text-xs text-rose-500">活动</span>
                      </button>
                    ))}
                    <button className="h-8 text-sky-500" type="button">搜索更多话题 &gt;</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start pt-8">
              <FieldLabel>简介</FieldLabel>
              <div className="relative w-full max-w-[746px]">
                <Textarea
                  className="h-40 resize-none rounded-md border-zinc-300 px-4 py-3 text-sm"
                  placeholder="填写更全面的相关信息，让更多的人能找到你的视频吧"
                />
                <span className="absolute bottom-4 right-4 text-sm text-zinc-400">0/2000</span>
              </div>
            </div>

            <div className="flex items-center">
              <FieldLabel>定时发布</FieldLabel>
              <Switch />
              <span className="ml-3 text-sm text-zinc-500">可选择距离当前最早≥5分钟/最晚≤15天的时间，花火、预约、互动视频稿件不可修改/取消</span>
            </div>

            <div className="flex items-start">
              <FieldLabel>加入合集</FieldLabel>
              <div className="text-sm">
                <p className="font-medium text-zinc-700">合集功能可用于收集整理系列性稿件</p>
                <p className="mt-2 text-xs text-zinc-500">开通合集功能需满足权益中心等级达 Lv2，您可前往创作中心-权益中心查看相关数据</p>
              </div>
            </div>

            <div className="flex items-center">
              <FieldLabel>商业推广</FieldLabel>
              <Checkbox />
              <span className="ml-2 text-sm text-zinc-600">增加商业推广信息</span>
            </div>

            <div className="flex items-center">
              <FieldLabel>
                <span className="font-semibold">更多设置</span>
              </FieldLabel>
              <span className="text-sm text-zinc-500">含声明与权益、视频元素、互动管理等</span>
              <ChevronDown className="ml-2 size-4 text-zinc-400" />
            </div>

            <div className="flex items-center gap-4 pt-8 pl-24">
              <Button variant="outline" className="h-10 w-[122px] rounded-sm text-zinc-600">
                存草稿
              </Button>
              <Button className="h-10 w-[122px] rounded-sm bg-sky-500 text-white hover:bg-sky-400">
                立即投稿
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function CreatorPage() {
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [selectedCover, setSelectedCover] = useState("");

  const handleVideoSelected = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      throw new Error("请选择视频文件");
    }

    const nextVideo = await readVideoFile(file);
    setUploadedVideo((currentVideo) => {
      if (currentVideo) {
        URL.revokeObjectURL(currentVideo.url);
      }
      return nextVideo;
    });
    setSelectedCover(nextVideo.covers[0] ?? "");
  };

  useEffect(() => {
    return () => {
      if (uploadedVideo) {
        URL.revokeObjectURL(uploadedVideo.url);
      }
    };
  }, [uploadedVideo]);

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-zinc-900">
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-zinc-100 bg-white px-8 shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/home" className="flex items-center gap-2 text-xl font-bold text-sky-500">
            <span className="font-black italic">VideoHub</span>
            <span>创作中心</span>
          </Link>
          <Link to="/home" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-sky-500">
            <Home className="size-4" />
            主站
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <button className="hidden items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-zinc-700 xl:flex" type="button">
            <span className="flex -space-x-2">
              <Avatar className="size-5 border border-white">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <Avatar className="size-5 border border-white">
                <AvatarFallback>剪</AvatarFallback>
              </Avatar>
            </span>
            试试更多AI创作工具吧
            <ChevronDown className="size-4" />
          </button>
          <Download className="size-5" />
          <Inbox className="size-5" />
          <span className="hidden border-l border-zinc-200 pl-6 lg:inline">
            在 VideoHub 星球的第 <span className="text-orange-500">1302</span> 天
          </span>
          <Avatar className="size-8">
            <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80" alt="用户头像" />
            <AvatarFallback>V</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] w-[200px] shrink-0 overflow-y-auto border-r border-zinc-100 bg-white px-8 py-6 lg:block">
          <Button className="mb-6 h-10 w-full rounded-sm bg-sky-500 text-white hover:bg-sky-400">
            <Upload className="size-4" />
            投稿
          </Button>

          <nav className="space-y-1 text-sm">
            {sidebarTop.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  className={`flex h-11 items-center justify-between rounded-sm px-1 ${
                    item.active ? "font-semibold text-sky-500" : "text-zinc-700 hover:text-sky-500"
                  }`}
                  href="#"
                >
                  <span className="flex items-center gap-4">
                    <Icon className="size-4 text-zinc-500" />
                    {item.label}
                  </span>
                  {item.expandable ? <ChevronDown className="size-4 text-zinc-400" /> : null}
                </a>
              );
            })}
          </nav>

          <div className="my-5 border-t border-zinc-100" />

          <nav className="space-y-1 text-sm">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} className="flex h-11 items-center justify-between rounded-sm px-1 text-zinc-700 hover:text-sky-500" href="#">
                  <span className="flex items-center gap-4">
                    <Icon className="size-4 text-zinc-500" />
                    {item.label}
                    {item.badge ? <span className="rounded-sm bg-rose-400 px-1 text-[10px] text-white">{item.badge}</span> : null}
                  </span>
                  {item.expandable ? <ChevronDown className="size-4 text-zinc-400" /> : null}
                </a>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-4 lg:px-10">
          <div className="mx-auto max-w-[1100px] bg-white">
            <div className="flex h-16 items-center gap-10 border-b border-zinc-100 px-10 text-sm text-zinc-600">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`relative h-full whitespace-nowrap text-base ${
                    index === 0 ? "font-semibold text-sky-500" : "hover:text-sky-500"
                  }`}
                  type="button"
                >
                  {tab}
                  {index === 0 ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sky-500" /> : null}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8 border-b border-zinc-100 px-16 py-9 md:grid-cols-3">
              {uploadTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.title} className={`flex items-center gap-5 ${index > 0 ? "md:border-l md:border-zinc-100 md:pl-8" : ""}`}>
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-200">
                      <Icon className="size-7" />
                    </span>
                    <div>
                      <h2 className="font-semibold text-zinc-800">{tip.title}</h2>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {uploadedVideo ? (
              <PublishForm
                key={uploadedVideo.url}
                selectedCover={selectedCover}
                video={uploadedVideo}
                onCoverSelect={setSelectedCover}
                onReplaceVideo={handleVideoSelected}
              />
            ) : (
              <UploadEntry onVideoSelected={handleVideoSelected} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
