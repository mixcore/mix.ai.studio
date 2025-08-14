<script lang="ts">
	import { Plus, Trash2, Settings, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-svelte';
	import { mcpServers, mcpConnections, mcpLoading, mcpTemplates, mcpActions } from '$lib/stores/mcp';
	import type { MCPServerConfig } from '$lib/services/mcp';

	let showAddForm = false;
	let newServerForm = {
		name: '',
		type: 'sse' as 'sse' | 'websocket',
		url: '',
		enabled: true
	};

	function resetForm() {
		newServerForm = {
			name: '',
			type: 'sse',
			url: '',
			enabled: true
		};
		showAddForm = false;
	}

	async function handleAddServer() {
		try {
			const config: Omit<MCPServerConfig, 'id'> = {
				name: newServerForm.name,
				type: newServerForm.type,
				url: newServerForm.url,
				enabled: newServerForm.enabled
			};

			await mcpActions.addServer(config);
			resetForm();
		} catch (error) {
			console.error('Failed to add server:', error);
			alert('Failed to add server: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}

	async function handleRemoveServer(serverId: string) {
		if (confirm('Are you sure you want to remove this server?')) {
			try {
				await mcpActions.removeServer(serverId);
			} catch (error) {
				console.error('Failed to remove server:', error);
				alert('Failed to remove server: ' + (error instanceof Error ? error.message : 'Unknown error'));
			}
		}
	}

	async function handleToggleServer(serverId: string, enabled: boolean) {
		try {
			await mcpActions.updateServer(serverId, { enabled });
		} catch (error) {
			console.error('Failed to toggle server:', error);
			alert('Failed to toggle server: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}

	async function handleRefreshTools(serverId: string) {
		try {
			await mcpActions.refreshServerTools(serverId);
		} catch (error) {
			console.error('Failed to refresh tools:', error);
			alert('Failed to refresh tools: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}

	async function handleInstallTemplate(template: any) {
		try {
			await mcpActions.installTemplate(template);
		} catch (error) {
			console.error('Failed to install template:', error);
			alert('Failed to install template: ' + (error instanceof Error ? error.message : 'Unknown error'));
		}
	}

	function getServerConnection(serverId: string) {
		return $mcpConnections.find(conn => conn.config.id === serverId);
	}

	function getServerStatus(serverId: string) {
		const connection = getServerConnection(serverId);
		if (!connection) return 'disconnected';
		if (connection.connected) return 'connected';
		if (connection.error) return 'error';
		return 'disconnected';
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'connected': return 'bg-success';
			case 'error': return 'bg-error';
			default: return 'bg-base-300';
		}
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'connected': return 'badge-success';
			case 'error': return 'badge-error';
			default: return 'badge-neutral';
		}
	}
</script>

<div class="space-y-6">
	<!-- Add New Server -->
	<div class="card bg-base-100 shadow-sm border border-base-200">
		<div class="card-body p-6">
			<div class="flex items-center justify-between mb-4">
				<h4 class="card-title text-base">Add New MCP Server</h4>
				<button 
					class="btn btn-primary btn-sm"
					on:click={() => showAddForm = !showAddForm}
				>
					<Plus class="w-4 h-4" />
					{showAddForm ? 'Cancel' : 'Add Server'}
				</button>
			</div>
			
			{#if showAddForm}
				<form on:submit|preventDefault={handleAddServer} class="space-y-4">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="form-control">
							<label for="server-name" class="label">
								<span class="label-text">Server Name</span>
							</label>
							<input 
								id="server-name"
								type="text" 
								placeholder="e.g., filesystem-server" 
								class="input input-bordered" 
								bind:value={newServerForm.name}
								required
							/>
						</div>
						<div class="form-control">
							<label for="server-type" class="label">
								<span class="label-text">Server Type</span>
							</label>
							<select id="server-type" class="select select-bordered" bind:value={newServerForm.type}>
								<option value="sse">Server-Sent Events (SSE)</option>
								<option value="websocket">WebSocket</option>
							</select>
						</div>
					</div>
					
					<div class="form-control">
						<label for="server-url" class="label">
							<span class="label-text">URL</span>
						</label>
						<input 
							id="server-url"
							type="url" 
							placeholder="e.g., wss://example.com/mcp or https://example.com/mcp/sse" 
							class="input input-bordered" 
							bind:value={newServerForm.url}
							required
						/>
					</div>
					
					<div class="form-control">
						<label class="label cursor-pointer">
							<span class="label-text">Enable server</span>
							<input type="checkbox" class="toggle toggle-primary" bind:checked={newServerForm.enabled} />
						</label>
					</div>
					
					<div class="card-actions justify-end">
						<button type="button" class="btn btn-ghost" on:click={resetForm}>Cancel</button>
						<button type="submit" class="btn btn-primary">Add Server</button>
					</div>
				</form>
			{/if}
		</div>
	</div>

	<!-- Connected Servers -->
	{#if $mcpServers.length > 0}
		<div>
			<h4 class="text-base font-medium mb-4">Configured Servers</h4>
			<div class="space-y-3">
				{#each $mcpServers as server (server.id)}
					{@const connection = getServerConnection(server.id)}
					{@const status = getServerStatus(server.id)}
					{@const loading = $mcpLoading[server.id] || false}
					
					<div class="card bg-base-100 shadow-sm border border-base-200">
						<div class="card-body p-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="w-3 h-3 rounded-full {getStatusColor(status)}"></div>
									<div>
										<div class="font-medium">{server.name}</div>
										<div class="text-sm text-base-content/60">
											{server.url}
										</div>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<div class="badge {getStatusBadge(status)} badge-sm">
										{#if loading}
											<span class="loading loading-spinner loading-xs mr-1"></span>
										{:else if status === 'connected'}
											<CheckCircle class="w-3 h-3 mr-1" />
										{:else if status === 'error'}
											<XCircle class="w-3 h-3 mr-1" />
										{:else}
											<AlertCircle class="w-3 h-3 mr-1" />
										{/if}
										{status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Disconnected'}
									</div>
									
									<div class="form-control">
										<input 
											type="checkbox" 
											class="toggle toggle-primary toggle-sm" 
											checked={server.enabled}
											disabled={loading}
											on:change={(e) => handleToggleServer(server.id, e.currentTarget.checked)}
										/>
									</div>
									
									<div class="dropdown dropdown-end">
										<button class="btn btn-ghost btn-sm" disabled={loading}>
											<Settings class="w-4 h-4" />
										</button>
										<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
											<li>
												<button 
													on:click={() => handleRefreshTools(server.id)}
													disabled={!connection?.connected}
												>
													<RefreshCw class="w-4 h-4" />
													Refresh Tools
												</button>
											</li>
											<li>
												<button 
													class="text-error"
													on:click={() => handleRemoveServer(server.id)}
												>
													<Trash2 class="w-4 h-4" />
													Remove
												</button>
											</li>
										</ul>
									</div>
								</div>
							</div>
							
							{#if connection?.error}
								<div class="mt-3 pt-3 border-t border-base-200">
									<div class="text-sm text-error">
										<XCircle class="w-4 h-4 inline mr-1" />
										{connection.error}
									</div>
								</div>
							{:else if connection && connection.tools && connection.tools.length > 0}
								<div class="mt-3 pt-3 border-t border-base-200">
									<div class="flex flex-wrap gap-2">
										{#each connection.tools as tool}
											<div class="badge badge-outline badge-sm">{tool.name}</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Popular MCP Servers -->
	<div>
		<h4 class="text-base font-medium mb-4">Popular MCP Servers</h4>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each $mcpTemplates as template}
				<div class="card bg-base-100 shadow-sm border border-base-200">
					<div class="card-body p-4">
						<div class="flex items-start justify-between mb-3">
							<div>
								<h5 class="font-medium">{template.name}</h5>
								<p class="text-sm text-base-content/60 mt-1">
									{#if template.name.includes('Mixcore')}
										Access Mixcore platform tools and services
									{:else if template.name.includes('Filesystem')}
										Read and write files on your system
									{:else if template.name.includes('Git')}
										Interact with Git repositories
									{:else if template.name.includes('Database')}
										Query SQL databases
									{:else if template.name.includes('Web Search')}
										Search the web for information
									{:else}
										MCP Server
									{/if}
								</p>
							</div>
							<button 
								class="btn btn-primary btn-sm"
								on:click={() => handleInstallTemplate(template)}
							>
								<Plus class="w-4 h-4" />
								Install
							</button>
						</div>
						<div class="flex flex-wrap gap-1">
							{#if template.name.includes('Mixcore')}
								<div class="badge badge-outline badge-xs">database_query</div>
								<div class="badge badge-outline badge-xs">file_storage</div>
								<div class="badge badge-outline badge-xs">user_auth</div>
								<div class="badge badge-outline badge-xs">api_proxy</div>
							{:else if template.name.includes('Filesystem')}
								<div class="badge badge-outline badge-xs">read_file</div>
								<div class="badge badge-outline badge-xs">write_file</div>
								<div class="badge badge-outline badge-xs">list_directory</div>
							{:else if template.name.includes('Git')}
								<div class="badge badge-outline badge-xs">git_status</div>
								<div class="badge badge-outline badge-xs">git_commit</div>
								<div class="badge badge-outline badge-xs">git_log</div>
							{:else if template.name.includes('Database')}
								<div class="badge badge-outline badge-xs">execute_query</div>
								<div class="badge badge-outline badge-xs">list_tables</div>
								<div class="badge badge-outline badge-xs">describe_table</div>
							{:else if template.name.includes('Web Search')}
								<div class="badge badge-outline badge-xs">web_search</div>
								<div class="badge badge-outline badge-xs">fetch_page</div>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>