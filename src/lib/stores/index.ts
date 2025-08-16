import { writable, derived, get } from 'svelte/store';
import type { Workspace } from '$lib/types';
import { mixcoreService, type User, type Project, type ChatMessage } from '$lib/services/mixcore';
// Re-export for external access
export { mixcoreService };
import { createLLMService, LLMService, type LLMProvider } from '$lib/services/llm';
import { createDatabaseService, type TableInfo, type DatabaseStats } from '$lib/services/database';
// Initialize services
// Initialize services
// Note: The real SDK client is now handled through mixcoreService
// Create a safe stub during server-side rendering so module imports don't
// instantiate browser-only logic (EventSource, localStorage, document, etc.).
let _llmService: LLMService | null = null;
if (typeof window !== 'undefined') {
  // In the browser, create the real service which may use DOM APIs.
  _llmService = createLLMService();
} else {
  // SSR: provide a minimal stub that implements the commonly used public
  // methods so imports and template rendering won't crash. Methods that
  // require runtime behavior will throw if called on the server.
  const stub: Partial<LLMService> = {
    getProviders: () => ({} as Record<string, LLMProvider>),
    getModels: (_provider: string) => [] as string[],
    getMCPConnections: () => ({}),
    getAutoAllowToolsSetting: () => false,
    onTemplateOperation: (_cb: any) => {
      return () => {};
    },
    setProvider: (_name: string, _config: Partial<LLMProvider>) => {},
    toggleProvider: (_name: string, _enabled: boolean) => {},
    setAutoAllowTools: (_enabled: boolean) => {},
    addMCPConnection: (_name: string, _conn: any) => {},
    removeMCPConnection: (_name: string) => {},
    // Async operations that should not run during SSR will throw if invoked.
    sendMessage: async () => { throw new Error('LLMService unavailable during server-side rendering'); },
    processToolCalls: async () => { throw new Error('LLMService unavailable during server-side rendering'); },
    executeMCPTool: async () => { throw new Error('LLMService unavailable during server-side rendering'); }
  };

  _llmService = stub as unknown as LLMService;
}

export const llmService = _llmService as LLMService;
export const databaseService = createDatabaseService();

export const user = writable<User | null>(null);
export const currentProject = writable<Project | null>(null);
export const workspace = writable<Workspace | null>(null);

// Auth-related stores
export const tokenExpiry = writable<Date | null>(null);
export const refreshInProgress = writable(false);
export const authError = writable<string | null>(null);

export const chatMessages = writable<ChatMessage[]>([]);
export const chatLoading = writable(false);
export const chatMode = writable<'default' | 'chat-only' | 'agent'>('default');
export const llmMode = writable<'mixcore' | 'external'>('mixcore');
export const chatInput = writable('');

// Streaming chat state
export const chatStreaming = writable(false);
export const chatStreamingMessage = writable('');
export const chatStreamingMessageId = writable<string | null>(null);

// LLM Integration
export const llmProviders = writable<Record<string, LLMProvider>>({});
export const selectedLLMProvider = writable<string>('openai');
export const selectedLLMModel = writable<string>('gpt-3.5-turbo');
export const llmSettings = writable({
  temperature: 0.7,
  maxTokens: 4000,
  enableMCP: true
});

// Database Integration
export const databaseTables = writable<TableInfo[]>([]);
export const databaseStats = writable<DatabaseStats | null>(null);
export const selectedTable = writable<TableInfo | null>(null);
export const databaseLoading = writable(false);

// New type for LLM Model (legacy compatibility)
export type LLMModel = {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Groq' | 'DeepSeek' | 'Mistral' | 'Mixcore';
};

