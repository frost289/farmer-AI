from typing import Literal, Optional

from pydantic import BaseModel, Field


class Prediction(BaseModel):
    label: str
    type: Literal["disease", "pest", "healthy", "unknown"]
    confidence: float = Field(ge=0, le=1)


class Quality(BaseModel):
    usable: bool
    issues: list[str] = []


class DiagnoseResponse(BaseModel):
    predictions: list[Prediction]
    severity_pct: Optional[float] = None
    model_version: str
    quality: Quality


class Region(BaseModel):
    x: int
    y: int
    w: int
    h: int
    damage_pct: float


class SegmentResponse(BaseModel):
    damaged_area_pct: float
    regions: list[Region]
    mask_png_base64: str
    model_version: str
