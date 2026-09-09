import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/server/auth';

/** Better Auth HTTP handler (all /api/auth/* methods). */
export const { GET, POST } = toNextJsHandler(auth);
