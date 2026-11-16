"""Damage segmentation.

STUB: colour-threshold mask from severity.py. Member 4: replace with Segment Anything (SAM)
or a trained segmentation model; keep the return shape.
"""
import base64
import io

import numpy as np
from PIL import Image

from app.services.severity import damage_mask


def segment(img: Image.Image) -> dict:
    small = img.copy()
    small.thumbnail((320, 320))
    damaged, healthy = damage_mask(small)
    plant = int(damaged.sum() + healthy.sum())
    pct = round(float(damaged.sum()) / plant * 100, 1) if plant >= 50 else 0.0
    buf = io.BytesIO()
    Image.fromarray((damaged * 255).astype(np.uint8), mode="L").save(buf, format="PNG")
    return {
        "damaged_area_pct": pct,
        "mask": damaged,
        "mask_png_base64": base64.b64encode(buf.getvalue()).decode("ascii"),
    }
