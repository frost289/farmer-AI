# Contributing to FarmAI

## 1. Daily Workflow

1. Pick or create an issue (use the templates in `.github/ISSUE_TEMPLATE/`).
2. Update your local branch:
   ```bash
   git checkout develop && git pull
   git checkout -b feature/api-farms
   ```
3. Code following `docs/CODING_STANDARDS.md` and `docs/NAMING_CONVENTIONS.md`.
4. Check the contract docs before inventing any endpoint, field or error.
5. Run lint and tests locally.
6. Commit with Conventional Commits, e.g. `feat(api): add farm creation endpoint`.
7. Push and open a pull request into `develop`. Fill in the template.
8. Fix review comments. A reviewer approves, then squash merge.

## 2. Branches

| Branch | Purpose | Who merges |
|---|---|---|
| `main` | Stable, deployable | Member 1 only, from `develop` |
| `develop` | Integration | Via approved pull requests |
| `feature/<module>-<name>` | New work | Author |
| `fix/<module>-<name>` | Bug fixes | Author |
| `docs/<name>` | Doc changes | Author |

## 3. Branch Protection (Imran sets up on GitHub)

Settings, Branches, add rules for `main` and `develop`:
- Require a pull request before merging
- Require at least 1 approval (2 for `main`)
- Require status checks (CI) to pass
- Require review from code owners
- Block direct pushes and force pushes

## 4. Changing a Contract

Contracts are `API_SPECIFICATION.md`, `SHARED_DATA_FIELDS.md`, `DATABASE_SCHEMA.md` and `ERROR_FORMATS.md`.

1. Open a "Contract change request" issue.
2. Change the doc in a `docs/` branch, in its own pull request, before the code.
3. Every affected member approves.
4. Then update the code to match.

## 5. Review Guide

Reviewers check:
- Does it match the docs (endpoints, fields, errors)?
- Naming and structure per the standards?
- Tests for the main path and a failure path?
- No secrets or large files?
- Small, readable, does one thing?

Aim to review within 24 hours.

## 6. Weekly Routine

- Short sync (15 minutes): progress, blockers, contract changes.
- Member 1 merges `develop` into `main` after the sync if everything passes.

## 7. Ownership

See `.github/CODEOWNERS` and the table in `README.md`.
