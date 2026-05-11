import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { ToastContainer } from "../components/feedback/toastContainer";
import type { ToastMessage } from "../components/feedback/toastContainer";
import type { ToastVariant } from "../components/feedback/toast";

type NotificationPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type NotificationContextValue = {
  notify: (payload: NotificationPayload) => void;
  notifySuccess: (title: string, description?: string) => void;
  notifyError: (title: string, description?: string) => void;
  notifyInfo: (title: string, description?: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

type NotificationProviderProps = {
  children: ReactNode;
};

const MAX_TOASTS = 3;

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setMessages((currentMessages) => currentMessages.filter((message) => message.id !== id));
  }, []);

  const notify = useCallback((payload: NotificationPayload) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const message: ToastMessage = {
      id,
      title: payload.title,
      description: payload.description,
      variant: payload.variant ?? "info",
    };

    setMessages((currentMessages) => [message, ...currentMessages].slice(0, MAX_TOASTS));
  }, []);

  const contextValue = useMemo<NotificationContextValue>(
    () => ({
      notify,
      notifySuccess: (title, description) => notify({ title, description, variant: "success" }),
      notifyError: (title, description) => notify({ title, description, variant: "error" }),
      notifyInfo: (title, description) => notify({ title, description, variant: "info" }),
    }),
    [notify],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer messages={messages} onClose={dismiss} />
    </NotificationContext.Provider>
  );
};

export { NotificationProvider, NotificationContext };
export type { NotificationContextValue, NotificationPayload };
