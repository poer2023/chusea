#!/usr/bin/env python3
"""
创建开发环境管理员账号
"""
import os
import sys
import asyncio
from sqlalchemy.orm import Session

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import get_db_sync, engine
from core.database_models import User, UserSettings
from core.auth import get_password_hash
from datetime import datetime
import uuid

def create_admin_user():
    """创建管理员用户"""
    
    # 创建数据库会话
    db = get_db_sync()
    
    try:
        # 检查是否已存在admin用户
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("✅ Admin用户已存在")
            print(f"   ID: {existing_admin.id}")
            print(f"   用户名: {existing_admin.username}")
            print(f"   邮箱: {existing_admin.email}")
            print(f"   创建时间: {existing_admin.created_at}")
            return existing_admin
        
        # 创建admin用户
        admin_password = "admin123"  # 开发环境密码
        hashed_password = get_password_hash(admin_password)
        
        admin_user = User(
            id=str(uuid.uuid4()),
            username="admin",
            email="admin@dev.local",
            hashed_password=hashed_password,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # 添加到数据库
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        # 创建用户设置
        user_settings = UserSettings(
            id=str(uuid.uuid4()),
            user_id=admin_user.id,
            theme="light",
            language="zh-CN",
            auto_save=True,
            auto_save_interval=30,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(user_settings)
        db.commit()
        
        print("🎉 成功创建Admin用户！")
        print("=" * 50)
        print(f"📋 用户信息:")
        print(f"   ID: {admin_user.id}")
        print(f"   用户名: admin")
        print(f"   密码: admin123")
        print(f"   邮箱: admin@dev.local")
        print(f"   状态: 激活")
        print("=" * 50)
        print("🔐 开发环境登录信息:")
        print("   用户名: admin")
        print("   密码: admin123")
        print("=" * 50)
        
        return admin_user
        
    except Exception as e:
        print(f"❌ 创建Admin用户失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def create_test_token():
    """创建长期有效的测试token"""
    from core.auth import create_access_token
    from datetime import timedelta
    
    # 创建一个长期有效的token（30天）
    access_token = create_access_token(
        data={"sub": "admin"},  # 使用username作为subject
        expires_delta=timedelta(days=30)
    )
    
    return access_token

if __name__ == "__main__":
    print("🚀 创建开发环境Admin用户...")
    print()
    
    try:
        # 创建admin用户
        admin_user = create_admin_user()
        
        # 创建长期token
        print("🔑 生成开发环境Token...")
        token = create_test_token()
        
        print(f"✅ 开发Token (30天有效): {token[:50]}...")
        print()
        print("💡 使用方法:")
        print("1. 手动登录:")
        print("   POST /api/auth/login-json")
        print("   Body: {\"username\": \"admin\", \"password\": \"admin123\"}")
        print()
        print("2. 直接使用Token:")
        print(f"   Authorization: Bearer {token}")
        print()
        
    except Exception as e:
        print(f"❌ 脚本执行失败: {e}")
        sys.exit(1)