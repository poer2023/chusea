"""
WebSocket管理器 - 实现实时状态更新
"""
import json
import asyncio
from typing import Dict, List, Set
from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect
import uuid
from datetime import datetime

from core.logging_config import logger

class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 活跃连接
        self.active_connections: Dict[str, WebSocket] = {}
        # 文档订阅
        self.document_subscriptions: Dict[str, Set[str]] = {}
        # 连接到文档的映射
        self.connection_documents: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, document_id: str) -> str:
        """连接WebSocket并订阅文档"""
        connection_id = str(uuid.uuid4())
        
        await websocket.accept()
        
        self.active_connections[connection_id] = websocket
        self.connection_documents[connection_id] = document_id
        
        # 添加到文档订阅
        if document_id not in self.document_subscriptions:
            self.document_subscriptions[document_id] = set()
        self.document_subscriptions[document_id].add(connection_id)
        
        logger.info(f"WebSocket connection {connection_id} connected to document {document_id}")
        
        # 发送连接确认
        await self.send_personal_message({
            "type": "connection_established",
            "connection_id": connection_id,
            "document_id": document_id,
            "timestamp": datetime.now().isoformat()
        }, connection_id)
        
        return connection_id
    
    def disconnect(self, connection_id: str):
        """断开WebSocket连接"""
        if connection_id in self.active_connections:
            document_id = self.connection_documents.get(connection_id)
            
            # 从活跃连接中移除
            del self.active_connections[connection_id]
            
            # 从文档订阅中移除
            if document_id and document_id in self.document_subscriptions:
                self.document_subscriptions[document_id].discard(connection_id)
                if not self.document_subscriptions[document_id]:
                    del self.document_subscriptions[document_id]
            
            # 从连接映射中移除
            if connection_id in self.connection_documents:
                del self.connection_documents[connection_id]
            
            logger.info(f"WebSocket connection {connection_id} disconnected from document {document_id}")
    
    async def send_personal_message(self, message: dict, connection_id: str):
        """发送个人消息"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send message to connection {connection_id}: {str(e)}")
                self.disconnect(connection_id)
    
    async def broadcast_to_document(self, message: dict, document_id: str):
        """向文档的所有订阅者广播消息"""
        if document_id in self.document_subscriptions:
            disconnected_connections = []
            
            for connection_id in self.document_subscriptions[document_id]:
                if connection_id in self.active_connections:
                    websocket = self.active_connections[connection_id]
                    try:
                        await websocket.send_text(json.dumps(message))
                    except Exception as e:
                        logger.error(f"Failed to broadcast to connection {connection_id}: {str(e)}")
                        disconnected_connections.append(connection_id)
            
            # 清理断开的连接
            for connection_id in disconnected_connections:
                self.disconnect(connection_id)
    
    async def send_workflow_update(self, document_id: str, status: str, current_node: str = None, progress: float = 0.0):
        """发送工作流状态更新"""
        message = {
            "type": "workflow_status_update",
            "document_id": document_id,
            "status": status,
            "current_node": current_node,
            "progress": progress,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_to_document(message, document_id)
        logger.debug(f"Sent workflow update for document {document_id}: {status}")
    
    async def send_node_update(self, document_id: str, node_id: str, node_type: str, status: str, content: str = None):
        """发送节点状态更新"""
        message = {
            "type": "node_status_update",
            "document_id": document_id,
            "node": {
                "id": node_id,
                "type": node_type,
                "status": status,
                "content": content,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        await self.broadcast_to_document(message, document_id)
        logger.debug(f"Sent node update for document {document_id}: {node_type} - {status}")
    
    async def send_content_update(self, document_id: str, content: str, preview: bool = False):
        """发送内容更新"""
        message = {
            "type": "content_update",
            "document_id": document_id,
            "content": content,
            "preview": preview,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_to_document(message, document_id)
        logger.debug(f"Sent content update for document {document_id}, preview: {preview}")
    
    async def send_error_message(self, document_id: str, error: str, node_type: str = None):
        """发送错误消息"""
        message = {
            "type": "error",
            "document_id": document_id,
            "error": error,
            "node_type": node_type,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_to_document(message, document_id)
        logger.warning(f"Sent error message for document {document_id}: {error}")
    
    async def send_metrics_update(self, document_id: str, metrics: dict):
        """发送指标更新"""
        message = {
            "type": "metrics_update",
            "document_id": document_id,
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast_to_document(message, document_id)
        logger.debug(f"Sent metrics update for document {document_id}")
    
    def get_active_connections_count(self) -> int:
        """获取活跃连接数"""
        return len(self.active_connections)
    
    def get_document_subscribers_count(self, document_id: str) -> int:
        """获取文档订阅者数量"""
        return len(self.document_subscriptions.get(document_id, set()))

# 全局连接管理器实例
connection_manager = ConnectionManager()


class WebSocketHandler:
    """WebSocket处理器"""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
    
    async def handle_connection(self, websocket: WebSocket, document_id: str):
        """处理WebSocket连接"""
        connection_id = await self.connection_manager.connect(websocket, document_id)
        
        try:
            while True:
                # 接收客户端消息
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await self.handle_message(message, connection_id, document_id)
                
        except WebSocketDisconnect:
            self.connection_manager.disconnect(connection_id)
        except Exception as e:
            logger.error(f"WebSocket error for connection {connection_id}: {str(e)}")
            self.connection_manager.disconnect(connection_id)
    
    async def handle_message(self, message: dict, connection_id: str, document_id: str):
        """处理客户端消息"""
        message_type = message.get("type")
        
        if message_type == "ping":
            # 心跳检测
            await self.connection_manager.send_personal_message({
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            }, connection_id)
        
        elif message_type == "subscribe_workflow":
            # 订阅工作流状态（已经在连接时处理）
            logger.debug(f"Connection {connection_id} subscribed to workflow for document {document_id}")
        
        elif message_type == "client_message":
            # 客户端消息，可以用于用户输入或命令
            content = message.get("content", "")
            logger.info(f"Received client message from {connection_id}: {content}")
            
            # 这里可以处理用户的实时输入，如手动编辑、插入Prompt等
            # 暂时只记录日志
        
        else:
            logger.warning(f"Unknown message type from connection {connection_id}: {message_type}")

# 全局WebSocket处理器实例
websocket_handler = WebSocketHandler(connection_manager)