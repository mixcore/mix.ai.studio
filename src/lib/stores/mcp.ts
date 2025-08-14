import { writable, derived, get } from 'svelte/store';
import { mcpService, type MCPServerConfig, type MCPServerConnection, MCP_SERVER_TEMPLATES } from '$lib/services/mcp';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// Store for server configurations
export const mcpServers = writable<MCPServerConfig[]>([]);

// Store for connection states
export const mcpConnections = writable<MCPServerConnection[]>([]);

// Store for all available tools
export const mcpTools = derived(
	mcpConnections,
	($connections) => {
		const allTools: Array<{ serverId: string; serverName: string; tool: Tool }> = [];
		for (const connection of $connections) {
			if (connection.connected) {
				for (const tool of connection.tools) {
					allTools.push({
						serverId: connection.config.id,
						serverName: connection.config.name,
						tool
					});
				}
			}
		}
		return allTools;
	}
);

// Store for loading states
export const mcpLoading = writable<Record<string, boolean>>({});

// Store for server templates
export const mcpTemplates = writable(MCP_SERVER_TEMPLATES);

// Actions for managing MCP servers
export const mcpActions = {
	/**
	 * Add a new MCP server configuration
	 */
	async addServer(config: Omit<MCPServerConfig, 'id'>): Promise<void> {
		const newServer: MCPServerConfig = {
			...config,
			id: `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		};

		// Add to configurations
		mcpServers.update(servers => [...servers, newServer]);

		// Try to connect if enabled
		if (newServer.enabled) {
			await mcpActions.connectServer(newServer.id);
		}

		// Save to localStorage
		mcpActions.saveToStorage();
	},

	/**
	 * Update an existing server configuration
	 */
	async updateServer(serverId: string, updates: Partial<MCPServerConfig>): Promise<void> {
		mcpServers.update(servers =>
			servers.map(server =>
				server.id === serverId ? { ...server, ...updates } : server
			)
		);

		// If server was disabled, disconnect it
		if (updates.enabled === false) {
			await mcpActions.disconnectServer(serverId);
		}
		// If server was enabled, connect it
		else if (updates.enabled === true) {
			await mcpActions.connectServer(serverId);
		}

		mcpActions.saveToStorage();
	},

	/**
	 * Remove a server configuration
	 */
	async removeServer(serverId: string): Promise<void> {
		// Disconnect first
		await mcpActions.disconnectServer(serverId);

		// Remove from configurations
		mcpServers.update(servers => servers.filter(server => server.id !== serverId));

		mcpActions.saveToStorage();
	},

	/**
	 * Connect to a server
	 */
	async connectServer(serverId: string): Promise<void> {
		const servers = get(mcpServers);
		const serverConfig = servers.find(s => s.id === serverId);

		if (!serverConfig) {
			throw new Error(`Server configuration not found: ${serverId}`);
		}

		// Set loading state
		mcpLoading.update(loading => ({ ...loading, [serverId]: true }));

		try {
			await mcpService.connectServer(serverConfig);
			mcpActions.refreshConnections();
		} catch (error) {
			console.error(`Failed to connect to server ${serverId}:`, error);
			throw error;
		} finally {
			// Clear loading state
			mcpLoading.update(loading => ({ ...loading, [serverId]: false }));
		}
	},

	/**
	 * Disconnect from a server
	 */
	async disconnectServer(serverId: string): Promise<void> {
		mcpLoading.update(loading => ({ ...loading, [serverId]: true }));

		try {
			await mcpService.disconnectServer(serverId);
			mcpActions.refreshConnections();
		} catch (error) {
			console.error(`Failed to disconnect from server ${serverId}:`, error);
		} finally {
			mcpLoading.update(loading => ({ ...loading, [serverId]: false }));
		}
	},

	/**
	 * Call a tool on a specific server
	 */
	async callTool(serverId: string, toolName: string, args: Record<string, unknown> = {}) {
		try {
			const result = await mcpService.callTool(serverId, toolName, args);
			return result;
		} catch (error) {
			// Refresh connections on error to update UI state
			mcpActions.refreshConnections();
			throw error;
		}
	},

	/**
	 * Refresh server tools
	 */
	async refreshServerTools(serverId: string): Promise<void> {
		mcpLoading.update(loading => ({ ...loading, [serverId]: true }));

		try {
			await mcpService.refreshServerTools(serverId);
			mcpActions.refreshConnections();
		} catch (error) {
			console.error(`Failed to refresh tools for server ${serverId}:`, error);
			throw error;
		} finally {
			mcpLoading.update(loading => ({ ...loading, [serverId]: false }));
		}
	},

	/**
	 * Refresh connection states from service
	 */
	refreshConnections(): void {
		const connections = mcpService.getAllServers();
		mcpConnections.set(connections);
	},

	/**
	 * Install a server from template
	 */
	async installTemplate(template: typeof MCP_SERVER_TEMPLATES[0]): Promise<void> {
		const config: Omit<MCPServerConfig, 'id'> = {
			...template,
			enabled: true
		};

		await mcpActions.addServer(config);
	},

	/**
	 * Save configurations to localStorage
	 */
	saveToStorage(): void {
		if (typeof localStorage !== 'undefined') {
			const servers = get(mcpServers);
			localStorage.setItem('mcp-servers', JSON.stringify(servers));
		}
	},

	/**
	 * Load configurations from localStorage
	 */
	loadFromStorage(): void {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('mcp-servers');
			if (stored) {
				try {
					const servers = JSON.parse(stored) as MCPServerConfig[];
					mcpServers.set(servers);
				} catch (error) {
					console.error('Failed to load MCP servers from storage:', error);
				}
			}
		}
	},

	/**
	 * Initialize MCP store and auto-connect enabled servers
	 */
	async initialize(): Promise<void> {
		// Load from storage
		mcpActions.loadFromStorage();

		// Set up event listeners
		mcpService.addEventListener('serverConnected', () => {
			mcpActions.refreshConnections();
		});

		mcpService.addEventListener('serverDisconnected', () => {
			mcpActions.refreshConnections();
		});

		mcpService.addEventListener('serverError', () => {
			mcpActions.refreshConnections();
		});

		mcpService.addEventListener('serverToolsUpdated', () => {
			mcpActions.refreshConnections();
		});

		// Auto-connect enabled servers
		const servers = get(mcpServers);
		for (const server of servers) {
			if (server.enabled) {
				try {
					await mcpActions.connectServer(server.id);
				} catch (error) {
					console.error(`Failed to auto-connect to server ${server.name}:`, error);
				}
			}
		}
	}
};

// Initialize on import (browser only)
if (typeof window !== 'undefined') {
	mcpActions.initialize().catch(console.error);
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', () => {
		mcpService.disconnectAll().catch(console.error);
	});
}