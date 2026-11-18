from fastapi import APIRouter, Depends, File, UploadFile
from starlette.concurrency import run_in_threadpool

from app.routers.diagnose import read_valid_image
from app.schemas.vision import SegmentResponse
from app.security import verify_internal_key
from app.services import classifier
from app.services.detector import find_regions
from app.services.segmenter import segment
from app.services.severity import analyze, to_analysis_size

router = APIRouter(prefix="/ai/v1/vision", dependencies=[Depends(verify_internal_key)])


def _segment(img) -> dict:
    analysis = analyze(img)
    result = segment(img, analysis)
    return {
        "damaged_area_pct": result["damaged_area_pct"],
        "regions": find_regions(result["mask"], to_analysis_size(img)),
        "mask_png_base64": result["mask_png_base64"],
        "model_version": classifier.model_version(),
    }


@router.post("/segment", response_model=SegmentResponse)
async def segment_image(image: UploadFile = File(...)):
    _, img = await read_valid_image(image)
    return await run_in_threadpool(_segment, img)
