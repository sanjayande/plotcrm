"""Lightweight SQLite migrations for new columns on existing tables."""

from sqlalchemy import text
from backend.database import engine


MIGRATIONS = [
    "ALTER TABLE customers ADD COLUMN lead_priority VARCHAR DEFAULT 'Warm Lead'",
    "ALTER TABLE customers ADD COLUMN interested_plot_ids TEXT",
    "ALTER TABLE users ADD COLUMN company_name VARCHAR",
    "ALTER TABLE users ADD COLUMN office_address VARCHAR",
    "ALTER TABLE users ADD COLUMN whatsapp_number VARCHAR",
]


def run_migrations() -> None:
    with engine.connect() as conn:
        for sql in MIGRATIONS:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                # Column likely already exists
                conn.rollback()
