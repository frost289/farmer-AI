"""Damaged-region boxes.

STUB: grid cells whose damaged share is high. Member 4: replace with YOLO (Ultralytics)
detections of lesions or pests; keep the return shape.
"""

import numpy as np

GRID = 4
MIN_DAMAGE_PCT = 30.0


def find_regions(mask: np.ndarray) -> list[dict]:
    height, width = mask.shape
    regions = []
    for row in range(GRID):
        for col in range(GRID):
            y0, y1 = row * height // GRID, (row + 1) * height // GRID
            x0, x1 = col * width // GRID, (col + 1) * width // GRID
            cell = mask[y0:y1, x0:x1]
            pct = round(float(cell.mean()) * 100, 1) if cell.size else 0.0
            if pct >= MIN_DAMAGE_PCT:
                regions.append(
                    {"x": x0, "y": y0, "w": x1 - x0, "h": y1 - y0, "damage_pct": pct}
                )
    return regions
