import { writable, derived, get } from 'svelte/store';
import type { Workspace } from '$lib/types';
import { mixcoreService, type User, type Project, type ChatMessage } from '$lib/services/mixcore';
// Re-export for external access
export { mixcoreService };
import { createLLMService, type LLMProvider } from '$lib/services/llm';
import { createDatabaseService, type TableInfo, type DatabaseStats } from '$lib/services/database';
import { initializeSDK } from '$lib/sdk/client';

// Initialize services
export const sdkClient = initializeSDK();
export const llmService = createLLMService({
  sdkEndpoint: sdkClient.getConfig().endpoint
});
export const databaseService = createDatabaseService();

export const user = writable<User | null>(null);
export const currentProject = writable<Project | null>(null);
export const workspace = writable<Workspace | null>(null);

export const chatMessages = writable<ChatMessage[]>([]);
export const chatLoading = writable(false);
export const chatMode = writable<'default' | 'chat-only' | 'agent'>('default');
export const chatInput = writable('');

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
	provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Groq' | 'DeepSeek' | 'Mistral';
};

// List of available models (legacy compatibility)
export const availableModels: LLMModel[] = [
	{ id: 'gpt-4o', name: 'ChatGPT 4o', provider: 'OpenAI' },
	{ id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
	{ id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' },
	{ id: 'llama3-8b', name: 'LLaMA3 8B', provider: 'Groq' }
];
export const selectedModel = writable<LLMModel>(availableModels[0]);

export const previewUrl = writable('');
export const previewLoading = writable(false);
export const showCodeView = writable(false);
export const viewMode = writable<'preview' | 'database' | 'agent' | 'vscode'>('preview');

export const showSettingsModal = writable(false);
export const showInviteModal = writable(false);
export const showPublishModal = writable(false);
export const showChatPanel = writable(true);
export const deviceMode = writable<'desktop' | 'tablet' | 'mobile'>('desktop');

// Mixcore integration stores
export const mixcoreConnected = writable(false);
export const projects = writable<Project[]>([]);

// Derived stores
export const isAuthenticated = derived(user, ($user) => !!$user);
export const hasProjects = derived(projects, ($projects) => $projects.length > 0);

// Store actions for Mixcore integration
export const userActions = {
  async login(email: string, password: string) {
    try {
      const mixcoreUser = await mixcoreService.login(email, password);
      if (mixcoreUser) {
        user.set(mixcoreUser);
        mixcoreConnected.set(true);
        
        // Load projects after successful login
        try {
          await projectActions.loadProjects();
        } catch (projectError) {
          console.warn('Failed to load projects after login:', projectError);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  async logout() {
    await mixcoreService.logout();
    user.set(null);
    currentProject.set(null);
    projects.set([]);
    chatMessages.set([]);
    mixcoreConnected.set(false);
  },

  async initialize(retries = 3, delay = 1000) {
    try {
      const initialized = await mixcoreService.initialize();
      if (initialized) {
        const currentUser = mixcoreService.currentUser;
        if (currentUser) {
          user.set(currentUser);
          mixcoreConnected.set(true);
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