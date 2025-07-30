import { writable } from 'svelte/store';
import { createHubConnection, startConnection } from '$lib/services/signalr';
import type { HubConnection } from '@microsoft/signalr';

export const chatMessages = writable<ChatMessage[]>([]);
export const chatLoading = writable(false);
export const connectionStatus = writable<'connected' | 'disconnected' | 'error'>('disconnected');

let connection: HubConnection | null = null;

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export async function initChatConnection() {
  try {
    connection = createHubConnection('wss://mixcore.net/hub/portalHub');
    
    connection.on('ReceiveMessage', (message: ChatMessage) => {
      chatMessages.update(messages => [...messages, message]);
    });

    connection.onreconnecting(() => connectionStatus.set('disconnected'));
    connection.onreconnected(() => connectionStatus.set('connected'));
    connection.onclose(() => connectionStatus.set('disconnected'));

    const success = await startConnection(connection);
    connectionStatus.set(success ? 'connected' : 'error');
    return success;
  } catch (err) {
    console.error('Connection initialization failed:', err);
    connectionStatus.set('error');
    return false;
  }
}

export async function sendChatMessage(content: string): Promise<void> {
  chatLoading.set(true);
  
  try {
    if (!connection) await initChatConnection();
    
    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      content,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    chatMessages.update(messages => [...messages, userMessage]);
    
    await connection?.invoke('SendMessage', content);
  } catch (err) {
    console.error('Failed to send message:', err);
    connectionStatus.set('error');
  } finally {
    chatLoading.set(false);
  }
}

export function closeConnection() {
  connection?.stop();
  connection = null;
  connectionStatus.set('disconnected');
}