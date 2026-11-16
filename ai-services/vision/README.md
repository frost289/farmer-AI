# Vision Service (Member 4)

FastAPI service for crop image analysis. Port **8002**. Contract: `docs/API_SPECIFICATION.md` section 3.1 and `docs/api-spec.yaml`.

## Status

| Part | State |
|---|---|
| Image loading and quality check (`preprocess.py`) | **Real**: flags too small, too dark, too bright, blurry |
| Damage estimate (`severity.py`) | **Simple heuristic**: yellow/brown vs green pixels. Soil in the background can inflate it |
| Disease and pest label (`classifier.py`) | **Stub**: deterministic pseudo-prediction from the image hash. It does not look at the plant |
| Segmentation (`segmenter.py`) | Stub using the colour mask. Replace with SAM |
| Detection (`detector.py`) | Stub using grid cells. Replace with YOLO |

Replace the stubs, keep the response shapes. The API never shows a stub prediction as fact: model output below 0.5 confidence is flagged `low_confidence` for the user.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8002
```
Docs UI: http://localhost:8002/docs. Every `/ai/v1/*` call needs the header `X-Internal-Key`.

## Test and lint

```bash
pytest
black . && ruff check .
```

## Training notes

- Put experiments in `notebooks/` (Google Colab is fine). Production code goes in `app/`.
- Datasets go in `data/` and trained weights in `models/`. Both are git-ignored. Document where to download them here.
- Labels must match `docs/label-taxonomy.json` (run `scripts/sync-taxonomy.sh` after editing it).
- Add the real dependencies (`opencv-python-headless`, `torch`, `ultralytics`) to `requirements.txt` when used, and load models once at startup.
