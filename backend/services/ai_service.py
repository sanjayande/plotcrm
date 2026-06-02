"""
Unified AI service: Groq (primary) with optional Gemini fallback.
Used for descriptions, search parsing, WhatsApp copy, chatbot, and lead scoring.
"""

import json
import re
from typing import Any, Optional, Tuple

from backend.config import settings

_PLACEHOLDER = {"", "YOUR_GEMINI_API_KEY_HERE", "YOUR_GROQ_API_KEY_HERE"}


def groq_configured() -> bool:
    key = (settings.GROQ_API_KEY or "").strip()
    return bool(key) and key not in _PLACEHOLDER


def gemini_configured() -> bool:
    key = (settings.GEMINI_API_KEY or "").strip()
    return bool(key) and key not in _PLACEHOLDER


def ai_configured() -> bool:
    return groq_configured() or gemini_configured()


def active_ai_provider() -> Optional[str]:
    if groq_configured():
        return "groq"
    if gemini_configured():
        return "gemini"
    return None


def _generate_groq(prompt: str, system: Optional[str] = None, max_tokens: int = 1024) -> str:
    from groq import Groq

    client = Groq(api_key=settings.GROQ_API_KEY.strip())
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    completion = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=max_tokens,
    )
    content = completion.choices[0].message.content
    if not content:
        raise ValueError("Empty Groq response")
    return content.strip()


def _generate_gemini(prompt: str, system: Optional[str] = None, max_tokens: int = 1024) -> str:
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY.strip())
    # Configure the model, passing system instructions natively if available
    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=system
    )
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.7,
        )
    )
    text = response.text
    if not text:
        raise ValueError("Empty Gemini response")
    return text.strip()


def generate_text(
    prompt: str,
    *,
    system: Optional[str] = None,
    max_tokens: int = 1024,
) -> str:
    """Generate text using Gemini first, then Groq if configured."""
    if gemini_configured():
        return _generate_gemini(prompt, system=system, max_tokens=max_tokens)
    if groq_configured():
        return _generate_groq(prompt, system=system, max_tokens=max_tokens)
    raise ValueError("No AI API key configured (please set GEMINI_API_KEY or GROQ_API_KEY in backend/.env)")


def generate_with_fallback(
    prompt: str,
    fallback: str,
    *,
    system: Optional[str] = None,
    max_tokens: int = 1024,
) -> Tuple[str, str]:
    if not ai_configured():
        return fallback, "template_fallback"
    try:
        provider = active_ai_provider()
        source = f"{provider}_api" if provider else "api"
        return generate_text(prompt, system=system, max_tokens=max_tokens), source
    except Exception:
        return fallback, "api_error_fallback"


def parse_json_from_ai(raw: str) -> dict[str, Any]:
    """Extract JSON object from AI response."""
    text = raw.strip()
    if text.startswith("```"):
        text = re.sub(r"^```\w*\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return json.loads(text, strict=False)
