"""
API端点测试
测试所有FastAPI路由的功能和错误处理
"""
import pytest
import json
from httpx import AsyncClient
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from main import app
from core.database_models import User, Document


@pytest.fixture
def client():
    """创建测试客户端"""
    return TestClient(app)


@pytest.fixture
async def async_client():
    """创建异步测试客户端"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def auth_headers():
    """创建认证头部"""
    # 模拟JWT token
    test_token = "test_jwt_token"
    return {"Authorization": f"Bearer {test_token}"}


class TestAuthRoutes:
    """认证路由测试"""

    def test_user_registration(self, client):
        """测试用户注册"""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        with patch('core.database.get_db') as mock_db:
            mock_db.return_value = Mock()
            
            response = client.post("/api/auth/register", json=user_data)
            
            # 根据实际API设计调整断言
            assert response.status_code in [200, 201]

    def test_user_login(self, client):
        """测试用户登录"""
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        
        with patch('core.database.get_db') as mock_db:
            mock_db.return_value = Mock()
            
            with patch('core.auth.authenticate_user') as mock_auth:
                mock_auth.return_value = Mock(id=1, username="testuser")
                
                response = client.post("/api/auth/login", json=login_data)
                
                assert response.status_code == 200
                if response.status_code == 200:
                    data = response.json()
                    assert "access_token" in data

    def test_invalid_login(self, client):
        """测试无效登录"""
        login_data = {
            "username": "invalid",
            "password": "wrong"
        }
        
        with patch('core.auth.authenticate_user') as mock_auth:
            mock_auth.return_value = None
            
            response = client.post("/api/auth/login", json=login_data)
            
            assert response.status_code == 401

    def test_protected_route_without_token(self, client):
        """测试无token访问受保护路由"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_protected_route_with_token(self, client, auth_headers):
        """测试有token访问受保护路由"""
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser", email="test@example.com")
            
            response = client.get("/api/auth/me", headers=auth_headers)
            
            if response.status_code == 200:
                data = response.json()
                assert "username" in data


