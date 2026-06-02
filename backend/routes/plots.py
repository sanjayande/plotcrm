import os
import uuid
import shutil
from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models.plot import Plot
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.config import settings

from backend.services.ai_service import active_ai_provider, generate_with_fallback, generate_text, ai_configured
from backend.services.watermark import apply_watermark
from backend.services.activity_log import log_activity

router = APIRouter(prefix="/api/plots", tags=["plots"])

# Helper function to format prices in Indian format (Lakhs/Crores)
def format_indian_currency(amount: float) -> str:
    try:
        val = float(amount)
        if val >= 10000000: # 1 Crore = 10,000,000
            return f"₹{val/10000000:.2f} Crore"
        elif val >= 100000: # 1 Lakh = 100,000
            return f"₹{val/100000:.2f} Lakh"
        else:
            return f"₹{val:,.2f}"
    except Exception:
        return f"₹{amount}"

# Pydantic Schemas
class PlotBase(BaseModel):
    name: str
    location: str
    price: float
    sq_yards: float
    facing: str
    amenities: Optional[str] = None
    description: Optional[str] = None
    google_maps_link: Optional[str] = None
    status: str = "Available" # Available, Reserved, Sold

class PlotCreate(PlotBase):
    pass

class PlotOut(PlotBase):
    id: int
    user_id: int
    images: Optional[str] = None
    formatted_price: Optional[str] = None

    class Config:
        from_attributes = True

@router.get("", response_model=List[PlotOut])
def list_plots(
    search: Optional[str] = None,
    price_min: Optional[float] = None,
    price_max: Optional[float] = None,
    location: Optional[str] = None,
    facing: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Plot).filter(Plot.user_id == current_user.id)
    
    # Text Search Filter
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Plot.name.like(search_filter),
                Plot.location.like(search_filter),
                Plot.description.like(search_filter),
                Plot.amenities.like(search_filter)
            )
        )
        
    # Price Range Filters
    if price_min is not None:
        query = query.filter(Plot.price >= price_min)
    if price_max is not None:
        query = query.filter(Plot.price <= price_max)
        
    # Location Filter
    if location:
        query = query.filter(Plot.location.like(f"%{location}%"))
        
    # Facing Filter
    if facing:
        query = query.filter(Plot.facing == facing)
        
    # Status Filter
    if status:
        query = query.filter(Plot.status == status)
        
    plots = query.order_by(Plot.created_at.desc()).all()
    
    # Attach formatted price for display convenience
    for plot in plots:
        plot.formatted_price = format_indian_currency(plot.price)
        
    return plots

def _build_ai_prompt_from_data(name: str, location: str, price: float, sq_yards: float, facing: str, amenities: Optional[str]) -> str:
    price_formatted = format_indian_currency(price)
    return (
        f"You are a professional real estate copywriter in India.\n"
        f"Create an attractive, professional marketing description for a residential/commercial plot:\n"
        f"- Plot Name: {name}\n"
        f"- Location: {location}\n"
        f"- Price: {price_formatted}\n"
        f"- Size: {sq_yards} Sq Yards\n"
        f"- Facing: {facing} facing\n"
        f"- Amenities: {amenities if amenities else 'Main Road access, Clean environment'}\n\n"
        f"Style requirements:\n"
        f"- Professional and sales-oriented\n"
        f"- Highlight location merits, high appreciation potential, and investment value\n"
        f"- Format with short paragraphs and bullet points\n"
        f"- Keep it concise (approx. 100-150 words)"
    )


def _generate_description_text(prompt: str, fallback: str) -> Tuple[str, str]:
    system = (
        "You are a professional Indian real estate copywriter. "
        "Write clear, persuasive plot listing descriptions for agents."
    )
    return generate_with_fallback(
        prompt,
        fallback,
        system=system,
        max_tokens=800,
    )


@router.post("/preview/generate-ai-description")
def generate_ai_description_preview(
    data: PlotCreate,
    current_user: User = Depends(get_current_user),
):
    """Generate AI description from form data (e.g. Add Plot modal before save)."""
    price_formatted = format_indian_currency(data.price)
    prompt = _build_ai_prompt_from_data(
        data.name, data.location, data.price, data.sq_yards, data.facing, data.amenities
    )
    fallback = (
        f"Premium investment opportunity in {data.location}!\n\n"
        f"Presenting '{data.name}', a {data.sq_yards} Sq Yard plot with prime {data.facing} facing. "
        f"Priced at {price_formatted}, ideal for your dream home or long-term appreciation.\n\n"
        f"Key highlights:\n"
        f"• Prime location in {data.location}\n"
        f"• {data.facing} facing — vastu friendly\n"
        f"• Amenities: {data.amenities or 'Water, power, road access'}\n"
        f"• Excellent ROI potential in a fast-growing zone."
    )
    description, source = _generate_description_text(prompt, fallback)
    return {"description": description, "source": source}


