"""Image loading and quality checks. These are real (not stubs)."""

import io

import numpy as np
from PIL import Image, UnidentifiedImageError

MIN_SIDE_PX = 100
DARK_MEAN = 40
BRIGHT_MEAN = 235
BLUR_VARIANCE = 20


def load_image(data: bytes) -> Image.Image:
    """Decode bytes to an RGB image. Raises ValueError if unreadable."""
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("Unreadable image") from exc
    return img.convert("RGB")


def _laplacian_variance(gray: np.ndarray) -> float:
    lap = (
        -4 * gray[1:-1, 1:-1]
        + gray[:-2, 1:-1]
        + gray[2:, 1:-1]
        + gray[1:-1, :-2]
        + gray[1:-1, 2:]
    )
    return float(lap.var())


def check_quality(img: Image.Image) -> dict:
    """Flags images that are too small, too dark, too bright or blurry."""
    issues = []
    if min(img.size) < MIN_SIDE_PX:
        issues.append("too_small")
    small = img.copy()
    small.thumbnail((256, 256))
    gray = np.asarray(small.convert("L"), dtype=np.float64)
    mean = float(gray.mean())
    if mean < DARK_MEAN:
        issues.append("too_dark")
    if mean > BRIGHT_MEAN:
        issues.append("too_bright")
    if (
        gray.shape[0] > 2
        and gray.shape[1] > 2
        and _laplacian_variance(gray) < BLUR_VARIANCE
    ):
        issues.append("blurry")
    return {"usable": not issues, "issues": issues}
