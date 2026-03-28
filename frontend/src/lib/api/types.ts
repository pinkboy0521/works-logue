import type { PaginatedResponse, ApiError } from "@/types";

export type { PaginatedResponse, ApiError };

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
};

export type RequestOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
  headers?: Record<string, string>;
  tags?: string[];
};
