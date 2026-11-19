from fastapi import APIRouter, Depends

from app.schemas.advisory import PlantingReadinessRequest, PlantingReadinessResponse
from app.security import verify_internal_key
from app.services.planting_service import assess

router = APIRouter(prefix="/ai/v1/advisory", dependencies=[Depends(verify_internal_key)])


@router.post("/planting-readiness", response_model=PlantingReadinessResponse)
def planting_readiness(body: PlantingReadinessRequest):
    forecast = [d.model_dump() for d in body.weather.forecast_7d]
    return assess(body.crop, body.soil_type, forecast, body.language)
