import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface AuthIdentity {
      clerkUserId: string;
      email?: string;
    }

    interface Request {
      user?: User;
      authIdentity?: AuthIdentity;
    }
  }
}

export {};
