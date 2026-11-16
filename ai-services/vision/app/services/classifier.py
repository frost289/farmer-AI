"""Disease and pest classification.

STUB: deterministic pseudo-prediction from a hash of the image bytes, so the same photo always
gives the same answer. It does NOT look at the plant.
Member 4: replace `classify` with a trained CNN/YOLO model and keep the return shape:
    [{"label": str, "type": str, "confidence": float}, ...] sorted by confidence, max 3.
Labels must come from docs/label-taxonomy.json.
"""
import hashlib
import json
from functools import lru_cache
from pathlib import Path
from typing import Optional


@lru_cache(maxsize=1)
def load_taxonomy() -> list[dict]:
    path = Path(__file__).resolve().parent.parent / "taxonomy.json"
    return json.loads(path.read_text(encoding="utf-8"))["labels"]


def labels_for(crop: Optional[str]) -> list[dict]:
    labels = load_taxonomy()
    if not crop:
        return labels
    matching = [item for item in labels if crop in item["crops"] or "*" in item["crops"]]
    return matching if len(matching) > 1 else labels


def classify(data: bytes, crop: Optional[str]) -> list[dict]:
    candidates = labels_for(crop)
    digest = hashlib.sha256(data).digest()
    start = digest[1] % len(candidates)
    ordered = [candidates[(start + i) % len(candidates)] for i in range(min(3, len(candidates)))]
    top = round(0.55 + (digest[0] / 255) * 0.4, 2)
    scores = [top, round((1 - top) * 0.6, 2), round((1 - top) * 0.25, 2)]
    return [
        {"label": item["label"], "type": item["type"], "confidence": scores[i]}
        for i, item in enumerate(ordered)
    ]
