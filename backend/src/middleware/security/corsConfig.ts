import type { CorsOptions } from "cors";

const parseAllowedOrigins = () => {
  const rawOrigins = process.env.ALLOWED_ORIGINS;
  if (!rawOrigins) {
    return [];
  }

  return rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const isDevelopment = process.env.NODE_ENV === "development";
const allowedOrigins = parseAllowedOrigins();

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (isDevelopment && allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "x-dev-clerk-user-id", "x-dev-email"],
};

export { corsOptions };
