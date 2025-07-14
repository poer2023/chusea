#!/usr/bin/env python3
"""
Backend Configuration Test Script
验证后端配置和启动状态
"""

import os
import sys
import traceback
from typing import List, Dict, Any

def test_configuration() -> Dict[str, Any]:
    """测试配置加载"""
    results = {
        "status": "success",
        "errors": [],
        "config_data": {}
    }
    
    try:
        from core.config import settings, validate_configuration, get_available_providers, get_default_provider
        
        results["config_data"] = {
            "app_name": settings.app_name,
            "environment": settings.environment,
            "host": settings.host,
            "port": settings.port,
            "database_url": settings.database_url,
            "redis_url": settings.redis_url,
            "chroma_persist_directory": settings.chroma_persist_directory,
            "upload_directory": settings.upload_directory,
            "log_file_path": settings.log_file_path,
            "available_providers": get_available_providers(),
            "default_provider": get_default_provider()
        }
        
        # 运行配置验证
        config_errors = validate_configuration()
        if config_errors:
            results["errors"].extend(config_errors)
            
    except Exception as e:
        results["status"] = "failed"
        results["errors"].append(f"Configuration loading failed: {str(e)}")
        
    return results

def test_database_connection() -> Dict[str, Any]:
    """测试数据库连接"""
    results = {
        "status": "success",
        "errors": [],
        "database_info": {}
    }
    
    try:
        from core.database_models import Base
        from sqlalchemy import create_engine
        from core.config import settings
        
        engine = create_engine(settings.database_url, echo=False)
        
        # 测试连接
        with engine.connect() as conn:
            results["database_info"] = {
                "url": settings.database_url,
                "connection": "successful"
            }
            
    except Exception as e:
        results["status"] = "failed"
        results["errors"].append(f"Database connection failed: {str(e)}")
        
    return results

def test_module_imports() -> Dict[str, Any]:
    """测试关键模块导入"""
    results = {
        "status": "success",
        "errors": [],
        "imported_modules": []
    }
    
    modules_to_test = [
        ("core.config", "settings"),
        ("core.database_models", "User, Document, Literature"),
        ("core.auth", "get_password_hash, verify_password"),
        ("api.routes.auth", "router"),
        ("api.routes.documents", "router"),
        ("api.routes.literature", "router"),
        ("api.routes.tools", "router"),
        ("api.routes.workflow", "router"),
        ("api.routes.writing", "router"),
    ]
    
    for module_name, items in modules_to_test:
        try:
            __import__(module_name)
            results["imported_modules"].append(f"✓ {module_name}")
        except Exception as e:
            results["errors"].append(f"Failed to import {module_name}: {str(e)}")
            
    if results["errors"]:
        results["status"] = "partial"
        
    return results

def test_fastapi_app() -> Dict[str, Any]:
    """测试FastAPI应用"""
    results = {
        "status": "success",
        "errors": [],
        "app_info": {}
    }
    
    try:
        if os.path.exists('main.py'):
            from main import app
            results["app_info"] = {
                "title": app.title,
                "file": "main.py",
                "routes_count": len(app.routes)
            }
        else:
            results["status"] = "failed"
            results["errors"].append("main.py not found")
            
    except Exception as e:
        results["status"] = "failed"
        results["errors"].append(f"FastAPI app import failed: {str(e)}")
        
    return results

def test_external_services() -> Dict[str, Any]:
    """测试外部服务连接（可选）"""
    results = {
        "status": "success",
        "errors": [],
        "services": {}
    }
    
    try:
        import redis
        from core.config import settings
        
        # 测试Redis连接（可选）
        try:
            r = redis.from_url(settings.redis_url)
            r.ping()
            results["services"]["redis"] = "connected"
        except Exception as e:
            results["services"]["redis"] = f"not available: {str(e)}"
            
    except ImportError:
        results["services"]["redis"] = "redis module not available"
        
    return results

def print_test_results(test_name: str, results: Dict[str, Any]):
    """打印测试结果"""
    print(f"\n{'='*50}")
    print(f"{test_name}")
    print(f"{'='*50}")
    
    if results["status"] == "success":
        print("✅ PASSED")
    elif results["status"] == "partial":
        print("⚠️  PARTIAL")
    else:
        print("❌ FAILED")
    
    if results["errors"]:
        print("\nErrors:")
        for error in results["errors"]:
            print(f"  - {error}")
    
    # 打印其他信息
    for key, value in results.items():
        if key not in ["status", "errors"]:
            if isinstance(value, dict):
                print(f"\n{key.replace('_', ' ').title()}:")
                for k, v in value.items():
                    print(f"  {k}: {v}")
            elif isinstance(value, list):
                print(f"\n{key.replace('_', ' ').title()}:")
                for item in value:
                    print(f"  {item}")

def main():
    """主测试函数"""
    print("🚀 Backend Configuration Test Suite")
    print("测试后端配置和启动状态")
    print(f"Working directory: {os.getcwd()}")
    
    # 运行所有测试
    tests = [
        ("Configuration Loading", test_configuration),
        ("Database Connection", test_database_connection),
        ("Module Imports", test_module_imports),
        ("FastAPI Application", test_fastapi_app),
        ("External Services", test_external_services),
    ]
    
    all_passed = True
    
    for test_name, test_func in tests:
        try:
            results = test_func()
            print_test_results(test_name, results)
            
            if results["status"] == "failed":
                all_passed = False
                
        except Exception as e:
            print_test_results(test_name, {
                "status": "failed",
                "errors": [f"Test execution failed: {str(e)}"],
            })
            all_passed = False
    
    # 总结
    print(f"\n{'='*50}")
    print("SUMMARY")
    print(f"{'='*50}")
    
    if all_passed:
        print("🎉 All tests passed! Backend is ready to start.")
        print("\nTo start the backend server, run:")
        print("  uvicorn main:app --host 0.0.0.0 --port 8002 --reload")
    else:
        print("❌ Some tests failed. Please fix the issues before starting the backend.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())