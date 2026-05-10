type PaginationInput = {
  page?: unknown;
  limit?: unknown;
};

type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PaginatedData<TItem> = {
  items: TItem[];
  pagination: PaginationMeta;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const parsePositiveInteger = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
};

const parsePaginationParams = (query: PaginationInput): PaginationParams => {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const requestedLimit = parsePositiveInteger(query.limit, DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const buildPaginationMeta = (totalItems: number, page: number, limit: number): PaginationMeta => {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: totalPages > 0 && page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
};

const buildPaginatedData = <TItem>(
  items: TItem[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedData<TItem> => {
  return {
    items,
    pagination: buildPaginationMeta(totalItems, page, limit),
  };
};

export { buildPaginatedData, buildPaginationMeta, parsePaginationParams };
export type { PaginatedData, PaginationMeta, PaginationParams };
