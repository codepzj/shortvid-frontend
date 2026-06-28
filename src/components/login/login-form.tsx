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
import { LoginGithub } from "@/third_party/github";
import { firebaseLoginAPI, type LoginFirebaseRequest } from "@/api/user";
import { useUserStore } from "@/store/user";
import { OAuthButtons } from "./oauth-buttons";

export interface LoginFormProps extends Omit<
  React.ComponentProps<"form">,
  "onSubmit"
> {
  onLoginSuccess: () => void;
}

export function LoginForm({ className, onLoginSuccess, ...props }: LoginFormProps) {
  const setAuth = useUserStore((state) => state.setAuth);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const dto: LoginFirebaseRequest = {
        id_token: idToken,
      };

      const { data } = await firebaseLoginAPI(dto);
      const { user, access_token, refresh_token } = data;
      setAuth({ user, access_token, refresh_token });
      onLoginSuccess?.();
    } catch (error) {
      console.error("google login failed:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
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
          <OAuthButtons
            onGitHubLogin={LoginGithub}
            onGoogleLogin={handleGoogleLogin}
          />
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