// List of available models (legacy compatibility)
export const availableModels: LLMModel[] = [
  { id: 'gpt-4o', name: 'ChatGPT 4o', provider: 'OpenAI' },
  { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', provider: 'Anthropic' },
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'Anthropic' },
  { id: 'claude-3-7-sonnet-20250219', name: 'Claude Sonnet 3.7', provider: 'Anthropic' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' },
  { id: 'mixcore-streaming', name: 'Mixcore Streaming API', provider: 'Mixcore' }
];;;;
export const selectedModel = writable<LLMModel>(availableModels.find(m => m.provider === 'Mixcore') || availableModels[0]);;

export const previewUrl = writable('');
export const previewLoading = writable(false);
export const showCodeView = writable(false);
export const viewMode = writable<'preview' | 'database' | 'agent' | 'vscode'>('preview');

// Template update tracking for iframe refresh
export const templateUpdateTrigger = writable(0);
export const shouldRefreshPreview = writable(false);

export const showSettingsModal = writable(false);
export const showInviteModal = writable(false);
export const showPublishModal = writable(false);
export const showChatPanel = writable(true);
export const deviceMode = writable<'desktop' | 'tablet' | 'mobile' | 'responsive'>('responsive');

// Mixcore integration stores
export const mixcoreConnected = writable(false);
export const projects = writable<Project[]>([]);

// Derived stores
export const isAuthenticated = derived(user, ($user) => !!$user);
export const hasProjects = derived(projects, ($projects) => $projects.length > 0);

// Auth status derived stores
export const isTokenExpiring = derived(tokenExpiry, ($tokenExpiry) => {
  if (!$tokenExpiry) return false;
  const now = new Date();
  const timeUntilExpiry = $tokenExpiry.getTime() - now.getTime();
  return timeUntilExpiry <= 10 * 60 * 1000 && timeUntilExpiry > 0; // Expires in next 10 minutes
});

export const authStatus = derived(
  [user, refreshInProgress, authError, isTokenExpiring],
  ([$user, $refreshInProgress, $authError, $isTokenExpiring]) => ({
    isAuthenticated: !!$user,
    isRefreshing: $refreshInProgress,
    hasError: !!$authError,
    error: $authError,
    isTokenExpiring: $isTokenExpiring,
    user: $user
  })
);

// Store actions for Mixcore integration
export const userActions = {
  async login(email: string, password: string) {
    try {
      authError.set(null);
      const mixcoreUser = await mixcoreService.login(email, password);
      if (mixcoreUser) {
        console.log('✅ User logged in:', mixcoreUser);
        user.set(mixcoreUser);
        mixcoreConnected.set(true);
        
        // Set token expiry (typically 1 hour from now)
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        tokenExpiry.set(expiry);
        localStorage.setItem('mixcore_token_expiry', expiry.toISOString());
        
        // Start token refresh monitoring
        this.startTokenRefreshMonitoring();
        
        // Load projects after successful login
        try {
          await projectActions.loadProjects();
        } catch (projectError) {
          console.warn('Failed to load projects after login:', projectError);
        }
        
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login failed:', error);
      authError.set(error instanceof Error ? error.message : 'Login failed');
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  },

  async logout() {
    this.stopTokenRefreshMonitoring();
    await mixcoreService.logout();
    user.set(null);
    currentProject.set(null);
    projects.set([]);
    chatMessages.set([]);
    mixcoreConnected.set(false);
    tokenExpiry.set(null);
    refreshInProgress.set(false);
    authError.set(null);
    localStorage.removeItem('mixcore_token_expiry');
  },

  async refreshToken(): Promise<boolean> {
    if (get(refreshInProgress)) {
      return false; // Already refreshing
    }
    
    try {
      refreshInProgress.set(true);
      authError.set(null);
      
      const refreshed = await mixcoreService.refreshAuthToken();
      
      if (refreshed) {
        // Update token expiry
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        tokenExpiry.set(expiry);
        localStorage.setItem('mixcore_token_expiry', expiry.toISOString());
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.warn('❌ Token refresh failed - logging out');
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      authError.set('Session expired - please log in again');
      await this.logout();
      return false;
    } finally {
      refreshInProgress.set(false);
    }
  },

  // Token refresh monitoring
  refreshInterval: null as any,
  
  startTokenRefreshMonitoring() {
    this.stopTokenRefreshMonitoring();
    
    // Check every 5 minutes
    this.refreshInterval = setInterval(() => {
      const expiry = get(tokenExpiry);
      if (!expiry) return;
      
      const now = new Date();
      const timeUntilExpiry = expiry.getTime() - now.getTime();
      
      // Refresh if token expires in the next 10 minutes
      if (timeUntilExpiry <= 10 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('🔄 Token expiring soon, refreshing...');
        this.refreshToken();
      } else if (timeUntilExpiry <= 0) {
        console.warn('⚠️ Token expired, logging out');
        this.logout();
      }
    }, 5 * 60 * 1000);
  },
  
  stopTokenRefreshMonitoring() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  },

  async initialize(retries = 3, delay = 1000) {
    try {
      const initialized = await mixcoreService.initialize();
      if (initialized) {
        const currentUser = mixcoreService.currentUser;
        if (currentUser) {
          user.set(currentUser);
          mixcoreConnected.set(true);
          
          // Restore token expiry if available
          const storedExpiry = localStorage.getItem('mixcore_token_expiry');
          if (storedExpiry) {
            tokenExpiry.set(new Date(storedExpiry));
          }
          
          // Start token refresh monitoring
          this.startTokenRefreshMonitoring();
          
          console.log('✅ Auth state restored from storage');
          
          // Try to load projects, but don't fail if it errors
          try {
            await projectActions.loadProjects();
          } catch (projectError) {
            console.warn('Failed to load projects during initialization:', projectError);
          }
        }
      }
      return initialized;
    } catch (error) {
      console.error('Initialization error:', error);
      
      // Retry logic for network issues
      if (retries > 0 && (error as any)?.statusCode >= 500) {
        console.log(`⏳ Retrying authentication initialization in ${delay}ms... (${retries} retries left)`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            const result = await this.initialize(retries - 1, delay * 2);
            resolve(result);
          }, delay);
        });
      }
      
      // Reset to safe state on permanent failure
      user.set(null);
      mixcoreConnected.set(false);
      tokenExpiry.set(null);
      authError.set(null);
      return false;
    }
  }
};

