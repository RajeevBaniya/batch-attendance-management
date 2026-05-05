import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const requireRole = (allowedRoles: Role[]) => {
  const roleMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const hasAccess = allowedRoles.includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return next();
  };

  return roleMiddleware;
};

export default requireRole;
