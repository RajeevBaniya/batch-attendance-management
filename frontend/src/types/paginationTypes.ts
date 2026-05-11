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

type PaginationParams = {
  page: number;
  limit: number;
};

export type { PaginatedData, PaginationMeta, PaginationParams };
