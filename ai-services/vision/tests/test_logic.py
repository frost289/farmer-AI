"""Pure-logic tests (no FastAPI needed)."""
from app.services import classifier, detector, preprocess, segmenter, severity
from tests.helpers import png_bytes, textured

GREEN = (60, 140, 50)
YELLOW = (210, 190, 40)


def test_good_image_is_usable():
    img = preprocess.load_image(png_bytes(textured(GREEN)))
    assert preprocess.check_quality(img)["usable"]


def test_tiny_dark_and_blurry_images_are_flagged():
    tiny = preprocess.load_image(png_bytes(textured(GREEN, size=40)))
    assert "too_small" in preprocess.check_quality(tiny)["issues"]
    dark = preprocess.load_image(png_bytes(textured((5, 5, 5))))
    assert "too_dark" in preprocess.check_quality(dark)["issues"]
    flat = preprocess.load_image(png_bytes(textured(GREEN) * 0 + 120))
    assert "blurry" in preprocess.check_quality(flat)["issues"]


def test_unreadable_bytes_raise():
    try:
        preprocess.load_image(b"not an image")
    except ValueError:
        return
    raise AssertionError("expected ValueError")


def test_damage_estimate_green_vs_yellow():
    green = preprocess.load_image(png_bytes(textured(GREEN)))
    yellow = preprocess.load_image(png_bytes(textured(YELLOW)))
    assert severity.estimate_damage_pct(green) < 20
    assert severity.estimate_damage_pct(yellow) > 80


def test_classifier_is_deterministic_and_sorted():
    data = png_bytes(textured(GREEN))
    a, b = classifier.classify(data, "maize"), classifier.classify(data, "maize")
    assert a == b
    assert [p["confidence"] for p in a] == sorted((p["confidence"] for p in a), reverse=True)
    labels = {i["label"] for i in classifier.load_taxonomy()}
    assert all(p["label"] in labels for p in a)


def test_segment_and_regions():
    img = preprocess.load_image(png_bytes(textured(YELLOW)))
    result = segmenter.segment(img)
    assert result["damaged_area_pct"] > 80
    assert detector.find_regions(result["mask"])
