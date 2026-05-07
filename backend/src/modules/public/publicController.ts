import { Request, Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { listPublicInstitutions } from "./publicService";

const getPublicInstitutionsHandler = async (req: Request, res: Response) => {
  try {
    if (Object.keys(req.query).length > 0) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const institutions = await listPublicInstitutions();
    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export { getPublicInstitutionsHandler };
