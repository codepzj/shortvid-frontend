import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { logoutAPI } from "@/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/user";

export function UserMenu() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.access_token);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      if (accessToken) {
        await logoutAPI(accessToken);
      }
    } catch {
      // 服务端会话清理失败时仍然完成本地退出。
    } finally {
      useUserStore.getState().clearUser();
      navigate("/login", { replace: true });
    }
  };

  const fallback = user?.nickname?.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="用户菜单">
          <Avatar className="size-8">
            <AvatarImage src={user?.avatar} alt={user?.nickname || "用户头像"} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm font-medium">{user?.nickname || "ShortVid 用户"}</p>
            {user?.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={() => void handleLogout()}
        >
          {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          {isLoggingOut ? "正在退出..." : "退出登录"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
