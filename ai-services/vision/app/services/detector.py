"""Damaged-region boxes.

Default: connected blobs of the damage mask (no weights needed). If `models/detector.pt`
exists and `ultralytics` is installed, a YOLO lesion detector is used instead. Boxes are in
the pixel space of the returned mask (see /segment), not of the original photo.
"""

import logging
from functools import lru_cache

import cv2
import numpy as np

from app.config import DETECTOR_PATH

logger = logging.getLogger("vision.detector")

MAX_REGIONS = 10
MIN_REGION_RATIO = 0.002  # smallest box area, as a share of the mask area


def blob_regions(mask: np.ndarray) -> list[dict]:
    height, width = mask.shape
    count, _, stats, _ = cv2.connectedComponentsWithStats(
        mask.astype(np.uint8), connectivity=8
    )
    regions = []
    for i in range(1, count):
        x, y, w, h, area = (int(v) for v in stats[i])
        if w * h < height * width * MIN_REGION_RATIO:
            continue
        pct = round(float(mask[y : y + h, x : x + w].mean()) * 100, 1)
        regions.append(
            {"x": x, "y": y, "w": w, "h": h, "damage_pct": pct, "_area": area}
        )
    regions.sort(key=lambda r: r["_area"], reverse=True)
    return [{k: v for k, v in r.items() if k != "_area"} for r in regions[:MAX_REGIONS]]


@lru_cache(maxsize=1)
def _yolo():
    if not DETECTOR_PATH.exists():
        return None
    try:
        from ultralytics import YOLO

        return YOLO(str(DETECTOR_PATH))
    except Exception:  # missing package or bad weights: fall back to blobs
        logger.exception("could not load YOLO detector, using blob regions")
        return None


def yolo_regions(rgb: np.ndarray, mask: np.ndarray) -> list[dict] | None:
    model = _yolo()
    if model is None:
        return None
    height, width = mask.shape
    scale_y, scale_x = height / rgb.shape[0], width / rgb.shape[1]
    boxes = model.predict(rgb[..., ::-1], verbose=False)[
        0
    ].boxes  # ultralytics expects BGR
    regions = []
    for xyxy in boxes.xyxy.cpu().numpy():
        x0, y0 = int(xyxy[0] * scale_x), int(xyxy[1] * scale_y)
        x1, y1 = int(np.ceil(xyxy[2] * scale_x)), int(np.ceil(xyxy[3] * scale_y))
        cell = mask[y0:y1, x0:x1]
        if cell.size:
            regions.append(
                {
                    "x": x0,
                    "y": y0,
                    "w": x1 - x0,
                    "h": y1 - y0,
                    "damage_pct": round(float(cell.mean()) * 100, 1),
                }
            )
    return regions[:MAX_REGIONS]


def find_regions(mask: np.ndarray, rgb: np.ndarray | None = None) -> list[dict]:
    if rgb is not None:
        found = yolo_regions(rgb, mask)
        if found is not None:
            return found
    return blob_regions(mask)