@router.get("/{plot_id}", response_model=PlotOut)
def get_plot(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == current_user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    plot.formatted_price = format_indian_currency(plot.price)
    return plot

@router.post("", response_model=PlotOut)
def create_plot(
    data: PlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = Plot(
        **data.model_dump(),
        user_id=current_user.id
    )
    db.add(plot)
    db.commit()
    db.refresh(plot)
    plot.formatted_price = format_indian_currency(plot.price)
    log_activity(db, current_user.id, "plot", f"Added plot '{plot.name}' in {plot.location}", plot.id)
    return plot


@router.put("/{plot_id}", response_model=PlotOut)
def update_plot(
    plot_id: int,
    data: PlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == current_user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    old_status = plot.status
    for key, value in data.model_dump().items():
        setattr(plot, key, value)

    db.commit()
    db.refresh(plot)
    if old_status != "Sold" and plot.status == "Sold":
        log_activity(db, current_user.id, "sale", f"Plot sold: '{plot.name}'", plot.id)
    plot.formatted_price = format_indian_currency(plot.price)
    return plot

@router.delete("/{plot_id}")
def delete_plot(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == current_user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    # Delete local image files if any
    if plot.images:
        image_list = plot.images.split(",")
        for img in image_list:
            file_path = settings.UPLOAD_DIR / img.strip()
            if file_path.exists():
                try:
                    os.remove(file_path)
                except Exception:
                    pass # Ignore if file cannot be removed
                    
    db.delete(plot)
    db.commit()
    return {"detail": "Plot deleted successfully"}

@router.post("/{plot_id}/upload-images", response_model=PlotOut)
def upload_images(
    plot_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == current_user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    uploaded_filenames = []
    
    for file in files:
        # Validate file type
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format: {ext}. Only JPG, PNG and WEBP allowed."
            )
            
        # Create a unique filename
        filename = f"{uuid.uuid4()}{ext}"
        target_path = settings.UPLOAD_DIR / filename
        
        # Save file locally
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        company = current_user.company_name or current_user.full_name
        apply_watermark(target_path, company, current_user.phone_number or "")

        uploaded_filenames.append(filename)
        
    # Append or create image list
    if plot.images:
        existing_images = plot.images.split(",")
        existing_images.extend(uploaded_filenames)
        plot.images = ",".join(existing_images)
    else:
        plot.images = ",".join(uploaded_filenames)
        
    db.commit()
    db.refresh(plot)
    plot.formatted_price = format_indian_currency(plot.price)
    return plot

@router.post("/{plot_id}/generate-ai-description")
def generate_ai_description(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == current_user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    price_formatted = format_indian_currency(plot.price)
    
    prompt = _build_ai_prompt_from_data(
        plot.name, plot.location, plot.price, plot.sq_yards, plot.facing, plot.amenities
    )
    fallback_desc = (
        f"Premium investment opportunity in {plot.location}!\n\n"
        f"Presenting '{plot.name}', a {plot.sq_yards} Sq Yard plot with prime {plot.facing} facing. "
        f"Priced at {price_formatted}, ideal for your dream home or long-term appreciation.\n\n"
        f"Key highlights:\n"
        f"• Excellent location in {plot.location}\n"
        f"• {plot.facing} facing\n"
        f"• Amenities: {plot.amenities or 'Water, power, road access'}\n"
        f"• Strong ROI potential."
    )
    ai_text, source = _generate_description_text(prompt, fallback_desc)
    plot.description = ai_text
    db.commit()
    return {"description": ai_text, "source": source}

@router.post("/{plot_id}/generate-whatsapp-message")
def generate_whatsapp_message(
    plot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plot = db.query(Plot).filter(Plot.id == plot_id, Plot.user_id == current_user.id).first()
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
        
    price_formatted = format_indian_currency(plot.price)
    agent_phone = current_user.phone_number if current_user.phone_number else "+91 99999 99999"
    
    if ai_configured():
        prompt = (
            f"Create a short, high-conversion WhatsApp broadcast message for a plot for sale.\n"
            f"Plot name: {plot.name}\n"
            f"Location: {plot.location}\n"
            f"Price: {price_formatted}\n"
            f"Size: {plot.sq_yards} Sq Yards\n"
            f"Facing: {plot.facing}\n"
            f"Agent: {current_user.full_name}\n"
            f"Contact: {agent_phone}\n"
            f"Maps: {plot.google_maps_link or 'on request'}\n\n"
            f"Use emojis, bullet points, WhatsApp bold (*text*), keep under 200 words, "
            f"end with a site-visit CTA."
        )
        try:
            whatsapp_text = generate_text(
                prompt,
                system="You write WhatsApp real estate sales messages for Indian agents.",
                max_tokens=500,
            )
            return {"message": whatsapp_text, "source": f"{active_ai_provider() or 'ai'}_api"}
        except Exception:
            pass

    # Structured template generator
    amenity_line = f"🔹 *Amenities:* {plot.amenities}\n" if plot.amenities else ""
    whatsapp_text = (
        f"🏡 *PRIME PLOT FOR SALE!* 🏡\n\n"
        f"Looking for the perfect location to build your dream home or a high-return investment? Check this out:\n\n"
        f"📍 *Location:* {plot.location}\n"
        f"📐 *Plot Size:* {plot.sq_yards} Sq Yards\n"
        f"🧭 *Facing:* {plot.facing}\n"
        f"💰 *Price:* {price_formatted}\n"
        f"{amenity_line}"
        f"✅ clear titles & immediate registration!\n\n"
        f"📞 *Interested?* Contact me now to schedule a site visit or for more details:\n"
        f"👤 *{current_user.full_name}*\n"
        f"📱 {agent_phone}\n\n"
        f"👉 *Tap here to view Location:* {plot.google_maps_link if plot.google_maps_link else 'Available on request'}"
    )
    return {"message": whatsapp_text, "source": "template_generator"}
