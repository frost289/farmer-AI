"""API behaviour that depends on the quality gate and model version."""

from fastapi.testclient import TestClient

from app.main import app
from tests.helpers import png_bytes, textured

client = TestClient(app)
H = {"X-Internal-Key": "dev-internal-key"}


def test_health_reports_backend():
    body = client.get("/health").json()
    assert body["status"] == "ok" and body["classifier"] == "stub"


def test_stub_answers_are_low_confidence():
    r = client.post(
        "/ai/v1/vision/diagnose",
        headers=H,
        data={"crop": "maize"},
        files={"image": ("a.png", png_bytes(textured((60, 140, 50))), "image/png")},
    )
    body = r.json()
    assert body["model_version"].endswith("-stub")
    assert body["predictions"][0]["confidence"] < 0.5


def test_non_plant_photo_is_unusable():
    r = client.post(
        "/ai/v1/vision/diagnose",
        headers=H,
        files={"image": ("a.png", png_bytes(textured((90, 110, 200))), "image/png")},
    )
    body = r.json()
    assert body["quality"] == {"usable": False, "issues": ["no_plant_detected"]}
    assert body["predictions"] == []


def test_segment_regions_and_mask():
    r = client.post(
        "/ai/v1/vision/segment",
        headers=H,
        files={"image": ("a.png", png_bytes(textured((210, 190, 40))), "image/png")},
    )
    body = r.json()
    assert body["damaged_area_pct"] > 80 and body["regions"] and body["mask_png_base64"]
