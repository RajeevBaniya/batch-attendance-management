import { Request, Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import {
  assignStudentToBatch,
  assignTrainerToBatch,
  createBatch,
  generateInvite,
  getBatchSummary,
  getInstitutionSummary,
  getProgrammeSummary,
  joinBatchWithInvite,
} from "./batchService";
import {
  assignStudentSchema,
  assignTrainerSchema,
  batchQuerySchema,
  batchIdParamSchema,
  createBatchSchema,
  institutionIdParamSchema,
  joinBatchSchema,
} from "./batchTypes";

const createBatchHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = createBatchSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const createdBatch = await createBatch(parsedBody.data, req.user);

    return res.status(201).json({
      success: true,
      data: createdBatch,
    });
  } catch (error) {
    return errorResponse(res, error, {
      TRAINER_INSTITUTION_REQUIRED: {
        status: 400,
        message: "Invalid request",
      },
    });
  }
};

const assignTrainerHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = batchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = assignTrainerSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const assignment = await assignTrainerToBatch(parsedParams.data.id, parsedBody.data, req.user);
    return res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    return errorResponse(res, error, {
      TRAINER_ALREADY_ASSIGNED: {
        status: 409,
        message: "Conflict",
      },
    });
  }
};

const assignStudentHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = batchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = assignStudentSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const assignment = await assignStudentToBatch(parsedParams.data.id, parsedBody.data, req.user);
    return res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    return errorResponse(res, error, {
      STUDENT_ALREADY_ASSIGNED: {
        status: 409,
        message: "Conflict",
      },
    });
  }
};

const generateInviteHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = batchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const invite = await generateInvite(parsedParams.data.id, req.user);

    return res.status(201).json({
      success: true,
      data: invite,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const joinBatchHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedBody = joinBatchSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const assignment = await joinBatchWithInvite(parsedBody.data, req.user);

    return res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    return errorResponse(res, error, {
      INVITE_EXPIRED: {
        status: 400,
        message: "Invalid request",
      },
      STUDENT_ALREADY_ASSIGNED: {
        status: 409,
        message: "Conflict",
      },
    });
  }
};

const getBatchSummaryHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = batchIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const summary = await getBatchSummary(parsedParams.data.id, req.user);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getInstitutionSummaryHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const parsedParams = institutionIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const summary = await getInstitutionSummary(parsedParams.data.id, req.user);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getProgrammeSummaryHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = batchQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const summary = await getProgrammeSummary(req.user);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export {
  createBatchHandler,
  assignTrainerHandler,
  assignStudentHandler,
  generateInviteHandler,
  joinBatchHandler,
  getBatchSummaryHandler,
  getInstitutionSummaryHandler,
  getProgrammeSummaryHandler,
};
