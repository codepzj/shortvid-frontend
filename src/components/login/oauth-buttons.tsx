import { Button } from "@/components/ui/button";

type OAuthButtonsProps = {
  onGitHubLogin: () => void;
  onGiteeLogin: () => void;
  onGoogleLogin: () => void;
};

export function OAuthButtons({ onGitHubLogin, onGiteeLogin, onGoogleLogin }: OAuthButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" type="button" className="w-full" onClick={onGitHubLogin}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            fill="currentColor"
          />
        </svg>
        Login with GitHub
      </Button>
      <Button
        variant="outline"
        type="button"
        className="w-full flex items-center justify-center gap-2"
        onClick={onGiteeLogin}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="#c71d23" />
          <path
            d="M7.25 6.75h7.25a4.25 4.25 0 0 1 0 8.5h-3.75v-2.5h3.75a1.75 1.75 0 1 0 0-3.5H9.75v8H7.25z"
            fill="#fff"
          />
        </svg>
        Login with Gitee
      </Button>
      <Button
        variant="outline"
        type="button"
        className="w-full flex items-center justify-center gap-2"
        onClick={onGoogleLogin}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 16 16">
          <g fill="none" fillRule="evenodd" clipRule="evenodd">
            <path
              fill="#f44336"
              d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86"
              opacity=".987"
            />
            <path
              fill="#ffc107"
              d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92"
              opacity=".997"
            />
            <path
              fill="#448aff"
              d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49"
              opacity=".999"
            />
            <path
              fill="#43a047"
              d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z"
              opacity=".993"
            />
          </g>
        </svg>
        Login with Google
      </Button>
    </div>
  );
}
