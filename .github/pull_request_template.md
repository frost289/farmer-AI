## What changed

<!-- Short summary. Link the issue: Closes #123 -->

## Area

- [ ] web
- [ ] api
- [ ] ai-services/advisory
- [ ] ai-services/vision
- [ ] docs

## How to test

<!-- Steps the reviewer can follow -->

## Checklist (all required)

- [ ] Follows `docs/CODING_STANDARDS.md` and `docs/NAMING_CONVENTIONS.md`
- [ ] Endpoints, request and response shapes match `docs/API_SPECIFICATION.md`
- [ ] Field names and enum values match `docs/SHARED_DATA_FIELDS.md`
- [ ] Errors use the format in `docs/ERROR_FORMATS.md`
- [ ] Database changes use a new numbered migration and match `docs/DATABASE_SCHEMA.md`
- [ ] Docs updated if the contract, schema or fields changed (and affected members tagged)
- [ ] Lint passes (`npm run lint` or `ruff` and `black`)
- [ ] Tests added or updated and passing
- [ ] No secrets, `.env`, datasets or model files committed
- [ ] `.env` updated if a new variable was added

## Screenshots (web changes)

<!-- Mobile and desktop -->
