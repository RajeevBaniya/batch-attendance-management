import { type Request, type Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { buildPaginatedData, parsePaginationParams } from "../../utils/pagination";

import {
  approveTrainerRequest,
  createInstitution,
  createInstitutionAdmin,
  getInstitutionTrainers,
  getTrainerRequests,
  listInstitutions,
  createMonitoringOfficer,
  createProgrammeManager,
  createTrainerRequest,
} from "./institutionService";
import {
  createInstitutionAdminSchema,
  createInstitutionSchema,
  createRoleUserSchema,
  createTrainerRequestSchema,
  institutionIdParamSchema,
  institutionQuerySchema,
  trainerRequestQuerySchema,
  trainerRequestIdParamSchema,
} from "./institutionTypes";

const createInstitutionHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedBody = createInstitutionSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const institution = await createInstitution(parsedBody.data, req.user);
    return res.status(201).json({ success: true, data: institution });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const listInstitutionsHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const institutions = await listInstitutions(req.user);
    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const createInstitutionAdminHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedParams = institutionIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedBody = createInstitutionAdminSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const admin = await createInstitutionAdmin(parsedParams.data.id, parsedBody.data, req.user);
    return res.status(201).json({ success: true, data: admin });
  } catch (error) {
    return errorResponse(res, error, {
      EMAIL_ALREADY_EXISTS: { status: 409, message: "Conflict" },
    });
  }
};

const createProgrammeManagerHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedBody = createRoleUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const programmeManager = await createProgrammeManager(parsedBody.data, req.user);
    return res.status(201).json({ success: true, data: programmeManager });
  } catch (error) {
    return errorResponse(res, error, {
      EMAIL_ALREADY_EXISTS: { status: 409, message: "Conflict" },
      CLERK_USER_ID_EXISTS: { status: 409, message: "Conflict" },
    });
  }
};

const createMonitoringOfficerHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedBody = createRoleUserSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const monitoringOfficer = await createMonitoringOfficer(parsedBody.data, req.user);
    return res.status(201).json({ success: true, data: monitoringOfficer });
  } catch (error) {
    return errorResponse(res, error, {
      EMAIL_ALREADY_EXISTS: { status: 409, message: "Conflict" },
      CLERK_USER_ID_EXISTS: { status: 409, message: "Conflict" },
    });
  }
};

const createTrainerRequestHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedBody = createTrainerRequestSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const trainerRequest = await createTrainerRequest(parsedBody.data, req.user);
    return res.status(201).json({ success: true, data: trainerRequest });
  } catch (error) {
    return errorResponse(res, error, {
      TRAINER_REQUEST_ALREADY_EXISTS: { status: 409, message: "Conflict" },
    });
  }
};

const approveTrainerRequestHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const parsedParams = trainerRequestIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const approvalResult = await approveTrainerRequest(parsedParams.data.id, req.user);
    return res.status(200).json({ success: true, data: approvalResult });
  } catch (error) {
    return errorResponse(res, error, {
      TRAINER_REQUEST_ALREADY_APPROVED: { status: 409, message: "Conflict" },
    });
  }
};

const getTrainerRequestsHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = trainerRequestQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const pagination = parsePaginationParams(req.query);
    const requests = await getTrainerRequests(req.user, pagination);
    const items = requests.items.map((request) => ({
      id: request.id,
      userId: request.requester.id,
      name: request.requester.name,
      email: request.requester.email,
      status: request.approvedAt ? "APPROVED" : "PENDING",
      createdAt: request.createdAt,
    }));
    return res.status(200).json({
      success: true,
      data: buildPaginatedData(items, requests.totalItems, pagination.page, pagination.limit),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

const getInstitutionTrainersHandler = async (req: Request, res: Response) => {
  try {
    const parsedQuery = institutionQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const trainers = await getInstitutionTrainers(req.user);
    return res.status(200).json({ success: true, data: trainers });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export {
  createInstitutionHandler,
  listInstitutionsHandler,
  createInstitutionAdminHandler,
  createProgrammeManagerHandler,
  createMonitoringOfficerHandler,
  createTrainerRequestHandler,
  getTrainerRequestsHandler,
  getInstitutionTrainersHandler,
  approveTrainerRequestHandler,
};
