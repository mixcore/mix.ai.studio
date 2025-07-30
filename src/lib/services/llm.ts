/**
 * LLM Integration Service
 * 
 * Provides unified interface for multiple LLM providers including:
 * - OpenAI (GPT-3.5, GPT-4, GPT-4o)
 * - Anthropic Claude (Claude-3.5 Sonnet, Claude-3 Haiku)  
 * - Google Gemini (Gemini Pro, Gemini Flash)
 * - DeepSeek (DeepSeek Chat, DeepSeek Coder)
 * 
 * Integrates with MCP (Model Context Protocol) Template for enhanced functionality
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
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
  sdkEndpoint?: string; // SDK client endpoint for dynamic MCP URL generation
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
      baseUrl: 'https://api.openai.com/v1',
      isEnabled: false
    },
    claude: {
      name: 'Anthropic Claude',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'claude-3-opus-20240229'],
      baseUrl: 'https://api.anthropic.com/v1',
      isEnabled: false
    },
    gemini: {
      name: 'Google Gemini',
      models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      isEnabled: false
    },
    deepseek: {
      name: 'DeepSeek',
      models: ['deepseek-chat', 'deepseek-coder'],
      baseUrl: 'https://api.deepseek.com/v1',
      isEnabled: false
    }
  },
  mcpConnections: {
    mixcore: {
      name: 'Mixcore MCP Server',
      type: 'sse',
      url: 'https://mixcore.net/mcp/sse', // Default fallback, will be updated dynamically
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
    
    // Update MCP connections with dynamic endpoint if provided
    if (config.sdkEndpoint) {
      this.updateMCPConnectionsForEndpoint(config.sdkEndpoint);
    }
    
    this.initializeMCPConnections();
  }

  // Update MCP connections to use the SDK endpoint
  private updateMCPConnectionsForEndpoint(sdkEndpoint: string) {
    try {
      const url = new URL(sdkEndpoint);
      
      // Extract base URL and transform for MCP endpoint
      let mcpUrl: string;
      
      if (url.hostname.includes('mixcore.net')) {
        // Transform mixcore.net to mixcore.net
        mcpUrl = `${url.protocol}//mixcore.net/mcp/sse`;
      } else if (url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1')) {
        // For local development, assume MCP is on a different port or path
        mcpUrl = `${url.protocol}//${url.hostname}:${url.port || '3000'}/mcp/sse`;
      } else {
        // For other domains, construct MCP URL by replacing subdomain
        const parts = url.hostname.split('.');
        if (parts.length >= 2) {
          parts[0] = 'agent'; // Replace first subdomain with 'agent'
          mcpUrl = `${url.protocol}//${parts.join('.')}/mcp/sse`;
        } else {
          // Fallback: use same domain but different path
          mcpUrl = `${url.protocol}//${url.hostname}/mcp/sse`;
        }
      }
      
      // Update the mixcore MCP connection
      if (this.config.mcpConnections.mixcore) {
        this.config.mcpConnections.mixcore.url = mcpUrl;
        console.log('🔗 Updated MCP URL:', mcpUrl);
      }
    } catch (error) {
      console.error('Failed to parse SDK endpoint for MCP URL generation:', error);
      // Fallback to default if URL parsing fails
    }
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

  // Send message to LLM
  async sendMessage(
    messages: LLMMessage[],
    options: {
      provider?: string;
      model?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    } = {}
  ): Promise<LLMResponse> {
    const provider = options.provider || this.config.defaultProvider;
    const model = options.model || this.config.defaultModel;

    const providerConfig = this.config.providers[provider];
    if (!providerConfig || !providerConfig.isEnabled) {
      throw new Error(`Provider ${provider} is not enabled`);
    }

    switch (provider) {
      case 'openai':
        return this.sendToOpenAI(messages, model, options);
      case 'claude':
        return this.sendToClaude(messages, model, options);
      case 'gemini':
        return this.sendToGemini(messages, model, options);
      case 'deepseek':
        return this.sendToDeepSeek(messages, model, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // OpenAI API integration
  private async sendToOpenAI(messages: LLMMessage[], model: string, options: any): Promise<LLMResponse> {
    const provider = this.config.providers.openai;
    
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
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }

  // Claude API integration
  private async sendToClaude(messages: LLMMessage[], model: string, options: any): Promise<LLMResponse> {
    const provider = this.config.providers.claude;
    
    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: messages.filter(m => m.role !== 'system').map(m => ({ 
          role: m.role, 
          content: m.content 
        })),
        system: messages.find(m => m.role === 'system')?.content,
        max_tokens: options.maxTokens || this.config.maxTokens,
        temperature: options.temperature || this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      usage: data.usage
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

  // Update SDK endpoint and reconnect MCP if needed
  updateSDKEndpoint(sdkEndpoint: string) {
    this.updateMCPConnectionsForEndpoint(sdkEndpoint);
    
    // Reconnect MCP connections if they were already initialized
    if (this.mcpClients.size > 0) {
      console.log('🔄 Updating MCP connections with new SDK endpoint:', sdkEndpoint);
      // Disconnect existing connections
      this.destroy();
      // Reinitialize with new endpoint
      this.initializeMCPConnections();
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
  } else if (config?.sdkEndpoint) {
    // If SDK endpoint is provided after initialization, update it
    llmService.updateSDKEndpoint(config.sdkEndpoint);
  }
  return llmService;
}

export function getLLMService(): LLMService | null {
  return llmService;
}