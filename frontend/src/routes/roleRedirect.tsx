import { Navigate } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import { getDashboardRouteForRole } from "./roleRoutes";

const RoleRedirect = () => {
  const { backendUser, isLoading, syncStatus } = useAuthContext();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      </main>
    );
  }

  if (syncStatus === "error" || !backendUser) {
    return <Navigate to="/unauthorized" replace />;
  }

  const dashboardRoute = getDashboardRouteForRole(backendUser.role);
  return <Navigate to={dashboardRoute} replace />;
};

export { RoleRedirect };
