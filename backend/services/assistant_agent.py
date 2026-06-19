import os
from typing import List, Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import settings
from backend.services.rag_service import query_vector_db
from backend.database import SessionLocal
from backend.models.plot import Plot
from backend.models.customer import Customer
from pydantic import BaseModel, Field

def get_llm():
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY not in {"", "YOUR_GROQ_API_KEY_HERE"}:
        return ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY)
    elif settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in {"", "YOUR_GEMINI_API_KEY_HERE"}:
        return ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL, google_api_key=settings.GEMINI_API_KEY)
    else:
        raise ValueError("No API key configured for Chat LLM.")

def get_agent_executor(user_id: int):
    llm = get_llm()
    
    @tool
    def search_vector_db(query: str, filter_type: Optional[str] = None) -> str:
        """Search the vector database for unstructured data, plots, or customers matching a natural language query."""
        return query_vector_db(query, user_id, k=5, filter_type=filter_type)

    @tool
    def compare_plots(plot_ids: List[int]) -> str:
        """Compare specific plots by their integer IDs and return a detailed textual comparison."""
        db = SessionLocal()
        try:
            plots = db.query(Plot).filter(Plot.id.in_(plot_ids), Plot.user_id == user_id).all()
            if not plots:
                return "Could not find those plots."
            
            comparison = "Comparison of Plots:\n\n"
            for p in plots:
                comparison += f"Plot ID: {p.id}\n"
                comparison += f"Name: {p.name}\n"
                comparison += f"Price: {p.price}\n"
                comparison += f"Size: {p.sq_yards} sq yards\n"
                comparison += f"Facing: {p.facing}\n"
                comparison += f"Amenities: {p.amenities}\n"
                comparison += f"Status: {p.status}\n\n"
            return comparison
        finally:
            db.close()

    @tool
    def get_customer_insights() -> str:
        """Get insights on customers such as hot leads, highest budget, and those needing follow-up."""
        db = SessionLocal()
        try:
            customers = db.query(Customer).filter(Customer.user_id == user_id).all()
            if not customers:
                return "No customers found."
                
            hot_leads = [c for c in customers if c.lead_priority == "Hot Lead"]
            highest_budget = max(customers, key=lambda c: c.budget or 0, default=None)
            
            insights = f"Total Customers: {len(customers)}\n"
            insights += f"Hot Leads: {len(hot_leads)}\n"
            if highest_budget:
                insights += f"Highest Budget Customer: {highest_budget.name} (Budget: {highest_budget.budget})\n"
                
            return insights
        finally:
            db.close()
            
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the AI Real Estate Assistant for PlotCRM. "
                   "You help real estate agents by answering questions about their plots, customers, and site visits. "
                   "You have access to a vector database and tools to look up specific plots or customers. "
                   "If you need to search plots, use `search_vector_db` with filter_type='plot'. "
                   "If you need to search customers, use `search_vector_db` with filter_type='customer'. "
                   "Provide clear, professional, and helpful responses formatted in Markdown. "
                   "If the user asks a question in Telugu, respond entirely in Telugu."),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    tools = [search_vector_db, compare_plots, get_customer_insights]
    
    agent = create_tool_calling_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    return agent_executor

def run_assistant(user_id: int, message: str, chat_history: List[Any] = None) -> str:
    executor = get_agent_executor(user_id)
    history = chat_history or []
    response = executor.invoke({
        "input": message,
        "chat_history": history,
        "user_id": user_id
    })
    return response["output"]