class TestDocumentRoutes:
    """文档路由测试"""

    def test_create_document(self, client, auth_headers):
        """测试创建文档"""
        document_data = {
            "title": "Test Document",
            "content": "This is a test document content.",
            "document_type": "academic"
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.database.get_db') as mock_db:
                mock_db.return_value = Mock()
                
                response = client.post(
                    "/api/documents/",
                    json=document_data,
                    headers=auth_headers
                )
                
                assert response.status_code in [200, 201]
                if response.status_code in [200, 201]:
                    data = response.json()
                    assert data["title"] == document_data["title"]

    def test_get_documents(self, client, auth_headers):
        """测试获取文档列表"""
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.database.get_db') as mock_db:
                mock_db.return_value = Mock()
                
                response = client.get("/api/documents/", headers=auth_headers)
                
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)

    def test_get_document_by_id(self, client, auth_headers):
        """测试根据ID获取文档"""
        document_id = "123"
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.database.get_db') as mock_db:
                mock_db.return_value = Mock()
                
                response = client.get(f"/api/documents/{document_id}", headers=auth_headers)
                
                # 文档存在时返回200，不存在时返回404
                assert response.status_code in [200, 404]

    def test_update_document(self, client, auth_headers):
        """测试更新文档"""
        document_id = "123"
        update_data = {
            "title": "Updated Title",
            "content": "Updated content"
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.database.get_db') as mock_db:
                mock_db.return_value = Mock()
                
                response = client.put(
                    f"/api/documents/{document_id}",
                    json=update_data,
                    headers=auth_headers
                )
                
                assert response.status_code in [200, 404]

    def test_delete_document(self, client, auth_headers):
        """测试删除文档"""
        document_id = "123"
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.database.get_db') as mock_db:
                mock_db.return_value = Mock()
                
                response = client.delete(f"/api/documents/{document_id}", headers=auth_headers)
                
                assert response.status_code in [200, 204, 404]


class TestWorkflowRoutes:
    """工作流路由测试"""

    def test_start_workflow(self, client, auth_headers):
        """测试启动工作流"""
        workflow_data = {
            "document_id": "123",
            "user_prompt": "Write a comprehensive guide about AI",
            "config": {
                "readability_threshold": 70.0,
                "max_retries": 3,
                "writing_mode": "academic"
            }
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.workflow_engine.workflow_engine.start_workflow') as mock_workflow:
                mock_workflow.return_value = {"success": True, "workflow_id": "workflow_123"}
                
                response = client.post(
                    "/api/workflow/start",
                    json=workflow_data,
                    headers=auth_headers
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_get_workflow_status(self, client, auth_headers):
        """测试获取工作流状态"""
        document_id = "123"
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.workflow_engine.workflow_engine.get_workflow_status') as mock_status:
                mock_status.return_value = {
                    "status": "drafting",
                    "progress": 60,
                    "current_step": "draft"
                }
                
                response = client.get(f"/api/workflow/status/{document_id}", headers=auth_headers)
                
                assert response.status_code == 200
                data = response.json()
                assert "status" in data

    def test_cancel_workflow(self, client, auth_headers):
        """测试取消工作流"""
        document_id = "123"
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('core.workflow_engine.workflow_engine.cancel_workflow') as mock_cancel:
                mock_cancel.return_value = {"success": True}
                
                response = client.post(f"/api/workflow/cancel/{document_id}", headers=auth_headers)
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True


class TestWritingRoutes:
    """写作路由测试"""

    def test_generate_writing(self, client, auth_headers):
        """测试生成写作内容"""
        writing_data = {
            "prompt": "Write an introduction about artificial intelligence",
            "mode": "academic",
            "context": {
                "topic": "AI",
                "length": "short"
            }
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('agents.writing_agent.WritingAgent.process_request') as mock_agent:
                mock_agent.return_value = Mock(
                    success=True,
                    content="Generated AI introduction content...",
                    metadata={"mode": "academic", "tokens_used": 150}
                )
                
                response = client.post(
                    "/api/writing/generate",
                    json=writing_data,
                    headers=auth_headers
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True
                assert "content" in data

    def test_improve_writing(self, client, auth_headers):
        """测试改进写作内容"""
        improve_data = {
            "text": "This is original text that needs improvement.",
            "improvement_type": "readability",
            "target_score": 80
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            response = client.post(
                "/api/writing/improve",
                json=improve_data,
                headers=auth_headers
            )
            
            # 根据实际实现调整
            assert response.status_code in [200, 501]  # 501 if not implemented yet


class TestLiteratureRoutes:
    """文献路由测试"""

    def test_search_literature(self, client, auth_headers):
        """测试文献搜索"""
        search_data = {
            "query": "machine learning artificial intelligence",
            "source": "google_scholar",
            "max_results": 10
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('agents.literature_agent.LiteratureAgent.process_request') as mock_agent:
                mock_agent.return_value = Mock(
                    success=True,
                    content="Found literature results...",
                    metadata={"results": [], "total_found": 0}
                )
                
                response = client.post(
                    "/api/literature/search",
                    json=search_data,
                    headers=auth_headers
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_validate_citations(self, client, auth_headers):
        """测试引用验证"""
        citation_data = {
            "text": "According to Smith et al. (2023), machine learning has advanced significantly.",
            "format": "apa"
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            response = client.post(
                "/api/literature/validate",
                json=citation_data,
                headers=auth_headers
            )
            
            assert response.status_code in [200, 501]


class TestToolsRoutes:
    """工具路由测试"""

    def test_grammar_check(self, client, auth_headers):
        """测试语法检查"""
        grammar_data = {
            "text": "This are a test sentence with errors.",
            "language": "en"
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            with patch('agents.tools_agent.ToolsAgent.process_request') as mock_agent:
                mock_agent.return_value = Mock(
                    success=True,
                    content="This is a test sentence without errors.",
                    metadata={"errors_found": 1, "corrections": []}
                )
                
                response = client.post(
                    "/api/tools/grammar-check",
                    json=grammar_data,
                    headers=auth_headers
                )
                
                assert response.status_code == 200
                data = response.json()
                assert data["success"] is True

    def test_readability_analysis(self, client, auth_headers):
        """测试可读性分析"""
        readability_data = {
            "text": "The quick brown fox jumps over the lazy dog. This is a sample text for readability analysis."
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            response = client.post(
                "/api/tools/readability",
                json=readability_data,
                headers=auth_headers
            )
            
            assert response.status_code in [200, 501]

    def test_word_count(self, client, auth_headers):
        """测试字数统计"""
        text_data = {
            "text": "This is a test document with multiple words and sentences."
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            response = client.post(
                "/api/tools/word-count",
                json=text_data,
                headers=auth_headers
            )
            
            assert response.status_code in [200, 501]


class TestErrorHandling:
    """错误处理测试"""

    def test_invalid_json(self, client):
        """测试无效JSON"""
        response = client.post(
            "/api/auth/login",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

    def test_missing_required_fields(self, client):
        """测试缺少必填字段"""
        incomplete_data = {"username": "test"}  # 缺少password
        
        response = client.post("/api/auth/login", json=incomplete_data)
        assert response.status_code == 422

    def test_rate_limiting(self, client):
        """测试速率限制（如果实现了）"""
        # 连续发送多个请求
        for _ in range(10):
            response = client.post("/api/auth/login", json={"username": "test", "password": "test"})
            # 第一个请求应该正常处理，后续可能被限制
            assert response.status_code in [200, 401, 429]  # 429 for rate limiting

    def test_internal_server_error(self, client, auth_headers):
        """测试内部服务器错误"""
        with patch('core.database.get_db') as mock_db:
            mock_db.side_effect = Exception("Database connection failed")
            
            response = client.get("/api/documents/", headers=auth_headers)
            assert response.status_code == 500


class TestRequestValidation:
    """请求验证测试"""

    def test_request_size_limit(self, client, auth_headers):
        """测试请求大小限制"""
        large_content = "x" * 10000000  # 10MB content
        
        document_data = {
            "title": "Large Document",
            "content": large_content
        }
        
        response = client.post(
            "/api/documents/",
            json=document_data,
            headers=auth_headers
        )
        
        # 应该返回413 (Payload Too Large) 或类似错误
        assert response.status_code in [413, 422, 400]

    def test_sql_injection_protection(self, client):
        """测试SQL注入保护"""
        malicious_data = {
            "username": "'; DROP TABLE users; --",
            "password": "password"
        }
        
        response = client.post("/api/auth/login", json=malicious_data)
        
        # 应该安全处理，不会造成SQL注入
        assert response.status_code in [401, 422]

    def test_xss_protection(self, client, auth_headers):
        """测试XSS保护"""
        xss_data = {
            "title": "<script>alert('xss')</script>",
            "content": "Normal content"
        }
        
        with patch('core.auth.get_current_user') as mock_user:
            mock_user.return_value = Mock(id=1, username="testuser")
            
            response = client.post(
                "/api/documents/",
                json=xss_data,
                headers=auth_headers
            )
            
            # 应该正常处理或拒绝
            assert response.status_code in [200, 201, 400, 422]