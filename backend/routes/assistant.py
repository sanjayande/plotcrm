from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.auth.deps import get_current_user
from backend.services.assistant_agent import run_assistant

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    
class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
def assistant_chat(
    body: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        # Format history for LangChain
        formatted_history = []
        for msg in body.history:
            formatted_history.append((msg.role, msg.content))
            
        reply = run_assistant(current_user.id, body.message, formatted_history)
        return {"reply": reply}
    except Exception as e:
        print(f"Assistant Error: {e}")
        return {"reply": f"Sorry, I encountered an error while processing your request: {e}"}
