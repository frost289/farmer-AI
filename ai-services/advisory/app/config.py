import os

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY", "dev-internal-key")
MODEL_VERSION = os.environ.get("MODEL_VERSION", "v0.1.0-stub")
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "stub")
