# 03 — Code quality

## Gates

- Run the repository's configured quality checks before finishing: linter,
  formatter, type checker, tests, build. If the repo has one command that runs
  all of them, use it.
- Never disable a check to make it pass. Fix the code.
- Keep warnings acceptable to the repo's policy; zero new errors.

## Naming

- Use names that are discoverable by text search. Two or three words,
  domain-prefixed: `getUserProfileById`, not `get` or `getProfile`.
- One word per concept, used everywhere. Do not swap synonyms for the same
  thing (`customers` here, `clients` there).
- Avoid untyped escape hatches. A precise signature lets the next contributor
  reason from the signature alone.
- No one-letter names unless the repo already does that.

## Comments

- Explain why, not what. The code shows what; the comment should say why the
  code is the way it is.
- Put explanatory comments directly above the definition they explain; that is
  where search lands.
- Mark deprecated code explicitly: `@deprecated` and why, so nobody copies it
  as a pattern.

## Dead and duplicated code

- Remove or avoid dead code. Duplication is cheaper than a wrong abstraction.
- Do not leave commented-out code behind unless the repo does it deliberately.

## Style consistency

- Match the file you are editing, then the module, then the repo.
- Do not introduce a second style for the same thing.
- Keep functions and files focused. Split by concept, not by size, but do not
  split a file just to split it.

## Logging and errors

- No stray debug output in committed code unless the repo allows it.
- Handle errors centrally where the repo does; never crash on bad input.
- Log the real error for diagnosis, but never leak internals to users.
