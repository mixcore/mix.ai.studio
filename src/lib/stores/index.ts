import { writable, derived, get } from 'svelte/store';
import type { Workspace } from '$lib/types';
import { mixcoreService, type User, type Project, type ChatMessage } from '$lib/services/mixcore';
import { createLLMService, type LLMProvider } from '$lib/services/llm';
import { createDatabaseService, type TableInfo, type DatabaseStats } from '$lib/services/database';
import { initializeSDK } from '$lib/sdk/client';
import { persistentStore } from './persistent';

// Initialize services
export const sdkClient = initializeSDK();
export const llmService = createLLMService();
export const databaseService = createDatabaseService();

// Create persistent user store that survives page refreshes
export const user = persistentStore<User | null>('mix_user_state', null);
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
        
        console.log('User logged in successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any partial auth state on login failure
      user.set(null);
      mixcoreConnected.set(false);
      return false;
    }
  },

  async logout() {
    try {
      await mixcoreService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      user.set(null);
      currentProject.set(null);
      projects.set([]);
      chatMessages.set([]);
      mixcoreConnected.set(false);
      console.log('User logged out and local state cleared');
    }
  },

  async initialize() {
    try {
      // Check if we have stored user data first
      const storedUser = get(user);
      
      const initialized = await mixcoreService.initialize();
      if (initialized) {
        const currentUser = mixcoreService.currentUser;
        if (currentUser) {
          user.set(currentUser);
          mixcoreConnected.set(true);
          // Try to load projects, but don't fail if it errors
          try {
            await projectActions.loadProjects();
          } catch (projectError) {
            console.warn('Failed to load projects during initialization:', projectError);
          }
          return true;
        }
      }
      
      // If mixcore failed to initialize but we have stored user data and tokens,
      // we're likely in offline mode - restore the stored user state
      if (storedUser && mixcoreService.getClient().auth.isAuthenticated) {
        console.log('Restoring user state from persistent storage (offline mode)');
        user.set(storedUser);
        mixcoreConnected.set(false); // We're offline but authenticated
        return true;
      }
      
      // If we have stored user but no tokens, clear the stale data
      if (storedUser && !mixcoreService.getClient().auth.isAuthenticated) {
        console.warn('Found stored user but no valid tokens, clearing stale auth state');
        user.set(null);
        mixcoreConnected.set(false);
      }
      
      return false;
    } catch (error) {
      console.error('Initialization error:', error);
      
      // If there's an error but we have stored user data and tokens, 
      // we might still be able to work in offline mode
      const storedUser = get(user);
      if (storedUser && mixcoreService.getClient().auth.isAuthenticated) {
        console.log('Error during initialization but restoring from persistent storage');
        user.set(storedUser);
        mixcoreConnected.set(false);
        return true;
      }
      
      // Reset to safe state
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