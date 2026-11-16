from fastapi import FastAPI

from app.config import MODEL_VERSION
from app.errors import register_error_handlers
from app.routers import diagnose, segment

app = FastAPI(title="FarmAI Vision Service", version=MODEL_VERSION)
register_error_handlers(app)
app.include_router(diagnose.router)
app.include_router(segment.router)


@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}
