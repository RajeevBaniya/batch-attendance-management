import { canOpenRealtimeConnection, subscribeRealtime, unsubscribeRealtime } from "./realtimeService";

import type { Request, Response } from "express";


const streamRealtimeHandler = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!canOpenRealtimeConnection(req.user.id)) {
    return res.status(429).json({ success: false, message: "Too many realtime connections" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const subscriberId = subscribeRealtime(req.user, res);

  req.on("close", () => {
    unsubscribeRealtime(subscriberId);
  });

  req.on("aborted", () => {
    unsubscribeRealtime(subscriberId);
  });

  return undefined;
};

export { streamRealtimeHandler };
