from fastapi import APIRouter, Depends

from app.schemas.advisory import TreatmentRequest, TreatmentResponse
from app.security import verify_internal_key
from app.services.treatment_service import get_treatment

router = APIRouter(prefix="/ai/v1/advisory", dependencies=[Depends(verify_internal_key)])


@router.post("/treatment", response_model=TreatmentResponse)
def treatment(body: TreatmentRequest):
    return get_treatment(body.diagnosis.label, body.diagnosis.severity_pct, body.language)
