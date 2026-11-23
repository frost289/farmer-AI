"""Evidence-gated crop profiles for Malawi.

Do not add numeric weather thresholds here until they have a traceable,
legally usable source and review by a qualified Malawi agronomist.
"""
from typing import TypedDict


class CropProfile(TypedDict):
    display_name: str
    evidence_status: str
    weather_rules_enabled: bool


# These records establish catalogue coverage, not agronomic recommendations.
# All weather rules remain disabled pending crop/variety/stage-specific review.
CROP_PROFILES: dict[str, CropProfile] = {
    "maize": {
        "display_name": "Maize",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "rice": {
        "display_name": "Rice",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "groundnut": {
        "display_name": "Groundnut",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "soybean": {
        "display_name": "Soybean",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "tobacco": {
        "display_name": "Tobacco",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "cassava": {
        "display_name": "Cassava",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "sweet_potato": {
        "display_name": "Sweet potato",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "beans": {
        "display_name": "Beans",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "cotton": {
        "display_name": "Cotton",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "tomato": {
        "display_name": "Tomato",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
    "pigeon_pea": {
        "display_name": "Pigeon pea",
        "evidence_status": "needs_agronomist_review",
        "weather_rules_enabled": False,
    },
}


def get_crop_profile(crop: str) -> CropProfile | None:
    """Return a known crop profile, or None for an unsupported crop key."""
    return CROP_PROFILES.get(crop)
