"""
端到端工作流测试 - 完整用户场景测试
"""
import pytest
from httpx import AsyncClient
from fastapi import status
import asyncio
import json

class TestWritingWorkflow:
    """写作工作流端到端测试"""
    
    async def test_complete_academic_writing_workflow(self, async_client: AsyncClient):
        """测试完整的学术写作工作流"""
        # 1. 创建文档
        document_data = {
            "title": "人工智能在医疗领域的应用研究",
            "content": "",
            "document_type": "academic",
            "metadata": {
                "author": "测试用户",
                "field": "医学信息学",
                "keywords": ["人工智能", "医疗", "深度学习"]
            }
        }
        
        create_response = await async_client.post("/api/documents/", json=document_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        document_id = create_response.json()["id"]
        
        # 2. 搜索相关文献
        literature_query = {
            "query": "artificial intelligence healthcare medical",
            "limit": 5,
            "filters": {
                "year_range": [2020, 2024],
                "publication_type": "journal"
            }
        }
        
        literature_response = await async_client.post("/api/literature/search", json=literature_query)
        assert literature_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 3. 生成写作内容
        writing_request = {
            "content": "写一篇关于人工智能在医疗领域应用的学术论文摘要",
            "writing_type": "academic",
            "style": "formal",
            "requirements": {
                "word_count": 300,
                "include_citations": True,
                "sections": ["background", "methods", "results", "conclusion"]
            }
        }
        
        writing_response = await async_client.post("/api/writing/assist", json=writing_request)
        assert writing_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 4. 增强写作内容
        if writing_response.status_code == status.HTTP_200_OK:
            writing_result = writing_response.json()
            enhance_request = {
                "content": writing_result.get("content", "AI在医疗领域的应用正在快速发展"),
                "enhancement_type": "clarity",
                "target_style": "academic"
            }
            
            enhance_response = await async_client.post("/api/writing/enhance", json=enhance_request)
            assert enhance_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 5. 格式化内容
        format_request = {
            "content": "AI在医疗领域的应用正在快速发展。机器学习算法能够帮助医生更准确地诊断疾病。",
            "format_type": "academic",
            "citation_style": "APA"
        }
        
        format_response = await async_client.post("/api/writing/format", json=format_request)
        assert format_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 6. 生成图表
        chart_data = {
            "data": {
                "labels": ["2020", "2021", "2022", "2023", "2024"],
                "values": [10, 25, 40, 65, 85]
            },
            "chart_type": "line",
            "title": "AI在医疗领域的应用增长趋势",
            "labels": {"x": "年份", "y": "应用数量"}
        }
        
        chart_response = await async_client.post("/api/tools/chart", json=chart_data)
        assert chart_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 7. 更新文档
        updated_content = "人工智能在医疗领域的应用研究\n\n摘要：本研究探讨了人工智能技术在医疗领域的应用现状..."
        update_data = {
            **document_data,
            "content": updated_content,
            "metadata": {
                **document_data["metadata"],
                "status": "draft",
                "last_modified": "2024-01-01T00:00:00Z"
            }
        }
        
        update_response = await async_client.put(f"/api/documents/{document_id}", json=update_data)
        assert update_response.status_code == status.HTTP_200_OK
        
        # 8. 验证最终文档
        final_doc_response = await async_client.get(f"/api/documents/{document_id}")
        assert final_doc_response.status_code == status.HTTP_200_OK
        final_doc = final_doc_response.json()
        assert final_doc["content"] == updated_content
        
        # 9. 清理：删除文档
        delete_response = await async_client.delete(f"/api/documents/{document_id}")
        assert delete_response.status_code == status.HTTP_200_OK
    
    async def test_blog_writing_workflow(self, async_client: AsyncClient):
        """测试博客写作工作流"""
        # 1. 创建博客文档
        blog_data = {
            "title": "人工智能改变生活的十种方式",
            "content": "",
            "document_type": "blog",
            "metadata": {
                "author": "博客作者",
                "category": "科技",
                "tags": ["AI", "科技", "生活"]
            }
        }
        
        create_response = await async_client.post("/api/documents/", json=blog_data)
        assert create_response.status_code == status.HTTP_201_CREATED
        document_id = create_response.json()["id"]
        
        # 2. 生成博客内容
        blog_request = {
            "content": "写一篇关于人工智能如何改变我们日常生活的博客文章",
            "writing_type": "blog",
            "style": "casual",
            "requirements": {
                "word_count": 800,
                "tone": "engaging",
                "include_examples": True
            }
        }
        
        blog_response = await async_client.post("/api/writing/assist", json=blog_request)
        assert blog_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 3. 转换为社交媒体格式
        if blog_response.status_code == status.HTTP_200_OK:
            blog_content = blog_response.json().get("content", "AI正在改变我们的生活...")
            convert_request = {
                "content": blog_content,
                "from_format": "blog",
                "to_format": "social_media",
                "options": {
                    "platform": "twitter",
                    "max_length": 280
                }
            }
            
            convert_response = await async_client.post("/api/tools/convert", json=convert_request)
            assert convert_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 4. 清理
        delete_response = await async_client.delete(f"/api/documents/{document_id}")
        assert delete_response.status_code == status.HTTP_200_OK

class TestLiteratureWorkflow:
    """文献工作流端到端测试"""
    
    async def test_literature_research_workflow(self, async_client: AsyncClient):
        """测试文献研究工作流"""
        # 1. 搜索文献
        search_request = {
            "query": "machine learning natural language processing",
            "limit": 10,
            "filters": {
                "year_range": [2020, 2024],
                "publication_type": "conference"
            }
        }
        
        search_response = await async_client.post("/api/literature/search", json=search_request)
        assert search_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 2. 生成引用
        citation_request = {
            "paper_id": "test_paper_001",
            "style": "APA",
            "metadata": {
                "title": "Advanced Machine Learning Techniques for NLP",
                "authors": ["Smith, J.", "Johnson, A.", "Williams, B."],
                "year": 2024,
                "journal": "Journal of AI Research",
                "volume": "45",
                "issue": "3",
                "pages": "123-145"
            }
        }
        
        citation_response = await async_client.post("/api/literature/citation", json=citation_request)
        assert citation_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 3. 验证引用格式
        validation_request = {
            "citations": [
                "Smith, J., Johnson, A., & Williams, B. (2024). Advanced Machine Learning Techniques for NLP. Journal of AI Research, 45(3), 123-145.",
                "不正确的引用格式"
            ],
            "style": "APA"
        }
        
        validation_response = await async_client.post("/api/literature/validate", json=validation_request)
        assert validation_response.status_code == status.HTTP_200_OK
        
        validation_result = validation_response.json()
        assert len(validation_result["results"]) == 2
        assert validation_result["results"][0]["valid"] == True
        assert validation_result["results"][1]["valid"] == False

class TestToolsWorkflow:
    """工具工作流端到端测试"""
    
    async def test_data_analysis_workflow(self, async_client: AsyncClient):
        """测试数据分析工作流"""
        # 1. 生成数据
        data_request = {
            "data_type": "time_series",
            "parameters": {
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "frequency": "monthly",
                "trend": "increasing"
            }
        }
        
        # 由于这个端点可能不存在，我们跳过或模拟数据
        sample_data = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
        
        # 2. 数据分析
        analysis_request = {
            "data": sample_data,
            "analysis_type": "descriptive",
            "options": {
                "include_visualization": True,
                "statistical_tests": ["normality", "trend"]
            }
        }
        
        analysis_response = await async_client.post("/api/tools/analyze", json=analysis_request)
        assert analysis_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 3. 生成图表
        chart_request = {
            "data": {
                "x": list(range(1, 13)),
                "y": sample_data
            },
            "chart_type": "line",
            "title": "数据趋势分析",
            "labels": {"x": "月份", "y": "数值"}
        }
        
        chart_response = await async_client.post("/api/tools/chart", json=chart_request)
        assert chart_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
        
        # 4. 格式转换
        conversion_request = {
            "content": "## 数据分析结果\n\n数据显示明显的上升趋势。",
            "from_format": "markdown",
            "to_format": "html",
            "options": {"include_css": True}
        }
        
        conversion_response = await async_client.post("/api/tools/convert", json=conversion_request)
        assert conversion_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]

