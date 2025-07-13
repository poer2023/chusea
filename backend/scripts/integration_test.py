"""
前后端集成测试脚本
测试关键的API端点和数据流
"""
import asyncio
import httpx
import json
from typing import Dict, Any

BASE_URL = "http://127.0.0.1:8002"

class IntegrationTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_id = None
        
    async def run_tests(self):
        """运行所有集成测试"""
        print("🚀 开始前后端集成测试")
        print("=" * 50)
        
        async with httpx.AsyncClient() as client:
            self.client = client
            
            # 测试流程
            await self.test_health_check()
            await self.test_user_authentication()
            await self.test_writing_workflow()
            await self.test_literature_workflow()
            await self.test_document_management()
            await self.test_tools_workflow()
            
        print("\n🎉 集成测试完成！")
        
    async def test_health_check(self):
        """测试系统健康状态"""
        print("🏥 测试系统健康状态...")
        
        response = await self.client.get(f"{self.base_url}/health")
        assert response.status_code == 200
        
        health_data = response.json()
        assert health_data["status"] == "healthy"
        assert "agents" in health_data["components"]
        
        print("   ✅ 系统状态正常")
        
    async def test_user_authentication(self):
        """测试用户认证流程"""
        print("🔐 测试用户认证流程...")
        
        # 用户登录
        login_data = {
            "username": "demo_user",
            "password": "demo123456"
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/auth/login-json",
            json=login_data
        )
        assert response.status_code == 200
        
        auth_data = response.json()
        self.token = auth_data["access_token"]
        assert auth_data["token_type"] == "bearer"
        
        # 验证令牌
        headers = {"Authorization": f"Bearer {self.token}"}
        response = await self.client.get(
            f"{self.base_url}/api/auth/me",
            headers=headers
        )
        assert response.status_code == 200
        
        user_data = response.json()
        self.user_id = user_data["id"]
        assert user_data["username"] == "demo_user"
        
        print("   ✅ 用户认证成功")
        
    async def test_writing_workflow(self):
        """测试写作工作流程"""
        print("✍️ 测试写作工作流程...")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # 测试学术写作
        writing_request = {
            "prompt": "人工智能在医疗领域的应用前景",
            "context": {
                "mode": "academic",
                "task_type": "generate"
            }
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/writing/generate",
            json=writing_request,
            headers=headers
        )
        assert response.status_code == 200
        
        writing_data = response.json()
        assert writing_data["success"] is True
        assert "content" in writing_data
        assert writing_data["metadata"]["writing_mode"] == "academic"
        
        # 测试博客写作
        blog_request = {
            "prompt": "AI学习心得分享",
            "context": {
                "mode": "blog",
                "task_type": "generate"
            }
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/writing/generate",
            json=blog_request,
            headers=headers
        )
        assert response.status_code == 200
        
        blog_data = response.json()
        assert blog_data["success"] is True
        assert blog_data["metadata"]["writing_mode"] == "blog"
        
        print("   ✅ 写作功能测试通过")
        
    async def test_literature_workflow(self):
        """测试文献管理工作流程"""
        print("📚 测试文献管理工作流程...")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # 获取用户文献
        response = await self.client.get(
            f"{self.base_url}/api/literature/",
            headers=headers
        )
        assert response.status_code == 200
        
        literature_data = response.json()
        assert isinstance(literature_data, list)
        assert len(literature_data) > 0
        
        # 测试文献搜索
        search_request = {
            "query": "transformer neural networks",
            "source": "semantic_scholar",
            "max_results": 5
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/literature/search",
            json=search_request,
            headers=headers
        )
        assert response.status_code == 200
        
        search_data = response.json()
        assert search_data["success"] is True
        assert "results" in search_data
        
        # 测试引用生成
        if literature_data:
            first_lit = literature_data[0]
            response = await self.client.post(
                f"{self.base_url}/api/literature/{first_lit['id']}/citation?format=apa",
                headers=headers
            )
            assert response.status_code == 200
            
            citation_data = response.json()
            assert "citation" in citation_data
        
        print("   ✅ 文献管理功能测试通过")
        
    async def test_document_management(self):
        """测试文档管理功能"""
        print("📄 测试文档管理功能...")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # 获取文档列表
        response = await self.client.get(
            f"{self.base_url}/api/documents/"
        )
        if response.status_code != 200:
            print(f"   ⚠️ 文档API响应: {response.status_code} - {response.text}")
        assert response.status_code == 200
        
        docs_data = response.json()
        assert "documents" in docs_data
        assert docs_data["total"] > 0
        
        # 创建新文档
        new_doc = {
            "title": "集成测试文档",
            "content": "这是一个集成测试创建的文档内容。",
            "document_type": "blog"
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/documents/",
            json=new_doc
        )
        assert response.status_code == 200
        
        created_doc = response.json()
        assert created_doc["title"] == new_doc["title"]
        assert created_doc["word_count"] > 0
        doc_id = created_doc["id"]
        
        # 更新文档
        update_data = {
            "title": "更新后的集成测试文档",
            "content": "这是更新后的文档内容。包含更多信息用于测试。"
        }
        
        response = await self.client.put(
            f"{self.base_url}/api/documents/{doc_id}",
            json=update_data
        )
        assert response.status_code == 200
        
        updated_doc = response.json()
        assert updated_doc["title"] == update_data["title"]
        
        # 获取文档统计 (可选测试)
        try:
            response = await self.client.get(
                f"{self.base_url}/api/documents/stats"
            )
            if response.status_code == 200:
                stats_data = response.json()
                assert "total_documents" in stats_data
                print("   ✅ 文档统计功能正常")
            else:
                print("   ⚠️ 文档统计功能暂不可用")
        except Exception as e:
            print(f"   ⚠️ 文档统计测试跳过: {e}")
        
        print("   ✅ 文档管理功能测试通过")
        
    async def test_tools_workflow(self):
        """测试工具功能"""
        print("🛠️ 测试工具功能...")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # 测试格式转换
        format_request = {
            "tool_type": "format_conversion",
            "content": "# 测试标题\n\n这是测试内容。",
            "context": {
                "from_format": "markdown",
                "to_format": "html"
            }
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/tools/agent/process",
            json=format_request,
            headers=headers
        )
        assert response.status_code == 200
        
        format_data = response.json()
        assert format_data["success"] is True
        assert "content" in format_data
        
        # 测试数据分析
        analysis_request = {
            "tool_type": "data_analysis",
            "context": {
                "data": {
                    "values": [10, 20, 30, 40, 50],
                    "labels": ["A", "B", "C", "D", "E"]
                },
                "analysis_type": "basic"
            }
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/tools/agent/process",
            json=analysis_request,
            headers=headers
        )
        assert response.status_code == 200
        
        analysis_data = response.json()
        assert analysis_data["success"] is True
        
        # 测试图表生成
        chart_request = {
            "tool_type": "chart_generation",
            "context": {
                "data": {
                    "values": [15, 25, 35, 45],
                    "labels": ["Q1", "Q2", "Q3", "Q4"]
                },
                "chart_type": "bar",
                "title": "季度数据"
            }
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/tools/agent/process",
            json=chart_request,
            headers=headers
        )
        assert response.status_code == 200
        
        chart_data = response.json()
        assert chart_data["success"] is True
        assert "chart_data" in chart_data["metadata"]
        
        print("   ✅ 工具功能测试通过")

async def main():
    """主测试函数"""
    tester = IntegrationTester()
    try:
        await tester.run_tests()
        print("\n✅ 所有集成测试通过！前后端集成工作正常。")
        return True
    except Exception as e:
        print(f"\n❌ 集成测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔗 AI写作助手 - 前后端集成测试")
    print("=" * 50)
    success = asyncio.run(main())
    if success:
        print("\n🎉 集成测试全部通过！系统已准备就绪。")
    else:
        print("\n⚠️ 存在集成问题，请检查系统配置。")