from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
H = {"X-Internal-Key": "dev-internal-key"}


def test_health_is_public():
    assert client.get("/health").json()["status"] == "ok"


def test_requires_internal_key():
    r = client.post("/ai/v1/advisory/query", json={"question": "hi"})
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "UNAUTHORIZED"


def test_query_returns_answer():
    r = client.post("/ai/v1/advisory/query", headers=H, json={"question": "When should I weed maize?", "language": "en"})
    assert r.status_code == 200
    assert r.json()["answer"]
    assert r.json()["language"] == "en"
    assert r.json()["language_fallback"] is False


def test_validation_error_uses_envelope():
    r = client.post("/ai/v1/advisory/query", headers=H, json={"language": "en"})
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"


def test_treatment_shape():
    r = client.post("/ai/v1/advisory/treatment", headers=H, json={"diagnosis": {"label": "maize_streak_virus", "severity_pct": 35}, "crop": "maize", "language": "en"})
    assert set(r.json()) == {"organic", "chemical", "prevention", "warnings", "language", "language_fallback"}
    assert r.json()["language"] == "en"
    assert r.json()["language_fallback"] is False


def test_planting_and_recommend():
    weather = {"forecast_7d": [{"date": "2026-11-16", "rain_mm": 12, "temp_c": 28}] * 7}
    p = client.post("/ai/v1/advisory/planting-readiness", headers=H, json={"crop": "maize", "location": {"lat": -13.9, "lng": 33.7}, "soil_type": "loam", "weather": weather})
    assert p.json()["verdict"] in {"plant", "wait", "not_recommended"}
    assert p.json()["language"] == "en"
    assert p.json()["language_fallback"] is False
    r = client.post("/ai/v1/advisory/recommend-crops", headers=H, json={"location": {"lat": -13.9, "lng": 33.7}, "soil_type": "loam", "weather": weather})
    assert r.json()["recommendations"]
    assert r.json()["language"] == "en"
    assert r.json()["language_fallback"] is False
