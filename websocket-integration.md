# WebSocket & AskAI Integration Guide (SvelteKit)

## 1. Project Context & Coding Guidelines

- **Structure:** Organize code into routes, components, and services.
- **Standards:** Use TypeScript, consistent naming, and SvelteKit conventions.
- **Docs & Tests:** Document new modules and write tests for services/components.
- **Security:** Handle tokens securely; never expose secrets in the client.
- **UX & Accessibility:** Use accessible markup and provide user feedback for connection states.

---

## 2. WebSocket (SignalR) Integration

### a. Install SignalR Client

```bash
npm install @microsoft/signalr
```

### b. Create a SignalR Service

````typescript
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

export function createHubConnection(hubUrl: string, accessToken?: string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(hubUrl, accessToken ? { accessTokenFactory: () => accessToken } : undefined)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();
}
````

### c. Usage Example in a Svelte Store

````typescript
import { writable } from 'svelte/store';
import { createHubConnection } from '$lib/services/signalr';

export const conversation = writable<{ role: string; content: string }[]>([]);
export const isConnected = writable(false);

let connection: ReturnType<typeof createHubConnection> | null = null;

export async function connectAIChatHub(token: string) {
  connection = createHubConnection('/hubs/llm_chat', token);

  connection.on('NewMessage', (msg) => {
    conversation.update((c) => [...c, { role: 'ai', content: msg.data.response }]);
  });

  connection.onreconnected(() => isConnected.set(true));
  connection.onclose(() => isConnected.set(false));

  await connection.start();
  isConnected.set(true);
}

export async function askAI(message: string) {
  if (!connection) return;
  conversation.update((c) => [...c, { role: 'user', content: message }]);
  await connection.invoke('AskAI', message);
}
````

---

## 3. AskAI Svelte Component Example

````svelte
<script lang="ts">
  import { conversation, askAI, connectAIChatHub, isConnected } from '$lib/stores/aiChat';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let input = '';
  let token = ''; // Retrieve securely (e.g., from session or API)

  onMount(() => {
    connectAIChatHub(token);
  });

  function send() {
    if (input.trim()) {
      askAI(input.trim());
      input = '';
    }
  }
</script>

<div>
  <div aria-live="polite">
    {#each $conversation as msg}
      <div class={msg.role === 'user' ? 'user' : 'ai'}>
        <strong>{msg.role}:</strong>
        <span>{@html msg.content}</span>
      </div>
    {/each}
  </div>
  <form on:submit|preventDefault={send}>
    <input bind:value={input} placeholder="Ask AI..." aria-label="Ask AI" />
    <button type="submit" disabled={!$isConnected}>Send</button>
  </form>
  {#if !$isConnected}
    <p>Connecting to AI chat...</p>
  {/if}
</div>

<style>
  .user { color: #333; }
  .ai { color: #007acc; }
</style>
````

---

## 4. Best Practices

- **Token Refresh:** Handle 401 errors by refreshing tokens and reconnecting.
- **Markdown Rendering:** Use a library like `marked` for AI responses if needed.
- **Accessibility:** Use semantic HTML and ARIA attributes.
- **Testing:** Write unit tests for the SignalR service and component logic.
- **Error Handling:** Show user-friendly messages on connection errors.

---

## 5. Next Steps

- Integrate authentication to securely provide the access token.
- Expand the SignalR service for other real-time features as needed.
- Document the API endpoints and expected message formats.

---

**Need a backend hub example or more advanced features? Let me know!**