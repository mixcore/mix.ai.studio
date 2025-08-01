<script lang="ts">
  import { Bot } from "lucide-svelte";
  import { chatMessages, chatLoading } from "$lib/stores";
  import ChatMessage from "./ChatMessage.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { onMount, onDestroy } from "svelte";
  import { ChatService } from "$lib/javascript-sdk/packages/realtime/src";
  import type { SignalRMessage } from "$lib/javascript-sdk/packages/realtime/src";

  let chatContainer: HTMLDivElement;
  let chatService: ChatService | null = null;
  let previousMessageCount = 0;
  const baseUrl = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT || 'https://mixcore.net';

  onMount(async () => {
    try {
      chatService = new ChatService({
        baseUrl: baseUrl,
        hubPath: "/hub/llm_chat",
        accessTokenFactory: () => localStorage.getItem("mixcore_access_token") || "",
        automaticReconnect: true,
        onConnected: () => {
          console.log("SignalR connected to llm_chat hub");
        },
        onDisconnected: (error) => {
          console.log("SignalR disconnected", error);
        },
        onError: (error) => {
          console.error("SignalR connection error:", error);
        }
      });

      // Handle incoming messages
      chatService.onMessageReceived((message: SignalRMessage) => {
        if (message?.data?.response) {
          // Turn off loading state immediately when response arrives
          chatLoading.set(false);
          
          // Extract the actual content string from the response
          let content = '';
          if (typeof message.data.response === 'string') {
            content = message.data.response;
          } else if (typeof message.data.response === 'object' && message.data.response !== null) {
            // Handle complex SignalR response structures
            const responseObj = message.data.response as any;
            if (responseObj.content) {
              content = responseObj.content;
            } else if (responseObj.data) {
              content = responseObj.data;
            } else if (responseObj.message) {
              content = responseObj.message;
            } else {
              // Fallback - try to extract meaningful text from the object
              content = JSON.stringify(message.data.response, null, 2);
            }
          } else {
            content = String(message.data.response);
          }
          
          chatMessages.update((messages) => [
            ...messages,
            {
              id: Date.now().toString(),
              content: content,
              role: "assistant",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      });

      await chatService.start();
    } catch (error) {
      console.error("Failed to initialize chat service:", error);
    }
  });

  onDestroy(() => {
    if (chatService) {
      chatService.dispose();
    }
  });

  // Optimized smooth scrolling - only when new messages are added
  $: if (chatContainer && $chatMessages.length > previousMessageCount) {
    previousMessageCount = $chatMessages.length;
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
</script>

<div class="flex flex-col h-full bg-base-100">
  <!-- Chat Messages -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if $chatMessages.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center">
        <Bot class="w-12 h-12 text-base-content/60 mb-4" />
        <h3 class="text-lg font-medium mb-2">Welcome to your Mixcore AI assistant</h3>
        <p class="text-sm text-base-content/60 max-w-sm">
          Describe what you want to build and I'll help you create it step by
          step.
        </p>
      </div>
    {:else}
      {#each $chatMessages as message (message.id)}
        <ChatMessage {message} />
      {/each}
    {/if}

    {#if $chatLoading}
      <div class="flex items-center gap-2 text-base-content/60">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div
            class="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
            style="animation-delay: 0.1s"
          ></div>
          <div
            class="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
            style="animation-delay: 0.2s"
          ></div>
        </div>
        <span class="text-sm">AI is thinking...</span>
      </div>
    {/if}
  </div>

  <!-- Chat Input -->
  <div class="p-4 border-t border-base-300">
    <ChatInput {chatService} />
  </div>
</div>
