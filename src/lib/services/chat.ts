import { get } from 'svelte/store';
import { chatMessages, chatLoading, connectionStatus } from '$lib/stores';
import type { ChatMessage } from './mixcore';

let socket: WebSocket | null = null;

export function initChatSocket(accessToken: string) {
  if (socket) return;

  socket = new WebSocket(`wss://mixcore.net/hub/portalHub?access_token=${accessToken}`);

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
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    chatMessages.update(messages => [...messages, userMessage]);
    
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