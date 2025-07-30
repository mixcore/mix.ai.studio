import { get } from 'svelte/store';
import { chatMessages, chatLoading, authToken, refreshAuthToken } from '$lib/stores';
import { connectionStatus } from '$lib/stores/chat';
import type { ChatMessage } from './mixcore';

let socket: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

export async function initChatSocket() {
  try {
    const tokens = get(authToken);
    if (!tokens.accessToken) {
      connectionStatus.set('auth_error');
      throw new Error('Authentication required - please login first');
    }

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Generate unique connection ID
    const connectionId = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    socket = new WebSocket(`wss://mixcore.net/hub/llm_chat?id=${connectionId}&access_token=${tokens.accessToken}`);

    socket.onopen = () => {
      connectionStatus.set('connected');
      reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as ChatMessage;
      message.id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      chatMessages.update(messages => [...messages, message]);
    };

    socket.onclose = () => {
      connectionStatus.set('disconnected');
      attemptReconnect();
    };

    socket.onerror = async (event: Event) => {
      console.error('WebSocket error:', event);
      
      // Handle 401 unauthorized errors by refreshing token
      const tokens = get(authToken);
      if (event instanceof ErrorEvent && event.message?.includes('401') && tokens.refreshToken) {
        try {
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            await initChatSocket(); // Reconnect with new token
            return;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          connectionStatus.set('auth_error');
        }
      }
      
      connectionStatus.set('error');
    };
  } catch (error) {
    console.error('WebSocket init error:', error);
    connectionStatus.set('error');
  }
}

function attemptReconnect() {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    setTimeout(initChatSocket, 1000 * reconnectAttempts);
  }
}

export async function sendChatMessage(content: string): Promise<void> {
  try {
    chatLoading.set(true);
    const tokens = get(authToken);
    if (!tokens.accessToken) {
      connectionStatus.set('auth_error');
      chatMessages.update(messages => [
        ...messages,
        {
          id: `${Date.now()}-error`,
          content: 'Authentication required - please login first',
          role: 'assistant',
          timestamp: new Date().toISOString()
        }
      ]);
      throw new Error('Authentication required');
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      await initChatSocket();
    }

    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const userMessage: ChatMessage = {
      id,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    chatMessages.update(messages => [...messages, userMessage]);
    
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'chat_message',
        content,
        role: 'user'
      }));
    } else {
      throw new Error('WebSocket connection not ready');
    }
  } catch (error) {
    console.error('Chat error:', error);
    connectionStatus.set('error');
    chatMessages.update(messages => [
      ...messages,
      {
        id: `${Date.now()}-error`,
        content: error instanceof Error ? error.message : 'Failed to send message',
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    ]);
  } finally {
    chatLoading.set(false);
  }
}

export function closeConnection() {
  if (socket) {
    // Clear all event listeners first
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    
    // Close connection if not already closed
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close(1000, 'Normal closure');
    }
    socket = null;
  }
  connectionStatus.set('disconnected');
  reconnectAttempts = 0; // Reset reconnection attempts
}