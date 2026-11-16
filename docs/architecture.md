# FarmAI Architecture and Project Structure

Companion to `SYSTEM_ARCHITECTURE.md`. This file holds the **complete folder and file layout** every member builds into. Contracts are in `API_SPECIFICATION.md` and `api-spec.yaml`.

## 1. Layers

```
Browser (React + Vite + Tailwind)
   | HTTPS, REST/JSON, JWT
Node.js + Express API (modular monolith)
   |-- PostgreSQL           data
   |-- Object storage       crop images
   |-- Redis + BullMQ       background jobs
   |-- Weather API          external
   '-- FastAPI AI services  internal
         |-- advisory (8001)  M3
         '-- vision   (8002)  M4
```

## 2. Repository Layout

```
farmai/
├── README.md
├── CONTRIBUTING.md
├── .gitignore
├── .editorconfig
├── .env.example
├── docker-compose.yml
├── .github/
│   ├── workflows/            ci-web.yml, ci-api.yml, ci-ai.yml
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── CODEOWNERS
├── docs/
├── web/
├── api/
├── ai-services/
│   ├── advisory/
│   ├── vision/
│   └── speech/               later phase
├── design/                   Member 5
└── scripts/                  setup.sh, migrate.sh, seed.sh
```

## 3. web/ (React + Vite + Tailwind) - skeldo265, lau

```
web/
├── package.json  vite.config.js  tailwind.config.js  postcss.config.js
├── eslint.config.js  .prettierrc  index.html  .env.example
├── public/                   favicon.ico, logo.svg
└── src/
    ├── main.jsx  App.jsx  index.css
    ├── assets/               images/, icons/
    ├── routes/               AppRoutes.jsx, ProtectedRoute.jsx, RoleRoute.jsx
    ├── context/              AuthContext.jsx, LanguageContext.jsx
    ├── hooks/                useAuth.js, useDebounce.js, useImageCompress.js
    ├── services/             apiClient.js (Axios), authService.js, farmService.js,
    │                         diagnosisService.js, advisoryService.js,
    │                         weatherService.js, outbreakService.js
    ├── utils/                constants.js, formatters.js, validators.js, storage.js
    ├── components/
    │   ├── common/           Button, Input, Modal, Loader, Alert, EmptyState
    │   ├── layout/           Navbar, Sidebar, Footer, DashboardLayout
    │   └── charts/           OutbreakMap, WeatherHeatmap, TrendChart
    ├── features/
    │   ├── auth/             LoginForm, RegisterForm
    │   ├── farms/            FarmList, FarmForm, FarmCard
    │   ├── diagnosis/        ImageUploader, SymptomChat, VoiceInput,
    │   │                     DiagnosisResult, DiagnosisHistory
    │   ├── planting/         PlantingReadiness, WeatherSummary
    │   ├── recommendations/  CropRecommendation
    │   └── officer/          OutbreakTable, RegionFilter, ReportExport
    └── pages/                LandingPage, LoginPage, RegisterPage, FarmerDashboard,
                              FarmDetailsPage, DiagnosisPage, PlantingPage,
                              RecommendationsPage, OfficerDashboard, ProfilePage,
                              AdminPage, NotFoundPage
```

## 4. api/ (Node.js + Express) - skeldo265, lau

```
api/
├── package.json  Dockerfile  .env.example  eslint.config.js  .prettierrc  server.js
├── src/
│   ├── app.js  routes.js     routes.js mounts /api/v1
│   ├── config/               env.js, db.js, redis.js, storage.js, logger.js
│   ├── middleware/           authenticate.js, authorize.js, validate.js,
│   │                         upload.js, rateLimiter.js, errorHandler.js
│   ├── modules/              each: <m>.routes.js, .controller.js, .service.js,
│   │   │                           .repository.js, .validation.js
│   │   ├── auth/  users/  farms/  plantings/  diagnoses/  advisory/
│   │   └── weather/  recommendations/  outbreaks/  alerts/  admin/
│   ├── integrations/         aiGateway.js, visionClient.js, advisoryClient.js,
│   │                         weatherClient.js
│   ├── jobs/                 queue.js, diagnosis.worker.js, outbreak.aggregator.js
│   └── utils/                ApiError.js, asyncHandler.js, hash.js, token.js
├── db/
│   ├── migrations/           001_users ... 009_refresh_tokens (see DATABASE_SCHEMA.md)
│   └── seeds/                crops.sql, districts.sql
├── tests/                    auth.test.js, farms.test.js, diagnoses.test.js
└── postman/                  farmai.postman_collection.json
```

## 5. ai-services/ (Python + FastAPI)

```
ai-services/
├── advisory/                 linna
│   ├── Dockerfile  requirements.txt  .env.example  README.md
│   ├── app/
│   │   ├── main.py  config.py
│   │   ├── routers/          query.py, treatment.py, planting.py, recommend.py
│   │   ├── services/         llm_service.py, planting_service.py, crop_recommender.py
│   │   ├── schemas/          advisory.py
│   │   └── prompts/          agronomy_prompt.txt
│   ├── models/  data/        git-ignored
│   ├── notebooks/  tests/
├── vision/                   frost289
│   ├── Dockerfile  requirements.txt  .env.example  README.md
│   ├── app/
│   │   ├── main.py  config.py
│   │   ├── routers/          diagnose.py, segment.py
│   │   ├── services/         preprocess.py, classifier.py, detector.py (YOLO),
│   │   │                     segmenter.py (SAM), severity.py
│   │   └── schemas/          vision.py
│   ├── models/  data/        git-ignored
│   ├── notebooks/  tests/
└── speech/                   later phase, Member 4
    └── app/                  main.py, services/asr_service.py, chichewa_nlp.py
```

## 6. design/ - irvin

```
design/
├── branding/                 logo/, style-guide.md
├── wireframes/
└── prototypes/
```

## 7. Ownership

| Folder | Owner |
|---|---|
| `web/` | M1, M2 |
| `api/` | M1, M2 |
| `ai-services/advisory/` | M3 |
| `ai-services/vision/`, `speech/` | M4 |
| `design/`, `docs/` | M5 (docs with M1) |

## 8. Phase 1 Priority

`web/`, `api/` and stub versions of both AI services. `speech/`, mobile app and USSD/SMS come later.
