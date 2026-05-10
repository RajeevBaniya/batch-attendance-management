import rateLimit from "express-rate-limit";

import type { Request } from "express";

type RoleLimitConfig = {
  defaultMax: number;
  trainerMax?: number;
  institutionMax?: number;
};

const resolveRequestIdentifier = (req: Request) => {
  const userId = req.user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${req.ip ?? "unknown"}`;
};

const buildRoleAwareLimiter = (windowMs: number, config: RoleLimitConfig) =>
  rateLimit({
    windowMs,
    limit: (req) => {
      if (req.user?.role === "TRAINER" && config.trainerMax) {
        return config.trainerMax;
      }
      if (req.user?.role === "INSTITUTION" && config.institutionMax) {
        return config.institutionMax;
      }
      return config.defaultMax;
    },
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: resolveRequestIdentifier,
    handler: (_req, res) => {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Try again later.",
      });
    },
  });

const authSyncRateLimiter = buildRoleAwareLimiter(60 * 1000, {
  defaultMax: 20,
});

const realtimeStreamRateLimiter = buildRoleAwareLimiter(60 * 1000, {
  defaultMax: 15,
});

const attendanceWriteRateLimiter = buildRoleAwareLimiter(60 * 1000, {
  defaultMax: 60,
  trainerMax: 90,
});

const inviteGenerationRateLimiter = buildRoleAwareLimiter(60 * 1000, {
  defaultMax: 20,
  trainerMax: 30,
  institutionMax: 30,
});

const trainerRequestCreationRateLimiter = buildRoleAwareLimiter(60 * 60 * 1000, {
  defaultMax: 10,
});

const reportExportRateLimiter = buildRoleAwareLimiter(60 * 1000, {
  defaultMax: 8,
  trainerMax: 10,
  institutionMax: 10,
});

export {
  attendanceWriteRateLimiter,
  authSyncRateLimiter,
  inviteGenerationRateLimiter,
  reportExportRateLimiter,
  realtimeStreamRateLimiter,
  trainerRequestCreationRateLimiter,
};
