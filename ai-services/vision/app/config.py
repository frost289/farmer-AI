import os
from pathlib import Path

SERVICE_DIR = Path(__file__).resolve().parent.parent

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY", "dev-internal-key")
STUB_MODEL_VERSION = "v0.1.0-stub"
MAX_IMAGE_BYTES = int(float(os.environ.get("MAX_IMAGE_MB", "5")) * 1024 * 1024)
ALLOWED_TYPES = {"image/jpeg", "image/png"}

# Trained artefacts (git-ignored). Produced by training/train_classifier.py.
MODELS_DIR = Path(os.environ.get("MODELS_DIR", SERVICE_DIR / "models"))
CLASSIFIER_PATH = MODELS_DIR / "classifier.onnx"
CLASSIFIER_META_PATH = MODELS_DIR / "labels.json"
DETECTOR_PATH = MODELS_DIR / "detector.pt"  # optional YOLO lesion detector

ONNX_THREADS = int(os.environ.get("ONNX_THREADS", "2"))
MAX_PREDICTIONS = 3

# The api flags top confidence below 0.5 as low_confidence. The stub must never reach it.
STUB_MAX_CONFIDENCE = 0.49

# Image quality thresholds (preprocess.py)
MIN_SIDE_PX = 100
DARK_MEAN = 40
BRIGHT_MEAN = 235
BLUR_VARIANCE = 20
MIN_PLANT_FRACTION = (
    0.02  # below this share of plant-coloured pixels: no_plant_detected
)

# Damage analysis (severity.py)
ANALYSIS_SIDE = 320
