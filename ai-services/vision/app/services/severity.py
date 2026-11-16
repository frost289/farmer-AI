"""Damage estimate from leaf colour.

Heuristic (real but simple): share of yellow/brown pixels among plant-coloured pixels.
Limits: brown soil in the background can count as damage. Member 4: replace with the
segmentation model (segmenter.py) and a calibrated severity scale.
"""
import numpy as np
from PIL import Image

# PIL HSV scale is 0-255 for H, S, V (H 0-255 maps to 0-360 degrees)
YELLOW_BROWN_H = (7, 48)
GREEN_H = (49, 128)


def _hsv(img: Image.Image) -> np.ndarray:
    return np.asarray(img.convert("HSV"), dtype=np.int16)


def damage_mask(img: Image.Image) -> tuple[np.ndarray, np.ndarray]:
    """Returns (damaged, healthy) boolean masks."""
    hsv = _hsv(img)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    damaged = (h >= YELLOW_BROWN_H[0]) & (h <= YELLOW_BROWN_H[1]) & (s > 60) & (v > 50)
    healthy = (h >= GREEN_H[0]) & (h <= GREEN_H[1]) & (s > 40) & (v > 40)
    return damaged, healthy


def estimate_damage_pct(img: Image.Image) -> float:
    small = img.copy()
    small.thumbnail((320, 320))
    damaged, healthy = damage_mask(small)
    plant = int(damaged.sum() + healthy.sum())
    if plant < 50:
        return 0.0
    return round(float(damaged.sum()) / plant * 100, 1)
