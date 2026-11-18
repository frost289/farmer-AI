from fastapi import APIRouter, Depends

from app.schemas.advisory import QueryRequest, QueryResponse
from app.security import verify_internal_key
from app.services.llm_service import answer_question

router = APIRouter(prefix="/ai/v1/advisory", dependencies=[Depends(verify_internal_key)])


@router.post("/query", response_model=QueryResponse)
def query(body: QueryRequest):
    # Safely handle optional context to avoid NoneType attribute errors
    context_data = body.context.model_dump() if body.context else {}
    
    return answer_question(body.question, body.language, context_data)
