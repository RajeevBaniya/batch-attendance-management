import { useAuth } from "@clerk/clerk-react";
import type { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthContext } from "../hooks/useAuthContext";
import type { BackendRole } from "../types/authTypes";

type ProtectedRouteProps = {
  allowedRoles?: BackendRole[];
  children?: ReactElement;
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { backendUser, isLoading, syncStatus, role } = useAuthContext();

  if (!isLoaded || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/65 p-5 text-center shadow-[0_20px_50px_rgba(2,6,23,0.5)]">
          <p className="text-sm font-medium text-slate-200">Restoring your workspace...</p>
          <p className="mt-2 text-xs text-slate-400">Checking authentication and syncing role access.</p>
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  if (syncStatus === "error" || !backendUser) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
};

export { ProtectedRoute };
