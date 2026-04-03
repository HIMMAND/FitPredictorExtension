# Session Rules

## Required After Every Session

1. Update `current-status.md`
2. Update any topic file changed by the session
3. Record new product, architecture, UI, ML, or workflow decisions
4. Leave enough context for a new agent to continue without rereading the whole repo

## Trigger Conditions

Update docs when a session changes:

- UI direction
- recommendation logic
- dataset or model strategy
- repo structure
- developer workflow

## Repo Hygiene

- Keep generated evaluation artifacts reproducible but out of Git history when they exceed standard GitHub file limits
- Keep generated dependency directories like `node_modules/` ignored at the repo root so verification and commit prep reflect real source changes
