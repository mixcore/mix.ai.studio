import { get } from 'svelte/store';
import { chatMessages, chatLoading, authToken, refreshAuthToken } from '$lib/stores';
import { connectionStatus } from '$lib/stores/chat';
import type { ChatMessage } from './mixcore';
import { createHubConnection, startConnection } from './signalr';
import type { HubConnection } from '@microsoft/signalr';

let hubConnection: HubConnection | null = null;

export async function initChatSocket() {
  try {
    const tokens = get(authToken);
    if (!tokens.accessToken) {
      connectionStatus.set('auth_error');
      throw new Error('Authentication required - please login first');
    }

    if (hubConnection && hubConnection.state !== 'Disconnected') {
      return;
    }

    const connectionId = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    const hubUrl = `wss://mixcore.net/hub/llm_chat?id=${connectionId}`;

    hubConnection = createHubConnection(hubUrl);

    hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      message.id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      chatMessages.update(messages => [...messages, message]);
    });

    hubConnection.onclose(async (error) => {
      console.error('SignalR connection closed:', error);
      connectionStatus.set('disconnected');
    });

    connectionStatus.set('connecting');
    const connected = await startConnection(hubConnection);

    if (connected) {
      connectionStatus.set('connected');
    } else {
      connectionStatus.set('error');
    }

  } catch (error) {
    console.error('SignalR init error:', error);
    connectionStatus.set('error');
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

    if (!hubConnection || hubConnection.state !== 'Connected') {
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
    
    if (hubConnection?.state === 'Connected') {
      await hubConnection.invoke('SendMessage', {
        type: 'chat_message',
        content,
        role: 'user'
      });
    } else {
      throw new Error('SignalR connection not ready');
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