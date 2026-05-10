import type { NextFunction, Request, Response } from "express";

const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") {
    return next();
  }

  const startedAt = Date.now();

  res.on("finish", () => {
    const elapsedMs = Date.now() - startedAt;
    console.info("request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      elapsedMs,
    });
  });

  return next();
};

export { requestLoggingMiddleware };
