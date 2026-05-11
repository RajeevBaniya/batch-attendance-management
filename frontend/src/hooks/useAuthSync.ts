import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";

import { apiClient } from "../api/client";
import type { BackendRole } from "../types/authTypes";

type BackendUser = {
  id: string;
  clerkUserId: string | null;
  email: string | null;
  name: string;
  role: BackendRole;
  institutionId: string | null;
  createdAt: string;
};

type SyncStatus = "idle" | "loading" | "success" | "error";

type AuthSyncState = {
  backendUser: BackendUser | null;
  syncStatus: SyncStatus;
  isLoading: boolean;
  errorMessage: string | null;
};

type SyncResponse = {
  success: true;
  data: BackendUser;
};

const useAuthSync = (): AuthSyncState => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const syncedClerkUserIdRef = useRef<string | null>(null);
  const attemptedClerkUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user?.id) {
      syncedClerkUserIdRef.current = null;
      attemptedClerkUserIdRef.current = null;
      return;
    }

    if (syncedClerkUserIdRef.current === user.id && syncStatus === "success") {
      return;
    }

    if (attemptedClerkUserIdRef.current === user.id) {
      return;
    }

    attemptedClerkUserIdRef.current = user.id;

    const syncUser = async () => {
      setSyncStatus("loading");
      setErrorMessage(null);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("AUTH_TOKEN_MISSING");
        }

        const response = await apiClient.post<SyncResponse>("/api/auth/sync");
        setBackendUser(response.data.data);
        setSyncStatus("success");
        syncedClerkUserIdRef.current = user.id;
      } catch {
        setBackendUser(null);
        setSyncStatus("error");
        setErrorMessage("Authentication sync failed");
      }
    };

    void syncUser();
  }, [getToken, isLoaded, isSignedIn, syncStatus, user?.id]);

  const isSessionReady = isLoaded && isSignedIn && Boolean(user?.id);

  return {
    backendUser: isSessionReady ? backendUser : null,
    syncStatus: isSessionReady ? syncStatus : "idle",
    isLoading: !isLoaded || (isSessionReady && (syncStatus === "idle" || syncStatus === "loading")),
    errorMessage: isSessionReady ? errorMessage : null,
  };
};

export { useAuthSync };
export type { BackendUser, SyncStatus };
