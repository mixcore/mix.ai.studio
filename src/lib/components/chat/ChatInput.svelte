<script lang="ts">
  // import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
  import { Send, Image, Eye, MessageSquare } from "lucide-svelte";
  import {
    chatInput,
    chatLoading,
    chatMessages,
    llmService,
    selectedLLMProvider,
    selectedLLMModel,
    llmSettings,
  } from "$lib/stores";
  import { cn } from "$lib/utils";

  let textArea: HTMLTextAreaElement;
  let fileInput: HTMLInputElement;

export let signalRConnection: any;

  async function askAI() {
    const inputValue = textArea?.value?.trim() || "";
    if (!signalRConnection || !inputValue) return;
    await signalRConnection.invoke("AskAI", inputValue);
    chatMessages.update(messages => [
      ...messages,
      {
        id: Date.now().toString(),
        content: inputValue,
        role: "user",
        timestamp: new Date().toISOString(),
      }
    ]);
    chatInput.set("");
	chatLoading.set(true);

	// Simulate loading state
	setTimeout(() => {
	  chatLoading.set(false);
	}, 1000); // Adjust timeout as needed
  }

  async function handleSubmit() {
    if ($chatLoading) return;
    await askAI();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleImageUpload() {
    fileInput?.click();
  }

  function autoResize() {
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = textArea.scrollHeight + "px";
    }
  }

  $: if (textArea && $chatInput) {
    autoResize();
  }
</script>

<div class="space-y-4">
  <!-- Mode Toggle -->
  <div class="flex items-center gap-2 text-xs">
    <button class="btn btn-primary btn-sm">
      <MessageSquare class="w-3 h-3" />
      Default
    </button>
    <button class="btn btn-ghost btn-sm">
      <MessageSquare class="w-3 h-3" />
      Chat only
    </button>
    <button class="btn btn-ghost btn-sm">
      <Eye class="w-3 h-3" />
      Visual editor
    </button>
  </div>

  <!-- Input Area -->
  <div class="relative">
    <textarea
      bind:this={textArea}
      bind:value={$chatInput}
      placeholder="Ask mixcore.ai to build your app..."
      class={cn(
        "w-full min-h-[60px] max-h-[200px] p-4 pr-20 text-sm",
        "textarea textarea-bordered w-full resize-none",
        "focus:textarea-primary",
        "placeholder:text-base-content/50"
      )}
      on:keydown={handleKeyDown}
      on:input={autoResize}
      disabled={$chatLoading}
    ></textarea>

    <!-- Input Controls -->
    <div class="absolute right-2 bottom-2 flex items-center gap-1">
      <button
        class="btn btn-ghost btn-sm"
        on:click={handleImageUpload}
        title="Attach image"
      >
        <Image class="w-4 h-4" />
      </button>

      <button
        class={cn(
          "btn btn-sm",
          $chatInput.trim() && !$chatLoading ? "btn-primary" : "btn-disabled"
        )}
        on:click={handleSubmit}
        disabled={!$chatInput.trim() || $chatLoading}
        title="Send message"
      >
        <Send class="w-4 h-4" />
      </button>
    </div>
  </div>
</div>

<!-- Hidden file input -->
<input
  bind:this={fileInput}
  type="file"
  accept="image/*"
  class="hidden"
  on:change={() => {}}
/>
