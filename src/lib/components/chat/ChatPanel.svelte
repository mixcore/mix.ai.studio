<script lang="ts">
  import { Bot } from "lucide-svelte";
  import { chatMessages, chatLoading } from "$lib/stores";
  import ChatMessage from "./ChatMessage.svelte";
  import ChatInput from "./ChatInput.svelte";
  import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

  // TypeScript class for parsing SignalR message
  class SignalRMessage {
    from: string | null;
    title: string | null;
    message: string | null;
    deviceId: string | null;
    action: string;
    type: string;
    data: {
      isSuccess: boolean;
      response: string;
      result: string;
    };
    createdDateTime: string;

    constructor(obj: any) {
      this.from = obj?.from ?? null;
      this.title = obj?.title ?? null;
      this.message = obj?.message ?? null;
      this.deviceId = obj?.deviceId ?? null;
      this.action = obj?.action ?? "";
      this.type = obj?.type ?? "";
      this.data = {
        isSuccess: obj?.data?.isSuccess ?? false,
        response: obj?.data?.response ?? "",
        result: obj?.data?.result ?? "",
      };
      this.createdDateTime = obj?.createdDateTime ?? "";
    }
  }
  import { onMount } from "svelte";

  let chatContainer: HTMLDivElement;
  let signalRConnection: any = null;

  onMount(() => {
    const accessToken = localStorage.getItem("mixcore_access_token");
    signalRConnection = new HubConnectionBuilder()
      .withUrl("https://mixcore.net/hub/llm_chat", {
        accessTokenFactory: () => accessToken || "",
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    signalRConnection.on("receive_message", (msg: string) => {
      let parsedMsg: SignalRMessage | null = null;
      if (msg) {
        try {
          if (typeof msg === "string" && msg.indexOf("{") === 0) {
            parsedMsg = new SignalRMessage(JSON.parse(msg));
          }

          if (typeof msg === "object") {
            parsedMsg = new SignalRMessage(msg);
          }
        } catch (e) {
          console.warn("Failed to parse message JSON:", e);
        }
      }
      // Append response to chatMessages
      if (parsedMsg?.data?.response) {
        chatMessages.update((messages) => [
          ...messages,
          {
            id: Date.now().toString(),
            content: parsedMsg.data.response,
            role: "assistant",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
      console.log("Received message:", parsedMsg);
    });

    signalRConnection
      .start()
      .then(() => {
        console.log("SignalR connected to llm_chat hub");
      })
      .catch((err: unknown) => {
        console.error("SignalR connection error:", err);
      });

    return () => {
      if (signalRConnection) {
        signalRConnection.stop();
      }
    };
  });

  $: if (chatContainer && $chatMessages.length) {
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }
</script>

<div class="flex flex-col h-full bg-base-100">
  <!-- Chat Messages -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if $chatMessages.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center">
        <Bot class="w-12 h-12 text-base-content/60 mb-4" />
        <h3 class="text-lg font-medium mb-2">Welcome to your AI assistant</h3>
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
    <ChatInput {signalRConnection} />
  </div>
</div>
