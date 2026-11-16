import os

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY", "dev-internal-key")
MODEL_VERSION = os.environ.get("MODEL_VERSION", "v0.1.0-stub")
MAX_IMAGE_BYTES = int(float(os.environ.get("MAX_IMAGE_MB", "5")) * 1024 * 1024)
ALLOWED_TYPES = {"image/jpeg", "image/png"}
