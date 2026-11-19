"""Error envelope shared by all FarmAI services (docs/ERROR_FORMATS.md)."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class ServiceError(Exception):
    def __init__(
        self, status: int, code: str, message: str, details: list | None = None
    ):
        self.status = status
        self.code = code
        self.message = message
        self.details = details


def _body(
    request: Request, code: str, message: str, details: list | None = None
) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details,
            "request_id": request.headers.get("x-request-id"),
        }
    }


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ServiceError)
    async def service_error(request: Request, exc: ServiceError):
        return JSONResponse(
            _body(request, exc.code, exc.message, exc.details), status_code=exc.status
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        details = [
            {
                "field": ".".join(str(p) for p in e["loc"] if p != "body"),
                "issue": e["msg"],
            }
            for e in exc.errors()
        ]
        return JSONResponse(
            _body(request, "VALIDATION_ERROR", "Invalid input", details),
            status_code=400,
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request: Request, exc: StarletteHTTPException):
        code = {401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND"}.get(
            exc.status_code, "INTERNAL_ERROR"
        )
        return JSONResponse(
            _body(request, code, str(exc.detail)), status_code=exc.status_code
        )

    @app.exception_handler(Exception)
    async def unhandled(request: Request, exc: Exception):
        return JSONResponse(
            _body(request, "INTERNAL_ERROR", "Something went wrong"), status_code=500
        )
