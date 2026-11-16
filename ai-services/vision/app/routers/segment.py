from fastapi import APIRouter, Depends, File, UploadFile

from app.config import MODEL_VERSION
from app.routers.diagnose import read_valid_image
from app.schemas.vision import SegmentResponse
from app.security import verify_internal_key
from app.services.detector import find_regions
from app.services.segmenter import segment

router = APIRouter(prefix="/ai/v1/vision", dependencies=[Depends(verify_internal_key)])


@router.post("/segment", response_model=SegmentResponse)
async def segment_image(image: UploadFile = File(...)):
    _, img = await read_valid_image(image)
    result = segment(img)
    return {
        "damaged_area_pct": result["damaged_area_pct"],
        "regions": find_regions(result["mask"]),
        "mask_png_base64": result["mask_png_base64"],
        "model_version": MODEL_VERSION,
    }
