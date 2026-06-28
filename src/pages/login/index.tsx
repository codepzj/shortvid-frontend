import { Navigate, useNavigate } from "react-router-dom";

import { LoginLayout } from "@/components/login/login-layout";
import { LoginForm } from "@/components/login/login-form";
import { useIsAuthenticated } from "@/store/user";

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <LoginLayout>
      <LoginForm
        onLoginSuccess={() => navigate("/home", { replace: true })}
      />
    </LoginLayout>
  );
}
