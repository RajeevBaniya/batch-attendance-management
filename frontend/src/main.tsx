import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import { AuthProvider } from "./providers/authProvider";
import { NotificationProvider } from "./providers/notificationProvider";
import { queryClient } from "./providers/queryClient";
import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!clerkPublishableKey) {
  createRoot(rootElement).render(
    <StrictMode>
      <div>Missing VITE_CLERK_PUBLISHABLE_KEY</div>
    </StrictMode>,
  );
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        appearance={{
          elements: {
            modalBackdrop: "bg-slate-950/45 backdrop-blur-sm",
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <NotificationProvider>
            <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthProvider>
          </NotificationProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </StrictMode>,
  );
}
