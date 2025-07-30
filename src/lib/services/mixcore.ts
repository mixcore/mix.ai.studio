import { MixcoreClient, MixQuery } from '$lib/mixcore';
import type { IClientConfig, User as MixcoreUser, DatabaseRecord } from '$lib/mixcore';

// Extended project interface for Mixcore
export interface Project extends DatabaseRecord {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdDate: string;
  modifiedDate: string;
  ownerId: string;
  settings?: Record<string, any>;
  previewUrl?: string;
}

// Chat message interface for Mixcore
export interface ChatMessage extends DatabaseRecord {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  projectId?: string;
  metadata?: Record<string, any>;
}

// User interface extending Mixcore user
export interface User extends MixcoreUser {
  avatar?: string;
  preferences?: Record<string, any>;
}

class MixcoreService {
  private client: MixcoreClient | null = null;
  private config: IClientConfig;

  constructor() {
    // Default configuration - should be overridden with environment variables
    this.config = {
      endpoint: import.meta.env.VITE_MIXCORE_ENDPOINT || 'https://mixcore.net/api/v2',
      tokenKey: 'mix_access_token',
      refreshTokenKey: 'mix_refresh_token',
      tokenType: 'Bearer',
      events: {
        onAuthSuccess: () => {
          console.log('Mixcore authentication successful');
        },
        onAuthError: () => {
          console.log('Mixcore authentication failed');
        }
      }
    };
  }

  // Initialize the client
  async initialize(): Promise<boolean> {
    try {
      if (!this.client) {
        this.client = new MixcoreClient(this.config);
      }
      
      return await this.client.initialize();
    } catch (error) {
      console.error('Failed to initialize Mixcore service:', error);
      return false;
    }
  }

  // Get the client instance
  getClient(): MixcoreClient {
    if (!this.client) {
      this.client = new MixcoreClient(this.config);
    }
    return this.client;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<User | null> {
    try {
      const client = this.getClient();
      const tokenInfo = await client.auth.login({ email, password });
      
      if (tokenInfo && client.auth.currentUser) {
        return client.auth.currentUser as User;
      }
      
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const client = this.getClient();
      client.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const client = this.getClient();
      return await client.auth.initUserData() as User;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  get isAuthenticated(): boolean {
    return this.client?.isAuthenticated || false;
  }

  get currentUser(): User | null {
    return this.client?.currentUser as User || null;
  }

  // Project management
  async getProjects(): Promise<Project[]> {
    try {
      const client = this.getClient();
      const query = new MixQuery()
        .orderBy('modifiedDate', 'desc');
      
      return await client.database.getData<Project>('projects', query);
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdDate' | 'modifiedDate'>): Promise<Project | null> {
    try {
      const client = this.getClient();
      const data = {
        ...projectData,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        ownerId: client.currentUser?.id || ''
      };
      
      return await client.database.createData<Project>('projects', data);
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const client = this.getClient();
      const data = {
        ...updates,
        modifiedDate: new Date().toISOString()
      };
      
      return await client.database.updateData<Project>('projects', id, data);
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const client = this.getClient();
      return await client.database.deleteData('projects', id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const client = this.getClient();
      return await client.database.getDataById<Project>('projects', id);
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  // Chat management
  async getChatMessages(projectId?: string): Promise<ChatMessage[]> {
    try {
      const client = this.getClient();
      let query = new MixQuery()
        .orderBy('timestamp', 'asc');
      
      if (projectId) {
        query = query.where('projectId', projectId);
      }
      
      return await client.database.getData<ChatMessage>('chat_messages', query);
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      return [];
    }
  }

  async createChatMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    try {
      const client = this.getClient();
      const data = {
        ...messageData,
        timestamp: new Date().toISOString()
      };
      
      return await client.database.createData<ChatMessage>('chat_messages', data);
    } catch (error) {
      console.error('Failed to create chat message:', error);
      return null;
    }
  }

  async deleteChatMessage(id: string): Promise<boolean> {
    try {
      const client = this.getClient();
      return await client.database.deleteData('chat_messages', id);
    } catch (error) {
      console.error('Failed to delete chat message:', error);
      return false;
    }
  }

  // File storage
  async uploadFile(file: File): Promise<string | null> {
    try {
      const client = this.getClient();
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await client.storage.uploadFile(formData);
      return result.url;
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const client = this.getClient();
      return await client.storage.deleteFile(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // Utility methods
  async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      return await client.healthCheck();
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Clean up resources
  destroy(): void {
    this.client?.destroy();
    this.client = null;
  }
}

// Create singleton instance
export const mixcoreService = new MixcoreService();