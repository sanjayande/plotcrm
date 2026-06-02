"""Apply company watermark to uploaded plot images."""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

from backend.config import settings


def apply_watermark(image_path: Path, company_name: str, phone: str) -> None:
    """Overlay semi-transparent watermark; overwrites file in place."""
    if not company_name and not phone:
        company_name = settings.PROJECT_NAME
    text_lines = [line for line in [company_name, phone] if line]
    if not text_lines:
        return

    img = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = img.size
    label = "  |  ".join(text_lines)
    font_size = max(14, min(w, h) // 28)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), label, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = w - tw - 20, h - th - 20
    draw.rectangle([x - 10, y - 6, x + tw + 10, y + th + 6], fill=(0, 0, 0, 120))
    draw.text((x, y), label, fill=(255, 255, 255, 220), font=font)

    out = Image.alpha_composite(img, overlay).convert("RGB")
    ext = image_path.suffix.lower()
    if ext in (".jpg", ".jpeg"):
        out.save(image_path, "JPEG", quality=90)
    elif ext == ".png":
        out.save(image_path, "PNG")
    elif ext == ".webp":
        out.save(image_path, "WEBP", quality=90)
    else:
        out.save(image_path)
