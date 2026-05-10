import { Prisma } from "@prisma/client";
import { type Response } from "express";

type ErrorResponse = {
  status: number;
  message: string;
};

type ErrorOverrides = Record<string, ErrorResponse>;

const resolveErrorResponse = (error: unknown, overrides: ErrorOverrides = {}): ErrorResponse => {
  if (!(error instanceof Error)) {
    return {
      status: 500,
      message: "Internal server error",
    };
  }

  if (overrides[error.message]) {
    return overrides[error.message];
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        status: 409,
        message: "Resource already exists",
      };
    }
  }

  if (error.message === "ROLE_NOT_ALLOWED") {
    return {
      status: 403,
      message: "Forbidden",
    };
  }

  if (error.message.startsWith("UNAUTHORIZED_")) {
    return {
      status: 403,
      message: "Forbidden",
    };
  }

  if (error.message.startsWith("INVALID_")) {
    return {
      status: 400,
      message: "Invalid request",
    };
  }

  if (error.message.endsWith("_NOT_FOUND")) {
    return {
      status: 404,
      message: "Resource not found",
    };
  }

  return {
    status: 500,
    message: "Internal server error",
  };
};

const errorResponse = (res: Response, error: unknown, overrides: ErrorOverrides = {}) => {
  if (error instanceof Error) {
    console.error("request_failed", {
      message: error.message,
      name: error.name,
    });
  } else {
    console.error("request_failed_unknown", error);
  }

  const resolvedError = resolveErrorResponse(error, overrides);

  return res.status(resolvedError.status).json({
    success: false,
    message: resolvedError.message,
  });
};

export { errorResponse, resolveErrorResponse };
export type { ErrorOverrides };
