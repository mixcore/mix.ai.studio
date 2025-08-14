<script lang="ts">
  import { Send, Image, Eye, MessageSquare, AlertCircle } from "lucide-svelte";
  import { onDestroy } from "svelte";
  import {
    chatInput,
    chatLoading,
    chatMessages,
    chatStreaming,
    selectedModel,
    llmService
  } from "$lib/stores";
  import { cn } from "$lib/utils";
  import type { ChatService } from "$lib/javascript-sdk/packages/realtime/src";

  // Props
  export let chatService: ChatService | null;
  export let currentMode: 'mixcore' | 'external' = 'mixcore';
  export let maxLength = 4000;
  export let placeholder = "Ask mixcore.ai to build your app...";
  
  // Dynamic placeholder based on mode
  $: dynamicPlaceholder = currentMode === 'mixcore' 
    ? "Ask Mixcore AI to build your app..." 
    : `Ask ${$selectedModel?.name || 'AI'} to help you...`;
  export let allowFileUpload = true;

  // Component state
  let textArea: HTMLTextAreaElement;
  let fileInput: HTMLInputElement;
  let resizeTimeout: ReturnType<typeof setTimeout>;
  let lastMessageTime = 0;
  let errorMessage = "";
  let isUploading = false;
  
  // Chat modes (commented out for now - might enable again in future)
  // type ChatMode = "default" | "chat-only" | "visual-editor";
  // let selectedMode: ChatMode = "default";

  // Constants
  const RATE_LIMIT_MS = 1000; // 1 second between messages
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  // Input validation and sanitization
  function sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, " ") // Normalize whitespace
      .slice(0, maxLength); // Enforce max length
  }

  function validateInput(input: string): { isValid: boolean; error?: string } {
    if (!input.trim()) {
      return { isValid: false, error: "Message cannot be empty" };
    }
    
    if (input.length > maxLength) {
      return { isValid: false, error: `Message too long (${input.length}/${maxLength} characters)` };
    }

    // Check rate limiting
    const now = Date.now();
    if (now - lastMessageTime < RATE_LIMIT_MS) {
      return { isValid: false, error: "Please wait before sending another message" };
    }

    return { isValid: true };
  }

  // Message sending logic
  async function sendMessage() {
    if ($chatLoading || $chatStreaming) return;

    const rawInput = $chatInput;
    const sanitizedInput = sanitizeInput(rawInput);
    const validation = validateInput(sanitizedInput);

    if (!validation.isValid) {
      errorMessage = validation.error || "Invalid input";
      setTimeout(() => errorMessage = "", 3000);
      return;
    }

    // Mode-specific validation
    if (currentMode === 'mixcore' && (!chatService || !chatService.isConnected())) {
      errorMessage = "Not connected to Mixcore chat service";
      setTimeout(() => errorMessage = "", 3000);
      return;
    }

    if (currentMode === 'external' && !$selectedModel) {
      errorMessage = "No LLM model selected";
      setTimeout(() => errorMessage = "", 3000);
      return;
    }

    try {
      errorMessage = "";
      lastMessageTime = Date.now();
      
      // Add user message to chat IMMEDIATELY for responsive UX
      chatMessages.update(messages => [
        ...messages,
        {
          id: crypto.randomUUID(),
          content: sanitizedInput,
          role: "user",
          timestamp: new Date().toISOString(),
        }
      ]);
      
      // Clear input immediately for responsive feel
      chatInput.set("");
      chatLoading.set(true);
      
      // Reset textarea height immediately
      requestAnimationFrame(() => {
        immediateResize();
      });
      
      // Handle different modes
      if (currentMode === 'mixcore') {
        // Use Mixcore streaming service
        await chatService.sendMessage(sanitizedInput);
      } else {
        // Use external LLM service
        await sendExternalLLMMessage(sanitizedInput);
      }
      
    } catch (error) {
      console.error("Failed to send message:", error);
      errorMessage = "Failed to send message. Please try again.";
      setTimeout(() => errorMessage = "", 5000);
      chatLoading.set(false);
    }
  }

  // Handle external LLM message sending
  async function sendExternalLLMMessage(message: string) {
    try {
      const response = await llmService.sendMessage([
        { role: 'user', content: message }
      ], {
        provider: $selectedModel.provider.toLowerCase() as any,
        model: $selectedModel.id
      });

      if (response.content) {
        // Add AI response to chat
        chatMessages.update(messages => [
          ...messages,
          {
            id: crypto.randomUUID(),
            content: response.content,
            role: "assistant",
            timestamp: new Date().toISOString(),
          }
        ]);
      }

      chatLoading.set(false);
    } catch (error) {
      console.error("Failed to get response from external LLM:", error);
      errorMessage = "Failed to get response. Please check your API configuration.";
      setTimeout(() => errorMessage = "", 5000);
      chatLoading.set(false);
    }
  }

  // Event handlers
  async function handleSubmit() {
    await sendMessage();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      
      // Only proceed if we can send
      if (!canSend) return;
      
      // Clear any pending resize timeouts to prevent conflicts
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      // Send immediately for responsive feel
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      chatInput.set("");
      textArea.blur();
      immediateResize();
    }
  }

  // File upload handling
  function validateFile(file: File): { isValid: boolean; error?: string } {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: "Only image files are allowed" };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: "File size must be less than 10MB" };
    }
    
    return { isValid: true };
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      errorMessage = validation.error || "Invalid file";
      setTimeout(() => errorMessage = "", 3000);
      target.value = ""; // Reset input
      return;
    }

    try {
      isUploading = true;
      errorMessage = "";
      
      // TODO: Implement actual file upload to backend
      console.log("File selected:", file.name, file.size, file.type);
      
      // Placeholder for file upload logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add file attachment info to input or handle differently
      const currentInput = $chatInput;
      chatInput.set(currentInput + (currentInput ? "\n" : "") + `[Image: ${file.name}]`);
      
    } catch (error) {
      console.error("File upload failed:", error);
      errorMessage = "File upload failed. Please try again.";
      setTimeout(() => errorMessage = "", 5000);
    } finally {
      isUploading = false;
      target.value = ""; // Reset input
    }
  }

  function handleImageUpload() {
    if (!allowFileUpload || isUploading || $chatStreaming) return;
    fileInput?.click();
  }

  // Mode selection
  // function selectMode(mode: ChatMode) {
  //   selectedMode = mode;
  //   // TODO: Emit event or update store for mode change
  //   console.log("Mode selected:", mode);
  // }

  // Auto-resize functionality
  function autoResize() {
    if (!textArea) return;
    
    // Reset height to calculate new height
    textArea.style.height = "auto";
    const newHeight = Math.min(textArea.scrollHeight, 200);
    textArea.style.height = newHeight + "px";
  }

  // Immediate resize for better responsiveness
  function immediateResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    autoResize();
  }

  // Debounced auto-resize
  $: if (textArea && $chatInput !== undefined) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(autoResize, 50);
  }

  // Character count and button state
  $: remainingChars = maxLength - $chatInput.length;
  $: isNearLimit = remainingChars < 100;
  $: canSend = $chatInput.trim().length > 0 && !$chatLoading && !$chatStreaming && !errorMessage;

  // Cleanup on destroy
  onDestroy(() => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
  });
