from fastapi import FastAPI

from app.config import MODEL_VERSION
from app.errors import register_error_handlers
from app.routers import planting, query, recommend, treatment

app = FastAPI(title="FarmAI Advisory Service", version=MODEL_VERSION)
register_error_handlers(app)

for module in (query, treatment, planting, recommend):
    app.include_router(module.router)


@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}
