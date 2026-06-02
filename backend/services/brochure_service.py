"""
Professional plot brochure PDF generation for Indian real-estate agents.
Uses FPDF2 with company branding, image gallery, QR, maps link, and contact block.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fpdf import FPDF

from backend.config import settings
from backend.services.qr_service import generate_plot_qr, plot_detail_url

# Brand palette — emerald / gold real-estate theme
COLOR_PRIMARY = (22, 101, 52)
COLOR_ACCENT = (217, 119, 6)
COLOR_SLATE_800 = (30, 41, 59)
COLOR_SLATE_600 = (71, 85, 105)
COLOR_SLATE_500 = (100, 116, 139)
COLOR_SLATE_200 = (226, 232, 240)
COLOR_SLATE_50 = (248, 250, 252)
COLOR_WHITE = (255, 255, 255)
COLOR_LIGHT_GREEN = (220, 252, 231)
COLOR_LINK = (37, 99, 235)


def _safe_text(value: Any, max_len: int = 2000) -> str:
    """Strip unsupported chars for core Helvetica fonts."""
    if value is None:
        return ""
    text = str(value).strip()
    text = text.encode("latin-1", errors="replace").decode("latin-1")
    return text[:max_len]


def format_inr(amount: float) -> str:
    try:
        val = float(amount)
        if val >= 10000000:
            return f"Rs. {val / 10000000:.2f} Crore"
        if val >= 100000:
            return f"Rs. {val / 100000:.2f} Lakh"
        return f"Rs. {val:,.0f}"
    except (TypeError, ValueError):
        return f"Rs. {amount}"


class PlotBrochurePDF(FPDF):
    """A4 portrait brochure with branded header/footer."""

    def __init__(self, company_name: str):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.company_name = _safe_text(company_name, 80) or "PlotCRM"
        self.set_auto_page_break(auto=True, margin=18)

    def header(self):
        self.set_fill_color(*COLOR_PRIMARY)
        self.rect(0, 0, 210, 42, "F")
        self.set_fill_color(*COLOR_ACCENT)
        self.rect(0, 42, 210, 2.5, "F")

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*COLOR_SLATE_500)
        self.cell(95, 8, _safe_text(f"{self.company_name} | PlotCRM Brochure"), align="L")
        self.cell(0, 8, f"Page {self.page_no()}", align="R")

    def draw_page_watermark(self):
        """Subtle diagonal company watermark."""
        self.set_font("Helvetica", "B", 36)
        self.set_text_color(241, 245, 249)
        with self.rotation(35, x=105, y=148):
            self.text(42, 0, self.company_name.upper())


def _draw_logo_placeholder(pdf: PlotBrochurePDF, x: float, y: float, w: float, h: float) -> None:
    pdf.set_draw_color(*COLOR_LIGHT_GREEN)
    pdf.set_fill_color(21, 128, 61)
    pdf.rect(x, y, w, h, "DF")
    pdf.set_xy(x, y + h / 2 - 4)
    pdf.set_font("Helvetica", "B", 7)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(w, 5, "LOGO", align="C")


def _draw_section_title(pdf: FPDF, title: str) -> None:
    pdf.set_text_color(*COLOR_SLATE_800)
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 7, _safe_text(title), new_x="LMARGIN", new_y="NEXT")
    y = pdf.get_y()
    pdf.set_draw_color(*COLOR_SLATE_200)
    pdf.line(15, y, 195, y)
    pdf.ln(3)


def _draw_highlight_grid(pdf: FPDF, plot: dict) -> None:
    grid_data = [
        ("VALUATION", format_inr(plot.get("price", 0))),
        ("PLOT AREA", f"{plot.get('sq_yards', '-')} Sq Yards"),
        ("VASTU FACING", f"{plot.get('facing', '-')} Facing"),
        ("STATUS", _safe_text(plot.get("status", "Available")).upper()),
    ]
    col_w, row_h, gap = 88, 14, 4
    start_y = pdf.get_y()
    for i, (label, val) in enumerate(grid_data):
        row, col = divmod(i, 2)
        x = 15 + col * (col_w + gap)
        y = start_y + row * (row_h + gap)
        pdf.set_fill_color(*COLOR_SLATE_50)
        pdf.set_draw_color(*COLOR_SLATE_200)
        pdf.rect(x, y, col_w, row_h, "DF")
        pdf.set_fill_color(*COLOR_ACCENT if i == 0 else COLOR_PRIMARY)
        pdf.rect(x, y, 1.5, row_h, "F")
        pdf.set_xy(x + 4, y + 2)
        pdf.set_font("Helvetica", "B", 7)
        pdf.set_text_color(*COLOR_SLATE_500)
        pdf.cell(col_w - 8, 4, label)
        pdf.set_xy(x + 4, y + 7)
        pdf.set_font("Helvetica", "B", 10)
        if i == 0:
            pdf.set_text_color(21, 128, 61)
        else:
            pdf.set_text_color(*COLOR_SLATE_800)
        pdf.cell(col_w - 8, 5, _safe_text(val, 40))
    pdf.set_y(start_y + 2 * (row_h + gap) + 4)


def _draw_image_gallery(pdf: FPDF, image_paths: list[str], max_images: int = 6) -> None:
    valid = [p for p in image_paths if Path(p).exists()][:max_images]
    if not valid:
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(*COLOR_SLATE_500)
        pdf.cell(0, 6, _safe_text("No plot images uploaded - add photos in PlotCRM for a richer brochure."), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)
        return

    cols = 3 if len(valid) > 2 else min(len(valid), 2)
    img_w = (180 - (cols - 1) * 4) / cols
    img_h = 38
    row_gap = 5
    x0 = 15
    y0 = pdf.get_y()

    for idx, img_path in enumerate(valid):
        row, col = divmod(idx, cols)
        x = x0 + col * (img_w + 4)
        y = y0 + row * (img_h + row_gap)
        if y + img_h > pdf.h - 25:
            pdf.add_page()
            pdf.draw_page_watermark()
            y0 = pdf.get_y()
            y = y0
            row = 0
            col = idx % cols
            x = x0 + col * (img_w + 4)
        try:
            pdf.set_draw_color(*COLOR_SLATE_200)
            pdf.rect(x - 0.5, y - 0.5, img_w + 1, img_h + 1, "D")
            pdf.image(str(img_path), x=x, y=y, w=img_w, h=img_h)
        except Exception:
            pdf.set_xy(x, y + img_h / 2)
            pdf.set_font("Helvetica", "I", 8)
            pdf.cell(img_w, 5, "Image unavailable", align="C")

    rows = (len(valid) + cols - 1) // cols
    pdf.set_y(y0 + rows * (img_h + row_gap) + 2)


def generate_brochure_pdf(
    plot: dict,
    agent: dict,
) -> Path:
    """
    Build a multi-section marketing PDF and return the saved file path.

    plot: id, name, location, price, sq_yards, facing, amenities, description,
          status, google_maps_link, image_paths
    agent: company_name, full_name, email, phone, whatsapp, office_address
    """
    company = _safe_text(agent.get("company_name") or agent.get("full_name") or "PlotCRM")
    pdf = PlotBrochurePDF(company_name=company)
    pdf.add_page()
    pdf.draw_page_watermark()

    # ── Company branding band ──
    _draw_logo_placeholder(pdf, 15, 8, 22, 22)
    pdf.set_xy(42, 10)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*COLOR_WHITE)
    pdf.cell(0, 6, _safe_text(company).upper(), new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(42)
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*COLOR_LIGHT_GREEN)
    contact_lines = [
        agent.get("phone") and f"Tel: {agent['phone']}",
        agent.get("email") and f"Email: {agent['email']}",
        agent.get("office_address") and f"Office: {agent['office_address']}",
    ]
    for line in filter(None, contact_lines):
        pdf.set_x(42)
        pdf.cell(0, 4, _safe_text(line, 90))

    pdf.set_y(48)
    pdf.set_text_color(*COLOR_SLATE_800)
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(*COLOR_ACCENT)
    pdf.cell(0, 5, "PREMIUM PLOT LISTING BROCHURE", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1)

    # ── Plot title block ──
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(*COLOR_SLATE_800)
    pdf.multi_cell(0, 8, _safe_text(plot.get("name", "Plot Listing")).upper())
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*COLOR_SLATE_600)
    plot_id = plot.get("id", "")
    pdf.cell(0, 5, f"Plot ID: #{plot_id}  |  Location: {_safe_text(plot.get('location', ''), 120)}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(3)

    _draw_section_title(pdf, "Property Highlights")
    _draw_highlight_grid(pdf, plot)

    if plot.get("amenities"):
        _draw_section_title(pdf, "Infrastructure & Amenities")
        items = [a.strip() for a in str(plot["amenities"]).split(",") if a.strip()]
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(*COLOR_SLATE_600)
        pdf.multi_cell(0, 5, "  |  ".join(f"[ {_safe_text(a, 40)} ]" for a in items))
        pdf.ln(3)

    if plot.get("description"):
        _draw_section_title(pdf, "Marketing Overview")
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(*COLOR_SLATE_600)
        pdf.multi_cell(0, 5.5, _safe_text(plot["description"], 1200))
        pdf.ln(3)

    if pdf.get_y() > 200:
        pdf.add_page()
        pdf.draw_page_watermark()

    _draw_section_title(pdf, "Property Gallery")
    _draw_image_gallery(pdf, plot.get("image_paths") or [])

    maps_link = plot.get("google_maps_link") or ""
    if maps_link:
        _draw_section_title(pdf, "Location on Google Maps")
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(*COLOR_LINK)
        pdf.cell(0, 6, "Tap to open Google Maps (directions & satellite view)", link=maps_link)
        pdf.ln(4)

    # ── Contact + QR footer card ──
    if pdf.h - pdf.get_y() < 42:
        pdf.add_page()
        pdf.draw_page_watermark()

    card_y = pdf.get_y() + 2
    pdf.set_fill_color(*COLOR_SLATE_50)
    pdf.set_draw_color(*COLOR_PRIMARY)
    pdf.rect(15, card_y, 180, 36, "DF")
    pdf.set_fill_color(*COLOR_PRIMARY)
    pdf.rect(15, card_y, 2.5, 36, "F")

    plot_id = plot.get("id")
    qr_url = plot_detail_url(plot_id) if plot_id else ""
    if plot_id:
        qr_path = generate_plot_qr(plot_id)
        if qr_path.exists():
            try:
                pdf.image(str(qr_path), x=168, y=card_y + 4, w=24, h=24)
            except Exception:
                pass

    pdf.set_xy(22, card_y + 4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*COLOR_PRIMARY)
    pdf.cell(0, 5, "YOUR AUTHORIZED AGENT")
    pdf.set_xy(22, card_y + 10)
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.set_text_color(*COLOR_SLATE_800)
    pdf.cell(0, 5, _safe_text(agent.get("full_name", ""), 60))
    pdf.set_xy(22, card_y + 16)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*COLOR_SLATE_600)
    if agent.get("phone"):
        pdf.cell(0, 5, f"Call: {_safe_text(agent['phone'], 30)}")
    pdf.set_xy(22, card_y + 21)
    if agent.get("whatsapp"):
        pdf.cell(0, 5, f"WhatsApp: {_safe_text(agent['whatsapp'], 30)}")
    pdf.set_xy(22, card_y + 27)
    pdf.set_font("Helvetica", "I", 7.5)
    pdf.set_text_color(*COLOR_SLATE_500)
    pdf.multi_cell(130, 4, f"Scan QR to view full listing online. Digital link: {_safe_text(qr_url, 80)}")

    out = settings.BROCHURE_DIR / f"brochure_plot_{plot_id}.pdf"
    pdf.output(str(out))
    return out
