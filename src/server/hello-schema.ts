import { z } from 'zod';

/** Query contract for GET /api/hello. Parsed at the boundary, before logic. */
export const helloQuerySchema = z.object({
  name: z.string().trim().min(1).max(100).default('World'),
});

export type HelloQuery = z.infer<typeof helloQuerySchema>;
