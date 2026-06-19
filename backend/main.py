import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.config import settings, get_cors_origins
from backend.database import engine
from backend.models import Base
from backend.utils.migrate import run_migrations
from backend.routes import auth, plots, customers, dashboard, search, site_visits, analytics, notifications, brochure, chat, compare, assistant

Base.metadata.create_all(bind=engine)
run_migrations()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered CRM for Indian plot real-estate agents",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_root = settings.UPLOAD_DIR.parent
app.mount("/static", StaticFiles(directory=str(static_root)), name="static")

app.include_router(auth.router)
app.include_router(compare.router)
app.include_router(chat.router)
app.include_router(assistant.router)
app.include_router(plots.router)
app.include_router(brochure.brochure_router)
app.include_router(brochure.legacy_router)
app.include_router(customers.router)
app.include_router(dashboard.router)
app.include_router(search.router)
app.include_router(site_visits.router)
app.include_router(analytics.router)
app.include_router(notifications.router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "2.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
