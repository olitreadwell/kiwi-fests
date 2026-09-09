/**
 * Liveness endpoint: load balancers and orchestrators poll this.
 *
 * @returns 200 JSON with status and process uptime.
 */
export function GET(): Response {
  return Response.json({ status: 'ok', uptime: process.uptime() });
}
