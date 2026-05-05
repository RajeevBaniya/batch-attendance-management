import { verifyToken } from "@clerk/backend";
import { NextFunction, Request, Response } from "express";

import prisma from "../config/db";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const devClerkUserIdHeader = req.header("x-dev-clerk-user-id");

  if (process.env.NODE_ENV === "development" && devClerkUserIdHeader) {
    const devUser = await prisma.user.findUnique({
      where: {
        clerkUserId: devClerkUserIdHeader,
      },
    });

    if (!devUser) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    req.user = devUser;
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

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: payload.sub,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }
};

export default authMiddleware;