class TestIntegratedWorkflow:
    """综合工作流测试"""
    
    async def test_full_document_creation_workflow(self, async_client: AsyncClient):
        """测试完整的文档创建工作流"""
        # 这个测试模拟一个完整的用户工作流：
        # 创建文档 -> 搜索文献 -> 生成内容 -> 添加图表 -> 格式化 -> 完成
        
        # 1. 创建新文档
        doc_data = {
            "title": "深度学习在图像识别中的应用",
            "content": "",
            "document_type": "academic",
            "metadata": {
                "author": "研究员",
                "field": "计算机视觉"
            }
        }
        
        doc_response = await async_client.post("/api/documents/", json=doc_data)
        assert doc_response.status_code == status.HTTP_201_CREATED
        document_id = doc_response.json()["id"]
        
        try:
            # 2. 文献搜索
            literature_query = {
                "query": "deep learning image recognition computer vision",
                "limit": 5
            }
            
            lit_response = await async_client.post("/api/literature/search", json=literature_query)
            assert lit_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
            
            # 3. 生成内容
            writing_request = {
                "content": "写一篇关于深度学习在图像识别中应用的技术综述",
                "writing_type": "academic",
                "style": "formal"
            }
            
            writing_response = await async_client.post("/api/writing/assist", json=writing_request)
            assert writing_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
            
            # 4. 生成相关图表
            chart_data = {
                "data": {
                    "labels": ["CNN", "RNN", "Transformer", "ResNet"],
                    "values": [85, 78, 92, 88]
                },
                "chart_type": "bar",
                "title": "不同深度学习模型的准确率比较"
            }
            
            chart_response = await async_client.post("/api/tools/chart", json=chart_data)
            assert chart_response.status_code in [status.HTTP_200_OK, status.HTTP_202_ACCEPTED]
            
            # 5. 最终更新文档
            final_content = "深度学习在图像识别中的应用\n\n本文综述了深度学习技术在图像识别领域的最新进展..."
            
            update_data = {
                **doc_data,
                "content": final_content,
                "metadata": {
                    **doc_data["metadata"],
                    "status": "completed",
                    "word_count": len(final_content.split())
                }
            }
            
            update_response = await async_client.put(f"/api/documents/{document_id}", json=update_data)
            assert update_response.status_code == status.HTTP_200_OK
            
            # 6. 验证最终结果
            final_doc_response = await async_client.get(f"/api/documents/{document_id}")
            assert final_doc_response.status_code == status.HTTP_200_OK
            final_doc = final_doc_response.json()
            assert "completed" in final_doc["metadata"]["status"]
            
        finally:
            # 清理：删除文档
            await async_client.delete(f"/api/documents/{document_id}")

