import io

import numpy as np
from PIL import Image


def png_bytes(array: np.ndarray) -> bytes:
    buf = io.BytesIO()
    Image.fromarray(array.astype(np.uint8)).save(buf, format="PNG")
    return buf.getvalue()


def textured(rgb: tuple, size: int = 200, seed: int = 1) -> np.ndarray:
    """Solid colour plus noise, so the blur check sees detail."""
    rng = np.random.default_rng(seed)
    base = np.ones((size, size, 3)) * np.array(rgb)
    return np.clip(base + rng.normal(0, 25, base.shape), 0, 255)
