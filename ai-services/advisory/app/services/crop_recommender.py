"""Crop suitability scoring.

STUB rule-based scoring from soil type and the 7-day weather. Member 3: replace with a model
trained on Malawi data. Varieties are left empty until verified with DARS/DAES sources.
"""

# crop -> (good soils, ok soils, weekly rain range mm that suits it, max comfortable temp C)
PROFILES = {
    "maize": (("loam", "sandy_loam", "clay_loam"), ("silt", "clay"), (25, 100), 34),
    "groundnut": (("sandy_loam", "sandy", "loam"), ("silt",), (15, 70), 34),
    "soybean": (("loam", "clay_loam", "sandy_loam"), ("silt", "clay"), (20, 90), 33),
    "beans": (("loam", "sandy_loam"), ("clay_loam", "silt"), (15, 70), 30),
    "cassava": (("sandy_loam", "sandy", "loam"), ("clay_loam", "silt"), (10, 80), 36),
    "sweet_potato": (("sandy_loam", "loam", "sandy"), ("silt",), (10, 70), 35),
    "rice": (("clay", "clay_loam", "silt"), ("loam",), (60, 200), 35),
    "tobacco": (("sandy_loam", "loam"), ("sandy",), (20, 80), 34),
    "cotton": (("loam", "clay_loam", "sandy_loam"), ("silt",), (20, 80), 36),
    "tomato": (("loam", "sandy_loam"), ("clay_loam", "silt"), (20, 70), 32),
    "pigeon_pea": (
        ("sandy_loam", "loam", "clay_loam"),
        ("sandy", "silt"),
        (10, 70),
        36,
    ),
}


def _fit(value: float, low: float, high: float) -> float:
    if low <= value <= high:
        return 1.0
    gap = (low - value) if value < low else (value - high)
    return max(0.0, 1.0 - gap / max(high, 1))


def recommend(soil_type: str, forecast: list[dict], limit: int = 5) -> list[dict]:
    rain = sum(d.get("rain_mm") or 0 for d in forecast)
    temps = [d["temp_c"] for d in forecast if d.get("temp_c") is not None]
    temp = sum(temps) / len(temps) if temps else None
    out = []
    for crop, (good, ok, (lo, hi), max_t) in PROFILES.items():
        soil_fit = (
            1.0
            if soil_type in good
            else 0.6 if soil_type in ok else 0.4 if soil_type == "unknown" else 0.2
        )
        rain_fit = _fit(rain, lo, hi) if forecast else 0.5
        temp_fit = (
            0.5
            if temp is None
            else (1.0 if temp <= max_t else max(0.0, 1 - (temp - max_t) / 10))
        )
        score = round(0.5 * soil_fit + 0.3 * rain_fit + 0.2 * temp_fit, 2)
        reasons = []
        reasons.append(
            "suits your soil"
            if soil_fit >= 1
            else "soil is acceptable" if soil_fit >= 0.6 else "soil is not ideal"
        )
        if forecast:
            reasons.append(
                "expected rain fits"
                if rain_fit >= 0.9
                else "expected rain is not ideal"
            )
        out.append(
            {
                "crop": crop,
                "variety": None,
                "score": score,
                "reason": "; ".join(reasons).capitalize() + ".",
            }
        )
    out.sort(key=lambda r: r["score"], reverse=True)
    return out[:limit]
