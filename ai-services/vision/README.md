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

Datasets are already wired in (`training/datasets.json`): KaraAgro Maize (healthy, fall armyworm, maize streak virus),
the Tanzania maize set (more streak virus and healthy), and Cassava Uganda (cassava mosaic, healthy). Covered labels:
`healthy`, `fall_armyworm`, `maize_streak_virus`, `cassava_mosaic_disease`. **Not covered yet:** `maize_gray_leaf_spot`,
`groundnut_rosette`, `tomato_late_blight` (they need your own photos or another source).

Easiest: open `training/train_colab.ipynb` in Google Colab (GPU) and run the cells. Or by hand:

```bash
# 1. get the data (KaraAgro and cassava by hand, see the "get" field in datasets.json)
python training/download_data.py --source tanzania_maize --extract
# 2. check, then build data/train, data/val, data/test
python training/prepare_data.py --dry-run
python training/prepare_data.py
# 3. train, then test on photos the model never saw
pip install -r requirements-train.txt
python training/train_classifier.py --data data --out models --version v0.2.0
python training/evaluate.py --data data/test
```
`models/classifier.onnx` + `models/labels.json` appear. Restart the service and check `/health` says `onnx`.

`prepare_data.py` removes exact duplicates, groups near-identical photos and puts each group in only one split (so a leaf
never sits in both train and test), drops photos whose near-duplicates carry different labels, caps each source so one big
dataset cannot dominate, and writes `data/manifest.csv` (where every image came from) and `data/report.json`.

Training uses a MobileNetV3-Large fine-tune, class-balanced sampling, field-photo augmentation, and temperature
scaling so confidence is calibrated. The exported ONNX is checked against PyTorch before it is written.

Honest expectations:
- **Check each dataset's licence** on its download page before using or redistributing it, and keep its citation for the research report.
- These datasets come from Uganda, Tanzania and similar, not Malawi. Their test score does not prove field performance: collect a few dozen real Malawian photos per label as a separate final test.
- Keep a `healthy` class with varied backgrounds, or the model will call every photo a disease.
- Run `evaluate.py` with and without `--crop`; judge by per-class recall, the `low_confidence` rate and accuracy when confident, not only overall accuracy.
- If the model has no disease labels for the farm's crop (for example cassava before cassava data is added), the service caps confidence below 0.5, so the api shows "consult an extension officer".

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
