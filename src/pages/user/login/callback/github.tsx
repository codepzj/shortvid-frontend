import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { githubLoginAPI, type GithubLoginRequest } from "@/api/user";
import { useUserStore } from "@/store/user";

export default function GithubCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const { setUser } = useUserStore();

  useEffect(() => {
    const fetchGithubLogin = async () => {
      if (code) {
        const dto: GithubLoginRequest = {
          code: code,
        };
        const { data } = await githubLoginAPI(dto);
        const { user } = data;
        setUser(user);
      }
    };
    fetchGithubLogin();
  }, [code, setUser]);

  return <div>GithubCallback</div>;
}
