export function LoginGitee() {
  const clientId = import.meta.env.VITE_GITEE_CLIENT_ID as string;
  const redirectUri =
    (import.meta.env.VITE_GITEE_REDIRECT_URI as string | undefined) ??
    `${window.location.origin}/login/gitee/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user_info emails",
  });

  window.location.assign(`https://gitee.com/oauth/authorize?${params.toString()}`);
}
