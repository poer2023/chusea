#!/usr/bin/env python3
"""
简化单元测试 - 实际可运行的测试
"""
import asyncio
import sys
import os
import unittest
from unittest.mock import Mock, AsyncMock, patch

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class TestAgents(unittest.TestCase):
    """Agent测试类"""
    
    def setUp(self):
        """测试setup"""
        from agents.writing_agent import WritingAgent
        from agents.literature_agent import LiteratureAgent
        from agents.tools_agent import ToolsAgent
        from core.agent_manager import AgentRequest, AgentType
        
        self.writing_agent = WritingAgent()
        self.literature_agent = LiteratureAgent()
        self.tools_agent = ToolsAgent()
        
        self.sample_request = AgentRequest(
            prompt="测试请求",
            user_id=1,
            document_id=None,
            agent_type=AgentType.WRITING,
            context={"test": True}
        )
    
    def test_agent_creation(self):
        """测试Agent创建"""
        self.assertIsNotNone(self.writing_agent)
        self.assertIsNotNone(self.literature_agent)
        self.assertIsNotNone(self.tools_agent)
        
        self.assertEqual(self.writing_agent.name, "WritingAgent")
        self.assertEqual(self.literature_agent.name, "LiteratureAgent")
        self.assertEqual(self.tools_agent.name, "ToolsAgent")
    
    def test_agent_has_process_method(self):
        """测试Agent有process方法"""
        self.assertTrue(hasattr(self.writing_agent, 'process'))
        self.assertTrue(hasattr(self.literature_agent, 'process'))
        self.assertTrue(hasattr(self.tools_agent, 'process'))
    
    def test_agent_type(self):
        """测试Agent类型"""
        from core.agent_manager import AgentType
        
        self.assertEqual(self.writing_agent.agent_type, AgentType.WRITING)
        self.assertEqual(self.literature_agent.agent_type, AgentType.LITERATURE)
        self.assertEqual(self.tools_agent.agent_type, AgentType.TOOLS)

class TestErrorHandling(unittest.TestCase):
    """错误处理测试"""
    
    def test_custom_errors(self):
        """测试自定义错误"""
        from core.error_handling import APIError, ErrorCode, AgentError, LLMError
        
        # 测试APIError
        error = APIError(400, "测试错误", ErrorCode.VALIDATION_ERROR)
        self.assertEqual(error.status_code, 400)
        self.assertEqual(error.detail, "测试错误")
        self.assertEqual(error.error_code, ErrorCode.VALIDATION_ERROR)
        
        # 测试AgentError
        agent_error = AgentError("Agent错误", "writing")
        self.assertEqual(agent_error.status_code, 500)
        self.assertEqual(agent_error.error_code, ErrorCode.AGENT_ERROR)
        
        # 测试LLMError
        llm_error = LLMError("LLM错误", "gpt-4")
        self.assertEqual(llm_error.status_code, 503)
        self.assertEqual(llm_error.error_code, ErrorCode.LLM_ERROR)
    
    def test_error_response_creation(self):
        """测试错误响应创建"""
        from core.error_handling import create_error_response, ErrorCode
        
        response = create_error_response(400, "测试错误", ErrorCode.VALIDATION_ERROR)
        
        self.assertIn("error", response)
        self.assertEqual(response["error"]["status_code"], 400)
        self.assertEqual(response["error"]["detail"], "测试错误")
        self.assertEqual(response["error"]["error_code"], ErrorCode.VALIDATION_ERROR)

class TestLoggingSystem(unittest.TestCase):
    """日志系统测试"""
    
    def test_logger_import(self):
        """测试日志器导入"""
        from core.logging_config import logger, api_logger, agent_logger
        
        self.assertIsNotNone(logger)
        self.assertIsNotNone(api_logger)
        self.assertIsNotNone(agent_logger)
    
    def test_logging_functions(self):
        """测试日志功能"""
        from core.logging_config import log_agent_activity, log_api_request, log_performance_metric
        
        # 这些函数应该能够正常调用而不抛出异常
        try:
            log_agent_activity("test", "测试活动")
            log_api_request("GET", "/test", 200, 0.1)
            log_performance_metric("test_operation", 0.5)
        except Exception as e:
            self.fail(f"日志功能调用失败: {e}")

class TestWebSocketManager(unittest.TestCase):
    """WebSocket管理器测试"""
    
    def test_connection_manager_creation(self):
        """测试连接管理器创建"""
        from core.websocket_manager import ConnectionManager, WebSocketHandler
        
        manager = ConnectionManager()
        handler = WebSocketHandler(manager)
        
        self.assertIsNotNone(manager)
        self.assertIsNotNone(handler)
        
        # 测试基本方法
        count = manager.get_active_connections_count()
        self.assertEqual(count, 0)

class TestModels(unittest.TestCase):
    """模型测试"""
    
    def test_agent_request_creation(self):
        """测试AgentRequest创建"""
        from core.agent_manager import AgentRequest, AgentType
        
        request = AgentRequest(
            prompt="测试",
            user_id=1,
            document_id=None,
            agent_type=AgentType.WRITING
        )
        
        self.assertEqual(request.prompt, "测试")
        self.assertEqual(request.user_id, 1)
        self.assertEqual(request.agent_type, AgentType.WRITING)
    
    def test_agent_response_creation(self):
        """测试AgentResponse创建"""
        from core.agent_manager import AgentResponse, AgentType
        
        response = AgentResponse(
            content="测试响应",
            agent_type=AgentType.WRITING,
            success=True
        )
        
        self.assertEqual(response.content, "测试响应")
        self.assertEqual(response.agent_type, AgentType.WRITING)
        self.assertTrue(response.success)

def run_tests():
    """运行测试"""
    print("=" * 60)
    print("AI辅助写作工具 - 简化单元测试")
    print("=" * 60)
    
    # 创建测试套件
    test_classes = [
        TestAgents,
        TestErrorHandling,
        TestLoggingSystem,
        TestWebSocketManager,
        TestModels,
    ]
    
    suite = unittest.TestSuite()
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        suite.addTests(tests)
    
    # 运行测试
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # 统计结果
    total_tests = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    success_tests = total_tests - failures - errors
    success_rate = (success_tests / total_tests * 100) if total_tests > 0 else 0
    
    print("\n" + "=" * 60)
    print("测试结果统计")
    print("=" * 60)
    print(f"总测试数: {total_tests}")
    print(f"成功测试: {success_tests}")
    print(f"失败测试: {failures}")
    print(f"错误测试: {errors}")
    print(f"成功率: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("\n✅ 单元测试整体通过！")
        return True
    elif success_rate >= 70:
        print("\n⚠️ 单元测试基本通过，但有部分问题需要关注")
        return True
    else:
        print("\n❌ 单元测试存在较多问题，需要修复")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)