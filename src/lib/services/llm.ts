/**
 * LLM Integration Service
 * 
 * Provides unified interface for multiple LLM providers including:
 * - OpenAI (GPT-3.5, GPT-4, GPT-4o)
 * - Anthropic Claude (Claude-3.5 Sonnet, Claude-3 Haiku)  
 * - Google Gemini (Gemini Pro, Gemini Flash)
 * - DeepSeek (DeepSeek Chat, DeepSeek Coder)
 * 
 * Integrates with MCP (Model Context Protocol) for enhanced functionality
 */

import { mcpService } from './mcp';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  metadata?: Record<string, any>;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: Record<string, any>;
  toolCalls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface LLMProvider {
  name: string;
  models: string[];
  apiKey?: string;
  baseUrl?: string;
  isEnabled: boolean;
}

export interface MCPConnection {
  name: string;
  type: 'sse' | 'websocket' | 'http';
  url: string;
  timeout?: number;
  autoApprove?: string[];
  disabled?: boolean;
}

export interface LLMConfig {
  defaultProvider: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
  providers: Record<string, LLMProvider>;
  mcpConnections: Record<string, MCPConnection>;
}

// Default configuration
const DEFAULT_CONFIG: LLMConfig = {
  defaultProvider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  maxTokens: 4000,
  temperature: 0.7,
  providers: {
    openai: {
      name: 'OpenAI',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
      baseUrl: '/proxy/openai/v1',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      isEnabled: !!import.meta.env.VITE_OPENAI_API_KEY
    },
    claude: {
      name: 'Anthropic Claude',
      models: [
        'claude-opus-4-1-20250805',
        'claude-opus-4-20250514', 
        'claude-sonnet-4-20250514',
        'claude-3-7-sonnet-20250219',
        'claude-3-5-haiku-20241022',
        'claude-3-haiku-20240307'
      ],
      baseUrl: '/proxy/anthropic/v1',
      apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
      isEnabled: !!import.meta.env.VITE_CLAUDE_API_KEY
    },
    gemini: {
      name: 'Google Gemini',
      models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
      baseUrl: '/proxy/gemini/v1beta',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      isEnabled: !!import.meta.env.VITE_GEMINI_API_KEY
    },
    deepseek: {
      name: 'DeepSeek',
      models: ['deepseek-chat', 'deepseek-coder'],
      baseUrl: '/proxy/deepseek/v1',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
      isEnabled: !!import.meta.env.VITE_DEEPSEEK_API_KEY
    },
    mixcore: {
      name: 'Mixcore',
      models: ['mixcore-streaming'],
      baseUrl: 'https://mixcore.net/api/v1/llm',
      isEnabled: true
    }
  },
  mcpConnections: {
    mixcore: {
      name: 'Mixcore MCP Server',
      type: 'sse',
      url: 'https://mixcore.net/mcp/sse',
      timeout: 300,
      autoApprove: [],
      disabled: false
    }
  }
};

