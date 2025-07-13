"""
WebSocket路由 - 实时通信端点
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse
from core.websocket_manager import websocket_handler, connection_manager
from core.logging_config import logger

router = APIRouter()

@router.websocket("/ws/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    """
    WebSocket端点 - 连接到指定文档进行实时通信
    
    Args:
        websocket: WebSocket连接
        document_id: 文档ID
    """
    logger.info(f"New WebSocket connection request for document: {document_id}")
    await websocket_handler.handle_connection(websocket, document_id)

@router.websocket("/ws")
async def websocket_general_endpoint(websocket: WebSocket, doc_id: str = Query(...)):
    """
    通用WebSocket端点 - 通过查询参数指定文档ID
    
    Args:
        websocket: WebSocket连接
        doc_id: 文档ID（查询参数）
    """
    logger.info(f"New WebSocket connection request (general) for document: {doc_id}")
    await websocket_handler.handle_connection(websocket, doc_id)

@router.get("/ws/status")
async def websocket_status():
    """
    获取WebSocket状态信息
    
    Returns:
        WebSocket连接状态和统计信息
    """
    return {
        "active_connections": connection_manager.get_active_connections_count(),
        "document_subscriptions": {
            doc_id: connection_manager.get_document_subscribers_count(doc_id)
            for doc_id in connection_manager.document_subscriptions.keys()
        },
        "status": "healthy"
    }

@router.get("/ws/test")
async def websocket_test_page():
    """
    WebSocket测试页面（仅用于开发测试）
    """
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebSocket Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .connected { background-color: #d4edda; color: #155724; }
            .disconnected { background-color: #f8d7da; color: #721c24; }
            .message { padding: 5px; margin: 5px 0; background-color: #f8f9fa; border-left: 3px solid #007bff; }
            textarea { width: 100%; height: 100px; margin: 10px 0; }
            button { padding: 10px 20px; margin: 5px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer; }
            button:hover { background-color: #0056b3; }
            button:disabled { background-color: #6c757d; cursor: not-allowed; }
            #messages { height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>WebSocket Test Page</h1>
            
            <div id="status" class="status disconnected">
                Status: Disconnected
            </div>
            
            <div>
                <label for="documentId">Document ID:</label>
                <input type="text" id="documentId" value="test-doc-123" placeholder="Enter document ID" />
                <button onclick="connect()">Connect</button>
                <button onclick="disconnect()">Disconnect</button>
            </div>
            
            <div>
                <label for="messageInput">Send Message:</label>
                <textarea id="messageInput" placeholder="Enter JSON message...">{"type": "ping"}</textarea>
                <button onclick="sendMessage()" id="sendBtn" disabled>Send Message</button>
            </div>
            
            <div>
                <h3>Quick Actions:</h3>
                <button onclick="sendPing()" id="pingBtn" disabled>Send Ping</button>
                <button onclick="subscribeWorkflow()" id="subscribeBtn" disabled>Subscribe Workflow</button>
                <button onclick="sendClientMessage()" id="clientMsgBtn" disabled>Send Client Message</button>
            </div>
            
            <div>
                <h3>Received Messages:</h3>
                <div id="messages"></div>
                <button onclick="clearMessages()">Clear Messages</button>
            </div>
        </div>

        <script>
            let ws = null;
            let isConnected = false;
            
            function updateStatus(connected) {
                const statusEl = document.getElementById('status');
                const buttons = ['sendBtn', 'pingBtn', 'subscribeBtn', 'clientMsgBtn'];
                
                if (connected) {
                    statusEl.textContent = 'Status: Connected';
                    statusEl.className = 'status connected';
                    buttons.forEach(id => document.getElementById(id).disabled = false);
                } else {
                    statusEl.textContent = 'Status: Disconnected';
                    statusEl.className = 'status disconnected';
                    buttons.forEach(id => document.getElementById(id).disabled = true);
                }
                isConnected = connected;
            }
            
            function addMessage(message, type = 'received') {
                const messagesEl = document.getElementById('messages');
                const messageEl = document.createElement('div');
                messageEl.className = 'message';
                messageEl.innerHTML = `
                    <strong>[${type}] ${new Date().toLocaleTimeString()}</strong><br>
                    <pre>${JSON.stringify(message, null, 2)}</pre>
                `;
                messagesEl.appendChild(messageEl);
                messagesEl.scrollTop = messagesEl.scrollHeight;
            }
            
            function connect() {
                if (isConnected) {
                    alert('Already connected!');
                    return;
                }
                
                const documentId = document.getElementById('documentId').value.trim();
                if (!documentId) {
                    alert('Please enter a document ID');
                    return;
                }
                
                const wsUrl = `ws://localhost:8002/api/ws/${documentId}`;
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function(event) {
                    updateStatus(true);
                    addMessage({type: 'connection_opened', url: wsUrl}, 'system');
                };
                
                ws.onmessage = function(event) {
                    try {
                        const message = JSON.parse(event.data);
                        addMessage(message, 'received');
                    } catch (e) {
                        addMessage({raw_data: event.data, parse_error: e.message}, 'error');
                    }
                };
                
                ws.onclose = function(event) {
                    updateStatus(false);
                    addMessage({type: 'connection_closed', code: event.code, reason: event.reason}, 'system');
                };
                
                ws.onerror = function(error) {
                    addMessage({type: 'connection_error', error: error.toString()}, 'error');
                };
            }
            
            function disconnect() {
                if (ws) {
                    ws.close();
                    ws = null;
                    updateStatus(false);
                }
            }
            
            function sendMessage() {
                if (!isConnected) {
                    alert('Not connected!');
                    return;
                }
                
                const messageText = document.getElementById('messageInput').value.trim();
                if (!messageText) {
                    alert('Please enter a message');
                    return;
                }
                
                try {
                    const message = JSON.parse(messageText);
                    ws.send(JSON.stringify(message));
                    addMessage(message, 'sent');
                } catch (e) {
                    alert('Invalid JSON: ' + e.message);
                }
            }
            
            function sendPing() {
                if (isConnected) {
                    const message = {type: 'ping'};
                    ws.send(JSON.stringify(message));
                    addMessage(message, 'sent');
                }
            }
            
            function subscribeWorkflow() {
                if (isConnected) {
                    const message = {type: 'subscribe_workflow'};
                    ws.send(JSON.stringify(message));
                    addMessage(message, 'sent');
                }
            }
            
            function sendClientMessage() {
                if (isConnected) {
                    const content = prompt('Enter client message content:');
                    if (content !== null) {
                        const message = {type: 'client_message', content: content};
                        ws.send(JSON.stringify(message));
                        addMessage(message, 'sent');
                    }
                }
            }
            
            function clearMessages() {
                document.getElementById('messages').innerHTML = '';
            }
            
            // 页面加载时初始化状态
            updateStatus(false);
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)