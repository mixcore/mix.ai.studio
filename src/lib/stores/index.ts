import { writable, derived } from 'svelte/store';
import type { Workspace } from '$lib/types';
import { mixcoreService, type User, type Project, type ChatMessage } from '$lib/services/mixcore';

export const user = writable<User | null>(null);
export const currentProject = writable<Project | null>(null);
export const workspace = writable<Workspace | null>(null);

export const chatMessages = writable<ChatMessage[]>([]);
export const chatLoading = writable(false);
export const chatMode = writable<'default' | 'chat-only' | 'agent'>('default');
export const chatInput = writable('');

export const previewUrl = writable('');
export const previewLoading = writable(false);
export const showCodeView = writable(false);

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

  async initialize() {
    const initialized = await mixcoreService.initialize();
    if (initialized) {
      const currentUser = mixcoreService.currentUser;
      if (currentUser) {
        user.set(currentUser);
        mixcoreConnected.set(true);
        await projectActions.loadProjects();
      }
    }
    return initialized;
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
      const message = await mixcoreService.createChatMessage({
        content,
        role,
        projectId: currentProjectId
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
  let projectId: string | undefined;
  currentProject.subscribe(project => {
    projectId = project?.id;
  })();
  return projectId;
}