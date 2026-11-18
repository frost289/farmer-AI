# Vision Service (Member 4)

FastAPI service for crop image analysis. Port **8002**. Contract: `docs/API_SPECIFICATION.md` section 3.1 and `docs/api-spec.yaml`.

## Status

| Part | State |
|---|---|
| Quality check (`preprocess.py`) | **Real**: too small, too dark, too bright, blurry, no plant in the photo |
| Classifier (`classifier.py`) | **Real, needs weights.** ONNX Runtime model + crop masking + calibrated confidence. Without `models/classifier.onnx` it falls back to a stub (see below) |
| Damage estimate and segmentation (`severity.py`, `segmenter.py`) | **Real colour analysis** (OpenCV): soil-aware, noise-filtered. Not a trained model (see Limits) |
| Regions (`detector.py`) | **Real**: connected damage blobs. Uses a YOLO model automatically if `models/detector.pt` exists |
| Training and evaluation (`training/`) | **Real**: fine-tune, calibrate, export ONNX, evaluate |

### Stub fallback
No weights in `models/` means no real diagnosis. The service then returns a deterministic pseudo-prediction
with `model_version` ending in `-stub` and confidence capped at 0.49, so the api always flags it `low_confidence`
("consult an extension officer"). `GET /health` shows `"classifier": "onnx"` or `"stub"`: check it after deploying.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```
Docs UI: http://localhost:8002/docs. Every `/ai/v1/*` call needs the header `X-Internal-Key`.
Docker: the image does not contain weights. Mount them: `-v ./models:/app/models` (compose: add `volumes: [./ai-services/vision/models:/app/models:ro]` to `vision`).

## Train a classifier

1. Arrange photos as `data/train/<label>/*.jpg` (and optionally `data/val/<label>/`). Folder names must be labels from `docs/label-taxonomy.json`. Both folders are git-ignored.
2. ```bash
   pip install -r requirements-train.txt
   python training/train_classifier.py --data data --out models --version v0.2.0
   python training/evaluate.py --data data/test            # held-out photos, never used in training
   ```
3. `models/classifier.onnx` + `models/labels.json` appear. Restart the service.

Training uses a MobileNetV3-Large fine-tune, class-balanced sampling, field-photo augmentation, and temperature
scaling so confidence is calibrated. The exported ONNX is checked against PyTorch before it is written.

Data advice (important for honest accuracy):
- Public lab-style datasets look much cleaner than farmers' phone photos. Add real Malawi field photos, with backgrounds, glare and mixed leaves, especially for `maize_streak_virus`, `fall_armyworm` and `groundnut_rosette`. I could not verify which public datasets cover each label, so check coverage and licences before relying on any.
- Put the **same plant/leaf in one split only** (provide `data/val` yourself). Random splits of near-duplicate photos give inflated scores.
- Keep a `healthy` class with varied backgrounds, or the model will call every photo a disease.
- Run `evaluate.py` with and without `--crop`, and look at the `low_confidence` rate and accuracy-when-confident, not only overall accuracy.

## Behaviour notes

- If `crop` is sent, labels for other crops are masked out and probabilities renormalised. Unknown crops use all labels.
- `/segment` regions and mask share the pixel space of the returned mask (longest side up to 320 px), not the original photo.
- Weights load once at startup. CPU-bound work runs in a thread pool.
- Env: `MODELS_DIR`, `ONNX_THREADS` (default 2), `MAX_IMAGE_MB`, `INTERNAL_API_KEY`.

## Limits (be honest in demos)

- Severity is a **colour heuristic**: yellow/brown share of plant pixels. Brown soil is excluded unless it sits near healthy green; a large dead area far from any green tissue is under-counted, and an entirely brown photo is read as fully damaged. Nutrient deficiency or dry leaves also look "damaged". Replace with a trained segmentation model and calibrate against officer-scored severity.
- SAM segmentation is not implemented. The optional YOLO hook is untested without weights.
- Chichewa names (`display.ny`) in the taxonomy are still empty and need a native speaker.

## Test and lint

```bash
pytest
black . && ruff check .
```
Tests never use real weights; the ONNX path is tested with a tiny synthetic model (needs `pip install onnx`, otherwise those tests skip).
