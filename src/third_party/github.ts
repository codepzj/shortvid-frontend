export function LoginGithub() {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string;

  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
  window.location.assign(url);
}