</script>

<div class="space-y-4">
  <!-- Mode Toggle (commented out for now - might enable again in future) -->
  <!--
  <div class="flex items-center gap-2 text-xs" role="tablist" aria-label="Chat mode selection">
    <button 
      class={cn(
        "btn btn-sm transition-colors",
        selectedMode === "default" ? "btn-primary" : "btn-ghost"
      )}
      role="tab"
      aria-selected={selectedMode === "default"}
      aria-label="Default mode - Full chat with code generation"
      on:click={() => selectMode("default")}
    >
      <MessageSquare class="w-3 h-3" aria-hidden="true" />
      Default
    </button>
    
    <button 
      class={cn(
        "btn btn-sm transition-colors",
        selectedMode === "chat-only" ? "btn-primary" : "btn-ghost"
      )}
      role="tab"
      aria-selected={selectedMode === "chat-only"}
      aria-label="Chat only mode - Text conversation only"
      on:click={() => selectMode("chat-only")}
    >
      <MessageSquare class="w-3 h-3" aria-hidden="true" />
      Chat only
    </button>
    
    <button 
      class={cn(
        "btn btn-sm transition-colors",
        selectedMode === "visual-editor" ? "btn-primary" : "btn-ghost"
      )}
      role="tab"
      aria-selected={selectedMode === "visual-editor"}
      aria-label="Visual editor mode - Interactive UI builder"
      on:click={() => selectMode("visual-editor")}
    >
      <Eye class="w-3 h-3" aria-hidden="true" />
      Visual editor
    </button>
  </div>
  -->

  <!-- Error Message -->
  {#if errorMessage}
    <div class="alert alert-error text-sm" role="alert">
      <AlertCircle class="w-4 h-4" aria-hidden="true" />
      <span>{errorMessage}</span>
    </div>
  {/if}

  <!-- Input Area -->
  <div class="relative">
    <textarea
      bind:this={textArea}
      bind:value={$chatInput}
      placeholder={dynamicPlaceholder}
      maxlength={maxLength}
      class={cn(
        "w-full min-h-[60px] max-h-[200px] p-4 pr-20 text-sm",
        "textarea textarea-bordered resize-none transition-colors",
        "focus:textarea-primary focus:outline-none",
        "placeholder:text-base-content/50",
        ($chatLoading || $chatStreaming) && "cursor-not-allowed opacity-60",
        errorMessage && "textarea-error"
      )}
      disabled={$chatLoading || $chatStreaming}
      aria-label="Chat message input"
      aria-describedby="char-count {errorMessage ? 'error-message' : ''}"
      on:keydown={handleKeyDown}
      on:input={immediateResize}
    ></textarea>

    <!-- Character Count -->
    <div 
      id="char-count"
      class={cn(
        "absolute top-2 right-20 text-xs text-base-content/60",
        isNearLimit && "text-warning",
        remainingChars < 0 && "text-error"
      )}
      aria-live="polite"
    >
      {remainingChars < 100 ? remainingChars : ""}
    </div>

    <!-- Input Controls -->
    <div class="absolute right-2 bottom-2 flex items-center gap-1">
      {#if allowFileUpload}
        <button
          class={cn(
            "btn btn-ghost btn-sm transition-colors",
            isUploading && "loading"
          )}
          disabled={$chatLoading || $chatStreaming || isUploading}
          aria-label={isUploading ? "Uploading image..." : "Attach image"}
          title={isUploading ? "Uploading..." : "Attach image"}
          on:click={handleImageUpload}
        >
          {#if !isUploading}
            <Image class="w-4 h-4" aria-hidden="true" />
          {/if}
        </button>
      {/if}

      <button
        class={cn(
          "btn btn-sm transition-all",
          canSend ? "btn-primary hover:btn-primary-focus" : "btn-ghost opacity-50"
        )}
        disabled={!canSend}
        aria-label="Send message"
        title={canSend ? "Send message (Enter)" : $chatStreaming ? "AI is responding..." : "Type a message to send"}
        on:click={handleSubmit}
      >
        <Send class={cn("w-4 h-4 transition-transform", canSend && "scale-105")} aria-hidden="true" />
      </button>
    </div>
  </div>
</div>

{#if allowFileUpload}
  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    accept={ALLOWED_FILE_TYPES.join(",")}
    class="hidden"
    aria-hidden="true"
    on:change={handleFileUpload}
  />
{/if}
