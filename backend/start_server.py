#!/usr/bin/env python3
"""
启动开发服务器的脚本
"""
import os
import sys
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

def main():
    """启动服务器"""
    # 检查是否有MiniMax API密钥
    if not os.getenv("MINIMAX_API_KEY"):
        print("警告: 未设置 MINIMAX_API_KEY 环境变量")
        print("请复制 .env.example 为 .env 并填入您的API密钥")
        
        # 创建示例环境文件
        if not os.path.exists(".env"):
            with open(".env.example", "r") as f:
                example_content = f.read()
            with open(".env", "w") as f:
                f.write(example_content)
            print("已创建 .env 文件，请填入您的API密钥后重新启动")
            return
    
    # 启动服务器
    import uvicorn
    
    print("正在启动AI写作助手服务器...")
    print("访问 http://localhost:8002 查看API文档")
    print("访问 http://localhost:8002/docs 查看交互式API文档")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()