class TestErrorScenarios:
    """错误场景测试"""
    
    async def test_invalid_data_handling(self, async_client: AsyncClient):
        """测试无效数据处理"""
        # 测试无效的写作请求
        invalid_writing_request = {
            "content": "",  # 空内容
            "writing_type": "invalid_type",  # 无效类型
            "style": ""  # 空样式
        }
        
        response = await async_client.post("/api/writing/assist", json=invalid_writing_request)
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]
        
        # 测试无效的文献搜索
        invalid_literature_query = {
            "query": "",  # 空查询
            "limit": -1  # 无效限制
        }
        
        response = await async_client.post("/api/literature/search", json=invalid_literature_query)
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]
    
    async def test_resource_not_found(self, async_client: AsyncClient):
        """测试资源不存在的情况"""
        # 测试获取不存在的文档
        response = await async_client.get("/api/documents/999999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # 测试删除不存在的文档
        response = await async_client.delete("/api/documents/999999")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    async def test_concurrent_operations(self, async_client: AsyncClient):
        """测试并发操作"""
        # 创建多个并发请求
        tasks = []
        
        for i in range(5):
            doc_data = {
                "title": f"并发测试文档 {i}",
                "content": f"内容 {i}",
                "document_type": "test"
            }
            task = async_client.post("/api/documents/", json=doc_data)
            tasks.append(task)
        
        # 等待所有请求完成
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 验证结果
        successful_responses = [r for r in responses if not isinstance(r, Exception)]
        assert len(successful_responses) >= 3  # 至少一半成功
        
        # 清理创建的文档
        for response in successful_responses:
            if hasattr(response, 'json'):
                try:
                    doc_id = response.json()["id"]
                    await async_client.delete(f"/api/documents/{doc_id}")
                except:
                    pass  # 忽略清理错误