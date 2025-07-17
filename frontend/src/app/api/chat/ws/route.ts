import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';

// WebSocket handler for real-time chat
// Note: This is a simplified implementation. In production, you'd want to use
// a proper WebSocket server like Socket.IO or a service like Pusher/Ably

interface ChatWebSocketMessage {
  type: 'chat_message' | 'chat_typing' | 'chat_user_joined' | 'chat_user_left' | 'workflow_update' | 'error';
  data: unknown;
  timestamp: number;
  id: string;
}

interface ConnectedClient {
  id: string;
  userId?: string;
  sessionId?: string;
  workflowId?: string;
  documentId?: string;
  lastSeen: number;
  ws: WebSocket;
}

// In-memory store for connected clients
// In production, this should be replaced with Redis or similar
const connectedClients = new Map<string, ConnectedClient>();
const clientSessions = new Map<string, Set<string>>(); // sessionId -> Set<clientId>

// Utility functions
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const broadcastToSession = (sessionId: string, message: ChatWebSocketMessage, excludeClientId?: string) => {
  const sessionClients = clientSessions.get(sessionId);
  if (!sessionClients) return;

  sessionClients.forEach(clientId => {
    if (clientId === excludeClientId) return;
    
    const client = connectedClients.get(clientId);
    if (client && client.ws && client.ws.readyState === 1) { // WebSocket.OPEN
      client.ws.send(JSON.stringify(message));
    }
  });
};

const handleChatMessage = async (clientId: string, message: ChatWebSocketMessage) => {
  const client = connectedClients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'chat_message':
      // Broadcast to all clients in the same session
      if (client.sessionId) {
        broadcastToSession(client.sessionId, message, clientId);
      }
      
      // TODO: Store message in database
      // TODO: Process with AI if needed
      break;

    case 'chat_typing':
      // Broadcast typing indicator to session
      if (client.sessionId) {
        broadcastToSession(client.sessionId, {
          ...message,
          data: {
            ...(message.data as object),
            userId: client.userId,
          }
        }, clientId);
      }
      break;

    case 'chat_user_joined':
      // Add client to session
      const sessionId = (message.data as { sessionId?: string })?.sessionId;
      if (sessionId) {
        client.sessionId = sessionId;
        
        if (!clientSessions.has(sessionId)) {
          clientSessions.set(sessionId, new Set());
        }
        clientSessions.get(sessionId)!.add(clientId);
        
        // Notify other clients
        broadcastToSession(sessionId, {
          type: 'chat_user_joined',
          data: { userId: client.userId },
          timestamp: Date.now(),
          id: generateId(),
        }, clientId);
      }
      break;

    case 'chat_user_left':
      // Remove client from session
      if (client.sessionId) {
        const sessionClients = clientSessions.get(client.sessionId);
        if (sessionClients) {
          sessionClients.delete(clientId);
          if (sessionClients.size === 0) {
            clientSessions.delete(client.sessionId);
          }
        }
        
        // Notify other clients
        broadcastToSession(client.sessionId, {
          type: 'chat_user_left',
          data: { userId: client.userId },
          timestamp: Date.now(),
          id: generateId(),
        }, clientId);
      }
      break;

    default:
      // Log unknown message type for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unknown message type:', message.type);
      }
  }
};

// Upgrade HTTP request to WebSocket
export async function GET() {
  // Note: Next.js doesn't natively support WebSocket upgrades in API routes
  // This is a conceptual implementation. In practice, you'd use:
  // 1. A separate WebSocket server (like ws or Socket.IO)
  // 2. A service like Pusher, Ably, or AWS API Gateway WebSocket
  // 3. A custom server with Next.js custom server setup
  
  return new Response(JSON.stringify({
    error: 'WebSocket upgrade not supported in this environment',
    message: 'Please use a dedicated WebSocket server or service',
    alternatives: [
      'Socket.IO server',
      'Pusher/Ably service',
      'AWS API Gateway WebSocket',
      'Custom Next.js server with ws library'
    ],
    mockEndpoint: '/api/chat/ws/mock',
  }), {
    status: 426, // Upgrade Required
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Mock WebSocket endpoint for testing
export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json();
    const { type, data } = body;

    // Simulate WebSocket message handling
    const message: ChatWebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: generateId(),
    };

    // Mock response based on message type
    switch (type) {
      case 'chat_message':
        return new Response(JSON.stringify({
          success: true,
          message: 'Message sent',
          echo: message,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });

      case 'chat_typing':
        return new Response(JSON.stringify({
          success: true,
          message: 'Typing indicator sent',
        }), {
          headers: { 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({
          success: true,
          message: 'Message processed',
          type,
        }), {
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process WebSocket message',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Export for potential use in custom server setup
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

// WebSocket handler factory for use with custom server
// Note: This is not exported as it's not compatible with Next.js API routes
// WebSocket handler factory for use with custom server - currently unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createWebSocketHandler = () => {
  const wss = new WebSocketServer({ port: 8080 });
  
  wss.on('connection', (ws: WebSocket, request: NextRequest) => {
    const clientId = generateId();
    const url = new URL(request.url!, `http://${request.headers.get('host') || 'localhost'}`);
    const userId = url.searchParams.get('userId');
    const sessionId = url.searchParams.get('sessionId');
    
    // Store client connection
    connectedClients.set(clientId, {
      id: clientId,
      userId: userId || undefined,
      sessionId: sessionId || undefined,
      lastSeen: Date.now(),
      ws,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client connected: ${clientId}, User: ${userId}, Session: ${sessionId}`);
    }
    
    // Handle incoming messages
    ws.on('message', async (data: unknown) => {
      try {
        const message: ChatWebSocketMessage = JSON.parse(String(data));
        await handleChatMessage(clientId, message);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error handling WebSocket message:', error);
        }
        ws.send(JSON.stringify({
          type: 'error',
          data: { error: 'Invalid message format' },
          timestamp: Date.now(),
          id: generateId(),
        }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      const client = connectedClients.get(clientId);
      if (client?.sessionId) {
        const sessionClients = clientSessions.get(client.sessionId);
        if (sessionClients) {
          sessionClients.delete(clientId);
          if (sessionClients.size === 0) {
            clientSessions.delete(client.sessionId);
          }
        }
        
        // Notify other clients about disconnection
        broadcastToSession(client.sessionId, {
          type: 'chat_user_left',
          data: { userId: client.userId },
          timestamp: Date.now(),
          id: generateId(),
        }, clientId);
      }
      
      connectedClients.delete(clientId);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Client disconnected: ${clientId}`);
      }
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection_established',
      data: { clientId, timestamp: Date.now() },
      timestamp: Date.now(),
      id: generateId(),
    }));
  });
  
  return wss;
};