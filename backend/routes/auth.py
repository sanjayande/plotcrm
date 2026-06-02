import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.auth.security import get_password_hash, verify_password, create_access_token
from backend.auth.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=1, description="Full name of user")
    email: str = Field(..., description="Email address")
    phone_number: str = Field(None, description="Contact phone number")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    confirm_password: str = Field(..., description="Confirm password must match")

class UserLogin(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str | None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Simple RFC 5322 regex for email validation
EMAIL_REGEX = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

@router.post("/signup", response_model=TokenResponse)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    # Validate email formatting
    if not re.match(EMAIL_REGEX, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid email format"
        )
    
    # Check password minimum length validation is handled by Pydantic min_length=6
    
    # Validate matching passwords
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Passwords do not match"
        )
    
    # Check if the user already exists
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email address already registered"
        )
        
    # Store user securely in database
    hashed = get_password_hash(data.password)
    user = User(
        full_name=data.full_name,
        email=data.email.lower(),
        phone_number=data.phone_number,
        hashed_password=hashed
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Generate token
    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Incorrect email or password"
        )
        
    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number
        }
    }

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Returns authenticated user information.
    """
    return current_user
