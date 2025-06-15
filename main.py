from enum import Enum
from typing import Optional, List, Dict
import httpx
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import tempfile
import re
from pathlib import Path
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Database Model
class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True, index=True)
    name = Column(String)
    country = Column(String)
    phone = Column(String)
    hashed_password = Column(String)
    terms_accepted = Column(Boolean, default=False)

# Enums and Models
class CompilerService(str, Enum):
    JDOODLE = "jdoodle"
    WANDBOX = "wandbox"
    COMPILER_EXPLORER = "compiler_explorer"

class Language(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    JAVA = "java"
    CPP = "cpp"
    C = "c"
    RUST = "rust"
    GO = "go"

class CodeFixRequest(BaseModel):
    code: str
    error_message: str
    language: Language
    compiler_service: CompilerService = CompilerService.JDOODLE  # Added this field

class CodeFixResponse(BaseModel):
    success: bool
    fixed_code: Optional[str] = None
    output: Optional[str] = None
    error: Optional[str] = None
    warnings: Optional[List[str]] = None
    service_used: str
    execution_time_ms: Optional[float] = None

class UserBase(BaseModel):
    email: str
    name: str
    country: str
    phone: str

class UserCreate(UserBase):
    password: str
    terms_accepted: bool

class UserResponse(UserBase):
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fix My Code ")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
LANGUAGE_CONFIG = {
    Language.PYTHON: {
        "extension": "py",
        "compilers": ["python3"],
        "fix_patterns": {
            "syntax_error": r"SyntaxError:",
            "name_error": r"NameError:",
            "type_error": r"TypeError:"
        }
    },
    Language.JAVASCRIPT: {
        "extension": "js",
        "compilers": ["node"],
        "fix_patterns": {
            "syntax_error": r"SyntaxError:",
            "reference_error": r"ReferenceError:",
            "type_error": r"TypeError:"
        }
    },
    # Add configurations for other languages similarly
}
# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# API Endpoints
@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if not user.terms_accepted:
        raise HTTPException(status_code=400, detail="Terms and conditions must be accepted")
    
    db_user = User(
        email=user.email,
        name=user.name,
        country=user.country,
        phone=user.phone,
        hashed_password=get_password_hash(user.password),
        terms_accepted=user.terms_accepted
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Code Fixing Service Implementation
class CodeFixService:
    async def fix_code(self, request: CodeFixRequest) -> dict:
        # Implement your actual fixing logic here
        # This is a placeholder implementation
        return {
            "fixed_code": f"Fixed {request.code}",
            "output": "Fixed successfully",
            "error": None,
            "warnings": None,
            "execution_time_ms": 100.0
        }

code_fix_service = CodeFixService()

@app.post("/fix-code", response_model=CodeFixResponse)
async def fix_code(request: CodeFixRequest):
    try:
        raw_response = await code_fix_service.fix_code(request)
        
        return CodeFixResponse(
            success=not raw_response.get("error"),
            fixed_code=raw_response.get("fixed_code"),
            output=raw_response.get("output"),
            error=raw_response.get("error"),
            warnings=raw_response.get("warnings"),
            service_used=request.compiler_service.value,  # Fixed this line
            execution_time_ms=raw_response.get("execution_time_ms")
        )
    except HTTPException:
        raise
    except Exception as e:
        return CodeFixResponse(
            success=False,
            error=str(e),
            service_used=request.compiler_service.value
        )

@app.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages and their configurations"""
    return {
        "languages": [
            {
                "name": lang.value,
                "extension": config["extension"],
                "compilers": config["compilers"],
                "supported_fixes": list(config["fix_patterns"].keys())
            }
            for lang, config in LANGUAGE_CONFIG.items()
        ]
    }

@app.get("/supported-compilers")
async def get_supported_compilers():
    """Get list of supported compiler services"""
    return {
        "compiler_services": [
            {
                "name": "JDoodle",
                "id": "jdoodle",
                "supported_languages": ["python", "java", "cpp", "c", "javascript"],
                "daily_limit": "200 credits"
            },
            {
                "name": "Wandbox",
                "id": "wandbox",
                "supported_languages": ["cpp", "python", "ruby"],
                "daily_limit": "Unlimited"
            },
            {
                "name": "Compiler Explorer",
                "id": "compiler_explorer",
                "supported_languages": ["cpp", "c", "rust", "go"],
                "daily_limit": "Unlimited"
            }
        ]
    }