# Advisory Service (Member 3)

FastAPI service for agronomic advice. Port **8001**. Contract: `docs/API_SPECIFICATION.md` section 3.2 and `docs/api-spec.yaml`.

## Status

All endpoints work and return the exact contract shapes, but the logic is a **stub** (rules and a small knowledge base) so the web app can be built now. Replace internals, not the shapes:

| Endpoint | Stub today | Member 3 replaces with |
|---|---|---|
| `POST /ai/v1/advisory/query` | keyword FAQ (`llm_service.py`) | LLM using `prompts/agronomy_prompt.txt` |
| `POST /ai/v1/advisory/treatment` | small knowledge base (`treatment_service.py`) | reviewed Malawi treatment data |
| `POST /ai/v1/advisory/planting-readiness` | 7-day rain rules (`planting_service.py`) | seasonal and soil-aware model |
| `POST /ai/v1/advisory/recommend-crops` | scoring table (`crop_recommender.py`) | model trained on Malawi data |

Chichewa (`ny`) requests currently return English text. Every generated-text endpoint reports the actual `language` (`en` or `ny`) and a `language_fallback` boolean; the web app uses this metadata to show the fallback notice. Do not claim a response is in Chichewa unless it actually is.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```
Docs UI: http://localhost:8001/docs. Every `/ai/v1/*` call needs the header `X-Internal-Key`.

## Test and lint

```bash
pytest
black . && ruff check .
```

## Rules

- Keep request and response shapes identical to the contract. Change shapes only through a contract-change PR.
- Labels come from `docs/label-taxonomy.json` (run `scripts/sync-taxonomy.sh` after editing it).
- Never add pesticide product names or doses without a verified source.
- Never commit datasets or model files (`models/`, `data/` are git-ignored).