export class LLMService {
  private config: LLMConfig;
  private mcpClients: Map<string, any> = new Map();

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeMCPConnections();
  }


  // Initialize MCP connections
  private async initializeMCPConnections() {
    for (const [name, connection] of Object.entries(this.config.mcpConnections)) {
      if (!connection.disabled) {
        try {
          await this.connectMCP(name, connection);
        } catch (error) {
          console.error(`Failed to connect to MCP server ${name}:`, error);
        }
      }
    }
  }

  // Connect to MCP server
  private async connectMCP(name: string, connection: MCPConnection) {
    switch (connection.type) {
      case 'sse':
        await this.connectSSE(name, connection);
        break;
      case 'websocket':
        await this.connectWebSocket(name, connection);
        break;
      case 'http':
        await this.connectHTTP(name, connection);
        break;
    }
  }

  // SSE connection for MCP
  private async connectSSE(name: string, connection: MCPConnection) {
    try {
      const eventSource = new EventSource(connection.url);
      
      eventSource.onopen = () => {
        console.log(`MCP SSE connection established: ${name}`);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMCPMessage(name, data);
        } catch (error) {
          console.error(`Failed to parse MCP message from ${name}:`, error);
        }
      };

      eventSource.onerror = (error) => {
        console.error(`MCP SSE connection error for ${name}:`, error);
      };

      this.mcpClients.set(name, eventSource);
    } catch (error) {
      console.error(`Failed to establish SSE connection to ${name}:`, error);
    }
  }

  // WebSocket connection for MCP
  private async connectWebSocket(name: string, connection: MCPConnection) {
    try {
      const ws = new WebSocket(connection.url);
      
      ws.onopen = () => {
        console.log(`MCP WebSocket connection established: ${name}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMCPMessage(name, data);
        } catch (error) {
          console.error(`Failed to parse MCP message from ${name}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`MCP WebSocket connection error for ${name}:`, error);
      };

      this.mcpClients.set(name, ws);
    } catch (error) {
      console.error(`Failed to establish WebSocket connection to ${name}:`, error);
    }
  }

  // HTTP polling for MCP
  private async connectHTTP(name: string, connection: MCPConnection) {
    const client: any = {
      url: connection.url,
      polling: true,
      poll: async () => {
        try {
          const response = await fetch(connection.url);
          if (response.ok) {
            const data = await response.json();
            this.handleMCPMessage(name, data);
          }
        } catch (error) {
          console.error(`MCP HTTP polling error for ${name}:`, error);
        }
      }
    };

    // Start polling
    const interval = setInterval(() => {
      if (client.polling) {
        client.poll();
      }
    }, 5000);

    client.stop = () => {
      client.polling = false;
      clearInterval(interval);
    };

    this.mcpClients.set(name, client);
  }

  // Handle MCP messages
  private handleMCPMessage(serverName: string, message: any) {
    console.log(`MCP message from ${serverName}:`, message);
    
    // Handle different MCP message types
    switch (message.type) {
      case 'tools_list':
        this.handleToolsList(serverName, message.tools);
        break;
      case 'tool_result':
        this.handleToolResult(serverName, message);
        break;
      case 'template':
        this.handleTemplate(serverName, message);
        break;
      default:
        console.log(`Unknown MCP message type: ${message.type}`);
    }
  }

  // Handle tools list from MCP server
  private handleToolsList(serverName: string, tools: any[]) {
    console.log(`Available tools from ${serverName}:`, tools);
  }

  // Handle tool execution result
  private handleToolResult(serverName: string, result: any) {
    console.log(`Tool result from ${serverName}:`, result);
  }

  // Handle MCP templates
  private handleTemplate(serverName: string, template: any) {
    console.log(`Template from ${serverName}:`, template);
  }

  // Send message to LLM with MCP tool support
  async sendMessage(
    messages: LLMMessage[],
    options: {
      provider?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
      useMCPTools?: boolean;
    } = {}
  ): Promise<LLMResponse> {
    const provider = options.provider || this.config.defaultProvider;
    const model = options.model || this.config.defaultModel;

    const providerConfig = this.config.providers[provider];
    if (!providerConfig || !providerConfig.isEnabled) {
      throw new Error(`Provider ${provider} is not enabled`);
    }

    // Get available MCP tools if enabled
    let tools: Tool[] = [];
    if (options.useMCPTools !== false) {
      tools = this.getAvailableMCPTools();
    }

    // Add tools to options for providers that support them
    const enhancedOptions = { ...options, tools };

    switch (provider) {
      case 'openai':
        return this.sendToOpenAI(messages, model, enhancedOptions);
      case 'claude':
        return this.sendToClaude(messages, model, enhancedOptions);
      case 'gemini':
        return this.sendToGemini(messages, model, enhancedOptions);
      case 'deepseek':
        return this.sendToDeepSeek(messages, model, enhancedOptions);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // Get available MCP tools
  private getAvailableMCPTools(): Tool[] {
    const allTools = mcpService.getAllTools();
    return allTools.map(({ tool }) => ({
      ...tool,
      // Add server information to tool name for disambiguation
      name: tool.name
    }));
  }

  // Execute MCP tool call
  async executeMCPTool(toolName: string, args: Record<string, unknown>): Promise<string> {
    const allTools = mcpService.getAllTools();
    const toolInfo = allTools.find(({ tool }) => tool.name === toolName);
    
    if (!toolInfo) {
      throw new Error(`Tool ${toolName} not found`);
    }

    try {
      const result = await mcpService.callTool(toolInfo.serverId, toolName, args);
      
      // Format result for LLM
      if (result.content) {
        return Array.isArray(result.content) 
          ? result.content.map((c: any) => c.type === 'text' ? c.text : JSON.stringify(c)).join('\n')
          : typeof result.content === 'string' 
            ? result.content 
            : JSON.stringify(result.content);
      }
      
      return 'Tool executed successfully';
    } catch (error) {
      throw new Error(`Failed to execute tool ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process tool calls in conversation
  async processToolCalls(
    messages: LLMMessage[],
    response: LLMResponse,
    options: any = {}
  ): Promise<{ messages: LLMMessage[]; finalResponse?: LLMResponse }> {
    if (!response.toolCalls || response.toolCalls.length === 0) {
      return { messages };
    }

    // Add assistant message with tool calls
    const updatedMessages = [...messages, {
      role: 'assistant' as const,
      content: response.content || '',
      toolCalls: response.toolCalls
    }];

    // Execute each tool call
    for (const toolCall of response.toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await this.executeMCPTool(toolCall.function.name, args);
        
        // Add tool result message
        updatedMessages.push({
          role: 'tool' as const,
          content: result,
          toolCallId: toolCall.id
        });
      } catch (error) {
        // Add error result
        updatedMessages.push({
          role: 'tool' as const,
          content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
          toolCallId: toolCall.id
        });
      }
    }

    // Send updated conversation back to LLM for final response
    const finalResponse = await this.sendMessage(updatedMessages, options);
    
    return { 
      messages: [...updatedMessages, {
        role: 'assistant' as const,
        content: finalResponse.content
      }],
      finalResponse
    };
  }

  // OpenAI API integration
  private async sendToOpenAI(messages: LLMMessage[], model: string, options: any): Promise<LLMResponse> {
    const provider = this.config.providers.openai;
    
    // Convert messages to OpenAI format
    const openaiMessages = messages.map(m => {
      const message: any = { role: m.role, content: m.content };
      
      if (m.toolCalls) {
        message.tool_calls = m.toolCalls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: tc.function
        }));
      }
      
      if (m.toolCallId) {
        message.tool_call_id = m.toolCallId;
      }
      
      return message;
    });

    // Convert MCP tools to OpenAI format
    const tools = options.tools?.map((tool: Tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
      }
    })) || [];
    
    const requestBody: any = {
      model,
      messages: openaiMessages,
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      stream: options.stream || false
    };

    if (tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = 'auto';
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    // Handle streaming response
    if (options.stream && response.body) {
      return this.handleOpenAIStream(response, model, options);
    }

    // Handle non-streaming response
    const data = await response.json();
    const message = data.choices[0].message;
    
    return {
      content: message.content || '',
      model: data.model,
      usage: data.usage,
      toolCalls: message.tool_calls?.map((tc: any) => ({
        id: tc.id,
        type: tc.type,
        function: tc.function
      }))
    };
  }

  // Handle OpenAI streaming response
  private async handleOpenAIStream(response: Response, model: string, options: any): Promise<LLMResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let content = '';
    let usage: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta?.content) {
                content += delta.content;
                // Emit streaming chunk for real-time updates
                if (options.onChunk) {
                  options.onChunk(delta.content, false);
                }
              }
              
              if (parsed.usage) {
                usage = parsed.usage;
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
      
      // Signal completion
      if (options.onChunk) {
        options.onChunk('', true);
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content,
      model,
      usage
    };
  }

  // Claude API integration
  private async sendToClaude(messages: LLMMessage[], model: string, options: any): Promise<LLMResponse> {
    const provider = this.config.providers.claude;
    
    const requestBody = {
      model,
      messages: messages.filter(m => m.role !== 'system').map(m => ({ 
        role: m.role, 
        content: m.content 
      })),
      system: messages.find(m => m.role === 'system')?.content,
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      stream: options.stream || false
    };

    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey!,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorMessage = `Claude API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch (e) {
        // If we can't parse the error response, just use the status
      }
      throw new Error(errorMessage);
    }

    // Handle streaming response
    if (options.stream && response.body) {
      return this.handleClaudeStream(response, model, options);
    }

    // Handle non-streaming response
    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      usage: data.usage
    };
  }

  // Handle Claude streaming response
  private async handleClaudeStream(response: Response, model: string, options: any): Promise<LLMResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let content = '';
    let usage: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                content += parsed.delta.text;
                // Emit streaming chunk for real-time updates
                if (options.onChunk) {
                  options.onChunk(parsed.delta.text, false);
                }
              } else if (parsed.type === 'message_stop') {
                if (options.onChunk) {
                  options.onChunk('', true); // Signal completion
                }
              } else if (parsed.usage) {
                usage = parsed.usage;
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content,
      model,
      usage
    };
  }

  // Gemini API integration
  private async sendToGemini(messages: LLMMessage[], model: string, options: any): Promise<LLMResponse> {
    const provider = this.config.providers.gemini;
    
    const response = await fetch(`${provider.baseUrl}/models/${model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        generationConfig: {
          maxOutputTokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates[0].content.parts[0].text,
      model: model,
      usage: data.usageMetadata
    };
  }

  // DeepSeek API integration
  private async sendToDeepSeek(messages: LLMMessage[], model: string, options: any): Promise<LLMResponse> {
    const provider = this.config.providers.deepseek;
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature,
        stream: options.stream || false
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }

  // Configure provider
  setProvider(name: string, config: Partial<LLMProvider>) {
    if (this.config.providers[name]) {
      this.config.providers[name] = { ...this.config.providers[name], ...config };
    }
  }

  // Enable/disable provider
  toggleProvider(name: string, enabled: boolean) {
    if (this.config.providers[name]) {
      this.config.providers[name].isEnabled = enabled;
    }
  }

  // Get available providers
  getProviders(): Record<string, LLMProvider> {
    return { ...this.config.providers };
  }

  // Get available models for provider
  getModels(provider: string): string[] {
    return this.config.providers[provider]?.models || [];
  }

  // Get MCP connections
  getMCPConnections(): Record<string, MCPConnection> {
    return { ...this.config.mcpConnections };
  }

  // Add MCP connection
  addMCPConnection(name: string, connection: MCPConnection) {
    this.config.mcpConnections[name] = connection;
    if (!connection.disabled) {
      this.connectMCP(name, connection);
    }
  }

  // Remove MCP connection
  removeMCPConnection(name: string) {
    const client = this.mcpClients.get(name);
    if (client) {
      if (client.close) {
        client.close();
      } else if (client.stop) {
        client.stop();
      }
      this.mcpClients.delete(name);
    }
    delete this.config.mcpConnections[name];
  }

  // Send message to MCP server
  async sendMCPMessage(serverName: string, message: any) {
    const client = this.mcpClients.get(serverName);
    if (!client) {
      throw new Error(`MCP server ${serverName} not connected`);
    }

    if (client.send) {
      // WebSocket
      client.send(JSON.stringify(message));
    } else if (client.url) {
      // HTTP
      const response = await fetch(client.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      return response.json();
    }
  }


  // Cleanup
  destroy() {
    for (const [, client] of this.mcpClients) {
      if (client.close) {
        client.close();
      } else if (client.stop) {
        client.stop();
      }
    }
    this.mcpClients.clear();
  }
}

// Create singleton instance
let llmService: LLMService | null = null;

export function createLLMService(config?: Partial<LLMConfig>): LLMService {
  if (!llmService) {
    llmService = new LLMService(config);
  }
  return llmService;
}

export function getLLMService(): LLMService | null {
  return llmService;
}