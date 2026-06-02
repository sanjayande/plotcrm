import traceback
from backend.database import SessionLocal
from backend.models.plot import Plot
from backend.models.user import User
from backend.services.pdf_brochure import generate_brochure
from backend.config import settings

db = SessionLocal()
plot = db.query(Plot).first()
user = db.query(User).first()

if not plot or not user:
    print("Cannot test: Plot or User database is empty!")
    exit(1)

image_paths = []
if plot.images:
    for fn in plot.images.split(","):
        p = settings.UPLOAD_DIR / fn.strip()
        if p.exists():
            image_paths.append(str(p))

plot_dict = {
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

try:
    print("Testing generate_brochure...")
    path = generate_brochure(
        plot_dict,
        user.full_name,
        user.phone_number or "",
        user.company_name or user.full_name,
    )
    print("Success! Generated PDF at:", path)
except Exception as e:
    print("Failed to generate PDF brochure!")
    traceback.print_exc()
