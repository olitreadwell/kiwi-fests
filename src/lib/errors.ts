import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

/** Error with an HTTP status attached; safe to surface to clients. */
export class AppError extends Error {
  /** HTTP status code to return for this error. */
  status: number;

  /**
   * @param message - Client-safe error description
   * @param status - HTTP status code, default 400
   */
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

/**
 * Convert any thrown value into a JSON error response.
 * Central handler: 400 for validation, mapped status for AppError,
 * 500 + logged stack for anything else.
 *
 * @param error - The thrown value.
 * @returns A Response with a JSON error body.
 */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      { error: 'validation_failed', details: error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  logger.error({ err: error }, 'unhandled error');
  return Response.json({ error: 'internal_error' }, { status: 500 });
}
