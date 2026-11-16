from fastapi import APIRouter, Depends

from app.schemas.advisory import RecommendRequest, RecommendResponse
from app.security import verify_internal_key
from app.services.crop_recommender import recommend

router = APIRouter(prefix="/ai/v1/advisory", dependencies=[Depends(verify_internal_key)])


@router.post("/recommend-crops", response_model=RecommendResponse)
def recommend_crops(body: RecommendRequest):
    forecast = [d.model_dump() for d in body.weather.forecast_7d]
    return {"recommendations": recommend(body.soil_type, forecast)}
