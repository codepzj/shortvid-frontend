import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { githubLoginAPI, type GithubLoginRequest } from "@/api/user";
import { useUserStore } from "@/store/user";

export default function GithubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { setUser } = useUserStore();

  useEffect(() => {
    if (!code) return;
    const dto: GithubLoginRequest = { code };
    githubLoginAPI(dto)
      .then((res) => {
        // 兼容 axios 风格和拦截器直接返回 data 的风格
        const payload = (res as any)?.data ?? (res as any);
        const { access_token, refresh_token, user } = payload ?? {};
        if (!user) return;

        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        setUser(user);
        localStorage.setItem("isAuthenticated", "true");
        navigate("/home", { replace: true });
      })
      .catch(() => {
        // do nothing, just simple call for demo/blank page
      });
  }, [code, navigate, setUser]);

  return null;
}
