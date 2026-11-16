import hmac

from fastapi import Header

from app.config import INTERNAL_API_KEY
from app.errors import ServiceError


def verify_internal_key(x_internal_key: str | None = Header(default=None)) -> None:
    if not x_internal_key or not hmac.compare_digest(x_internal_key, INTERNAL_API_KEY):
        raise ServiceError(401, "UNAUTHORIZED", "Missing or invalid internal key")
