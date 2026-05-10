import { Role } from "@prisma/client";
import { type NextFunction, type Request, type Response } from "express";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const restrictMonitoringWriteAccess = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST" && req.path === "/auth/sync" && !req.user) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role === Role.MONITORING_OFFICER && WRITE_METHODS.has(req.method)) {
    return res.status(403).json({
      success: false,
      message: "Read-only access",
    });
  }

  return next();
};

export default restrictMonitoringWriteAccess;
