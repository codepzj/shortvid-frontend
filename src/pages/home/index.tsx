import {
  Captions,
  Home,
  Search,
  Sparkles,
  SquarePlay,
  Upload,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const primaryItems = [
  { label: "首页", icon: Home, active: true, href: "/home" },
  { label: "上传", icon: Upload, href: "/upload" },
];

const videos = [
  {
    title: "视频标题",
    views: "19万",
    comments: "23",
    duration: "03:24",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "视频标题",
    views: "7.2万",
    comments: "356",
    duration: "07:26",
    image: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "视频标题",
    views: "24.8万",
    comments: "252",
    duration: "04:32",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "视频标题",
    views: "16.3万",
    comments: "109",
    duration: "19:09",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "视频标题",
    views: "84.4万",
    comments: "2042",
    duration: "16:43",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=720&q=80",
  },
  {
    title: "视频标题",
    views: "9.1万",
    comments: "177",
    duration: "11:08",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=720&q=80",
  },
];

function VideoCard({ video }: { video: (typeof videos)[number] }) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
        <img
          src={video.image}
          alt={video.title}
          className="size-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/70 to-transparent px-2 pb-1.5 pt-8 text-xs text-white">
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
      <h3 className="mt-2 line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 text-foreground">
        {video.title}
      </h3>
      <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
        <span className="truncate">创作者</span>
        <span>·</span>
        <span>刚刚</span>
      </p>
    </article>
  );
}

export default function HomePage() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>菜单</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryItems.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <>
                      <Icon />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </>
                  );

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                        {item.href.startsWith("/") ? (
                          <Link to={item.href}>{content}</Link>
                        ) : (
                          <a href={item.href}>{content}</a>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
          <SidebarTrigger />
          <div className="flex h-10 min-w-0 flex-1 items-center rounded-md border bg-background px-3 text-sm text-muted-foreground lg:max-w-xl">
            <Search className="mr-2 size-4" />
            <span className="truncate">搜索视频</span>
          </div>
          <Button asChild className="rounded-md">
            <Link to="/upload">
              <Upload data-icon="inline-start" />
              投稿
            </Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col gap-8 px-4 py-6 lg:px-8">
          <section className="grid gap-5 xl:grid-cols-[minmax(420px,1.25fr)_2fr]">
            <article className="relative min-h-[320px] overflow-hidden rounded-md bg-muted">
              <img
                src="https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80"
                alt="首页推荐视频"
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <Badge variant="secondary" className="mb-3 bg-white/90 text-foreground">今日推荐</Badge>
                <h1 className="text-xl font-bold">推荐内容</h1>
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

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">推荐视频</h2>
                <p className="mt-1 text-sm text-muted-foreground">这里展示视频列表内容</p>
              </div>
              <Button variant="outline" className="rounded-md">
                <Sparkles data-icon="inline-start" />
                换一换
              </Button>
            </div>
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard key={`recommend-${video.title}`} video={video} />
              ))}
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
