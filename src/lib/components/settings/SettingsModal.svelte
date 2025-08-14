<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { 
    X, 
    Save, 
    TestTube2, 
    Key, 
    Settings, 
    Brain,
    Database,
    Zap
  } from 'lucide-svelte';
  import { 
    llmService, 
    selectedLLMProvider, 
    selectedLLMModel, 
    llmSettings 
  } from '$lib/stores';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let activeTab: 'llm' | 'database' | 'mcp' = 'llm';
  let providers = llmService.getProviders();
  let mcpConnections = llmService.getMCPConnections();
  
  // LLM Settings
  let openaiApiKey = '';
  let claudeApiKey = '';
  let geminiApiKey = '';
  let deepseekApiKey = '';
  
  // Test connection status
  let testingConnection = false;
  let connectionStatus: Record<string, 'success' | 'error' | 'idle'> = {};
  
  // Auto-allow tools setting
  let autoAllowTools = llmService.getAutoAllowToolsSetting();

  function closeModal() {
    isOpen = false;
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  async function testConnection(provider: string) {
    testingConnection = true;
    connectionStatus[provider] = 'idle';
    
    try {
      // Test with a simple message
      const response = await llmService.sendMessage([
        { role: 'user', content: 'Hello, this is a test message.' }
      ], {
        provider,
        model: getDefaultModel(provider)
      });
      
      connectionStatus[provider] = 'success';
    } catch (error) {
      console.error(`Connection test failed for ${provider}:`, error);
      connectionStatus[provider] = 'error';
    } finally {
      testingConnection = false;
    }
  }

  function getDefaultModel(provider: string): string {
    const providerModels = providers[provider]?.models || [];
    return providerModels[0] || '';
  }

  function saveApiKey(provider: string, key: string) {
    llmService.setProvider(provider, { apiKey: key, isEnabled: !!key });
    providers = llmService.getProviders();
  }

  function toggleProvider(provider: string) {
    const isEnabled = !providers[provider].isEnabled;
    llmService.toggleProvider(provider, isEnabled);
    providers = llmService.getProviders();
  }

  function saveSettings() {
    // Save API keys
    if (openaiApiKey) saveApiKey('openai', openaiApiKey);
    if (claudeApiKey) saveApiKey('claude', claudeApiKey);
    if (geminiApiKey) saveApiKey('gemini', geminiApiKey);
    if (deepseekApiKey) saveApiKey('deepseek', deepseekApiKey);
    
    // Save auto-allow tools setting
    llmService.setAutoAllowTools(autoAllowTools);
    
    closeModal();
  }

  function addMCPConnection() {
    const name = prompt('Enter MCP connection name:');
    const url = prompt('Enter MCP server URL:');
    
    if (name && url) {
      llmService.addMCPConnection(name, {
        name,
        type: 'sse',
        url,
        timeout: 300,
        autoApprove: [],
        disabled: false
      });
      mcpConnections = llmService.getMCPConnections();
    }
  }

  function removeMCPConnection(name: string) {
    if (confirm(`Remove MCP connection "${name}"?`)) {
      llmService.removeMCPConnection(name);
      mcpConnections = llmService.getMCPConnections();
    }
  }
</script>

{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <Settings class="w-6 h-6" />
          Settings
        </h3>
        <button class="btn btn-ghost btn-sm btn-circle" on:click={closeModal}>
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="tabs tabs-boxed mb-6">
        <button 
          class="tab {activeTab === 'llm' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'llm'}
        >
          <Brain class="w-4 h-4 mr-2" />
          LLM Providers
        </button>
        <button 
          class="tab {activeTab === 'database' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'database'}
        >
          <Database class="w-4 h-4 mr-2" />
          Database
        </button>
        <button 
          class="tab {activeTab === 'mcp' ? 'tab-active' : ''}"
          on:click={() => activeTab = 'mcp'}
        >
          <Zap class="w-4 h-4 mr-2" />
          MCP Servers
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto">
        {#if activeTab === 'llm'}
          <!-- LLM Providers Tab -->
          <div class="space-y-6">
            <!-- Global LLM Settings -->
            <div class="card bg-base-50 border border-base-200">
              <div class="card-body">
                <h4 class="card-title text-lg">Global Settings</h4>
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Default Provider</span>
                    </label>
                    <select class="select select-bordered" bind:value={$selectedLLMProvider}>
                      {#each Object.entries(providers) as [key, provider]}
                        <option value={key} disabled={!provider.isEnabled}>
                          {provider.name}
                        </option>
                      {/each}
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Default Model</span>
                    </label>
                    <select class="select select-bordered" bind:value={$selectedLLMModel}>
                      {#each providers[$selectedLLMProvider]?.models || [] as model}
                        <option value={model}>{model}</option>
                      {/each}
                    </select>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Temperature</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      class="range range-primary" 
                      bind:value={$llmSettings.temperature}
                    />
                    <div class="text-sm text-base-content/60 mt-1">
                      {$llmSettings.temperature}
                    </div>
                  </div>
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Max Tokens</span>
                    </label>
                    <input 
                      type="number" 
                      class="input input-bordered" 
                      bind:value={$llmSettings.maxTokens}
                      min="100"
                      max="100000"
                    />
                  </div>
                </div>
                
                <!-- Tool Execution Settings -->
                <div class="mt-6 pt-6 border-t border-base-300">
                  <h5 class="font-semibold mb-4 flex items-center gap-2">
                    <Zap class="w-4 h-4" />
                    Tool Execution
                  </h5>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">
                        <span>Auto-allow tool execution (≤20 tools)</span>
                        <div class="text-xs text-base-content/60 mt-1">
                          When enabled, automatically execute up to 20 MCP tools without asking for permission
                        </div>
                      </span>
                      <input 
                        type="checkbox" 
                        class="toggle toggle-primary" 
                        bind:checked={autoAllowTools}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Provider Configuration -->
            {#each Object.entries(providers) as [key, provider]}
              <div class="card bg-base-50 border border-base-200">
                <div class="card-body">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="card-title text-lg flex items-center gap-2">
                      {provider.name}
                      <div class="badge {provider.isEnabled ? 'badge-success' : 'badge-neutral'} badge-sm">
                        {provider.isEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </h4>
                    <div class="flex items-center gap-2">
                      <button 
                        class="btn btn-outline btn-sm"
                        on:click={() => testConnection(key)}
                        disabled={testingConnection || !provider.isEnabled}
                      >
                        {#if testingConnection}
                          <span class="loading loading-spinner loading-xs"></span>
                        {:else}
                          <TestTube2 class="w-4 h-4" />
                        {/if}
                        Test
                      </button>
                      <input 
                        type="checkbox" 
                        class="toggle toggle-primary" 
                        checked={provider.isEnabled}
                        on:change={() => toggleProvider(key)}
                      />
                    </div>
                  </div>

                  {#if connectionStatus[key]}
                    <div class="alert {connectionStatus[key] === 'success' ? 'alert-success' : 'alert-error'} mb-4">
                      <span>
                        {connectionStatus[key] === 'success' 
                          ? 'Connection successful!' 
                          : 'Connection failed. Please check your API key and settings.'}
                      </span>
                    </div>
                  {/if}

                  <div class="grid grid-cols-1 gap-4">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text flex items-center gap-2">
                          <Key class="w-4 h-4" />
                          API Key
                        </span>
                      </label>
                      <input 
                        type="password" 
                        class="input input-bordered" 
                        placeholder="Enter your {provider.name} API key"
                        bind:value={key === 'openai' ? openaiApiKey : 
                                   key === 'claude' ? claudeApiKey : 
                                   key === 'gemini' ? geminiApiKey : deepseekApiKey}
                      />
                    </div>
                    
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text">Available Models</span>
                      </label>
                      <div class="flex flex-wrap gap-2">
                        {#each provider.models as model}
                          <div class="badge badge-outline">{model}</div>
                        {/each}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>

        {:else if activeTab === 'database'}
          <!-- Database Tab -->
          <div class="space-y-6">
            <div class="card bg-base-50 border border-base-200">
              <div class="card-body">
                <h4 class="card-title text-lg">Database Configuration</h4>
                <p class="text-base-content/60 mb-4">
                  Configure your MixDB connection and settings.
                </p>
                
                <div class="grid grid-cols-1 gap-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Database Endpoint</span>
                    </label>
                    <input 
                      type="url" 
                      class="input input-bordered" 
                      value="https://mixcore.net"
                      readonly
                    />
                  </div>
                  
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Auto Refresh Interval (seconds)</span>
                    </label>
                    <input 
                      type="number" 
                      class="input input-bordered" 
                      value="30"
                      min="5"
                      max="300"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">Enable Real-time Updates</span>
                      <input type="checkbox" class="toggle toggle-primary" checked />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {:else if activeTab === 'mcp'}
          <!-- MCP Servers Tab -->
          <div class="space-y-6">
            <div class="card bg-base-50 border border-base-200">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="card-title text-lg">MCP Server Connections</h4>
                  <button class="btn btn-primary btn-sm" on:click={addMCPConnection}>
                    <Zap class="w-4 h-4 mr-2" />
                    Add Connection
                  </button>
                </div>
                
                <p class="text-base-content/60 mb-4">
                  Configure Model Context Protocol (MCP) server connections for enhanced AI capabilities.
                </p>

                <div class="space-y-4">
                  {#each Object.entries(mcpConnections) as [name, connection]}
                    <div class="card bg-base-100 border border-base-300">
                      <div class="card-body">
                        <div class="flex items-center justify-between">
                          <div>
                            <h5 class="font-semibold">{connection.name}</h5>
                            <p class="text-sm text-base-content/60">{connection.url}</p>
                            <div class="flex items-center gap-2 mt-2">
                              <div class="badge badge-outline badge-sm">{connection.type.toUpperCase()}</div>
                              <div class="badge {connection.disabled ? 'badge-error' : 'badge-success'} badge-sm">
                                {connection.disabled ? 'Disabled' : 'Enabled'}
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              class="toggle toggle-primary" 
                              checked={!connection.disabled}
                              on:change={() => {
                                connection.disabled = !connection.disabled;
                                mcpConnections = { ...mcpConnections };
                              }}
                            />
                            <button 
                              class="btn btn-ghost btn-sm btn-circle text-error"
                              on:click={() => removeMCPConnection(name)}
                            >
                              <X class="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="modal-action">
        <button class="btn btn-ghost" on:click={closeModal}>Cancel</button>
        <button class="btn btn-primary" on:click={saveSettings}>
          <Save class="w-4 h-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div class="modal-backdrop" on:click={handleBackdropClick}></div>
  </div>
{/if}