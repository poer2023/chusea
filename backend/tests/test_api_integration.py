"""
API集成测试
"""
import pytest
from httpx import AsyncClient
from fastapi import status

class TestAPIEndpoints:
    """API端点集成测试"""
    
    async def test_root_endpoint(self, async_client: AsyncClient):
        """测试根端点"""
        response = await async_client.get("/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "endpoints" in data
    
    async def test_health_check(self, async_client: AsyncClient):
        """测试健康检查端点"""
        response = await async_client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "components" in data

class TestWritingAPI:
    """写作API测试"""
    
    async def test_writing_assist(self, async_client: AsyncClient, sample_writing_request):
        """测试写作辅助功能"""
        response = await async_client.post("/api/writing/assist", json=sample_writing_request)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        data = response.json()
        assert "content" in data or "task_id" in data
    
    async def test_writing_enhance(self, async_client: AsyncClient):
        """测试文本增强功能"""
        enhance_data = {
            "content": "这是一个需要增强的文本",
            "enhancement_type": "grammar",
            "target_style": "formal"
        }
        response = await async_client.post("/api/writing/enhance", json=enhance_data)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
    
    async def test_writing_format(self, async_client: AsyncClient):
        """测试格式化功能"""
        format_data = {
            "content": "需要格式化的文本",
            "format_type": "academic",
            "citation_style": "APA"
        }
        response = await async_client.post("/api/writing/format", json=format_data)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]

class TestLiteratureAPI:
    """文献API测试"""
    
    async def test_literature_search(self, async_client: AsyncClient, sample_literature_query):
        """测试文献搜索功能"""
        response = await async_client.post("/api/literature/search", json=sample_literature_query)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        data = response.json()
        assert "results" in data or "task_id" in data
    
    async def test_citation_generate(self, async_client: AsyncClient):
        """测试引用生成功能"""
        citation_data = {
            "paper_id": "test_paper_123",
            "style": "APA",
            "metadata": {
                "title": "Test Paper",
                "authors": ["Author One", "Author Two"],
                "year": 2024,
                "journal": "Test Journal"
            }
        }
        response = await async_client.post("/api/literature/citation", json=citation_data)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
    
    async def test_citation_validate(self, async_client: AsyncClient):
        """测试引用验证功能"""
        validation_data = {
            "citations": [
                "Author, A. (2024). Test paper. Test Journal, 1(1), 1-10.",
                "Invalid citation format"
            ],
            "style": "APA"
        }
        response = await async_client.post("/api/literature/validate", json=validation_data)
        assert response.status_code == status.HTTP_200_OK

class TestToolsAPI:
    """工具API测试"""
    
    async def test_chart_generation(self, async_client: AsyncClient):
        """测试图表生成功能"""
        chart_data = {
            "data": {"x": [1, 2, 3, 4], "y": [10, 20, 15, 25]},
            "chart_type": "line",
            "title": "测试图表",
            "labels": {"x": "时间", "y": "数值"}
        }
        response = await async_client.post("/api/tools/chart", json=chart_data)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
    
    async def test_data_analysis(self, async_client: AsyncClient):
        """测试数据分析功能"""
        analysis_data = {
            "data": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "analysis_type": "descriptive",
            "options": {"include_visualization": True}
        }
        response = await async_client.post("/api/tools/analyze", json=analysis_data)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
    
    async def test_format_conversion(self, async_client: AsyncClient):
        """测试格式转换功能"""
        conversion_data = {
            "content": "# 标题\n\n这是一个markdown文档",
            "from_format": "markdown",
            "to_format": "html",
            "options": {"include_css": False}
        }
        response = await async_client.post("/api/tools/convert", json=conversion_data)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]

class TestDocumentsAPI:
    """文档API测试"""
    
    async def test_create_document(self, async_client: AsyncClient, sample_document_data):
        """测试创建文档"""
        response = await async_client.post("/api/documents/", json=sample_document_data)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "id" in data
        assert data["title"] == sample_document_data["title"]
        return data["id"]
    
    async def test_get_documents(self, async_client: AsyncClient):
        """测试获取文档列表"""
        response = await async_client.get("/api/documents/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
    
    async def test_document_lifecycle(self, async_client: AsyncClient, sample_document_data):
        """测试文档完整生命周期"""
        # 创建文档
        create_response = await async_client.post("/api/documents/", json=sample_document_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        doc_id = create_response.json()["id"]
        
        # 获取文档
        get_response = await async_client.get(f"/api/documents/{doc_id}")
        assert get_response.status_code == status.HTTP_200_OK
        
        # 更新文档
        update_data = {**sample_document_data, "title": "更新后的标题"}
        update_response = await async_client.put(f"/api/documents/{doc_id}", json=update_data)
        assert update_response.status_code == status.HTTP_200_OK
        
        # 删除文档
        delete_response = await async_client.delete(f"/api/documents/{doc_id}")
        assert delete_response.status_code == status.HTTP_200_OK

class TestErrorHandling:
    """错误处理测试"""
    
    async def test_invalid_endpoint(self, async_client: AsyncClient):
        """测试无效端点"""
        response = await async_client.get("/invalid/endpoint")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    async def test_invalid_request_data(self, async_client: AsyncClient):
        """测试无效请求数据"""
        invalid_data = {"invalid": "data"}
        response = await async_client.post("/api/writing/assist", json=invalid_data)
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST, 
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]
    
    async def test_method_not_allowed(self, async_client: AsyncClient):
        """测试不允许的HTTP方法"""
        response = await async_client.patch("/api/documents/")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED