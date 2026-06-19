import os
from typing import List, Dict, Any, Optional
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from backend.config import settings

CHROMA_PERSIST_DIR = os.path.join(settings.UPLOAD_DIR.parent, "chroma_db")

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_vector_store() -> Chroma:
    embeddings = get_embeddings()
    return Chroma(
        collection_name="plotcrm_collection",
        embedding_function=embeddings,
        persist_directory=CHROMA_PERSIST_DIR
    )

def _format_inr(amount: float) -> str:
    if amount >= 10000000:
        return f"₹{amount / 10000000:.2f} Cr"
    if amount >= 100000:
        return f"₹{amount / 100000:.2f} L"
    return f"₹{amount:,.0f}"

def sync_plot_to_vector_db(plot: Any):
    try:
        vector_store = get_vector_store()
        
        content = f"""Plot Name: {plot.name}
Location: {plot.location}
Price: {plot.price} ({_format_inr(plot.price)})
Area (Sq Yards): {plot.sq_yards}
Facing: {plot.facing}
Status: {plot.status}
Amenities: {plot.amenities}
Description: {plot.description or 'No description provided.'}"""

        doc = Document(
            page_content=content,
            metadata={
                "id": str(plot.id),
                "user_id": str(plot.user_id),
                "type": "plot",
                "name": plot.name,
                "location": plot.location,
                "price": float(plot.price),
                "status": plot.status
            }
        )
        
        doc_id = f"plot_{plot.id}"
        vector_store.add_documents(documents=[doc], ids=[doc_id])
    except Exception as e:
        print(f"Failed to sync plot {plot.id} to ChromaDB: {e}")

def sync_customer_to_vector_db(customer: Any):
    try:
        vector_store = get_vector_store()
        content = f"""Customer Name: {customer.name}
Phone: {customer.phone_number}
Interested Location: {customer.interested_location}
Budget: {customer.budget}
Lead Priority: {customer.lead_priority}
Notes: {customer.notes}"""

        doc = Document(
            page_content=content,
            metadata={
                "id": str(customer.id),
                "user_id": str(customer.user_id),
                "type": "customer",
                "name": customer.name,
                "lead_priority": customer.lead_priority
            }
        )
        doc_id = f"customer_{customer.id}"
        vector_store.add_documents(documents=[doc], ids=[doc_id])
    except Exception as e:
        print(f"Failed to sync customer {customer.id} to ChromaDB: {e}")

def delete_plot_from_vector_db(plot_id: int):
    try:
        vector_store = get_vector_store()
        vector_store.delete(ids=[f"plot_{plot_id}"])
    except Exception:
        pass

def delete_customer_from_vector_db(customer_id: int):
    try:
        vector_store = get_vector_store()
        vector_store.delete(ids=[f"customer_{customer_id}"])
    except Exception:
        pass

def query_vector_db(query: str, user_id: int, k: int = 5, filter_type: Optional[str] = None) -> str:
    try:
        vector_store = get_vector_store()
        
        filter_dict = {}
        if filter_type:
            filter_dict = {"$and": [{"user_id": str(user_id)}, {"type": filter_type}]}
        else:
            filter_dict = {"user_id": str(user_id)}
            
        docs = vector_store.similarity_search(query, k=k, filter=filter_dict)
        
        if not docs:
            return "No relevant records found in the database."
            
        context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        return f"Error searching vector database: {e}"
