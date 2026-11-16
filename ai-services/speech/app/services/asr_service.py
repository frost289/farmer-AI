"""Speech-to-text. LATER PHASE (Member 4): research Whisper fine-tuning, Mozilla Common Voice
and other Chichewa data, then implement `transcribe`."""
from app.errors import ServiceError


def transcribe(audio: bytes, language: str) -> dict:
    raise ServiceError(503, "AI_UNAVAILABLE", "Speech recognition is not available yet")
