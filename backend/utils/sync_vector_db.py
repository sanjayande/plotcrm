import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.database import SessionLocal
from backend.models.plot import Plot
from backend.models.customer import Customer
from backend.services.rag_service import sync_plot_to_vector_db, sync_customer_to_vector_db

def sync_all():
    db = SessionLocal()
    try:
        print("Syncing plots to vector database...")
        plots = db.query(Plot).all()
        for i, plot in enumerate(plots):
            sync_plot_to_vector_db(plot)
            if (i+1) % 10 == 0:
                print(f"Synced {i+1} plots...")
        print(f"Finished syncing {len(plots)} plots.")

        print("Syncing customers to vector database...")
        customers = db.query(Customer).all()
        for i, customer in enumerate(customers):
            sync_customer_to_vector_db(customer)
            if (i+1) % 10 == 0:
                print(f"Synced {i+1} customers...")
        print(f"Finished syncing {len(customers)} customers.")
        
    finally:
        db.close()

if __name__ == "__main__":
    sync_all()
