import { type Request, type Response } from "express";

import { errorResponse } from "../../utils/errorResponse";
import { buildPaginatedData, parsePaginationParams } from "../../utils/pagination";

import { listAuditLogs } from "./auditService";

const getAuditLogsHandler = async (req: Request, res: Response) => {
  try {
    const pagination = parsePaginationParams(req.query);
    const auditLogs = await listAuditLogs(pagination);

    return res.status(200).json({
      success: true,
      data: buildPaginatedData(auditLogs.items, auditLogs.totalItems, pagination.page, pagination.limit),
    });
  } catch (error) {
    return errorResponse(res, error);
  }
};

export { getAuditLogsHandler };
