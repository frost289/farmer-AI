"""Tests for the damage analysis, quality checks and region finder."""

import numpy as np
from PIL import Image

from app.services import detector, preprocess, segmenter, severity
from tests.helpers import png_bytes, textured

GREEN = (60, 140, 50)
YELLOW = (210, 190, 40)
SOIL = (120, 80, 40)


def image(array: np.ndarray) -> Image.Image:
    return preprocess.load_image(png_bytes(array))


def leaf_on_soil(patch: tuple | None = None) -> np.ndarray:
    """Green leaf in the middle of brown soil; optional yellow patch inside the leaf."""
    canvas = textured(SOIL, size=200, seed=3)
    canvas[60:140, 60:140] = textured(GREEN, size=80, seed=4)
    if patch:
        y0, y1, x0, x1 = patch
        canvas[y0:y1, x0:x1] = textured(YELLOW, size=200, seed=5)[: y1 - y0, : x1 - x0]
    return canvas


def test_soil_background_is_not_counted_as_damage():
    assert severity.estimate_damage_pct(image(leaf_on_soil())) < 25


def test_damage_inside_the_leaf_is_measured():
    pct = severity.estimate_damage_pct(image(leaf_on_soil(patch=(80, 100, 70, 130))))
    assert 10 < pct < 30  # a yellow patch covering about 19% of the leaf


def test_fully_yellow_leaf_is_still_damaged():
    assert severity.estimate_damage_pct(image(textured(YELLOW))) > 80


def test_photo_without_plant_is_flagged():
    sky = textured((90, 110, 200))
    assert preprocess.check_quality(image(sky))["issues"] == ["no_plant_detected"]


def test_segment_mask_matches_percentage():
    result = segmenter.segment(image(leaf_on_soil(patch=(80, 100, 70, 130))))
    assert result["mask"].dtype == bool and result["mask"].any()
    assert result["mask_png_base64"]
    assert result["damaged_area_pct"] > 10


def test_regions_are_blobs_not_grid_cells():
    mask = np.zeros((100, 100), dtype=bool)
    mask[10:30, 10:40] = True
    mask[60:90, 55:85] = True
    regions = detector.find_regions(mask)
    assert len(regions) == 2
    assert {"x": 10, "y": 10, "w": 30, "h": 20, "damage_pct": 100.0} in regions


def test_tiny_specks_are_ignored():
    mask = np.zeros((100, 100), dtype=bool)
    mask[5:7, 5:7] = True
    assert detector.find_regions(mask) == []
