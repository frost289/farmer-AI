from fastapi import APIRouter, Depends, File, Form, FastAPI, UploadFile

from app.config import MODEL_VERSION
from app.errors import register_error_handlers
from app.security import verify_internal_key
from app.services.asr_service import transcribe

app = FastAPI(title="FarmAI Speech Service (later phase)", version=MODEL_VERSION)
register_error_handlers(app)
router = APIRouter(prefix="/ai/v1/speech", dependencies=[Depends(verify_internal_key)])


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...), language: str = Form(default="en")):
    return transcribe(await audio.read(), language)


app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}
