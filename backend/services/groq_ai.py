"""Backward-compatible re-exports — Groq is the primary AI provider."""

from backend.services.ai_service import (
    ai_configured,
    groq_configured,
    gemini_configured,
    generate_text,
    generate_with_fallback,
    active_ai_provider,
)
