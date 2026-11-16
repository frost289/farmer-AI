# Error Formats

All services (api, advisory, vision) return errors in this exact shape.

## 1. Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [{ "field": "phone", "issue": "Invalid format" }],
    "request_id": "c1f4..."
  }
}
```

- `code`: stable machine-readable string (below). The web app switches on this, never on `message`.
- `message`: short English text, safe to show. No stack traces, SQL or secrets.
- `details`: optional array. Used mainly for validation.
- `request_id`: copied from `X-Request-ID`.

## 2. Error Codes

| HTTP | Code | When |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid or missing input |
| 400 | `INVALID_IMAGE` | Wrong type, too large, or unreadable |
| 401 | `UNAUTHORIZED` | Missing, invalid or expired token |
| 403 | `FORBIDDEN` | Role not allowed |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate (e.g. phone already registered) |
| 413 | `PAYLOAD_TOO_LARGE` | Upload over limit |
| 422 | `LOW_QUALITY_IMAGE` | Image blurry or too dark; ask for a new photo |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `AI_UNAVAILABLE` | AI service down |
| 504 | `AI_TIMEOUT` | AI service too slow |
| 503 | `WEATHER_UNAVAILABLE` | Weather provider failed |

Add new codes by PR to this file first.

## 3. Success Envelope (for reference)

```json
{ "data": {}, "meta": {} }
```
Lists include `meta: { "page": 1, "limit": 20, "total": 134 }`.

## 4. Rules

- **api**: throw `ApiError(status, code, message, details)`. Only `errorHandler` formats the response.
- **AI services**: use a FastAPI exception handler to return the same envelope. Never return a bare `{"detail": ...}`.
- **Web**: show a friendly message from the `code`. Log `request_id` for debugging.
- Diagnosis failures stored in the database use `error_code` with the same values.
- Never expose internal errors. Log them server-side with the `request_id`.
- Validation errors list every invalid field, not just the first.

## 5. Examples

**401**
```json
{ "error": { "code": "UNAUTHORIZED", "message": "Token expired", "request_id": "c1f4..." } }
```

**AI timeout**
```json
{ "error": { "code": "AI_TIMEOUT", "message": "Diagnosis service took too long. Please try again.", "request_id": "c1f4..." } }
```
