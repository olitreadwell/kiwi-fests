# Passwordless auth

The template ships **Better Auth** (`better-auth`) with email one-time-code
(OTP) sign-in — no passwords, no external service. It is the modern
industry-standard passwordless library for TypeScript/Next.js (the same
maintainers behind the archived Lucia recommend it).

## Stack

- `better-auth` server instance in `src/server/auth.ts`
- Email OTP plugin (5-minute codes, per-IP rate limiting built in)
- Persistence: SQLite via Drizzle (`src/server/db.ts`) — the file
  `data/auth.db` and its tables are created on first boot; no migration
  step. Swap the drizzle adapter for Postgres when you outgrow SQLite.
- HTTP: `src/app/api/auth/[...all]/route.ts`; browser client in
  `src/lib/auth-client.ts`
- UI: `/login` (Radix components, axe-tested in e2e)

## Env

```bash
AUTH_SECRET=            # required in production (openssl rand -base64 32)
AUTH_URL=http://localhost:3000
AUTH_EMAIL_FROM=
AUTH_DB_PATH=data/auth.db
AUTH_TRUSTED_ORIGINS=   # comma-separated, when deployed origins differ
```

Emails go out over the same SMTP vars as the contact form (`SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). With no SMTP configured (dev
default), the one-time code is logged to the server console so a fresh
scaffold still works end-to-end.

## Flows

- Send code: `POST /api/auth/email-otp/send-verification-otp`
  (`authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })`)
- Verify: `POST /api/auth/email-otp/verify-email`
  (`authClient.emailOtp.verifyEmail({ email, otp })`) — sets the session
  cookie and creates the user on first sign-in
- All endpoints are rate-limited per IP (5 requests/min by default)

## Security notes

- `AUTH_SECRET` is mandatory in production; dev falls back to an ephemeral
  secret (sessions reset on restart).
- The SQLite DB is gitignored (`data/`). Back it up or swap to Postgres
  before relying on it in production.
- Native `better-sqlite3` is traced by Next standalone and compiled in the
  Docker image (build tools added to the `deps` stage).

## Adding providers later

Better Auth supports social logins (Google, GitHub, …), passkeys
(WebAuthn), and magic links as plugins — add them to
`src/server/auth.ts` without changing the client API.
