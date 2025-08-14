import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import type { Tool, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

export type MCPServerType = 'sse' | 'websocket';

export interface MCPServerConfig {
	id: string;
	name: string;
	type: MCPServerType;
	url: string; // For SSE/WebSocket servers
	enabled: boolean;
}

export interface MCPServerConnection {
	config: MCPServerConfig;
	client: Client;
	transport: Transport;
	tools: Tool[];
	connected: boolean;
	error?: string;
}

export class MCPService {
	private connections = new Map<string, MCPServerConnection>();
	private eventTarget = new EventTarget();

	constructor() {
		// Initialize with empty connections
	}

	/**
	 * Connect to an MCP server
	 */
	async connectServer(config: MCPServerConfig): Promise<void> {
		if (this.connections.has(config.id)) {
			await this.disconnectServer(config.id);
		}

		const client = new Client(
			{
				name: 'mixcore-ai-studio',
				version: '1.0.0'
			},
			{
				capabilities: {
					sampling: {}
				}
			}
		);

		let transport: Transport;

		try {
			// Create transport based on server type
			switch (config.type) {
				case 'sse':
					transport = new SSEClientTransport(new URL(config.url));
					break;

				case 'websocket':
					transport = new WebSocketClientTransport(new URL(config.url));
					break;

				default:
					throw new Error(`Unsupported server type: ${config.type}`);
			}

			// Connect to the server
			await client.connect(transport);

			// Get available tools
			const toolsResult: ListToolsResult = await client.listTools();
			const tools = toolsResult.tools || [];

			// Store the connection
			const connection: MCPServerConnection = {
				config,
				client,
				transport,
				tools,
				connected: true
			};

			this.connections.set(config.id, connection);

			// Emit connection event
			this.eventTarget.dispatchEvent(
				new CustomEvent('serverConnected', {
					detail: { serverId: config.id, tools }
				})
			);

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			
			// Store failed connection for UI feedback
			const connection: MCPServerConnection = {
				config,
				client,
				transport: transport!,
				tools: [],
				connected: false,
				error: errorMessage
			};

			this.connections.set(config.id, connection);

			// Emit error event
			this.eventTarget.dispatchEvent(
				new CustomEvent('serverError', {
					detail: { serverId: config.id, error: errorMessage }
				})
			);

			throw error;
		}
	}

	/**
	 * Disconnect from an MCP server
	 */
	async disconnectServer(serverId: string): Promise<void> {
		const connection = this.connections.get(serverId);
		if (!connection) {
			return;
		}

		try {
			await connection.client.close();
		} catch (error) {
			console.warn(`Error closing connection to server ${serverId}:`, error);
		}

		this.connections.delete(serverId);

		// Emit disconnection event
		this.eventTarget.dispatchEvent(
			new CustomEvent('serverDisconnected', {
				detail: { serverId }
			})
		);
	}

	/**
	 * Call a tool on a specific server
	 */
	async callTool(serverId: string, toolName: string, args: Record<string, unknown> = {}): Promise<any> {
		const connection = this.connections.get(serverId);
		if (!connection || !connection.connected) {
			throw new Error(`Server ${serverId} is not connected`);
		}

		try {
			const result = await connection.client.callTool({
				name: toolName,
				arguments: args
			});

			return result;
		} catch (error) {
			// Update connection status on error
			connection.connected = false;
			connection.error = error instanceof Error ? error.message : 'Tool call failed';

			// Emit error event
			this.eventTarget.dispatchEvent(
				new CustomEvent('serverError', {
					detail: { serverId, error: connection.error }
				})
			);

			throw error;
		}
	}

	/**
	 * Get all available tools from all connected servers
	 */
	getAllTools(): Array<{ serverId: string; serverName: string; tool: Tool }> {
		const allTools: Array<{ serverId: string; serverName: string; tool: Tool }> = [];

		for (const [serverId, connection] of this.connections) {
			if (connection.connected) {
				for (const tool of connection.tools) {
					allTools.push({
						serverId,
						serverName: connection.config.name,
						tool
					});
				}
			}
		}

		return allTools;
	}

	/**
	 * Get connection status for a server
	 */
	getServerStatus(serverId: string): { connected: boolean; error?: string } | null {
		const connection = this.connections.get(serverId);
		if (!connection) {
			return null;
		}

		return {
			connected: connection.connected,
			error: connection.error
		};
	}

	/**
	 * Get all server connections
	 */
	getAllServers(): MCPServerConnection[] {
		return Array.from(this.connections.values());
	}

	/**
	 * Add event listener for MCP events
	 */
	addEventListener(type: string, listener: EventListener): void {
		this.eventTarget.addEventListener(type, listener);
	}

	/**
	 * Remove event listener
	 */
	removeEventListener(type: string, listener: EventListener): void {
		this.eventTarget.removeEventListener(type, listener);
	}

	/**
	 * Refresh tools for a server (useful after server restart)
	 */
	async refreshServerTools(serverId: string): Promise<void> {
		const connection = this.connections.get(serverId);
		if (!connection || !connection.connected) {
			throw new Error(`Server ${serverId} is not connected`);
		}

		try {
			const toolsResult: ListToolsResult = await connection.client.listTools();
			connection.tools = toolsResult.tools || [];

			// Emit tools updated event
			this.eventTarget.dispatchEvent(
				new CustomEvent('serverToolsUpdated', {
					detail: { serverId, tools: connection.tools }
				})
			);
		} catch (error) {
			connection.connected = false;
			connection.error = error instanceof Error ? error.message : 'Failed to refresh tools';

			// Emit error event
			this.eventTarget.dispatchEvent(
				new CustomEvent('serverError', {
					detail: { serverId, error: connection.error }
				})
			);

			throw error;
		}
	}

	/**
	 * Disconnect all servers (cleanup)
	 */
	async disconnectAll(): Promise<void> {
		const serverIds = Array.from(this.connections.keys());
		await Promise.allSettled(
			serverIds.map(serverId => this.disconnectServer(serverId))
		);
	}
}

// Create singleton instance
export const mcpService = new MCPService();

// Popular MCP server templates
export const MCP_SERVER_TEMPLATES: Omit<MCPServerConfig, 'id' | 'enabled'>[] = [
	{
		name: 'Mixcore Platform',
		type: 'sse',
		url: 'https://mixcore.net/mcp/sse',
	},
	{
		name: 'Filesystem Server',
		type: 'sse',
		url: 'https://filesystem-mcp.example.com/sse',
	},
	{
		name: 'Git Server',
		type: 'sse',
		url: 'https://git-mcp.example.com/sse'
	},
	{
		name: 'Database Server',
		type: 'sse',
		url: 'https://database-mcp.example.com/sse'
	},
	{
		name: 'Web Search Server',
		type: 'sse',
		url: 'https://search-mcp.example.com/sse'
	}
];