from fastapi import FastAPI

from app.config import MODEL_VERSION
from app.errors import register_error_handlers
from app.routers import planting, query, recommend, treatment

app = FastAPI(title="FarmAI Advisory Service", version=MODEL_VERSION)
register_error_handlers(app)

# Include routers with the correct API prefix
app.include_router(query.router, prefix="/api/v1")
app.include_router(treatment.router, prefix="/api/v1")
app.include_router(planting.router, prefix="/api/v1")
app.include_router(recommend.router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}
