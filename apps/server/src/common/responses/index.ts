import type { Response } from "express";

// ─── Response Shapes ──────────────────────────────────────────

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface MessageResponse {
  success: true;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Success Helpers ──────────────────────────────────────────

/**
 * Send a 200 OK response with data and optional pagination metadata.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: PaginationMeta) {
  const body: SuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
}

/**
 * Send a 201 Created response.
 */
export function sendCreated<T>(res: Response, data: T) {
  sendSuccess(res, data, 201);
}

/**
 * Send a 204 No Content response.
 */
export function sendNoContent(res: Response) {
  res.status(204).send();
}

// ─── Error Helper ────────────────────────────────────────────

/**
 * Send a standardized error response.
 */
export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  message: string,
  details?: Record<string, string[]>
) {
  const body: ErrorResponse = { success: false, error, message, statusCode };
  if (details) body.details = details;
  res.status(statusCode).json(body);
}

// ─── Message Helper ───────────────────────────────────────────

/**
 * Send a simple success message response.
 */
export function sendMessage(res: Response, message: string, statusCode = 200) {
  const body: MessageResponse = { success: true, message };
  res.status(statusCode).json(body);
}

// ─── Pagination ───────────────────────────────────────────────

/**
 * Build pagination metadata from raw values.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
