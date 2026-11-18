"""Disease and pest classification.

Loads `models/classifier.onnx` + `models/labels.json` (made by training/train_classifier.py)
once, runs it with ONNX Runtime on CPU, and restricts the answer to labels valid for the
requested crop. If no trained model is present the service falls back to a STUB that does
not look at the plant; its confidence is capped below the api's 0.5 threshold, so the api
always shows "consult an extension officer" and never presents a stub guess as fact.

Return shape (contract): [{"label", "type", "confidence"}], sorted desc, max 3.
Labels come from docs/label-taxonomy.json.
"""

import hashlib
import json
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image

from app.config import (
    CLASSIFIER_META_PATH,
    CLASSIFIER_PATH,
    MAX_PREDICTIONS,
    ONNX_THREADS,
    STUB_MAX_CONFIDENCE,
    STUB_MODEL_VERSION,
)

logger = logging.getLogger("vision.classifier")


@lru_cache(maxsize=1)
def load_taxonomy() -> list[dict]:
    path = Path(__file__).resolve().parent.parent / "taxonomy.json"
    return json.loads(path.read_text(encoding="utf-8"))["labels"]


def labels_for(crop: Optional[str]) -> list[dict]:
    labels = load_taxonomy()
    if not crop:
        return labels
    matching = [
        item for item in labels if crop in item["crops"] or "*" in item["crops"]
    ]
    return matching if len(matching) > 1 else labels


@dataclass
class OnnxModel:
    session: object
    labels: list[str]
    input_size: int
    mean: np.ndarray
    std: np.ndarray
    temperature: float
    version: str


def _load_onnx() -> Optional[OnnxModel]:
    if not (CLASSIFIER_PATH.exists() and CLASSIFIER_META_PATH.exists()):
        return None
    try:
        import onnxruntime as ort

        meta = json.loads(CLASSIFIER_META_PATH.read_text(encoding="utf-8"))
        known = {item["label"] for item in load_taxonomy()}
        unknown = [label for label in meta["labels"] if label not in known]
        if unknown:
            raise ValueError(f"labels not in taxonomy: {unknown}")
        options = ort.SessionOptions()
        options.intra_op_num_threads = ONNX_THREADS
        session = ort.InferenceSession(
            str(CLASSIFIER_PATH), options, providers=["CPUExecutionProvider"]
        )
        return OnnxModel(
            session=session,
            labels=list(meta["labels"]),
            input_size=int(meta.get("input_size", 224)),
            mean=np.array(
                meta.get("mean", [0.485, 0.456, 0.406]), dtype=np.float32
            ).reshape(1, 1, 3),
            std=np.array(
                meta.get("std", [0.229, 0.224, 0.225]), dtype=np.float32
            ).reshape(1, 1, 3),
            temperature=float(meta.get("temperature", 1.0)),
            version=str(meta.get("version", "v0.2.0")),
        )
    except Exception:
        logger.exception("could not load classifier model, using the stub")
        return None


@lru_cache(maxsize=1)
def get_model() -> Optional[OnnxModel]:
    """Loaded once. Called at startup; also lazily so tests need no lifespan."""
    return _load_onnx()


def model_version() -> str:
    model = get_model()
    return model.version if model else STUB_MODEL_VERSION


def backend() -> str:
    return "onnx" if get_model() else "stub"


def _softmax(logits: np.ndarray) -> np.ndarray:
    shifted = logits - logits.max()
    exp = np.exp(shifted)
    return exp / exp.sum()


def _prepare(model: OnnxModel, img: Image.Image) -> np.ndarray:
    size = model.input_size
    resized = img.convert("RGB").resize((size, size), Image.BILINEAR)
    arr = (np.asarray(resized, dtype=np.float32) / 255.0 - model.mean) / model.std
    return arr.transpose(2, 0, 1)[None].astype(np.float32)


def _predict_onnx(
    model: OnnxModel, img: Image.Image, crop: Optional[str]
) -> list[dict]:
    input_name = model.session.get_inputs()[0].name
    logits = model.session.run(None, {input_name: _prepare(model, img)})[0][0].astype(
        np.float64
    )
    logits = logits / model.temperature
    taxonomy = {item["label"]: item for item in load_taxonomy()}
    allowed = {item["label"] for item in labels_for(crop)}
    usable = [label in allowed for label in model.labels]
    # The model must know this crop's diseases, not only "healthy". Otherwise masking would
    # answer "healthy" for any photo of a crop it was never trained on.
    crop_supported = not crop or sum(usable) >= 2
    probs = _softmax(np.where(usable, logits, -np.inf) if crop_supported else logits)
    order = np.argsort(-probs)[:MAX_PREDICTIONS]
    cap = (
        1.0 if crop_supported else STUB_MAX_CONFIDENCE
    )  # unsupported crop: always low_confidence
    return [
        {
            "label": model.labels[i],
            "type": taxonomy[model.labels[i]]["type"],
            "confidence": round(min(float(probs[i]), cap), 4),
        }
        for i in order
        if probs[i] > 0
    ]


def _predict_stub(data: bytes, crop: Optional[str]) -> list[dict]:
    """Deterministic pseudo-prediction from the image hash. Does NOT look at the plant."""
    candidates = labels_for(crop)
    digest = hashlib.sha256(data).digest()
    start = digest[1] % len(candidates)
    ordered = [
        candidates[(start + i) % len(candidates)]
        for i in range(min(MAX_PREDICTIONS, len(candidates)))
    ]
    top = round(0.3 + (digest[0] / 255) * (STUB_MAX_CONFIDENCE - 0.3), 2)
    scores = [top, round((1 - top) * 0.25, 2), round((1 - top) * 0.1, 2)]
    return [
        {"label": item["label"], "type": item["type"], "confidence": scores[i]}
        for i, item in enumerate(ordered)
    ]


def classify(
    data: bytes, crop: Optional[str], img: Optional[Image.Image] = None
) -> list[dict]:
    model = get_model()
    if model is None:
        return _predict_stub(data, crop)
    if img is None:
        from app.services.preprocess import load_image

        img = load_image(data)
    return _predict_onnx(model, img, crop)
