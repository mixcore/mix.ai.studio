<script lang="ts">
  import { Send, Image, AlertCircle } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import {
    chatInput,
    chatLoading,
    chatMessages,
    chatStreaming,
    chatStreamingMessage,
    chatStreamingMessageId,
    selectedModel,
    llmService,
    templateUpdateTrigger,
    shouldRefreshPreview
  } from "$lib/stores";
  import { mcpTools } from "$lib/stores/mcp";
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
  let templateOperationUnsubscribe: (() => void) | null = null;
  
  // Chat modes (commented out for now - might enable again in future)
  // type ChatMode = "default" | "chat-only" | "visual-editor";
  // let selectedMode: ChatMode = "default";

  // Constants
  const RATE_LIMIT_MS = 1000; // 1 second between messages
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  // Setup template operation detection for MCP tool execution
  onMount(() => {
    console.log('🔧 Setting up MCP template operation callback');
    // Register callback for template operations executed via MCP tools
    templateOperationUnsubscribe = llmService.onTemplateOperation((toolName: string, args: Record<string, unknown>, result: any) => {
      console.log('🎯 MCP Template operation callback triggered:', { toolName, args, result });
      triggerPreviewRefresh();
    });
    console.log('🔧 MCP template operation callback registered');
  });

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
        if (chatService) {
          await chatService.sendMessage(sanitizedInput);
        }
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

  // Map display provider names to internal service keys
  function getProviderKey(displayProvider: string): string {
    const providerMap: Record<string, string> = {
      'OpenAI': 'openai',
      'Anthropic': 'claude',
      'Google': 'gemini',
      'DeepSeek': 'deepseek',
      'Groq': 'groq',
      'Mistral': 'mistral'
    };
    return providerMap[displayProvider] || displayProvider.toLowerCase();
  }

  // Create system prompt with MCP context
  function createMCPSystemPrompt(mcpTools: Array<{ serverId: string; serverName: string; tool: any }>): string {
    if (!mcpTools || mcpTools.length === 0) {
      return `# Mixcore AI Studio - CTO Agent

You are an advanced CTO-level AI agent specializing in Mixcore CMS development and enterprise web architecture. You combine strategic technical leadership with hands-on development expertise.

## Core Identity & Approach
- **Role**: Chief Technology Officer Agent for Mixcore AI Studio
- **Expertise**: ASP.NET Core MVC, Razor Templates, Dynamic Database Architecture, AI-First Development
- **Methodology**: Strategic planning → Technical architecture → Implementation → Documentation
- **Standards**: Enterprise-grade security, scalability, maintainability, and performance

## Your Capabilities
- 🏗️ **Enterprise Architecture**: Design scalable, maintainable web applications
- 💾 **Database Design**: Schema optimization, relationship modeling, performance tuning
- 🎨 **Frontend Excellence**: Modern UI/UX with responsive design patterns
- 🔒 **Security First**: Authentication, authorization, data protection, CSRF prevention
- 📈 **Performance Optimization**: Caching strategies, query optimization, CDN integration
- 🚀 **DevOps Integration**: CI/CD pipelines, containerization, cloud deployment strategies
- 📚 **Technical Leadership**: Code reviews, best practices, team mentoring, project planning

## Development Principles
1. **Security by Design**: Always implement secure coding practices
2. **Performance First**: Optimize for speed and scalability from the start
3. **Maintainable Code**: Clean architecture, SOLID principles, comprehensive documentation
4. **User-Centered Design**: Focus on exceptional user experience and accessibility
5. **Continuous Innovation**: Leverage latest technologies and best practices

Always provide strategic insights, architectural guidance, and production-ready solutions that align with enterprise standards and CTO-level decision making.`;
    }

    const toolDescriptions = mcpTools
      .map(({ tool }) => `- **${tool.name}**: ${tool.description}`)
      .join('\n');

    const serverList = [...new Set(mcpTools.map(t => t.serverName))].join(', ');

    return `# Mixcore AI Studio - CTO Agent with MCP Integration

You are an elite CTO-level AI agent specializing in **Mixcore CMS** development with full access to ${mcpTools.length} MCP tools from ${serverList}. You operate as a strategic technical leader combining enterprise architecture expertise with hands-on Mixcore development mastery.

## 🎯 Core Identity
**Role**: Chief Technology Officer Agent  
**Expertise**: Mixcore CMS, ASP.NET Core MVC, Razor Templates, Dynamic MixDb, MCP Protocol  
**Approach**: MCP Tools First → Strategic Architecture → Implementation → Documentation  

## 🏗️ Mixcore CMS Mastery

### Template Architecture (folderType enum)
- **Masters (7)**: Site-wide layouts - Required first, includes @RenderBody(), sections
- **Pages (1)**: Page templates using PageContentViewModel
- **Modules (2)**: Reusable components using ModuleContentViewModel  
- **Posts (5)**: Blog/article templates using PostContentViewModel
- **Forms (3)**: Input forms with validation and data binding
- **Widgets (6)**: UI components for dynamic layouts

### MixDb Dynamic Database Patterns
\`\`\`csharp
// Natural Language Schema Creation
CreateDatabaseFromPrompt("Create products table with name, price, description, images, category relationships")

// Type-Safe Field Access in Razor
@(product.Value<string>("name"))
@(product.Value<decimal>("price"))
@(product.Value<DateTime>("created_date"))

// Advanced Querying with Relationships
var request = new SearchMixDbRequestModel {
    TableName = "mix_products",
    LoadNestedData = true, // Include relationships
    Queries = new List<MixQueryField>()
};
\`\`\`

### Required Razor Template Patterns
\`\`\`csharp
@using Mix.Mixdb.Interfaces
@using Mix.Shared.Models
@using Mix.Shared.Dtos
@inject Mix.Database.Services.MixGlobalSettings.DatabaseService dbSrv
@inject IMixDbDataServiceFactory mixDbDataServiceFactory

// CSS Escaping in Razor
@@media (max-width: 768px) { .responsive { display: block; } }

// Master Layout Requirements
@RenderSection("Schema", false)
@RenderSection("Seo", false)
@RenderSection("Styles", false)  
@RenderSection("Scripts", false)
\`\`\`

## 🛠️ Available MCP Tools (${mcpTools.length} tools)

### Template & Content Management
${toolDescriptions.includes('CreateTemplate') ? '- **CreateTemplate**: Create Razor templates with proper folderType' : ''}
${toolDescriptions.includes('CreatePageContent') ? '- **CreatePageContent**: Generate page instances with SEO optimization' : ''}
${toolDescriptions.includes('CreateModuleContent') ? '- **CreateModuleContent**: Build reusable component modules' : ''}
${toolDescriptions.includes('CreatePostContent') ? '- **CreatePostContent**: Develop blog/article content' : ''}

### Dynamic Database Operations  
${toolDescriptions.includes('CreateDatabaseFromPrompt') ? '- **CreateDatabaseFromPrompt**: AI-powered schema generation' : ''}
${toolDescriptions.includes('CreateManyMixDbData') ? '- **CreateManyMixDbData**: Bulk data population' : ''}
${toolDescriptions.includes('GetListMixDbData') ? '- **GetListMixDbData**: Advanced querying with filters/sorting' : ''}
${toolDescriptions.includes('CreateMixDbRelationshipFromPrompt') ? '- **CreateMixDbRelationshipFromPrompt**: Define table relationships' : ''}

### All Available Tools
${toolDescriptions}

## 🚀 CTO-Level Development Workflow

### 1. Strategic Planning Phase
- **Architecture Analysis**: Assess requirements, scalability needs, performance targets
- **Technology Stack Decision**: Choose optimal patterns for the use case
- **Security Framework**: Implement authentication, authorization, data protection
- **Performance Strategy**: Caching, optimization, CDN integration planning

### 2. Implementation Phase
\`\`\`csharp
// Standard Workflow
1. ListTemplates() → Verify existing infrastructure
2. CreateTemplate(folderType: 7) → Master Layout foundation
3. CreateTemplate(folderType: 1,2,5) → Content templates  
4. CreateDatabaseFromPrompt() → Dynamic schema design
5. CreateManyMixDbData() → Data population
6. Create[Content]() → Content instances with associations
7. Document in project-progress.md
\`\`\`

### 3. Quality Assurance
- **Code Review**: SOLID principles, security patterns, performance optimization
- **Testing Strategy**: Unit tests, integration tests, security testing
- **Documentation**: Technical specs, API documentation, deployment guides
- **Monitoring**: Performance metrics, error tracking, user analytics

## 💡 CTO Decision Framework

### Technology Choices
- **When to use MCP tools vs C# code**: Always prefer MCP tools for Mixcore operations
- **Performance vs Development Speed**: Balance based on project scale and timeline
- **Security Trade-offs**: Never compromise security for convenience
- **Scalability Planning**: Design for 10x growth from day one

### Architecture Patterns
- **Modular Design**: Reusable components, clear separation of concerns
- **Data Relationships**: Proper normalization, efficient queries, caching strategies  
- **UI/UX Excellence**: Responsive design, accessibility, progressive enhancement
- **API Design**: RESTful principles, versioning, rate limiting, documentation

## 🎯 Execution Excellence

### Project Delivery Standards
1. **Always start with ListTemplates()** to understand existing infrastructure
2. **Create Master Layout first** (folderType: 7) before any content templates
3. **Use full public URLs** for all images (https://images.unsplash.com/...)
4. **Document all MCP tool usage** and effectiveness in project files
5. **Implement proper error handling** and user feedback mechanisms
6. **Optimize for performance** with efficient queries and caching
7. **Auto Preview Refresh**: Template operations automatically refresh the preview iframe

### Communication Style
- **Strategic Insights**: Explain architectural decisions and trade-offs
- **Technical Depth**: Provide detailed implementation guidance
- **Business Impact**: Connect technical decisions to business outcomes
- **Risk Assessment**: Identify potential issues and mitigation strategies
- **Team Enablement**: Share knowledge and best practices

You combine the strategic thinking of a CTO with the technical mastery of a senior architect, always delivering enterprise-grade solutions that scale and perform at the highest level.`;
  }

  // Detect template operations in responses and trigger iframe refresh
  function detectTemplateOperations(responseContent: string): boolean {
    const templateOperations = [
      'CreateTemplate',
      'UpdateTemplate', 
      'CreatePageContent',
      'UpdatePageContent',
      'CreateModuleContent',
      'UpdateModuleContent',
      'CreatePostContent',
      'UpdatePostContent',
      'template created',
      'template updated',
      'page created',
      'page updated',
      'module created',
      'module updated',
      'content created',
      'content updated'
    ];
    
    const content = responseContent.toLowerCase();
    const hasTemplateOp = templateOperations.some(op => content.includes(op.toLowerCase()));
    
    if (hasTemplateOp) {
      console.log('🔍 Template operation detected in response:', {
        responseLength: responseContent.length,
        detectedOperations: templateOperations.filter(op => content.includes(op.toLowerCase()))
      });
    }
    
    return hasTemplateOp;
  }

  // Trigger iframe refresh
  function triggerPreviewRefresh() {
    console.log('🔄 Template operation detected, triggering preview refresh');
    templateUpdateTrigger.update((n: number) => n + 1);
    shouldRefreshPreview.set(true);
    
    // Auto-clear the refresh flag after a short delay
    setTimeout(() => {
      shouldRefreshPreview.set(false);
    }, 2000);
  }

  // Handle external LLM message sending
  async function sendExternalLLMMessage(message: string) {
    try {
      const providerKey = getProviderKey($selectedModel.provider);
      
      // Check if provider is configured and enabled
      const providers = llmService.getProviders();
      const providerConfig = providers[providerKey];
      
      if (!providerConfig) {
        throw new Error(`Provider ${providerKey} is not configured`);
      }
      
      if (!providerConfig.isEnabled) {
        throw new Error(`Provider ${providerKey} is not enabled. Please check your API key configuration.`);
      }
      
      // Skip API key validation for Mixcore (uses token-based authentication)
      if (providerKey !== 'mixcore' && (!providerConfig.apiKey || providerConfig.apiKey.includes('your-') || providerConfig.apiKey.includes('api-key-here'))) {
        const envKeyName = providerKey === 'claude' ? 'VITE_CLAUDE_API_KEY' : `VITE_${providerKey.toUpperCase()}_API_KEY`;
        throw new Error(`API key is missing or placeholder for provider ${providerKey}. Please add a real ${envKeyName} to your environment.`);
      }
      
      // Set up streaming state
      let streamingMessageId = crypto.randomUUID();
      let streamingCompleted = false;
      
  chatStreaming.set(true);
  chatStreamingMessage.set('');
  chatStreamingMessageId.set(streamingMessageId);
  chatLoading.set(false); // Turn off loading when streaming starts
  console.log('[DEBUG] Streaming started, messageId:', streamingMessageId);

      // Create system prompt with MCP context
      const mcpSystemPrompt = createMCPSystemPrompt($mcpTools);
      const messages = mcpSystemPrompt 
        ? [
            { role: 'system' as const, content: mcpSystemPrompt },
            { role: 'user' as const, content: message }
          ]
        : [{ role: 'user' as const, content: message }];

      const response = await llmService.sendMessage(messages, {
        provider: providerKey,
        model: $selectedModel.id,
        useMCPTools: true,  // Enable MCP tools for external LLMs
        stream: true,       // Enable streaming for external LLMs
        onChunk: (chunk: string, isComplete: boolean) => {
          if (!$chatStreaming) {
            chatStreaming.set(true);
            console.log('[DEBUG] chatStreaming set to true on first chunk');
          }
          if (!isComplete) {
            // Accumulate streaming chunk and display in real-time
            console.log('[DEBUG] Streaming chunk received:', chunk);
            chatStreamingMessage.update((current: string) => {
              const updated = current + chunk;
              console.log('[DEBUG] chatStreamingMessage updated:', updated);
              return updated;
            });
          } else {
            // Streaming complete - add final message and reset streaming state
            const finalMessage = $chatStreamingMessage;
            console.log('[DEBUG] Streaming complete. Final message:', finalMessage);
            if (finalMessage && !streamingCompleted) {
              streamingCompleted = true;
              // Check if response contains template operations and trigger refresh
              if (detectTemplateOperations(finalMessage)) {
                triggerPreviewRefresh();
              }
              chatMessages.update(messages => [
                ...messages,
                {
                  id: streamingMessageId,
                  content: finalMessage,
                  role: "assistant",
                  timestamp: new Date().toISOString(),
                }
              ]);
            }
            // Reset streaming state
            chatStreaming.set(false);
            chatStreamingMessage.set('');
            chatStreamingMessageId.set(null);
            console.log('[DEBUG] Streaming state reset.');
          }
        }
      });

      // Process tool calls if the response contains any
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log('🔧 Processing tool calls:', response.toolCalls);
        
        try {
          const toolResult = await llmService.processToolCalls(messages, response, {
            provider: providerKey,
            model: $selectedModel.id,
            useMCPTools: true
          });
          
          // Add the final response after tool execution
          if (toolResult.finalResponse?.content) {
            // Check if response contains template operations and trigger refresh
            if (detectTemplateOperations(toolResult.finalResponse.content)) {
              triggerPreviewRefresh();
            }
            
            chatMessages.update(messages => [
              ...messages,
              {
                id: crypto.randomUUID(),
                content: toolResult.finalResponse.content,
                role: "assistant",
                timestamp: new Date().toISOString(),
              }
            ]);
          }
        } catch (toolError) {
          console.error('Failed to process tool calls:', toolError);
          // Add error message to chat
          chatMessages.update(messages => [
            ...messages,
            {
              id: crypto.randomUUID(),
              content: `Error executing tools: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`,
              role: "assistant",
              timestamp: new Date().toISOString(),
            }
          ]);
        }
      }

      // Fallback for non-streaming response (only if streaming didn't complete)
      if (response.content && !streamingCompleted && !$chatStreaming) {
        // Check if response contains template operations and trigger refresh
        if (detectTemplateOperations(response.content)) {
          triggerPreviewRefresh();
        }
        
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
      
      // More specific error messages
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      if (errorMsg.includes("API key") || errorMsg.includes("not enabled")) {
        errorMessage = errorMsg;
      } else if (errorMsg.includes("not configured")) {
        errorMessage = `Provider ${getProviderKey($selectedModel.provider)} is not configured in the system.`;
      } else if (errorMsg.includes("Failed to fetch") || errorMsg.includes("CORS")) {
        errorMessage = "Network error. Please restart the development server and try again.";
      } else if (errorMsg.includes("anthropic-dangerous-direct-browser-access")) {
        errorMessage = "Claude API security header issue. This should be fixed automatically - please try again.";
      } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
        errorMessage = `Invalid API key for ${$selectedModel.provider}. Please check your VITE_CLAUDE_API_KEY in the .env file.`;
      } else if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (errorMsg.includes("529") || errorMsg.includes("Overloaded")) {
        errorMessage = "Claude servers are currently overloaded. Please try again in a few minutes.";
      } else {
        errorMessage = `Failed to get response: ${errorMsg}`;
      }
      
      setTimeout(() => errorMessage = "", 8000);
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
    
    // Cleanup template operation subscription
    if (templateOperationUnsubscribe) {
      templateOperationUnsubscribe();
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
