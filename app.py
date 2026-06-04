"""Vercel entrypoint — re-exports the FastAPI app from backend.main."""
from backend.main import app  # noqa: F401
