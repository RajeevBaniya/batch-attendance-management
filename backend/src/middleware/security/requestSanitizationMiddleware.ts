import type { NextFunction, Request, Response } from "express";

const MAX_OBJECT_DEPTH = 6;
const MAX_STRING_LENGTH = 2000;

const stripControlCharacters = (value: string) => {
  return Array.from(value)
    .filter((character) => {
      const charCode = character.charCodeAt(0);
      return charCode >= 32 && charCode !== 127;
    })
    .join("");
};

const sanitizeString = (value: string) => {
  const trimmed = stripControlCharacters(value.trim());
  if (trimmed.length > MAX_STRING_LENGTH) {
    throw new Error("INVALID_INPUT_TOO_LARGE");
  }
  return trimmed;
};

const sanitizeUnknown = (value: unknown, depth: number): unknown => {
  if (depth > MAX_OBJECT_DEPTH) {
    throw new Error("INVALID_INPUT_DEPTH");
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeUnknown(entry, depth + 1));
  }

  if (value !== null && typeof value === "object") {
    const sanitizedObject: Record<string, unknown> = {};
    Object.entries(value).forEach(([key, objectValue]) => {
      sanitizedObject[key] = sanitizeUnknown(objectValue, depth + 1);
    });
    return sanitizedObject;
  }

  return value;
};

const requestSanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = sanitizeUnknown(req.body, 0);
    req.query = sanitizeUnknown(req.query, 0) as Request["query"];
    req.params = sanitizeUnknown(req.params, 0) as Request["params"];
    return next();
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid request",
    });
  }
};

export { requestSanitizationMiddleware };
