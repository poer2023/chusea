from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
from typing import Optional

from core.database import get_db
from core.database_models import User
from core.models import UserCreate, UserResponse
from core.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user
)

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # 检查邮箱是否已存在
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # 创建新用户
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.model_validate(db_user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login-json", response_model=Token)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)):
    """JSON格式登录"""
    user = authenticate_user(login_data.username, login_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse.model_validate(current_user)

@router.get("/verify")
async def verify_token(current_user: User = Depends(get_current_user)):
    """验证令牌有效性"""
    return {"valid": True, "user_id": current_user.id, "username": current_user.username}

@router.post("/dev-login", response_model=Token)
async def dev_auto_login(db: Session = Depends(get_db)):
    """开发环境自动登录（仅在DEBUG模式下可用）"""
    import os
    print("🔑 开发环境自动登录请求")
    if os.getenv("DEBUG", "False").lower() != "true":
        raise HTTPException(
            status_code=403,
            detail="Development login only available in DEBUG mode"
        )
    
    # 查找admin用户
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        raise HTTPException(
            status_code=404,
            detail="Admin user not found. Please run create_admin_user.py first."
        )
    
    # 创建长期token（30天）
    access_token_expires = timedelta(days=30)
    access_token = create_access_token(
        data={"sub": str(admin_user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/dev-status")
async def dev_auth_status():
    """开发环境认证状态"""
    import os
    is_debug = os.getenv("DEBUG", "False").lower() == "true"
    
    return {
        "debug_mode": is_debug,
        "auto_login_available": is_debug,
        "admin_username": "admin" if is_debug else None,
        "message": "Development environment authentication status"
    }