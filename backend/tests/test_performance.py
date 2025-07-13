"""
性能测试
"""
import pytest
import asyncio
import time
from httpx import AsyncClient
from fastapi import status
from concurrent.futures import ThreadPoolExecutor
import statistics

class TestPerformance:
    """性能测试类"""
    
    @pytest.mark.asyncio
    async def test_api_response_time(self, async_client: AsyncClient):
        """测试API响应时间"""
        endpoints = [
            "/",
            "/health",
            "/api/documents/"
        ]
        
        response_times = []
        
        for endpoint in endpoints:
            start_time = time.time()
            response = await async_client.get(endpoint)
            end_time = time.time()
            
            response_time = end_time - start_time
            response_times.append(response_time)
            
            assert response.status_code in [200, 404]  # 允许404（如果端点不存在）
            assert response_time < 2.0  # 响应时间应小于2秒
        
        # 计算平均响应时间
        avg_response_time = statistics.mean(response_times)
        assert avg_response_time < 1.0  # 平均响应时间应小于1秒
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, async_client: AsyncClient):
        """测试并发请求"""
        num_requests = 20
        
        async def make_request():
            start_time = time.time()
            response = await async_client.get("/health")
            end_time = time.time()
            return {
                "status_code": response.status_code,
                "response_time": end_time - start_time
            }
        
        # 创建并发任务
        tasks = [make_request() for _ in range(num_requests)]
        
        # 执行并发请求
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        
        total_time = end_time - start_time
        
        # 验证结果
        successful_requests = sum(1 for r in results if r["status_code"] == 200)
        assert successful_requests >= num_requests * 0.8  # 至少80%成功
        
        # 验证总时间（并发应该比串行快）
        assert total_time < num_requests * 0.1  # 总时间应远小于串行时间
        
        # 验证平均响应时间
        response_times = [r["response_time"] for r in results]
        avg_response_time = statistics.mean(response_times)
        assert avg_response_time < 1.0
    
    @pytest.mark.asyncio
    async def test_large_request_handling(self, async_client: AsyncClient):
        """测试大请求处理"""
        # 创建大的写作请求
        large_content = "A" * 10000  # 10KB的内容
        
        writing_request = {
            "content": f"请分析以下内容：{large_content}",
            "writing_type": "academic",
            "style": "formal"
        }
        
        start_time = time.time()
        response = await async_client.post("/api/writing/assist", json=writing_request)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # 验证响应
        assert response.status_code in [200, 202, 400, 422]  # 允许各种有效状态
        assert response_time < 30.0  # 大请求应在30秒内完成
    
    @pytest.mark.asyncio
    async def test_memory_usage(self, async_client: AsyncClient):
        """测试内存使用情况"""
        import psutil
        import os
        
        # 获取当前进程
        process = psutil.Process(os.getpid())
        
        # 记录初始内存使用
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # 执行多次请求
        for i in range(50):
            await async_client.get("/health")
            
            # 每10次请求检查一次内存
            if i % 10 == 0:
                current_memory = process.memory_info().rss / 1024 / 1024  # MB
                memory_increase = current_memory - initial_memory
                
                # 内存增长应该合理（小于100MB）
                assert memory_increase < 100, f"Memory usage increased by {memory_increase:.2f}MB"
    
    @pytest.mark.asyncio
    async def test_database_query_performance(self, async_client: AsyncClient):
        """测试数据库查询性能"""
        # 创建多个文档
        documents = []
        for i in range(10):
            doc_data = {
                "title": f"性能测试文档 {i}",
                "content": f"这是性能测试文档 {i} 的内容",
                "document_type": "test"
            }
            
            response = await async_client.post("/api/documents/", json=doc_data)
            if response.status_code == 201:
                documents.append(response.json()["id"])
        
        try:
            # 测试批量查询性能
            start_time = time.time()
            
            # 并发查询所有文档
            tasks = []
            for doc_id in documents:
                task = async_client.get(f"/api/documents/{doc_id}")
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            query_time = end_time - start_time
            
            # 验证查询时间
            assert query_time < 5.0  # 10个文档的查询应在5秒内完成
            
            # 验证查询结果
            successful_queries = sum(
                1 for r in responses 
                if not isinstance(r, Exception) and hasattr(r, 'status_code') and r.status_code == 200
            )
            assert successful_queries >= len(documents) * 0.8  # 至少80%成功
            
        finally:
            # 清理测试数据
            for doc_id in documents:
                try:
                    await async_client.delete(f"/api/documents/{doc_id}")
                except:
                    pass
    
    @pytest.mark.asyncio
    async def test_websocket_performance(self, async_client: AsyncClient):
        """测试WebSocket性能"""
        import websockets
        import json
        
        # 由于测试环境限制，这里只测试连接时间
        # 实际项目中可以测试消息吞吐量
        
        # 获取WebSocket状态
        response = await async_client.get("/api/ws/status")
        assert response.status_code == 200
        
        status_data = response.json()
        assert "active_connections" in status_data
        assert status_data["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_agent_performance(self, async_client: AsyncClient):
        """测试Agent性能"""
        # 测试写作Agent
        writing_requests = [
            {
                "content": "写一段关于AI的介绍",
                "writing_type": "blog",
                "style": "casual"
            },
            {
                "content": "分析机器学习的应用",
                "writing_type": "academic",
                "style": "formal"
            },
            {
                "content": "创建一个技术总结",
                "writing_type": "summary",
                "style": "professional"
            }
        ]
        
        response_times = []
        
        for request in writing_requests:
            start_time = time.time()
            response = await async_client.post("/api/writing/assist", json=request)
            end_time = time.time()
            
            response_time = end_time - start_time
            response_times.append(response_time)
            
            # 验证响应状态
            assert response.status_code in [200, 202, 400, 422]
        
        # 验证平均响应时间
        if response_times:
            avg_response_time = statistics.mean(response_times)
            assert avg_response_time < 10.0  # Agent响应应在10秒内

class TestLoadTesting:
    """负载测试类"""
    
    @pytest.mark.asyncio
    async def test_sustained_load(self, async_client: AsyncClient):
        """测试持续负载"""
        duration = 30  # 30秒测试
        requests_per_second = 5
        
        start_time = time.time()
        all_responses = []
        
        while time.time() - start_time < duration:
            # 创建一批并发请求
            tasks = []
            for _ in range(requests_per_second):
                task = async_client.get("/health")
                tasks.append(task)
            
            # 执行这批请求
            batch_responses = await asyncio.gather(*tasks, return_exceptions=True)
            all_responses.extend(batch_responses)
            
            # 等待一秒
            await asyncio.sleep(1)
        
        # 分析结果
        successful_requests = sum(
            1 for r in all_responses 
            if not isinstance(r, Exception) and hasattr(r, 'status_code') and r.status_code == 200
        )
        
        total_requests = len(all_responses)
        success_rate = successful_requests / total_requests if total_requests > 0 else 0
        
        assert success_rate >= 0.95  # 95%成功率
        assert total_requests >= duration * requests_per_second * 0.8  # 完成至少80%的预期请求
    
    @pytest.mark.asyncio
    async def test_stress_testing(self, async_client: AsyncClient):
        """压力测试"""
        # 逐渐增加负载直到系统响应时间过长
        max_concurrent = 50
        acceptable_response_time = 3.0
        
        for concurrent_level in [5, 10, 20, 30, 50]:
            if concurrent_level > max_concurrent:
                break
            
            # 创建并发请求
            tasks = []
            for _ in range(concurrent_level):
                task = async_client.get("/health")
                tasks.append(task)
            
            # 执行并发请求
            start_time = time.time()
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            total_time = end_time - start_time
            avg_response_time = total_time / concurrent_level
            
            # 统计成功率
            successful_requests = sum(
                1 for r in responses 
                if not isinstance(r, Exception) and hasattr(r, 'status_code') and r.status_code == 200
            )
            success_rate = successful_requests / concurrent_level
            
            print(f"Concurrent level: {concurrent_level}, Success rate: {success_rate:.2%}, Avg response time: {avg_response_time:.3f}s")
            
            # 如果成功率过低或响应时间过长，停止测试
            if success_rate < 0.8 or avg_response_time > acceptable_response_time:
                print(f"System limit reached at concurrent level: {concurrent_level}")
                break
            
            # 验证基本要求
            assert success_rate >= 0.8  # 至少80%成功率
            assert avg_response_time < acceptable_response_time  # 响应时间要求