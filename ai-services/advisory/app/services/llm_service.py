"""Question answering.

STUB: keyword-matched answers so the web app can be built end to end.
Member 3: replace `answer_question` with a real LLM call (use prompts/agronomy_prompt.txt)
and keep the same return shape. See docs/API_SPECIFICATION.md section 3.2.
"""

from app.config import MODEL_VERSION

FAQ = [
    (
        ("weed", "weeding"),
        "Weed maize early: first weeding 2 to 3 weeks after emergence and a second one 3 to 4 weeks later. "
        "Weeds compete for water and nutrients most when plants are small.",
    ),
    (
        ("armyworm", "caterpillar", "worm"),
        "For fall armyworm, scout the field weekly, look inside the leaf whorls, and remove egg masses and "
        "larvae by hand when few. If the attack is heavy, ask your extension officer for a registered product.",
    ),
    (
        ("fertilizer", "fertiliser", "manure", "compost"),
        "Apply organic manure or compost before planting. Ask your extension officer or agro-dealer for the "
        "right fertilizer type and amount for your crop and soil.",
    ),
    (
        ("store", "storage", "weevil"),
        "Dry grain well before storage, clean the store, and keep it off the floor. Check regularly for weevils.",
    ),
    (
        ("seed", "variety"),
        "Choose certified seed of a variety suited to your area, and buy it before the rains start.",
    ),
    (
        ("water", "irrigation", "drought"),
        "Mulch around plants to keep soil moisture, and plant on time with the first sustained rains.",
    ),
]


def answer_question(question: str, language: str, context: dict) -> dict:
    q = question.lower()
    answer = next((a for keys, a in FAQ if any(k in q for k in keys)), None)
    if answer is None:
        crop = context.get("crop")
        answer = (
            f"I do not have a specific answer for {crop + ' ' if crop else ''}that question yet. "
            "Please describe the problem (crop, what you see, how long) or ask your extension officer."
        )
    return {
        "answer": answer,
        "sources": [],
        "model_version": MODEL_VERSION,
        "language": "en",
        "language_fallback": language == "ny",
    }
