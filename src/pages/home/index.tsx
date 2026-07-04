import {
  Bell,
  BookOpen,
  Captions,
  ChevronDown,
  Flame,
  Gamepad2,
  Heart,
  History,
  Home,
  Mail,
  MonitorPlay,
  Radio,
  RefreshCw,
  Search,
  SquarePlay,
  Star,
  Upload,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "首页", icon: Home },
  { label: "番剧" },
  { label: "直播", icon: Radio },
  { label: "游戏中心", icon: Gamepad2 },
  { label: "会员购" },
  { label: "漫画" },
  { label: "赛事" },
];

const userActions = [
  { label: "大会员", icon: Star },
  { label: "消息", icon: Mail },
  { label: "动态", icon: Bell },
  { label: "收藏", icon: Heart },
  { label: "历史", icon: History },
  { label: "创作中心", icon: Upload, path: "/creator" },
];

const channels = [
  "番剧",
  "国创",
  "综艺",
  "动画",
  "鬼畜",
  "舞蹈",
  "娱乐",
  "科技数码",
  "美食",
  "汽车",
  "体育运动",
  "vlog",
  "电影",
  "电视剧",
  "纪录片",
  "游戏",
  "音乐",
  "影视",
  "知识",
  "资讯",
  "小剧场",
  "时尚美妆",
  "动物",
];

const shortcutItems = [
  { label: "专栏", icon: BookOpen },
  { label: "活动", icon: Flame },
  { label: "社区中心", icon: Users },
  { label: "直播", icon: Radio },
  { label: "课堂", icon: MonitorPlay },
  { label: "新歌热榜", icon: Star },
];

const videos = [
  {
    title: "前端已死？但不是你以为的死法",
    author: "代码之外BeyondCode",
    date: "06-24",
    views: "19万",
    comments: "23",
    duration: "01:35:25",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=720&q=80",
    tag: "热门",
  },
  {
    title: "月薪几万后，她选择从零开始做手工",
    author: "捕风同学",
    date: "06-17",
    views: "7.2万",
    comments: "356",
    duration: "07:26",
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "新植物：菠萝战车",
    author: "潜艇侍伟迷",
    date: "07-01",
    views: "24.8万",
    comments: "252",
    duration: "04:32",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=720&q=80",
    tag: "1万点赞",
  },
  {
    title: "一天带你建立 Unity 开发的知识体系",
    author: "游池记",
    date: "2025-12-09",
    views: "16.3万",
    comments: "109",
    duration: "19:09",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=720&q=80",
    tag: "6千点赞",
  },
  {
    title: "天津75元烤串自助，腰子油边小龙虾通通爽吃",
    author: "橙飞一下",
    date: "06-24",
    views: "84.4万",
    comments: "2042",
    duration: "16:43",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "Vibe Coding 零基础入门，AI 编程实战",
    author: "黑马程序员",
    date: "07-01",
    views: "9.1万",
    comments: "177",
    duration: "07:31:11",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "周末城市骑行路线，避开人潮看晚霞",
    author: "晨光旅行",
    date: "07-02",
    views: "12.5万",
    comments: "521",
    duration: "08:12",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "把小房间改造成沉浸式工作区",
    author: "空间实验室",
    date: "06-30",
    views: "31.8万",
    comments: "904",
    duration: "11:08",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=720&q=80",
  },
];

