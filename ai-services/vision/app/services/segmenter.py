"""Damage segmentation: PNG mask plus damaged-area percentage.

Uses the colour analysis in severity.py. To use Segment Anything or a trained U-Net later,
return the same dict from `segment` (damaged_area_pct, mask as bool array, mask_png_base64).
"""

import base64
import io

import numpy as np
from PIL import Image

from app.services.severity import LeafAnalysis, analyze


def segment(img: Image.Image, analysis: LeafAnalysis | None = None) -> dict:
    result = analysis or analyze(img)
    buf = io.BytesIO()
    Image.fromarray((result.damaged * 255).astype(np.uint8), mode="L").save(
        buf, format="PNG"
    )
    return {
        "damaged_area_pct": result.damaged_pct,
        "mask": result.damaged,
        "mask_png_base64": base64.b64encode(buf.getvalue()).decode("ascii"),
    }
