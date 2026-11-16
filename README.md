# FarmAI

AI-powered agricultural assistant for smallholder farmers (Malawi). Phase 1 is the **web app**. Mobile and USSD/SMS follow later.

## Repository Layout

```
farmai/
├── web/                 React + Vite + Tailwind        (skeldo265, lau)
├── api/                 Node.js + Express + PostgreSQL (skeldo265, lau)
├── ai-services/
│   ├── advisory/        FastAPI: LLM, crop advice      (linna)
│   └── vision/          FastAPI: disease detection     (frost289)
├── docs/                Shared rules (read before coding)
└── README.md
```

## Team Ownership

| Member | Role | Owns |
|---|---|---|
| 1 | JS dev, lead and architecture | `api/`, `docs/SYSTEM_ARCHITECTURE.md`, standards |
| 2 | JS dev, frontend and backend | `web/`, farm and user modules |
| 3 | Python dev, AI/ML | `ai-services/advisory/` |
| 4 | Python dev, computer vision | `ai-services/vision/` |
| 5 | UI/UX, docs, marketing | design files, documentation |

## Read First (mandatory for everyone)

1. `docs/SYSTEM_ARCHITECTURE.md`
2. `docs/CODING_STANDARDS.md`
3. `docs/NAMING_CONVENTIONS.md`
4. `docs/SHARED_DATA_FIELDS.md`
5. `docs/API_SPECIFICATION.md`
6. `docs/ERROR_FORMATS.md`
7. `docs/DATABASE_SCHEMA.md`

## What Is Built (Phase 1)

| Part | Status |
|---|---|
| `api/` | Complete: auth (JWT + refresh), users, farms, plantings, diagnoses (async jobs), advisory, weather (Open-Meteo, cached), recommendations, outbreaks (daily aggregation), alerts, admin stats, migrations, seeds, tests |
| `web/` | Complete: farmer screens, officer dashboard, admin page, photo upload with compression, polling diagnosis, English UI (Chichewa strings still to add) |
| `ai-services/advisory` | Working **stub** (rules and a small knowledge base). Member 3 replaces the logic behind the same contract |
| `ai-services/vision` | Working **stub** (image quality check, placeholder classifier). Member 4 replaces the models behind the same contract |
| `ai-services/speech` | Skeleton for a later phase |

## Run With Docker (easiest)

```bash
cp .env.example .env            # optional: change secrets
docker compose up --build       # postgres, redis, api, advisory, vision, web
docker compose run --rm api npm run seed
```

Open http://localhost:5173. Demo users (development only, password `Password123!`):

| Role | Phone |
|---|---|
| Farmer | `+265999000003` |
| Extension officer | `+265999000002` |
| Admin | `+265999000001` |

API: http://localhost:4000/api/v1 (health: `/health`). AI docs: http://localhost:8001/docs and http://localhost:8002/docs.

## Run Locally (no Docker)

```bash
sh scripts/setup.sh             # installs everything and creates .env files
createdb farmai_dev
sh scripts/migrate.sh && sh scripts/seed.sh
# then, in separate terminals:
cd api && npm run dev                                                        # :4000
cd web && npm run dev                                                        # :5173
cd ai-services/advisory && . .venv/bin/activate && uvicorn app.main:app --port 8001 --reload
cd ai-services/vision   && . .venv/bin/activate && uvicorn app.main:app --port 8002 --reload
```

Tests: `cd api && npm test` (needs a test database), `cd web && npm test`, `cd ai-services/<service> && pytest`.

Default ports: web `5173`, api `4000`, advisory `8001`, vision `8002`, speech `8003`.

## Workflow

- Branches: `main` (stable), `develop` (integration), `feature/<module>-<short-name>`.
- Never push directly to `main` or `develop`. Open a pull request.
- At least one reviewer must approve. Lint and tests must pass.
- Any change to `docs/API_SPECIFICATION.md`, `SHARED_DATA_FIELDS.md`, or `DATABASE_SCHEMA.md` needs approval from every affected member.

## Rules

- Never commit `.env`, secrets, datasets, or trained model files.
- Every service exposes `GET /health`.
- Follow the docs. If a doc is wrong, fix the doc in a PR first.
