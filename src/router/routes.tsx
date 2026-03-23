import { lazy } from "react";

const Home = lazy(() => import("@/pages/home"));
import LoginPage from "@/pages/user/login/login";
import GithubCallback from "@/pages/user/login/callback/github";

export interface RouteConfig {
  path: string;
  name?: string;
  component?: React.ComponentType;
  redirect?: string;
  meta?: {
    requiresAuth?: boolean;
    title?: string;
  };
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: () => <LoginPage />,
  },
  {
    path: "/login/github/callback",
    name: "GithubCallback",
    component: () => <GithubCallback />,
  }
];
