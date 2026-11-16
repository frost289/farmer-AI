# Coding Standards

Applies to all members. Language-specific rules are marked.

## 1. General

- Write clear, small, single-purpose functions (aim for under 40 lines).
- No dead code, no commented-out code, no debug `console.log` or `print` in commits.
- Comments explain **why**, not what.
- Handle every error. Never swallow exceptions silently.
- No secrets in code. Use environment variables. Update `.env.example` when adding one.
- Use English for all code, comments, commits and docs.

## 2. JavaScript (web and api)

- ES modules (`import`/`export`), `const` by default, `let` only when needed, never `var`.
- `async/await`, not nested callbacks or long `.then()` chains.
- Strict equality (`===`).
- Tools: **ESLint** and **Prettier** (config committed in each folder). Code must pass `npm run lint`.
- Prettier: 2 spaces, single quotes, semicolons, trailing commas, 100-character lines.
- Validate all external input (Zod on web, validation middleware on api).

### React (web)

- Function components and hooks only.
- One component per file. File and component names in `PascalCase`.
- Keep components small. Move logic to custom hooks (`useXxx`) and API calls to `services/`.
- No API calls directly inside components. Use `services/` plus React Query.
- Tailwind utility classes. No inline styles unless values are dynamic.
- Every page must be responsive (mobile first) and accessible (labels, alt text, keyboard focus).

### Express (api)

- Layering: `routes -> controller -> service -> repository`.
  - Routes: URL mapping only.
  - Controller: read request, call service, send response.
  - Service: business logic.
  - Repository: SQL only.
- Wrap async handlers with `asyncHandler`.
- Throw `ApiError`. Only `errorHandler` sends error responses (see `ERROR_FORMATS.md`).
- Use parameterized SQL (`$1, $2`). Never build SQL by string concatenation.

## 3. Python (ai-services)

- Python 3.10+, follow **PEP 8**. Format with **Black**, lint with **Ruff**.
- Type hints on all function signatures.
- Pydantic models for every request and response (`schemas/`).
- Routers hold only HTTP logic. Model and business logic live in `services/`.
- Load models once at startup, not per request.
- Pin dependencies in `requirements.txt`.
- Notebooks (`notebooks/`) are for experiments only. Production code goes in `app/`.
- Never commit datasets or model weights. Document where to get them in a `README.md` inside the service.

## 4. Git

- Branch names: `feature/<module>-<name>`, `fix/<module>-<name>`, `docs/<name>`.
- Commit messages (Conventional Commits): `feat(api): add farm creation endpoint`.
  Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Small commits and small PRs (under about 400 changed lines).
- A PR must include what changed, how to test, and the linked issue.
- Squash merge into `develop`.

## 5. Testing

- API: Jest + Supertest. Python: pytest. Web: Vitest + React Testing Library for key flows.
- New features need tests for the main path and at least one failure path.
- CI must be green before merge.

## 6. Security

- Hash passwords with bcrypt. Never log passwords, tokens or personal data.
- Check roles on every protected route.
- Limit upload type and size (images: JPEG/PNG, max 5 MB).
- Never trust client input.

## 7. Logging

- API: structured JSON logs including `request_id`.
- Levels: `error`, `warn`, `info`, `debug`. No sensitive data in logs.
