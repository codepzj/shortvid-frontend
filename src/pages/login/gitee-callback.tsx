import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  giteeLoginAPI,
  type GiteeLoginRequest,
  type LoginGiteeResponse,
} from "@/api/user";
import { useUserStore } from "@/store/user";

export default function GiteeCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const setAuth = useUserStore((state) => state.setAuth);

  useEffect(() => {
    if (!code) return;

    const dto: GiteeLoginRequest = { code };
    giteeLoginAPI(dto)
      .then((res) => {
        const payload = (res as { data?: LoginGiteeResponse }).data ?? res;
        const { access_token, refresh_token, user } = payload as LoginGiteeResponse;
        if (!user) return;

        setAuth({ user, access_token, refresh_token });
        navigate("/home", { replace: true });
      })
      .catch(() => {
        // do nothing, just simple call for demo/blank page
      });
  }, [code, navigate, setAuth]);

  return null;
}