export const projectActions = {
  async loadProjects() {
    try {
      const projectList = await mixcoreService.getProjects();
      projects.set(projectList);
      return projectList;
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  },

  async createProject(projectData: { name: string; description?: string }) {
    try {
      const newProject = await mixcoreService.createProject({
        ...projectData,
        status: 'active' as const
      });
      
      if (newProject) {
        projects.update(list => [...list, newProject]);
        currentProject.set(newProject);
        return newProject;
      }
      return null;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  },

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      const updatedProject = await mixcoreService.updateProject(id, updates);
      if (updatedProject) {
        projects.update(list => 
          list.map(p => p.id === id ? updatedProject : p)
        );
        
        // Update current project if it's the one being updated
        currentProject.update(current => 
          current?.id === id ? updatedProject : current
        );
        
        return updatedProject;
      }
      return null;
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  },

  async deleteProject(id: string) {
    try {
      const success = await mixcoreService.deleteProject(id);
      if (success) {
        projects.update(list => list.filter(p => p.id !== id));
        
        // Clear current project if it's the one being deleted
        currentProject.update(current => 
          current?.id === id ? null : current
        );
      }
      return success;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  },

  async selectProject(id: string) {
    try {
      const project = await mixcoreService.getProject(id);
      if (project) {
        currentProject.set(project);
        // Load chat messages for this project
        await chatActions.loadMessages(id);
        return project;
      }
      return null;
    } catch (error) {
      console.error('Failed to select project:', error);
      return null;
    }
  }
};

export const chatActions = {
  async loadMessages(projectId?: string) {
    try {
      const messages = await mixcoreService.getChatMessages(projectId);
      chatMessages.set(messages);
      return messages;
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      return [];
    }
  },

  async sendMessage(content: string, role: 'user' | 'assistant' = 'user') {
    try {
      chatLoading.set(true);
      
      const currentProjectId = getCurrentProjectId();
      const currentModel = get(selectedModel);
      const message = await mixcoreService.createChatMessage({
        content,
        role,
        projectId: currentProjectId,
        metadata: { model: currentModel.id }
      });
      
      if (message) {
        chatMessages.update(messages => [...messages, message]);
        return message;
      }
      return null;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    } finally {
      chatLoading.set(false);
    }
  },

  async deleteMessage(id: string) {
    try {
      const success = await mixcoreService.deleteChatMessage(id);
      if (success) {
        chatMessages.update(messages => messages.filter(m => m.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  },

  clearMessages() {
    chatMessages.set([]);
  }
};

// Helper function to get current project ID
function getCurrentProjectId(): string | undefined {
  return get(currentProject)?.id;
}