<script lang="ts">
  import { Bot, Settings } from "lucide-svelte";
  import { chatMessages, chatLoading, chatStreaming, chatStreamingMessage, chatStreamingMessageId, llmMode, selectedModel, llmService, availableModels } from "$lib/stores";
  import { mcpTools, mcpConnections } from "$lib/stores/mcp";
  import ChatMessage from "./ChatMessage.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { onMount, onDestroy } from "svelte";
  import { ChatService } from "$lib/javascript-sdk/packages/realtime/src";
  import type { SignalRMessage } from "$lib/javascript-sdk/packages/realtime/src";

  let chatContainer: HTMLDivElement;
  let chatService: ChatService | null = null;
  let previousMessageCount = 0;
  const baseUrl = import.meta.env.VITE_MIXCORE_PREVIEW_ENDPOINT || 'https://mixcore.net';
  
  // Mode selection logic
  let currentMode: 'mixcore' | 'external' = 'mixcore';
  $: currentMode = $llmMode;

  // Initialize services based on current mode
  async function initializeServices() {
    if (currentMode === 'mixcore') {
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

      // Handle streaming messages
      chatService.onStreaming((chunk: string, isComplete: boolean) => {
        if (isComplete) {
          // Streaming complete - add final message and reset streaming state
          const finalMessage = $chatStreamingMessage;
          if (finalMessage) {
            chatMessages.update((messages) => [
              ...messages,
              {
                id: $chatStreamingMessageId || Date.now().toString(),
                content: finalMessage,
                role: "assistant",
                timestamp: new Date().toISOString(),
              },
            ]);
          }
          
          // Reset streaming state
          chatStreaming.set(false);
          chatStreamingMessage.set('');
          chatStreamingMessageId.set(null);
          chatLoading.set(false);
        } else {
          // Accumulate streaming chunk
          if (!$chatStreaming) {
            chatStreaming.set(true);
            chatStreamingMessage.set('');
            chatStreamingMessageId.set(crypto.randomUUID());
            chatLoading.set(false); // Turn off loading when streaming starts
          }
          
          chatStreamingMessage.update((current) => current + chunk);
        }
      });

      // Handle streaming state changes
      chatService.onStreamingStateChange((state) => {
        chatStreaming.set(state.isStreaming);
        if (!state.isStreaming && state.currentMessage) {
          // Ensure final message is captured
          chatStreamingMessage.set(state.currentMessage);
        }
      });

      // Handle regular messages emitted by ChatService
      chatService.onRegularMessage((message) => {
        console.log('Regular message from ChatService:', message);
        chatLoading.set(false);
        
        chatMessages.update((messages) => [
          ...messages,
          message
        ]);
      });

      // Raw SignalR messages are processed internally by ChatService
      chatService.onMessageReceived((message: SignalRMessage) => {
        console.log('Raw SignalR message received:', message);
      });

        await chatService.start();
      } catch (error) {
        console.error("Failed to initialize Mixcore chat service:", error);
      }
    } else {
      // External LLM mode - no SignalR service needed
      // Messages will be handled through llmService
      console.log("External LLM mode initialized with model:", $selectedModel);
    }
  }

  onMount(async () => {
    await initializeServices();
  });

  // Re-initialize when mode changes
  $: if (currentMode) {
    if (chatService && currentMode === 'external') {
      // Cleanup Mixcore service when switching to external
      chatService.dispose();
      chatService = null;
    } else if (!chatService && currentMode === 'mixcore') {
      // Initialize Mixcore service when switching from external
      initializeServices();
    }
  }

  onDestroy(() => {
    if (chatService) {
      chatService.dispose();
    }
  });

  // Optimized smooth scrolling - for new messages and streaming updates
  $: if (chatContainer && ($chatMessages.length > previousMessageCount || $chatStreamingMessage)) {
    if ($chatMessages.length > previousMessageCount) {
      previousMessageCount = $chatMessages.length;
    }
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: $chatStreaming ? 'instant' : 'smooth'
      });
    });
  }
</script>

<div class="flex flex-col h-full bg-base-100">
  <!-- Mode Selection Header -->
  <div class="p-4 border-b border-base-300">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Settings class="w-4 h-4" />
        <span class="text-sm font-medium">LLM Mode</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-xs {currentMode === 'mixcore' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => llmMode.set('mixcore')}
        >
          Mixcore Stream
        </button>
        <button
          class="btn btn-xs {currentMode === 'external' ? 'btn-primary' : 'btn-outline'}"
          on:click={() => llmMode.set('external')}
        >
          External LLMs
        </button>
      </div>
    </div>
    
    {#if currentMode === 'external'}
      <div class="mt-2 flex items-center gap-2">
        <span class="text-xs text-base-content/60">Model:</span>
        <select 
          class="select select-xs select-bordered" 
          bind:value={$selectedModel}
        >
          {#each availableModels.filter(m => {
            if (m.provider === 'Mixcore') return false;
            const providers = llmService.getProviders();
            const providerKey = m.provider === 'OpenAI' ? 'openai' : 
                             m.provider === 'Anthropic' ? 'claude' :
                             m.provider === 'Google' ? 'gemini' :
                             m.provider === 'DeepSeek' ? 'deepseek' :
                             m.provider.toLowerCase();
            return providers[providerKey]?.isEnabled;
          }) as model}
            <option value={model}>{model.name} ({model.provider})</option>
          {/each}
        </select>
      </div>
      
      <!-- MCP Tools Status -->
      <div class="mt-2 flex items-center gap-2">
        <span class="text-xs text-base-content/60">MCP Tools:</span>
        <div class="badge badge-xs {$mcpTools.length > 0 ? 'badge-success' : 'badge-neutral'}">
          {$mcpTools.length} tools from {$mcpConnections.filter(c => c.connected).length} servers
        </div>
        {#if $mcpTools.length > 0}
          <span class="text-xs text-base-content/40">
            ({$mcpTools.map(t => t.tool.name).join(', ')})
          </span>
        {/if}
      </div>
    {/if}
  </div>
  
  <!-- Chat Messages -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if $chatMessages.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center">
        <Bot class="w-12 h-12 text-base-content/60 mb-4" />
        <h3 class="text-lg font-medium mb-2">
          {#if currentMode === 'mixcore'}
            Welcome to your Mixcore AI assistant
          {:else}
            Welcome to your AI assistant
          {/if}
        </h3>
        <p class="text-sm text-base-content/60 max-w-sm">
          {#if currentMode === 'mixcore'}
            Using Mixcore Streaming API - Describe what you want to build and I'll help you create it step by step.
          {:else}
            Using {$selectedModel.name} - Describe what you want to build and I'll help you create it step by step.
          {/if}
        </p>
      </div>
    {:else}
      {#each $chatMessages as message (message.id)}
        <ChatMessage {message} />
      {/each}
      
      {#if $chatStreaming && $chatStreamingMessage}
        <ChatMessage 
          message={{
            id: $chatStreamingMessageId || 'streaming',
            content: $chatStreamingMessage,
            role: 'assistant',
            timestamp: new Date().toISOString(),
            isStreaming: true
          }} 
        />
      {/if}
    {/if}

    {#if $chatLoading && !$chatStreaming}
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
    <ChatInput {chatService} {currentMode} />
  </div>
</div>
