"""
Redis缓存系统
用于缓存引用数据和工作流状态
"""
import redis
import json
import pickle
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
import os

from .logging_config import logger


class CacheManager:
    """缓存管理器"""
    
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=False)
            # 测试连接
            self.redis_client.ping()
            self.available = True
            logger.info("Redis缓存系统初始化成功")
        except (redis.ConnectionError, redis.TimeoutError) as e:
            logger.warning(f"Redis连接失败，使用内存缓存: {str(e)}")
            self.redis_client = None
            self.available = False
            # 使用内存缓存作为后备
            self._memory_cache = {}
    
    def _get_key(self, prefix: str, identifier: str) -> str:
        """生成缓存键"""
        return f"ai_writing:{prefix}:{identifier}"
    
    async def get(self, key: str, default: Any = None) -> Any:
        """获取缓存值"""
        try:
            if self.available:
                cached_data = self.redis_client.get(key)
                if cached_data:
                    return pickle.loads(cached_data)
            else:
                # 使用内存缓存
                return self._memory_cache.get(key, default)
        except Exception as e:
            logger.error(f"缓存读取错误: {str(e)}")
        
        return default
    
    async def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """设置缓存值"""
        try:
            if self.available:
                serialized_data = pickle.dumps(value)
                return self.redis_client.setex(key, expire, serialized_data)
            else:
                # 使用内存缓存
                self._memory_cache[key] = value
                return True
        except Exception as e:
            logger.error(f"缓存写入错误: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """删除缓存"""
        try:
            if self.available:
                return bool(self.redis_client.delete(key))
            else:
                # 使用内存缓存
                if key in self._memory_cache:
                    del self._memory_cache[key]
                    return True
        except Exception as e:
            logger.error(f"缓存删除错误: {str(e)}")
        
        return False
    
    async def exists(self, key: str) -> bool:
        """检查键是否存在"""
        try:
            if self.available:
                return bool(self.redis_client.exists(key))
            else:
                return key in self._memory_cache
        except Exception as e:
            logger.error(f"缓存检查错误: {str(e)}")
            return False
    
    # 引用相关缓存方法
    async def cache_citation(self, doi: str, metadata: Dict[str, Any], expire: int = 86400) -> bool:
        """缓存引用元数据（24小时过期）"""
        key = self._get_key("citation", doi)
        return await self.set(key, metadata, expire)
    
    async def get_cached_citation(self, doi: str) -> Optional[Dict[str, Any]]:
        """获取缓存的引用元数据"""
        key = self._get_key("citation", doi)
        return await self.get(key)
    
    async def cache_crossref_search(self, query: str, results: List[Dict[str, Any]], expire: int = 3600) -> bool:
        """缓存CrossRef搜索结果（1小时过期）"""
        key = self._get_key("crossref_search", query)
        return await self.set(key, results, expire)
    
    async def get_cached_crossref_search(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """获取缓存的CrossRef搜索结果"""
        key = self._get_key("crossref_search", query)
        return await self.get(key)
    
    # 工作流相关缓存方法
    async def cache_workflow_status(self, document_id: str, status: Dict[str, Any], expire: int = 300) -> bool:
        """缓存工作流状态（5分钟过期）"""
        key = self._get_key("workflow_status", document_id)
        return await self.set(key, status, expire)
    
    async def get_cached_workflow_status(self, document_id: str) -> Optional[Dict[str, Any]]:
        """获取缓存的工作流状态"""
        key = self._get_key("workflow_status", document_id)
        return await self.get(key)
    
    async def invalidate_workflow_cache(self, document_id: str) -> bool:
        """使工作流缓存失效"""
        key = self._get_key("workflow_status", document_id)
        return await self.delete(key)
    
    # LLM响应缓存
    async def cache_llm_response(self, prompt_hash: str, response: str, expire: int = 7200) -> bool:
        """缓存LLM响应（2小时过期）"""
        key = self._get_key("llm_response", prompt_hash)
        return await self.set(key, response, expire)
    
    async def get_cached_llm_response(self, prompt_hash: str) -> Optional[str]:
        """获取缓存的LLM响应"""
        key = self._get_key("llm_response", prompt_hash)
        return await self.get(key)
    
    # 可读性分析缓存
    async def cache_readability_analysis(self, content_hash: str, analysis: Dict[str, Any], expire: int = 3600) -> bool:
        """缓存可读性分析结果（1小时过期）"""
        key = self._get_key("readability", content_hash)
        return await self.set(key, analysis, expire)
    
    async def get_cached_readability_analysis(self, content_hash: str) -> Optional[Dict[str, Any]]:
        """获取缓存的可读性分析结果"""
        key = self._get_key("readability", content_hash)
        return await self.get(key)
    
    # 批量操作
    async def clear_user_cache(self, user_id: str) -> int:
        """清除用户相关的所有缓存"""
        pattern = f"ai_writing:*{user_id}*"
        cleared_count = 0
        
        try:
            if self.available:
                keys = self.redis_client.keys(pattern)
                if keys:
                    cleared_count = self.redis_client.delete(*keys)
            else:
                # 内存缓存清理
                keys_to_delete = [k for k in self._memory_cache.keys() if user_id in k]
                for key in keys_to_delete:
                    del self._memory_cache[key]
                cleared_count = len(keys_to_delete)
            
            logger.info(f"清除用户 {user_id} 的 {cleared_count} 个缓存项")
            return cleared_count
            
        except Exception as e:
            logger.error(f"清除用户缓存错误: {str(e)}")
            return 0
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """获取缓存统计信息"""
        stats = {
            "available": self.available,
            "type": "redis" if self.available else "memory"
        }
        
        try:
            if self.available:
                info = self.redis_client.info()
                stats.update({
                    "memory_usage": info.get("used_memory_human", "N/A"),
                    "connected_clients": info.get("connected_clients", 0),
                    "total_keys": self.redis_client.dbsize()
                })
            else:
                stats.update({
                    "memory_usage": f"{len(self._memory_cache)} items",
                    "total_keys": len(self._memory_cache)
                })
        except Exception as e:
            logger.error(f"获取缓存统计错误: {str(e)}")
            stats["error"] = str(e)
        
        return stats
    
    def health_check(self) -> bool:
        """缓存健康检查"""
        try:
            if self.available:
                self.redis_client.ping()
                return True
            else:
                # 内存缓存总是可用
                return True
        except Exception:
            return False


# 全局缓存管理器实例
cache_manager = CacheManager()