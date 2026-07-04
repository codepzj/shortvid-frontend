import { lazy } from "react";

const HomePage = lazy(() => import("@/pages/home"));
const CreatorPage = lazy(() => import("@/pages/creator"));
const LoginPage = lazy(() => import("@/pages/login"));
const GithubCallbackPage = lazy(() => import("@/pages/login/github-callback"));
const GiteeCallbackPage = lazy(() => import("@/pages/login/gitee-callback"));

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
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/creator",
    name: "Creator",
    component: CreatorPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/login/github/callback",
    name: "GithubCallback",
    component: GithubCallbackPage,
  },
  {
    path: "/login/gitee/callback",
    name: "GiteeCallback",
    component: GiteeCallbackPage,
  },
];
