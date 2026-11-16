# System Architecture (Web App, Phase 1)

Owner: Member 1. Reference for every member.

## 1. Overview

Three-tier web app (React, Express, PostgreSQL) plus separate Python FastAPI AI services. Modular monolith for the main API; AI services are separate so Python models can evolve independently. Containerized with Docker.

```
Browser (React + Vite + Tailwind)
   | HTTPS, REST/JSON, JWT
Node.js + Express API
   |-- PostgreSQL
   |-- Object storage (crop images)
   |-- Redis + BullMQ (background jobs)
   |-- Weather API (external)
   '-- FastAPI AI services (internal)
         |-- advisory (8001)  LLM, crop and planting advice
         '-- vision   (8002)  disease and pest detection
```

## 2. Components

| Component | Tech | Owner | Port |
|---|---|---|---|
| web | React, Vite, Tailwind, React Router, React Query | skeldo265, lau | 5173 |
| api | Node.js, Express, PostgreSQL, JWT | skeldo265, lau | 4000 |
| advisory | Python, FastAPI | linna | 8001 |
| vision | Python, FastAPI, OpenCV, YOLO, SAM | frost289 | 8002 |
| design and docs | Figma, Markdown | irvin | n/a |

## 3. Frontend (`web/`)

- `pages/` route-level screens, `features/` feature components, `components/` shared UI, `services/` API calls, `hooks/`, `context/`, `utils/`.
- Role-based protected routes (farmer, field_agent, extension_officer, admin).
- Mobile-first, low-literacy design (icons, simple wording, English and Chichewa).
- Client-side image compression before upload.

## 4. Backend (`api/`)

- Feature modules: auth, users, farms, plantings, diagnoses, advisory, weather, recommendations, outbreaks, alerts, admin.
- Layers: routes, controller, service, repository.
- Middleware: authenticate, authorize, validate, upload, rate limiter, error handler.
- Integrations: `aiGateway` (the only code that calls AI services), weather client.
- Jobs: diagnosis worker, outbreak aggregator.

## 5. AI Services (`ai-services/`)

- **advisory (M3):** question answering, treatment advice, planting readiness, crop recommendations.
- **vision (M4):** image quality check, classification, detection, severity estimate. Segmentation (SAM) later.
- **speech (later):** ASR for Chichewa.
- Stateless, internal only, authenticated with `X-Internal-Key`. Models loaded once at startup.

## 6. Key Flows

**Photo diagnosis**
web uploads to api, api stores image and returns 202, worker calls vision then advisory, result saved, web polls until `completed`.

**Planting readiness**
web asks api, api fetches weather (cached 3 hours), api calls advisory, result returned.

**Outbreak dashboard**
Daily job aggregates completed diagnoses into `outbreaks`; officers query by district and date.

## 7. Cross-Cutting Decisions

- Contracts first: `API_SPECIFICATION.md` is the agreement. AI services ship stubs in week 1.
- Async processing for heavy image jobs so the API stays fast on poor networks.
- Single error format (`ERROR_FORMATS.md`) and shared field names (`SHARED_DATA_FIELDS.md`).
- The api is the only service allowed to access the database.
- Channel-agnostic business logic in services so USSD/SMS and the mobile app can reuse it later.

## 8. Security

HTTPS, bcrypt password hashing, short-lived JWT plus refresh token, role-based access, input validation, upload limits, CORS allow-list, rate limiting, secrets only in environment variables, least-privilege database user, internal key between api and AI services.

## 9. Deployment and DevOps

- Docker image per service, `docker-compose.yml` for local development.
- GitHub Actions: lint, test and build per folder on every pull request.
- Environments: development, staging, production.
- Suggested hosting: static host for web, Render for api and AI services, managed PostgreSQL (e.g. Neon).
- Every service exposes `GET /health`. Logs are structured JSON with `request_id`.

## 10. Phases

1. **Foundation:** repo, standards, auth, database, CI.
2. **Core:** users, farms, dashboard (stubbed AI).
3. **Real AI:** advisory, then vision.
4. **Officer dashboard:** outbreaks, weather heatmaps.
5. **Later:** voice (Chichewa), mobile app, USSD/SMS.

## 11. Risks

Limited Malawi-specific training data, AI latency and accuracy, large uploads on slow networks, weather API limits and cost, model size for future offline use.
