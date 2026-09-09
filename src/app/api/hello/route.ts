import { logger } from '@/lib/logger';
import { toErrorResponse } from '@/lib/errors';
import { helloQuerySchema } from '@/server/hello-schema';

/**
 * Greets a name from the query string. Demonstrates zod validation at the
 * boundary: bad input never reaches business logic.
 *
 * @param request - The incoming request
 * @returns 200 greeting JSON, or 400 for invalid input.
 */
export function GET(request: Request): Response {
  try {
    const url = new URL(request.url);
    const { name } = helloQuerySchema.parse(Object.fromEntries(url.searchParams));
    logger.info({ name }, 'hello requested');
    return Response.json({ message: `Hello, ${name}!` });
  } catch (error) {
    return toErrorResponse(error);
  }
}
