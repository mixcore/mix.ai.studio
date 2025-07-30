import { injectAuthToken } from '$lib/utils/auth-helper';
import { createHubConnection, startConnection } from '$lib/services/signalr';

// Example usage with the provided JWT token
async function useProvidedToken() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOlsiT3duZXItMSIsIlN1cGVyQWRtaW4iXSwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIxMDljMjYxZi02M2JlLTQ2OTQtOGE2ZS03Y2IyNjA1MDQ4OTIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoibWl4Y29yZSIsIlRlbmFudElkIjoiMSIsIlJlZnJlc2hUb2tlbiI6IjA5N2FmYTg0LWJiODctNGY5Yy1iYTNkLTZjMjdmZjUxOWM2NSIsIkF2YXRhciI6Ii9taXgtYXBwL2Fzc2V0cy9pbWcvdXNlci5wbmciLCJFeHBpcmVBdCI6IjIwMjUtMDctMzBUMTA6MDA6NTcuOTk4WiIsIm5iZiI6MTc1Mzg2ODQ1NywiZXhwIjoxNzUzODY5NjU3LCJpc3MiOiJtaXgtY29yZSIsImF1ZCI6Im1peC1jb3JlIn0.HX8LcdroJlt-hUa4_Hoqkg1fDbp_w-FmzOvzgRXrFnY";

  // 1. Inject the auth token (for REST API calls)
  await injectAuthToken({
    accessToken: token,
    refreshToken: "097afa84-bb87-4f9c-ba3d-6c27ff519c65",
    expiresIn: 1200
  });

  // 2. Connect to websocket hubs using both approaches
  
  // Approach 1: Using SignalR client (recommended)
  try {
    const portalHub = createHubConnection('https://mixcore.net/hub/portalHub');
    await startConnection(portalHub);
    portalHub.on('PortalUpdate', (data) => {
      console.log('Portal update:', data);
    });
  } catch (error) {
    console.error('PortalHub connection error:', error);
  }

  // Approach 2: Direct URL with token (alternative)
  try {
    const llmChatUrl = `wss://mixcore.net/hub/llm_chat?id=${generateId()}&access_token=${token}`;
    const llmChat = new WebSocket(llmChatUrl);
    llmChat.onmessage = (event) => {
      console.log('LLM Chat message:', event.data);
    };
  } catch (error) {
    console.error('LLM Chat connection error:', error);
  }
}

// Helper to generate random connection ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Run the example
useProvidedToken().catch(console.error);