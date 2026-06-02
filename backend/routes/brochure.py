"""Brochure PDF generation and QR download endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.auth.deps import get_current_user
from backend.config import settings
from backend.database import get_db
from backend.models.plot import Plot
from backend.models.user import User
from backend.services.brochure_service import generate_brochure_pdf
from backend.services.qr_service import generate_plot_qr

brochure_router = APIRouter(prefix="/api/brochure", tags=["brochure"])
legacy_router = APIRouter(prefix="/api/plots", tags=["brochure"])


def _safe_filename(name: str) -> str:
    cleaned = "".join(c if c.isalnum() or c in "._- " else "_" for c in name)
    return cleaned.strip().replace(" ", "_") or "plot"


def _plot_image_paths(plot: Plot) -> list[str]:
    paths: list[str] = []
    if not plot.images:
        return paths
    for fn in plot.images.split(","):
        p = settings.UPLOAD_DIR / fn.strip()
        if p.exists():
            paths.append(str(p))
    return paths


def _agent_context(user: User) -> dict:
    phone = user.phone_number or ""
    return {
        "company_name": user.company_name or user.full_name,
        "full_name": user.full_name,
        "email": user.email,
        "phone": phone,
        "whatsapp": getattr(user, "whatsapp_number", None) or phone,
        "office_address": getattr(user, "office_address", None) or "",
    }


def _plot_payload(plot: Plot, image_paths: list[str]) -> dict:
    return {
        "id": plot.id,
        "name": plot.name,
        "location": plot.location,
        "price": plot.price,
        "sq_yards": plot.sq_yards,
        "facing": plot.facing,
        "amenities": plot.amenities,
        "description": plot.description,
        "status": plot.status,
        "google_maps_link": plot.google_maps_link,
        "image_paths": image_paths,
    }


def _get_owned_plot(plot_id: int, db: Session, user: User) -> Plot:
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    return plot


def _build_and_return_pdf(plot: Plot, user: User) -> FileResponse:
    try:
        path = generate_brochure_pdf(_plot_payload(plot, _plot_image_paths(plot)), _agent_context(user))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Brochure generation failed: {exc}",
        ) from exc

    if not path.exists():
        raise HTTPException(status_code=500, detail="Brochure file was not created")

    filename = f"PlotCRM_{_safe_filename(plot.name)}.pdf"
    return FileResponse(path, media_type="application/pdf", filename=filename)


@brochure_router.post("/generate/{plot_id}")
def generate_brochure(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a professional marketing PDF and return it for download."""
    plot = _get_owned_plot(plot_id, db, current_user)
    return _build_and_return_pdf(plot, current_user)


@legacy_router.get("/{plot_id}/brochure")
def download_brochure_legacy(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Legacy GET endpoint — same PDF as POST /api/brochure/generate/{plot_id}."""
    plot = _get_owned_plot(plot_id, db, current_user)
    return _build_and_return_pdf(plot, current_user)


@legacy_router.get("/{plot_id}/qr")
def download_qr(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_owned_plot(plot_id, db, current_user)
    try:
        path = generate_plot_qr(plot_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"QR generation failed: {exc}") from exc
    return FileResponse(path, media_type="image/png", filename=f"plot_{plot_id}_qr.png")
