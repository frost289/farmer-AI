from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from starlette.concurrency import run_in_threadpool

from app.config import ALLOWED_TYPES, MAX_IMAGE_BYTES
from app.errors import ServiceError
from app.schemas.vision import DiagnoseResponse
from app.security import verify_internal_key
from app.services import classifier
from app.services.preprocess import check_quality, load_image
from app.services.severity import analyze

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


def _diagnose(data: bytes, img, crop: Optional[str]) -> dict:
    version = classifier.model_version()
    quality = check_quality(img)
    if not quality["usable"]:
        return {
            "predictions": [],
            "severity_pct": None,
            "model_version": version,
            "quality": quality,
        }
    predictions = classifier.classify(data, crop, img)
    healthy = bool(predictions) and predictions[0]["type"] == "healthy"
    severity = 0.0 if healthy else analyze(img).damaged_pct
    return {
        "predictions": predictions,
        "severity_pct": severity,
        "model_version": version,
        "quality": quality,
    }


@router.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(
    image: UploadFile = File(...),
    crop: Optional[str] = Form(default=None),
    request_id: Optional[str] = Form(default=None),
):
    data, img = await read_valid_image(image)
    return await run_in_threadpool(
        _diagnose, data, img, crop
    )  # CPU work: keep the event loop free
