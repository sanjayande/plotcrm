from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import settings


def ensure_sqlite_path() -> None:
    """Create parent folder for file-based SQLite DB (needed on Render/Docker)."""
    url = settings.DATABASE_URL
    if not url.startswith("sqlite"):
        return
    db_path = url.replace("sqlite:///", "", 1)
    if db_path in (":memory:", ""):
        return
    Path(db_path).expanduser().parent.mkdir(parents=True, exist_ok=True)


ensure_sqlite_path()

# For SQLite databases, we require check_same_thread=False
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session in API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
