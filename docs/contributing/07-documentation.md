# 07 — Documentation

## When docs change

- A change that alters behavior, commands, env vars, or interfaces updates
  the docs in the same change. Docs and code drift apart the moment they
  change in different commits.
- README quickstart commands must match what a fresh checkout actually does.
  Copy-paste the commands into a shell before claiming they work.
- Renaming or moving a file updates every link to it.

## What the repo needs

- A quickstart: how to get the project running in the fewest commands.
- The check command: how to run the quality gates.
- Where things live: one paragraph that maps concepts to directories.
- A glossary or naming index only when the repo has enough jargon to need
  one.

## How to write it

- Show real commands and real output; no fake examples.
- One spelling per concept, matching the code.
- Explain why, then what, then how. Cut anything that restates the code.
- Keep each file short enough to read in one sitting; split by topic.
- Never document a feature that does not exist yet.

## Documentation hygiene

- Update diagrams and examples in the same commit as the behavior they
  describe.
- Delete docs for removed features; leaving "temporarily disabled" docs
  around becomes permanent confusion.
- Check generated docs, specs, and API references before committing them;
  they drift silently.
