import { ApiClient } from './api';
import { AuthModule } from './auth';
import { DatabaseModule } from './database';
import { StorageModule } from './storage';
import type { IClientConfig } from './types';
import { validateRequired } from './helpers';

export class MixcoreClient {
  private apiClient: ApiClient;
  
  public readonly auth: AuthModule;
  public readonly database: DatabaseModule;
  public readonly storage: StorageModule;

  constructor(config: IClientConfig) {
    // Validate required configuration
    validateRequired(config.tokenKey, 'Token key');
    validateRequired(config.refreshTokenKey, 'Refresh token key');

    const endpoint = config.endpoint || 'https://api.mixcore.io/api/v2';
    const tokenType = config.tokenType || 'Bearer';

    // Initialize API client
    this.apiClient = new ApiClient(
      endpoint,
      () => this.auth?.getAccessToken() || null
    );

    // Initialize modules
    this.auth = new AuthModule(
      this.apiClient,
      config.tokenKey,
      config.refreshTokenKey,
      config.events?.onAuthSuccess,
      config.events?.onAuthError
    );

    this.database = new DatabaseModule(this.apiClient);
    this.storage = new StorageModule(this.apiClient);

    // Auto-initialize user data if token exists
    if (this.auth.isAuthenticated) {
      this.auth.initUserData().catch(console.error);
    }
  }

  // Convenience methods for common operations

  async initialize(): Promise<boolean> {
    try {
      if (this.auth.isAuthenticated) {
        await this.auth.initUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize client:', error);
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.apiClient.get('/health');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Configuration getters
  get isAuthenticated(): boolean {
    return this.auth.isAuthenticated;
  }

  get currentUser() {
    return this.auth.currentUser;
  }

  get tokenInfo() {
    return this.auth.tokenInfo;
  }

  // Quick access methods for common database operations
  async getProjects() {
    return this.database.getData('projects');
  }

  async createProject(data: any) {
    return this.database.createData('projects', data);
  }

  async updateProject(id: string | number, data: any) {
    return this.database.updateData('projects', id, data);
  }

  async deleteProject(id: string | number) {
    return this.database.deleteData('projects', id);
  }

  // Cleanup method
  destroy(): void {
    this.database.clearCache();
    // Any other cleanup needed
  }
}

// Re-export commonly used classes and types
export { MixQuery } from './query';
export type { 
  IClientConfig,
  LoginCredentials,
  RegisterCredentials,
  User,
  TokenInfo,
  DatabaseRecord,
  MixcoreSDKError,
  AuthenticationError,
  NetworkError,
  ValidationError
} from './types';

// Export cache utilities
export { defaultCache, generateCacheKey } from './cache';

// Export validation helpers
export { 
  validateRequired,
  validateDatabaseSystemName,
  validateEmail,
  validateMinLength,
  validateObject
} from './helpers';