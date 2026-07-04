import { Heart, MessageCircle, Play, Plus, Share2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const featuredVideos = [
  {
    id: 1,
    title: "城市夜跑 30 秒节奏剪辑",
    author: "林间镜头",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    duration: "00:32",
    likes: "12.8k",
    comments: "842",
    shares: "316",
    topic: "运动",
    poster: "from-zinc-950 via-rose-900 to-orange-400",
  },
  {
    id: 2,
    title: "一人食晚餐：番茄牛肉饭",
    author: "小锅日记",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=96&q=80",
    duration: "00:48",
    likes: "8.6k",
    comments: "493",
    shares: "128",
    topic: "美食",
    poster: "from-emerald-950 via-teal-800 to-amber-300",
  },
  {
    id: 3,
    title: "桌面收纳改造前后对比",
    author: "空间实验室",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80",
    duration: "01:12",
    likes: "21.4k",
    comments: "1.2k",
    shares: "768",
    topic: "生活",
    poster: "from-sky-950 via-cyan-800 to-lime-300",
  },
];

const trends = ["旅行碎片", "通勤穿搭", "周末厨房", "学习打卡", "宠物日常", "胶片感"];

const creators = [
  { name: "阿北剪辑", handle: "@abei", videos: "128" },
  { name: "晨光旅行", handle: "@morningtrip", videos: "76" },
  { name: "Tech Minute", handle: "@techmin", videos: "211" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-cyan-300">ShortVid Studio</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal sm:text-4xl">发现正在流行的短视频</h1>
          </div>
          <Button className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300 md:w-auto">
            <Upload className="size-4" />
            发布作品
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredVideos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
              >
                <div className={`relative aspect-[9/14] bg-gradient-to-br ${video.poster}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.28),transparent_28%),linear-gradient(to_top,rgba(0,0,0,0.72),transparent_56%)]" />
                  <Badge className="absolute left-3 top-3 bg-black/50 text-white hover:bg-black/50">
                    {video.topic}
                  </Badge>
                  <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium">
                    {video.duration}
                  </span>
                  <button
                    className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-950 shadow-lg transition hover:scale-105"
                    type="button"
                    aria-label={`播放 ${video.title}`}
                  >
                    <Play className="ml-1 size-6 fill-current" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h2 className="text-lg font-semibold leading-tight">{video.title}</h2>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar className="size-8 border border-white/20">
                        <AvatarImage src={video.avatar} alt={video.author} />
                        <AvatarFallback>{video.author.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white/85">{video.author}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-white/10 text-sm text-white/75">
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Heart className="size-4" />
                    {video.likes}
                  </div>
                  <div className="flex items-center justify-center gap-2 border-x border-white/10 py-3">
                    <MessageCircle className="size-4" />
                    {video.comments}
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3">
                    <Share2 className="size-4" />
                    {video.shares}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-semibold">趋势话题</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {trends.map((trend) => (
                  <Badge key={trend} variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
                    #{trend}
                  </Badge>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-semibold">推荐创作者</h2>
              <div className="mt-4 flex flex-col gap-4">
                {creators.map((creator) => (
                  <div key={creator.handle} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{creator.name}</p>
                      <p className="truncate text-xs text-white/55">
                        {creator.handle} · {creator.videos} 条作品
                      </p>
                    </div>
                    <Button size="icon-sm" variant="secondary" className="shrink-0 bg-white/10 text-white hover:bg-white/15">
                      <Plus className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
