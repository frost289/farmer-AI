from typing import Literal, Optional

from pydantic import BaseModel, Field

Language = Literal["en", "ny"]


class Location(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    district: Optional[str] = None


class ForecastDay(BaseModel):
    date: str
    rain_mm: float = 0
    temp_c: Optional[float] = None
    humidity_pct: Optional[float] = None


class Weather(BaseModel):
    forecast_7d: list[ForecastDay] = []


class QueryContext(BaseModel):
    crop: Optional[str] = None
    district: Optional[str] = None
    season: Optional[Literal["rainy", "dry"]] = None


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    language: Language = "en"
    context: QueryContext = QueryContext()


class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = []
    model_version: str
    language: Language = "en"
    language_fallback: bool = False


class DiagnosisInput(BaseModel):
    label: str
    severity_pct: Optional[float] = None


class TreatmentRequest(BaseModel):
    diagnosis: DiagnosisInput
    crop: Optional[str] = None
    language: Language = "en"


class TreatmentResponse(BaseModel):
    organic: list[str] = []
    chemical: list[str] = []
    prevention: list[str] = []
    warnings: list[str] = []
    language: Language = "en"
    language_fallback: bool = False


class PlantingReadinessRequest(BaseModel):
    crop: str
    language: Language = "en"
    location: Location
    soil_type: str = "unknown"
    weather: Weather = Weather()


class PlantingReadinessResponse(BaseModel):
    verdict: Literal["plant", "wait", "not_recommended"]
    reason: str
    rain_onset_date: Optional[str] = None
    soil_moisture: Literal["dry", "adequate", "wet"]
    confidence: float = Field(ge=0, le=1)
    language: Language = "en"
    language_fallback: bool = False


class RecommendRequest(BaseModel):
    location: Location
    language: Language = "en"
    soil_type: str = "unknown"
    weather: Weather = Weather()


class CropRecommendation(BaseModel):
    crop: str
    variety: Optional[str] = None
    score: float = Field(ge=0, le=1)
    reason: str


class RecommendResponse(BaseModel):
    recommendations: list[CropRecommendation]
    language: Language = "en"
    language_fallback: bool = False
