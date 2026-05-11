import { useAuth } from "@clerk/clerk-react";
import { createContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { setTokenGetter } from "../api/client";
import { useAuthSync } from "../hooks/useAuthSync";
import type { BackendUser } from "../hooks/useAuthSync";
import type { BackendRole } from "../types/authTypes";

type AuthContextValue = {
  backendUser: BackendUser | null;
  role: BackendRole | null;
  isLoading: boolean;
  syncStatus: "idle" | "loading" | "success" | "error";
  syncError: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { getToken } = useAuth();
  const { backendUser, isLoading, syncStatus, errorMessage } = useAuthSync();

  useEffect(() => {
    setTokenGetter(getToken);
    return () => {
      setTokenGetter(null);
    };
  }, [getToken]);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      backendUser,
      role: backendUser?.role ?? null,
      isLoading,
      syncStatus,
      syncError: errorMessage,
    }),
    [backendUser, errorMessage, isLoading, syncStatus],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
export type { AuthContextValue };
