from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.config import ALLOWED_TYPES, MAX_IMAGE_BYTES, MODEL_VERSION
from app.errors import ServiceError
from app.schemas.vision import DiagnoseResponse
from app.security import verify_internal_key
from app.services.classifier import classify
from app.services.preprocess import check_quality, load_image
from app.services.severity import estimate_damage_pct

router = APIRouter(prefix="/ai/v1/vision", dependencies=[Depends(verify_internal_key)])


async def read_valid_image(image: UploadFile):
    if image.content_type not in ALLOWED_TYPES:
        raise ServiceError(400, "INVALID_IMAGE", "Only JPEG or PNG images are allowed")
    data = await image.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise ServiceError(413, "PAYLOAD_TOO_LARGE", "Image is too large")
    try:
        return data, load_image(data)
    except ValueError as exc:
        raise ServiceError(400, "INVALID_IMAGE", str(exc)) from exc


@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(
    image: UploadFile = File(...),
    crop: Optional[str] = Form(default=None),
    request_id: Optional[str] = Form(default=None),
):
    data, img = await read_valid_image(image)
    quality = check_quality(img)
    if not quality["usable"]:
        return {
            "predictions": [],
            "severity_pct": None,
            "model_version": MODEL_VERSION,
            "quality": quality,
        }
    predictions = classify(data, crop)
    healthy = predictions[0]["type"] == "healthy"
    return {
        "predictions": predictions,
        "severity_pct": 0.0 if healthy else estimate_damage_pct(img),
        "model_version": MODEL_VERSION,
        "quality": quality,
    }
