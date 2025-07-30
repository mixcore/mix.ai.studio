import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { authToken } from '$lib/stores';
import { get } from 'svelte/store';

export function createHubConnection(hubUrl: string): HubConnection {
  const token = get(authToken);
  if (!token) throw new Error('No authentication token available');
  
  return new HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token as string,
      skipNegotiation: true,
      transport: 1 // WebSockets only
    })
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        return Math.min(retryContext.elapsedMilliseconds * 2, 10000);
      }
    })
    .configureLogging(LogLevel.Warning)
    .build();
}

export async function startConnection(connection: HubConnection) {
  try {
    await connection.start();
    return true;
  } catch (err) {
    console.error('SignalR Connection Error:', err);
    return false;
  }
}