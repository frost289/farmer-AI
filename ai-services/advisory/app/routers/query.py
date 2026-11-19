from fastapi import APIRouter, Depends

from app.schemas.advisory import QueryRequest, QueryResponse
from app.security import verify_internal_key
from app.services.llm_service import answer_question

router = APIRouter(
    prefix="/ai/v1/advisory", dependencies=[Depends(verify_internal_key)]
)


@router.post("/query", response_model=QueryResponse)
def query(body: QueryRequest):
    return answer_question(body.question, body.language, body.context.model_dump())
