# 06 — Security (what must never ship)

## Secrets

- No secrets in code, config, docs, commits, or images: API keys, tokens,
  passwords, database URLs, private keys. If you see one committed, say so
  loudly and rotate it.
- Read secrets from the environment or the repo's approved secret store.
  Never hardcode a value "just for now".
- If a secret was ever committed, assume it is compromised. Rotate, remove,
  and scrub history if the repo's maintainers agree.

## Input

- Validate input at the boundary before it reaches logic. Reject bad input
  with a clean error; never crash on it.
- Treat all external input as untrusted: user input, file contents, network
  responses, environment variables.
- Prefer the repo's existing validation helpers over hand-rolled checks.

## Dependencies

- Keep dependencies pinned as the repo does. Never add a dependency
  casually.
- Run the repo's dependency audit if one exists, and fix or report what it
  finds.
- Adding a dependency adds a trust surface: check the package's maintenance,
  provenance, and license before adopting it.

## Output

- Never leak internals to users: stack traces, connection strings, raw
  dependency errors.
- Log the real error for diagnosis, but show the user a safe message.
- Sanitize anything rendered back to the user. Do not trust data you echo.

## Reporting

- If you find a vulnerability, report it privately to the maintainers (or
  via the repo's security policy), not in a public issue.
- If you cannot responsibly handle a found vulnerability, stop and say so.
