import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the backend
BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from backend/.env
load_dotenv(dotenv_path=BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "PlotCRM"
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./plotcrm.db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "9a3f2b6e1c7d8a9f0e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))
    # Groq — primary AI: https://console.groq.com/keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    # Optional Gemini fallback — https://aistudio.google.com/apikey
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", FRONTEND_URL)
    
    UPLOAD_DIR: Path = BASE_DIR / "static" / "uploads"
    BROCHURE_DIR: Path = BASE_DIR / "static" / "brochures"
    QR_DIR: Path = BASE_DIR / "static" / "qr"

settings = Settings()


def get_cors_origins() -> list[str]:
    """Allowed browser origins for API requests (dev + production)."""
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.FRONTEND_URL,
        settings.FRONTEND_BASE_URL,
    ]
    extra = os.getenv("CORS_ORIGINS", "")
    if extra:
        origins.extend(o.strip() for o in extra.split(",") if o.strip())
    seen: set[str] = set()
    unique: list[str] = []
    for origin in origins:
        if origin and origin not in seen:
            seen.add(origin)
            unique.append(origin)
    return unique


# Create the upload directory path if it does not exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.BROCHURE_DIR.mkdir(parents=True, exist_ok=True)
settings.QR_DIR.mkdir(parents=True, exist_ok=True)
