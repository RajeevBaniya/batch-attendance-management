import { verifyToken } from "@clerk/backend";
import { NextFunction, Request, Response } from "express";

import prisma from "../config/db";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const isSyncRoute = req.method === "POST" && req.path === "/auth/sync";
  const devClerkUserIdHeader = req.header("x-dev-clerk-user-id");
  const devEmailHeader = req.header("x-dev-email") ?? undefined;

  if (process.env.NODE_ENV === "development" && devClerkUserIdHeader) {
    req.authIdentity = {
      clerkUserId: devClerkUserIdHeader,
      email: devEmailHeader,
    };

    const devUser = await prisma.user.findUnique({
      where: {
        clerkUserId: devClerkUserIdHeader,
      },
    });

    if (!devUser && !isSyncRoute) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    if (devUser) {
      req.user = devUser;
    }
    return next();
  }

  const authorizationHeader = req.header("authorization");

  if (!authorizationHeader) {
    return res.status(401).json({
      success: false,
      message: "Missing or invalid authorization header",
    });
  }

  const authParts = authorizationHeader.trim().split(/\s+/);

  if (authParts.length !== 2 || authParts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Missing or invalid authorization header",
    });
  }

  const token = authParts[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Missing authentication token",
    });
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (typeof payload.sub !== "string" || payload.sub.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const payloadRecord = payload as Record<string, unknown>;
    const payloadEmail = typeof payloadRecord.email === "string" ? payloadRecord.email : undefined;
    req.authIdentity = {
      clerkUserId: payload.sub,
      email: payloadEmail,
    };

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: payload.sub,
      },
    });

    if (!user && !isSyncRoute) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    if (user) {
      req.user = user;
    }
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

export default authMiddleware;
