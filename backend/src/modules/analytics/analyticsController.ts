import { Request, Response } from "express";
import { z } from "zod";

import { errorResponse } from "../../utils/errorResponse";
import { listAnalyticsInstitutions } from "./analyticsService";

const analyticsQuerySchema = z.object({}).passthrough();

const getAnalyticsInstitutionsHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = analyticsQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const institutions = await listAnalyticsInstitutions(req.user);
    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export { getAnalyticsInstitutionsHandler };
