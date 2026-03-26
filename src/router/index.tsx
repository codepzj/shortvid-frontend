import { Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { routes } from "./routes";
import type { RouteConfig } from "./routes";
import { Spinner } from "@/components/loading";

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center justify-center">
      <Spinner className="size-6" />
      <p className="text-sm text-gray-500">loading...</p>
    </div>
  </div>
);

function createRouteElement(
  route: RouteConfig,
  isAuthenticated: boolean,
  isLoading: boolean,
): React.ReactNode {
  if (route.redirect) {
    return <Navigate to={route.redirect} replace />;
  }

  if (!route.component) {
    return null;
  }

  const Component = route.component;

  if (route.meta?.requiresAuth) {
    if (isLoading) {
      return <LoadingFallback />;
    }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Component />;
}

function RouterRenderer() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const isLoading = false;

  const routeElements = routes.map((route) => ({
    path: route.path,
    element: createRouteElement(route, isAuthenticated, isLoading),
  }));

  return useRoutes(routeElements);
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterRenderer />
    </Suspense>
  );
}
