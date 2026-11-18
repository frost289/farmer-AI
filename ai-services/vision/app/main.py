from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.errors import register_error_handlers
from app.routers import diagnose, segment
from app.services import classifier


@asynccontextmanager
async def lifespan(_: FastAPI):
    classifier.get_model()  # load weights once at startup, not on the first request
    yield


app = FastAPI(
    title="FarmAI Vision Service",
    version=classifier.STUB_MODEL_VERSION,
    lifespan=lifespan,
)
register_error_handlers(app)
app.include_router(diagnose.router)
app.include_router(segment.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_version": classifier.model_version(),
        "classifier": classifier.backend(),
    }
