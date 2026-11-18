"""Leaf damage analysis with OpenCV.

Damage = yellow/brown pixels that belong to the plant. Soil is brown too, so damaged pixels
only count when they sit on or next to healthy (green) tissue. If almost no green is visible
(a fully diseased leaf), the restriction is dropped, because soil and a dead leaf cannot be
told apart by colour alone. Speckle is removed with a morphological opening.

The same analysis feeds /diagnose (severity_pct) and /segment (mask, regions), so both always
agree. A trained segmentation model can replace `analyze` without touching the routers.
"""

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image

from app.config import ANALYSIS_SIDE

# OpenCV HSV: H 0-179, S 0-255, V 0-255
DAMAGED_H = (5, 34)
HEALTHY_H = (35, 90)
DAMAGED_MIN_SV = (60, 50)
HEALTHY_MIN_SV = (40, 40)
MIN_PLANT_PIXELS = 50
MIN_GREEN_FRACTION = 0.02  # below this, damage is not restricted to the area near green
NEAR_GREEN_RATIO = 0.06  # dilation radius as a share of the shorter image side
MIN_BLOB_RATIO = 0.0005  # drop damage blobs smaller than this share of the image
ANCHOR_OPEN_PX = (
    5  # green must form solid patches this wide to anchor damage (ignores noise)
)
ANCHOR_MIN_RATIO = 0.003  # ...and each patch must cover this share of the image


@dataclass
class LeafAnalysis:
    damaged: np.ndarray  # bool mask, analysis resolution
    healthy: np.ndarray  # bool mask, analysis resolution
    damaged_pct: float


def to_analysis_size(img: Image.Image) -> np.ndarray:
    """RGB uint8 array no larger than ANALYSIS_SIDE on its longest side."""
    small = img.convert("RGB")
    small.thumbnail((ANALYSIS_SIDE, ANALYSIS_SIDE))
    return np.asarray(small, dtype=np.uint8)


def _colour_masks(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    damaged = (
        (h >= DAMAGED_H[0])
        & (h <= DAMAGED_H[1])
        & (s > DAMAGED_MIN_SV[0])
        & (v > DAMAGED_MIN_SV[1])
    )
    healthy = (
        (h >= HEALTHY_H[0])
        & (h <= HEALTHY_H[1])
        & (s > HEALTHY_MIN_SV[0])
        & (v > HEALTHY_MIN_SV[1])
    )
    return damaged, healthy


def plant_fraction(img: Image.Image) -> float:
    """Share of pixels that look like plant tissue (green or yellow/brown)."""
    damaged, healthy = _colour_masks(to_analysis_size(img))
    return float((damaged | healthy).mean())


def _clean(mask: np.ndarray) -> np.ndarray:
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    opened = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_OPEN, kernel)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(opened, connectivity=8)
    min_area = max(4, int(mask.size * MIN_BLOB_RATIO))
    keep = np.zeros(count, dtype=bool)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] >= min_area
    return keep[labels]


def _green_anchor(healthy: np.ndarray) -> np.ndarray:
    """Solid green patches only. Stray greenish pixels (soil noise, glare) must not count."""
    kernel = cv2.getStructuringElement(
        cv2.MORPH_ELLIPSE, (ANCHOR_OPEN_PX, ANCHOR_OPEN_PX)
    )
    opened = cv2.morphologyEx(healthy.astype(np.uint8), cv2.MORPH_OPEN, kernel)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(opened, connectivity=8)
    keep = np.zeros(count, dtype=bool)
    keep[1:] = stats[1:, cv2.CC_STAT_AREA] >= healthy.size * ANCHOR_MIN_RATIO
    return keep[labels]


def analyze(img: Image.Image) -> LeafAnalysis:
    rgb = to_analysis_size(img)
    damaged, healthy = _colour_masks(rgb)
    anchor = _green_anchor(healthy)
    if anchor.mean() >= MIN_GREEN_FRACTION:
        radius = max(2, int(min(rgb.shape[:2]) * NEAR_GREEN_RATIO))
        kernel = cv2.getStructuringElement(
            cv2.MORPH_ELLIPSE, (2 * radius + 1, 2 * radius + 1)
        )
        near_green = cv2.dilate(anchor.astype(np.uint8), kernel).astype(bool)
        damaged &= near_green
    damaged = _clean(damaged)
    healthy &= ~damaged
    plant = int(damaged.sum() + healthy.sum())
    pct = (
        round(float(damaged.sum()) / plant * 100, 1)
        if plant >= MIN_PLANT_PIXELS
        else 0.0
    )
    return LeafAnalysis(damaged=damaged, healthy=healthy, damaged_pct=pct)


# Kept for callers and tests that used the earlier heuristic API.
def damage_mask(img: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    result = analyze(img)
    return result.damaged, result.healthy


def estimate_damage_pct(img: Image.Image) -> float:
    return analyze(img).damaged_pct
