export function LoginGitee() {
  const clientId = import.meta.env.VITE_GITEE_CLIENT_ID as string;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: "http://localhost:5173/login/gitee/callback",
    scope: "user_info",
  });

  window.location.assign(`https://gitee.com/oauth/authorize?${params.toString()}`);
}
