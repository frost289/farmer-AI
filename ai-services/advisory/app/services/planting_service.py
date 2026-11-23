"""Evidence-gated planting readiness.

The seven-day forecast is suitable for a general weather watch, not a
crop-specific planting verdict. Until each crop profile has reviewed,
traceable agronomic rules, this service must not tell farmers to plant.
"""

from typing import Optional

from app.services.crop_profiles import get_crop_profile


def assess(
    crop: str, soil_type: str, forecast: list[dict], language: str = "en"
) -> dict:
    # soil_type and forecast are accepted for API compatibility. They are not
    # sufficient to infer field soil moisture or crop-specific planting readiness.
    del soil_type
    language_metadata = {"language": "en", "language_fallback": language == "ny"}
    profile = get_crop_profile(crop)

    onset: Optional[str] = None
    if forecast:
        onset = next(
            (day["date"] for day in forecast if (day.get("rain_mm") or 0) >= 10),
            None,
        )

    if profile is None:
        reason = (
            "FarmAI does not yet have a reviewed planting profile for this crop. "
            "Use the forecast as general weather information and ask an extension "
            "officer for crop-specific planting guidance."
        )
    else:
        reason = (
            f"FarmAI is preparing reviewed planting guidance for "
            f"{profile['display_name']}. "
            "The current seven-day forecast is general weather information, not a "
            "crop-specific planting recommendation. Ask an extension officer before "
            "making a planting decision."
        )

    return {
        "verdict": "wait",
        "reason": reason,
        "rain_onset_date": onset,
        # No field soil-moisture measurement is available in this assessment.
        "soil_moisture": "unknown",
        "confidence": 0.2,
        **language_metadata,
    }
