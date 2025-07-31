// Mixcore service stub - sdk-client logic removed

// Extended project interface for Mixcore
export interface Project {
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
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  projectId?: string;
  metadata?: Record<string, any>;
}

// User interface for Mixcore
export interface User {
  id: string;
  email: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

class MixcoreService {
  // All sdk-client logic removed. Implement your own logic here.

  async initialize(): Promise<boolean> {
    // ...stub...
    return true;
  }

  getClient(): unknown {
    // ...stub...
    return null;
  }

  async login(email: string, password: string): Promise<User | null> {
    // Dynamically import AuthService to avoid circular deps
    const { AuthService } = await import('$lib/javascript-sdk/packages/user/src/auth-services');
    // Use the same config as in +page.svelte
    const apiBaseUrl = import.meta.env.VITE_MIXCORE_API_URL || 'https://mixcore.net';
    const authService = new AuthService({
      apiBaseUrl,
      encryptAES: (data: string) => data,
      updateAuthData: () => {},
      fillAuthData: async () => ({}),
      initAllSettings: async () => {},
      getApiResult: async (req: { url: string, method?: string, data?: any }) => {
        const url = req.url.startsWith('http') ? req.url : `${apiBaseUrl}${req.url}`;
        const response = await fetch(url, {
          method: req.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: req.data ? JSON.stringify(req.data) : undefined
        });
        const data = await response.json();
        return { isSucceed: response.ok, data };
      },
      getRestApiResult: async (req: { url: string, method?: string, data?: any }) => {
        const url = req.url.startsWith('http') ? req.url : `${apiBaseUrl}${req.url}`;
        const response = await fetch(url, {
          method: req.method || 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: req.data && req.method !== 'GET' ? JSON.stringify(req.data) : undefined
        });
        const data = await response.json();
        return { isSucceed: response.ok, data };
      }
    });
    const result = await authService.loginUnsecure({
      userName: email,
      password,
      rememberMe: true,
      email: '',
      phoneNumber: '',
      returnUrl: ''
    });
    if (result.isSucceed && result.data && result.data.user) {
      return result.data.user;
    }
    return null;
  }

  async logout(): Promise<void> {
    // ...stub...
  }

  async getCurrentUser(): Promise<User | null> {
    // ...stub...
    return null;
  }

  get isAuthenticated(): boolean {
    // ...stub...
    return false;
  }

  get currentUser(): User | null {
    // ...stub...
    return null;
  }

  async getProjects(): Promise<Project[]> {
    // ...stub...
    return [];
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdDate' | 'modifiedDate' | 'ownerId'>): Promise<Project | null> {
    // ...stub...
    return null;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    // ...stub...
    return null;
  }

  async deleteProject(id: string): Promise<boolean> {
    // ...stub...
    return false;
  }

  async getProject(id: string): Promise<Project | null> {
    // ...stub...
    return null;
  }

  async getChatMessages(projectId?: string): Promise<ChatMessage[]> {
    // ...stub...
    return [];
  }

  async createChatMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    // ...stub...
    return null;
  }

  async deleteChatMessage(id: string): Promise<boolean> {
    // ...stub...
    return false;
  }

  async uploadFile(file: File): Promise<string | null> {
    // ...stub...
    return null;
  }

  async deleteFile(filePath: string): Promise<boolean> {
    // ...stub...
    return false;
  }

  async healthCheck(): Promise<boolean> {
    // ...stub...
    return false;
  }

  destroy(): void {
    // ...stub...
  }
}

// Create singleton instance
export const mixcoreService = new MixcoreService();