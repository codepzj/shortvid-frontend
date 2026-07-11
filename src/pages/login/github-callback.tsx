import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  githubLoginAPI,
  type GithubLoginRequest,
} from "@/api";
import { useUserStore } from "@/store/user";

export default function GithubCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const setAuth = useUserStore((state) => state.setAuth);
  const loginRequestedRef = useRef(false);

  useEffect(() => {
    if (!code || loginRequestedRef.current) return;
    loginRequestedRef.current = true;

    const dto: GithubLoginRequest = { code };
    githubLoginAPI(dto)
      .then((res) => {
        const { access_token, refresh_token, user } = res.data;
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
