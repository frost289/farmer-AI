"""Treatment advice per disease/pest label.

STUB knowledge base with general, widely published practices. Member 3 must review it with
Malawi agronomy sources (DAES guidelines, extension officers) before real use.
Never add product names or doses here without a verified source.
"""
from typing import Optional

CHEMICAL_NOTE = (
    "If a chemical is needed, ask your extension officer for a pesticide registered in Malawi "
    "and follow the label for dose and safety."
)

KB: dict[str, dict] = {
    "maize_streak_virus": {
        "organic": [
            "Remove and destroy infected plants early so the virus does not spread.",
            "Keep fields weed-free; weeds can hide the leafhoppers that spread the virus.",
        ],
        "chemical": [CHEMICAL_NOTE + " Treatment targets the leafhopper insects, not the virus itself."],
        "prevention": [
            "Plant resistant or tolerant maize varieties.",
            "Plant early with the first rains; late-planted maize is hit harder.",
        ],
        "warnings": ["There is no cure for infected plants."],
    },
    "maize_gray_leaf_spot": {
        "organic": ["Remove badly infected leaves and bury or burn old crop residue after harvest."],
        "chemical": [CHEMICAL_NOTE],
        "prevention": [
            "Rotate maize with legumes such as groundnut or soybean.",
            "Use tolerant varieties and avoid planting maize after maize.",
        ],
        "warnings": [],
    },
    "fall_armyworm": {
        "organic": [
            "Scout weekly and crush egg masses and young larvae by hand when numbers are small.",
            "Put dry soil or wood ash into the leaf whorl of young plants (common farmer practice).",
            "Neem-based sprays may help on young larvae.",
        ],
        "chemical": [CHEMICAL_NOTE],
        "prevention": [
            "Plant at the same time as neighbours so the pest has less time to build up.",
            "Intercrop maize with legumes and keep the field free of weeds.",
        ],
        "warnings": ["Spray early morning or late afternoon, when larvae are active."],
    },
    "cassava_mosaic_disease": {
        "organic": ["Uproot and destroy infected plants and do not use their stems as planting material."],
        "chemical": ["Insecticides against whiteflies are rarely economical. Ask your extension officer first."],
        "prevention": [
            "Use clean cuttings from healthy plants and resistant varieties.",
            "Plant stems from fields with no mosaic symptoms.",
        ],
        "warnings": [],
    },
    "groundnut_rosette": {
        "organic": ["Remove infected plants early and weed the field well."],
        "chemical": [CHEMICAL_NOTE + " Control targets the aphids that spread rosette."],
        "prevention": [
            "Plant resistant varieties.",
            "Plant early and use close spacing, which reduces aphid spread.",
        ],
        "warnings": ["There is no cure for infected plants."],
    },
    "tomato_late_blight": {
        "organic": [
            "Remove and destroy infected leaves and fruits.",
            "Water at the base of plants, in the morning, and avoid wetting the leaves.",
        ],
        "chemical": [CHEMICAL_NOTE],
        "prevention": [
            "Space plants for good air flow and stake them.",
            "Rotate tomatoes with non-related crops and avoid planting near potatoes.",
        ],
        "warnings": ["The disease spreads quickly in cool, wet weather."],
    },
    "healthy": {"organic": [], "chemical": [], "prevention": ["Keep scouting your field every week."], "warnings": []},
}

GENERIC = {
    "organic": ["Remove the worst affected plants or leaves and keep the field clean."],
    "chemical": [CHEMICAL_NOTE],
    "prevention": ["Rotate crops, use certified seed and scout your field every week."],
    "warnings": [],
}


def get_treatment(label: str, severity_pct: Optional[float], language: str) -> dict:
    entry = KB.get(label, GENERIC)
    result = {k: list(v) for k, v in entry.items()}
    if severity_pct is not None and severity_pct > 50:
        result["warnings"].append("The damage is severe. Contact your extension officer as soon as possible.")
    if label not in KB:
        result["warnings"].append("No specific advice is available for this problem yet.")
    if language == "ny":
        result["warnings"].append("Chichewa advice is not available yet, so this advice is in English.")
    return result
