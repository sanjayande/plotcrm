"""Generate QR codes linking to plot detail pages."""

from pathlib import Path
import qrcode
from qrcode.constants import ERROR_CORRECT_M

from backend.config import settings


def plot_detail_url(plot_id: int) -> str:
    base = settings.FRONTEND_BASE_URL.rstrip("/")
    return f"{base}/plots/{plot_id}"


def generate_plot_qr(plot_id: int) -> Path:
    """Create or return path to PNG QR for plot."""
    out_path = settings.QR_DIR / f"plot_{plot_id}.png"
    url = plot_detail_url(plot_id)
    qr = qrcode.QRCode(version=1, error_correction=ERROR_CORRECT_M, box_size=10, border=2)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#166534", back_color="white")
    img.save(out_path)
    return out_path
