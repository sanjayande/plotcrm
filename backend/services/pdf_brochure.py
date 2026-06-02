"""Backward-compatible exports — use brochure_service for new code."""

from backend.services.brochure_service import format_inr, generate_brochure_pdf as generate_brochure

__all__ = ["format_inr", "generate_brochure"]
