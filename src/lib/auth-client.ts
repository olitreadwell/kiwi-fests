import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

/**
 * Passwordless auth client for browser code. Uses the page origin as the
 * base URL, so it works on localhost and on deployed origins unchanged.
 */
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});