function VideoCard({ video }: { video: (typeof videos)[number] }) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-md bg-zinc-100">
        <img
          src={video.image}
          alt={video.title}
          className="size-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-8 text-xs text-white">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex items-center gap-1">
              <SquarePlay className="size-3.5" strokeWidth={2.4} />
              {video.views}
            </span>
            <span className="flex items-center gap-1">
              <Captions className="size-3.5" strokeWidth={2.4} />
              {video.comments}
            </span>
          </div>
          <span>{video.duration}</span>
        </div>
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 text-zinc-950">
        {video.title}
      </h3>
      <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-zinc-500">
        {video.tag ? <span className="rounded bg-orange-50 px-1 text-orange-500">{video.tag}</span> : null}
        <span className="truncate">{video.author}</span>
        <span>·</span>
        <span>{video.date}</span>
      </p>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="relative h-40 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80"
          alt="VideoHub banner"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-white/10" />

        <nav className="relative z-10 flex h-16 items-start justify-between gap-4 px-4 pt-4 text-sm text-white lg:px-6">
          <div className="hidden min-w-0 items-center gap-5 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} className="flex shrink-0 items-center gap-1.5 font-medium drop-shadow" href="#">
                  {Icon ? <Icon className="size-4" /> : null}
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="mx-auto flex h-10 w-full max-w-[540px] items-center rounded-lg bg-white/95 px-4 text-zinc-500 shadow-sm md:mx-4">
            <span className="flex-1">暴走英雄坛</span>
            <Search className="size-5 text-zinc-800" />
          </div>

          <div className="flex shrink-0 items-start gap-3 lg:gap-4">
            <Avatar className="size-10 border-2 border-white">
              <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80" alt="用户头像" />
              <AvatarFallback>V</AvatarFallback>
            </Avatar>
            {userActions.map((item) => {
              const Icon = item.icon;
              const className = "hidden flex-col items-center gap-1 text-xs font-medium xl:flex";
              const path = "path" in item ? item.path : undefined;

              if (path) {
                return (
                  <Link key={item.label} className={className} to={path}>
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <a key={item.label} className={className} href="#">
                  <Icon className="size-5" />
                  {item.label}
                </a>
              );
            })}
            <Button asChild className="hidden h-9 rounded-md bg-pink-500 px-5 text-white hover:bg-pink-400 sm:inline-flex">
              <Link to="/creator">
                <Upload className="size-4" />
                投稿
              </Link>
            </Button>
          </div>
        </nav>

        <div className="absolute bottom-4 left-8 text-4xl font-black italic tracking-normal text-pink-500 drop-shadow-sm">
          VideoHub
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1420px] px-4 py-5 lg:px-6">
        <div className="grid gap-4 border-b border-zinc-100 pb-5 lg:grid-cols-[128px_minmax(0,1fr)] xl:grid-cols-[128px_minmax(0,1fr)_288px]">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2 text-sm font-medium">
              <span className="grid size-12 place-items-center rounded-full bg-lime-100 text-lime-600">
                <MonitorPlay className="size-7" />
              </span>
              动态
            </div>
            <div className="flex flex-col items-center gap-2 text-sm font-medium">
              <span className="grid size-12 place-items-center rounded-full bg-rose-100 text-rose-500">
                <Flame className="size-7" />
              </span>
              热门
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-2 gap-y-2 sm:grid-cols-4 md:grid-cols-6 2xl:grid-cols-12">
            {channels.map((channel) => (
              <button
                key={channel}
                type="button"
                className="h-8 whitespace-nowrap rounded-md border border-zinc-100 bg-zinc-50 px-2 text-sm text-zinc-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600"
              >
                {channel}
              </button>
            ))}
            <button
              type="button"
              className="flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-zinc-100 bg-zinc-50 px-2 text-sm text-zinc-700"
            >
              更多
              <ChevronDown className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-3 border-zinc-100 text-sm text-zinc-600 lg:col-start-2 xl:col-start-auto xl:border-l xl:pl-4">
            {shortcutItems.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.label} className="flex items-center gap-2 whitespace-nowrap hover:text-cyan-600" href="#">
                  <Icon className="size-4" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(480px,2fr)_3fr]">
          <article className="relative min-h-[330px] overflow-hidden rounded-lg bg-zinc-100">
            <img
              src="https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80"
              alt="首页推荐视频"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h2 className="text-xl font-bold">书科考丁未？不耽误我射科第一啊！</h2>
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className={`size-2 rounded-full ${index === 5 ? "w-4 bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </article>

          <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
            {videos.slice(0, 6).map((video) => (
              <VideoCard key={video.title} video={video} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">推荐视频</h2>
            <Button variant="outline" className="h-8 gap-2 rounded-md text-zinc-600">
              <RefreshCw className="size-4" />
              换一换
            </Button>
          </div>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={`recommend-${video.title}`} video={video} />
            ))}
          </div>
        </section>
      </section>

      <aside className="fixed right-6 top-[330px] z-20 hidden flex-col gap-3 2xl:flex">
        <button
          type="button"
          className="flex h-24 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-700 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600"
        >
          <RefreshCw className="size-4" />
          <span>换一换</span>
        </button>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:border-cyan-200 hover:text-cyan-600"
          aria-label="刷新推荐"
        >
          <RefreshCw className="size-4" />
        </button>
      </aside>
    </main>
  );
}
