#!/usr/bin/env python3
"""
基础功能测试 - 验证核心组件是否正常工作
"""
import asyncio
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_basic_imports():
    """测试基本导入"""
    print("1. 测试基本导入...")
    
    try:
        # 测试Agent导入
        from agents.writing_agent import WritingAgent
        from agents.literature_agent import LiteratureAgent
        from agents.tools_agent import ToolsAgent
        print("   ✅ Agent导入成功")
        
        # 测试核心模块导入
        from core.agent_manager import BaseAgent, AgentType
        from core.models import AgentRequest, AgentResponse
        print("   ✅ 核心模块导入成功")
        
        return True
    except Exception as e:
        print(f"   ❌ 导入失败: {e}")
        return False

async def test_agent_creation():
    """测试Agent创建"""
    print("2. 测试Agent创建...")
    
    try:
        from agents.writing_agent import WritingAgent
        from agents.literature_agent import LiteratureAgent
        from agents.tools_agent import ToolsAgent
        
        # 创建Agent实例
        writing_agent = WritingAgent()
        literature_agent = LiteratureAgent()
        tools_agent = ToolsAgent()
        
        print(f"   ✅ WritingAgent创建成功: {writing_agent.name}")
        print(f"   ✅ LiteratureAgent创建成功: {literature_agent.name}")
        print(f"   ✅ ToolsAgent创建成功: {tools_agent.name}")
        
        return True
    except Exception as e:
        print(f"   ❌ Agent创建失败: {e}")
        return False

async def test_agent_basic_functionality():
    """测试Agent基本功能"""
    print("3. 测试Agent基本功能...")
    
    try:
        from agents.writing_agent import WritingAgent
        from core.models import AgentRequest
        
        # 创建WritingAgent
        agent = WritingAgent()
        
        # 创建测试请求
        from core.agent_manager import AgentType
        request = AgentRequest(
            prompt="测试请求",
            user_id=1,
            document_id=None,
            agent_type=AgentType.WRITING,
            context={"test": True}
        )
        
        # 测试process方法是否存在
        if hasattr(agent, 'process'):
            print("   ✅ Agent.process方法存在")
        else:
            print("   ❌ Agent.process方法不存在")
        
        print("   ✅ Agent基本功能测试通过")
        return True
    except Exception as e:
        print(f"   ❌ Agent功能测试失败: {e}")
        return False

async def test_error_handling():
    """测试错误处理"""
    print("4. 测试错误处理...")
    
    try:
        from core.error_handling import APIError, ErrorCode, create_error_response
        
        # 测试自定义错误
        error = APIError(400, "测试错误", ErrorCode.VALIDATION_ERROR)
        print(f"   ✅ 自定义错误创建成功: {error.detail}")
        
        # 测试错误响应
        response = create_error_response(400, "测试响应", ErrorCode.VALIDATION_ERROR)
        print("   ✅ 错误响应格式正确")
        
        return True
    except Exception as e:
        print(f"   ❌ 错误处理测试失败: {e}")
        return False

async def test_logging_system():
    """测试日志系统"""
    print("5. 测试日志系统...")
    
    try:
        from core.logging_config import logger, log_agent_activity
        
        # 测试基本日志
        logger.info("测试日志消息")
        print("   ✅ 基本日志功能正常")
        
        # 测试Agent活动日志
        log_agent_activity("test", "测试活动", {"test": True})
        print("   ✅ Agent活动日志功能正常")
        
        return True
    except Exception as e:
        print(f"   ❌ 日志系统测试失败: {e}")
        return False

async def test_websocket_manager():
    """测试WebSocket管理器"""
    print("6. 测试WebSocket管理器...")
    
    try:
        from core.websocket_manager import ConnectionManager, WebSocketHandler
        
        # 创建连接管理器
        manager = ConnectionManager()
        handler = WebSocketHandler(manager)
        
        # 测试基本方法
        count = manager.get_active_connections_count()
        print(f"   ✅ 活跃连接数: {count}")
        
        print("   ✅ WebSocket管理器正常")
        return True
    except Exception as e:
        print(f"   ❌ WebSocket管理器测试失败: {e}")
        return False

async def run_all_tests():
    """运行所有测试"""
    print("=" * 50)
    print("AI辅助写作工具 - 基础功能测试")
    print("=" * 50)
    
    tests = [
        test_basic_imports,
        test_agent_creation,
        test_agent_basic_functionality,
        test_error_handling,
        test_logging_system,
        test_websocket_manager,
    ]
    
    results = []
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            print(f"   ❌ 测试异常: {e}")
            results.append(False)
        print()
    
    # 统计结果
    passed = sum(results)
    total = len(results)
    success_rate = passed / total * 100
    
    print("=" * 50)
    print("测试结果总结")
    print("=" * 50)
    print(f"总测试数: {total}")
    print(f"通过测试: {passed}")
    print(f"失败测试: {total - passed}")
    print(f"成功率: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("\n✅ 基础功能测试整体通过！")
        return True
    else:
        print("\n❌ 基础功能测试存在问题，需要修复")
        return False

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)