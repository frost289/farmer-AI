from fastapi.testclient import TestClient

from app.main import app
from tests.helpers import png_bytes, textured

client = TestClient(app)
H = {"X-Internal-Key": "dev-internal-key"}


def post_image(data: bytes, content_type="image/png", **form):
    return client.post("/ai/v1/vision/diagnose", headers=H, files={"image": ("leaf.png", data, content_type)}, data=form)


def test_health_is_public():
    assert client.get("/health").json()["status"] == "ok"


def test_requires_internal_key():
    r = client.post("/ai/v1/vision/diagnose", files={"image": ("a.png", b"x", "image/png")})
    assert r.status_code == 401


def test_diagnose_returns_contract_shape():
    r = post_image(png_bytes(textured((60, 140, 50))), crop="maize")
    assert r.status_code == 200
    body = r.json()
    assert body["quality"]["usable"] is True
    assert 1 <= len(body["predictions"]) <= 3
    assert {"label", "type", "confidence"} <= set(body["predictions"][0])


def test_unusable_image_returns_empty_predictions():
    r = post_image(png_bytes(textured((5, 5, 5))))
    assert r.json()["quality"]["usable"] is False
    assert r.json()["predictions"] == []


def test_rejects_wrong_type_and_garbage():
    assert post_image(b"hello", content_type="text/plain").json()["error"]["code"] == "INVALID_IMAGE"
    assert post_image(b"not an image").json()["error"]["code"] == "INVALID_IMAGE"


def test_segment():
    r = client.post("/ai/v1/vision/segment", headers=H, files={"image": ("a.png", png_bytes(textured((210, 190, 40))), "image/png")})
    assert r.status_code == 200
    assert r.json()["damaged_area_pct"] > 50
