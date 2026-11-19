"""'Can I plant this week?' rules.

STUB heuristic on the 7-day forecast only. Member 3: improve with seasonal forecasts,
soil moisture and crop-specific thresholds.
"""
from typing import Optional

RAIN_DAY_MM = 1.0
ESTABLISHED_RAIN_MM = 25.0
WATERLOGGING_MM = 150.0
HEAT_LIMIT_C = 38.0


def assess(crop: str, soil_type: str, forecast: list[dict], language: str = "en") -> dict:
    language_metadata = {"language": "en", "language_fallback": language == "ny"}
    if not forecast:
        return {
            "verdict": "wait",
            "reason": "No forecast available. Check again later or ask your extension officer.",
            "rain_onset_date": None,
            "soil_moisture": "dry",
            "confidence": 0.2,
            **language_metadata,
        }
    total = sum(d.get("rain_mm") or 0 for d in forecast)
    rainy_days = sum(1 for d in forecast if (d.get("rain_mm") or 0) >= RAIN_DAY_MM)
    hottest = max((d.get("temp_c") for d in forecast if d.get("temp_c") is not None), default=None)
    onset: Optional[str] = next((d["date"] for d in forecast if (d.get("rain_mm") or 0) >= 10), None)

    moisture = "dry" if total < 10 else "wet" if total > 100 else "adequate"
    if soil_type == "sandy" and moisture == "adequate" and total < 40:
        moisture = "dry"  # sandy soil drains fast

    if total > WATERLOGGING_MM:
        verdict, reason, conf = "not_recommended", "Very heavy rain is forecast. Seed may rot in waterlogged soil.", 0.7
    elif hottest is not None and hottest > HEAT_LIMIT_C:
        verdict, reason, conf = "wait", "Very hot weather is forecast. Wait for cooler days to avoid drought stress.", 0.6
    elif total >= ESTABLISHED_RAIN_MM and rainy_days >= 3:
        verdict, reason, conf = "plant", f"Rain looks established ({total:.0f} mm over {rainy_days} days). Good time to plant {crop}.", 0.65
    else:
        verdict, reason, conf = "wait", "Rains are not established yet. Wait for steady rain before planting to avoid seed rot or drought stress.", 0.65
    return {
        "verdict": verdict,
        "reason": reason,
        "rain_onset_date": onset,
        "soil_moisture": moisture,
        "confidence": conf,
        **language_metadata,
    }
