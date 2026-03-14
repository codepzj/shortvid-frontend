import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/third_party/firebase";
import { firebaseLoginAPI } from "@/api/user";

interface LoginFormProps extends Omit<
  React.ComponentProps<"form">,
  "onSubmit"
> {
  onLoginSuccess?: () => void;
}

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await firebaseLoginAPI(idToken);

      const userInfo = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        providerId: result.providerId,
      };
      localStorage.setItem("user", JSON.stringify(userInfo));

      onLoginSuccess?.();
    } catch (error) {
      console.error("Google 登录失败:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess?.();
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <div className="flex flex-col gap-2">
            <Button variant="outline" type="button" className="w-full">
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
              onClick={handleGoogleLogin}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3 2.3c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.3-.2-1.9H12z"
                />
                <path
                  fill="#34A853"
                  d="M6.6 13.9 5.9 14.4l-2.4 1.8C5.1 19.7 8.3 21.6 12 21.6c2.3 0 4.2-.7 5.6-1.9l-3-2.3c-.8.5-1.8.9-2.6.9-2 0-3.8-1.3-4.4-3.2z"
                />
                <path
                  fill="#4A90E2"
                  d="M3.5 7.7C2.8 9 2.4 10.5 2.4 12s.4 3 1.1 4.3l3.2-2.4C6.4 13.3 6.3 12.7 6.3 12s.1-1.3.4-1.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 6.4c1.3 0 2.4.4 3.3 1.2l2.5-2.5C16.2 3.6 14.3 2.8 12 2.8 8.3 2.8 5.1 4.7 3.5 7.7l3.2 2.4C7.2 7.7 9 6.4 12 6.4z"
                />
              </svg>
              Login with Google
            </Button>
          </div>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
