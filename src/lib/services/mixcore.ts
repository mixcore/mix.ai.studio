// Mixcore service stub - sdk-client logic removed

// Standardized Error Types
export class MixcoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'MixcoreError';
  }
}

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
  username?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

class MixcoreService {
  private _currentUser: User | null = null;
  private accessToken: string | null = null;

  async initialize(): Promise<boolean> {
    // Try to restore authentication from localStorage
    try {
      const storedToken = localStorage.getItem('mixcore_access_token');
      const storedUser = localStorage.getItem('mixcore_user');
      
      if (storedToken && storedUser) {
        this.accessToken = storedToken;
        this._currentUser = JSON.parse(storedUser);
        return true;
      }
    } catch (error) {
      console.warn('Failed to restore auth state:', error);
    }
    return false;
  }

  getClient() {
    return {
      auth: {
        register: this.register.bind(this),
        resetPassword: async (email: string) => {
          const authService = await this.createAuthService();
          const result = await authService.forgotPassword({ email });
          return result.isSucceed;
        },
        isAuthenticated: this.isAuthenticated,
        initUserData: async () => {
          // Stub implementation
        }
      }
    };
  }

  private async createAuthService() {
    // Dynamically import AuthService to avoid circular deps
    const { AuthService } = await import('$lib/javascript-sdk/packages/user/src/auth-services');
    
    const apiBaseUrl = import.meta.env.VITE_MIXCORE_API_URL || 'https://mixcore.net';
    
    // Create a minimal API service implementation
    const apiService = {
      config: { apiBaseUrl },
      hooks: [],
      use: () => {},
      async get(endpoint: string) {
        const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        return { isSucceed: response.ok, data, status: response.status };
      },
      async post(endpoint: string, body?: any) {
        const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined
        });
        const data = await response.json();
        return { isSucceed: response.ok, data, status: response.status };
      },
      async delete(endpoint: string) {
        const url = endpoint.startsWith('http') ? endpoint : `${apiBaseUrl}${endpoint}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        return { isSucceed: response.ok, data, status: response.status };
      }
    };
    
    return new AuthService({
      apiService,
      encryptAES: (data: string) => data,
      updateAuthData: () => {},
      fillAuthData: async () => ({}),
      initAllSettings: async () => {}
    });
  }

  async login(email: string, password: string): Promise<User | null> {
    try {
      const authService = await this.createAuthService();
      const result = await authService.loginUnsecure({
        userName: email,
        password,
        rememberMe: true,
        email: '',
        phoneNumber: '',
        returnUrl: ''
      });
      
      if (result.isSucceed && result.data) {
        // The API returns user info in result.data.info, not result.data.user
        const userInfo = result.data.info;
        if (userInfo) {
          const user: User = {
            id: userInfo.parentId || userInfo.username,
            email: userInfo.email,
            username: userInfo.username,
            avatar: result.data.Avatar,
            preferences: {}
          };
          
          // Store authentication data
          this.accessToken = result.data.accessToken;
          this._currentUser = user;
          
          // Persist to localStorage
          try {
            localStorage.setItem('mixcore_access_token', result.data.accessToken);
            localStorage.setItem('mixcore_refresh_token', result.data.refreshToken);
            localStorage.setItem('mixcore_user', JSON.stringify(user));
          } catch (error) {
            console.warn('Failed to persist auth state:', error);
          }
          
          return user;
        }
      }
      
      throw new MixcoreError(
        result.errors?.[0] || 'Login failed',
        'LOGIN_FAILED',
        result.status
      );
    } catch (error) {
      if (error instanceof MixcoreError) {
        throw error;
      }
      throw new MixcoreError(
        error instanceof Error ? error.message : 'Login failed',
        'LOGIN_ERROR'
      );
    }
  }
  
  async register(username: string, email: string, password: string): Promise<User | null> {
    const authService = await this.createAuthService();
    const result = await authService.saveRegistration({
      username,
      email,
      password,
      confirmPassword: password
    });
    if (result.isSucceed && result.data) {
      return result.data;
    }
    return null;
  }

  async logout(): Promise<void> {
    // Clear auth state
    this.accessToken = null;
    this._currentUser = null;
    
    // Clear localStorage
    try {
      localStorage.removeItem('mixcore_access_token');
      localStorage.removeItem('mixcore_refresh_token');
      localStorage.removeItem('mixcore_user');
    } catch (error) {
      console.warn('Failed to clear auth state:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // ...stub...
    return null;
  }

  get isAuthenticated(): boolean {
    return !!(this.accessToken && this._currentUser);
  }

  get currentUser(): User | null {
    return this._currentUser;
  }

  private async refreshAuthToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('mixcore_refresh_token');
    if (!refreshToken) return false;
    
    try {
      const authService = await this.createAuthService();
      const result = await authService.refreshToken(refreshToken, this.accessToken || '');
      
      if (result && result.isSucceed && result.data) {
        // Update stored tokens
        this.accessToken = result.data.accessToken;
        localStorage.setItem('mixcore_access_token', result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem('mixcore_refresh_token', result.data.refreshToken);
        }
        return true;
      }
      
      // If refresh fails, clear auth state
      await this.logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  // Enhanced method to make authenticated API calls with auto-retry on token expiry
  private async makeAuthenticatedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // If it's a 401 error, try to refresh the token and retry once
      if (error.statusCode === 401 || error.code === 'UNAUTHORIZED') {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          return await requestFn();
        }
      }
      throw error;
    }
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