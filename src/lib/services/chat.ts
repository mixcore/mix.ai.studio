import { get } from 'svelte/store';
import { chatMessages, chatLoading, connectionStatus, authToken } from '$lib/stores';
import type { ChatMessage } from './mixcore';

let socket: WebSocket | null = null;

export function initChatSocket() {
  const token = get(authToken);
  if (!token) throw new Error('No auth token available');

  if (socket) return;

  socket = new WebSocket(`wss://mixcore.net/hub/portalHub?access_token=${token}`);

  socket.onopen = () => {
    connectionStatus.set('connected');
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as ChatMessage;
    chatMessages.update(messages => [...messages, message]);
  };

  socket.onclose = () => {
    connectionStatus.set('disconnected');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    connectionStatus.set('error');
  };
}

export function sendChatMessage(content: string): void {
  chatLoading.set(true);
  
  try {
    // Generate more unique ID with random suffix
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const userMessage: ChatMessage = {
      id,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    chatMessages.update(messages => [...messages, userMessage]);
    
    if (!socket) initChatSocket();
    
    if (socket && socket.readyState === WebSocket.OPEN) {
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
    chatMessages.update(messages => [
      ...messages,
      {
        id: Date.now().toString(),
        content: 'Sorry, there was an error sending your message',
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    ]);
  } finally {
    chatLoading.set(false);
  }
}

export function closeChatSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}