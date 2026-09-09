import { openApiDocument } from '@/server/openapi';

/**
 * Serve the OpenAPI 3.1 document. Swagger UI at /docs renders this.
 *
 * @returns The OpenAPI document as JSON.
 */
export function GET(): Response {
  return Response.json(openApiDocument, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
