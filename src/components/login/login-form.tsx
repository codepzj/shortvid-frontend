import { cn } from "@/lib/utils";
import { Field, FieldGroup } from "@/components/ui/field";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/third_party/firebase";
import { LoginGithub } from "@/third_party/github";
import { firebaseLoginAPI, type LoginFirebaseRequest } from "@/api/user";
import { useUserStore } from "@/store/user";
import { OAuthButtons } from "./oauth-buttons";

export interface LoginFormProps extends React.ComponentProps<"div"> {
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

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Continue with GitHub or Google
          </p>
        </div>
        <Field>
          <OAuthButtons
            onGitHubLogin={LoginGithub}
            onGoogleLogin={handleGoogleLogin}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
