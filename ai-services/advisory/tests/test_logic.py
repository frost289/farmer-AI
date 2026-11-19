"""Pure-logic tests (no FastAPI needed)."""

from app.services import crop_recommender, planting_service, treatment_service

DRY = [{"date": f"2026-11-{16 + i}", "rain_mm": 0, "temp_c": 29} for i in range(7)]
WET = [{"date": f"2026-11-{16 + i}", "rain_mm": 8, "temp_c": 27} for i in range(7)]
FLOOD = [{"date": f"2026-11-{16 + i}", "rain_mm": 40, "temp_c": 25} for i in range(7)]


def test_dry_week_means_wait():
    r = planting_service.assess("maize", "loam", DRY)
    assert r["verdict"] == "wait"
    assert r["soil_moisture"] == "dry"


def test_established_rain_means_plant():
    r = planting_service.assess("maize", "loam", WET)
    assert r["verdict"] == "plant"
    assert r["rain_onset_date"] == "2026-11-16" or r["rain_onset_date"] is None


def test_waterlogging_not_recommended():
    assert (
        planting_service.assess("maize", "clay", FLOOD)["verdict"] == "not_recommended"
    )


def test_no_forecast_is_low_confidence():
    r = planting_service.assess("maize", "loam", [])
    assert r["confidence"] < 0.5


def test_recommendations_sorted_and_scored():
    recs = crop_recommender.recommend("loam", WET)
    assert len(recs) == 5
    assert [r["score"] for r in recs] == sorted(
        (r["score"] for r in recs), reverse=True
    )
    assert all(0 <= r["score"] <= 1 for r in recs)


def test_treatment_known_and_unknown_labels():
    known = treatment_service.get_treatment("fall_armyworm", 70, "en")
    assert known["organic"] and any("severe" in w for w in known["warnings"])
    unknown = treatment_service.get_treatment("something_new", None, "en")
    assert unknown["warnings"]
