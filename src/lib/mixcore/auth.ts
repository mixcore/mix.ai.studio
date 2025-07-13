import type { 
  LoginCredentials, 
  RegisterCredentials, 
  TokenInfo, 
  User 
} from './types';
import { 
  validateRequired, 
  validateEmail, 
  validateMinLength 
} from './helpers';
import type { ApiClient } from './api';

export interface AuthCallbacks {
  success?: (data: any) => void;
  error?: (error: Error) => void;
  finally?: () => void;
}

export class AuthModule {
  private _tokenInfo: TokenInfo | null = null;
  private _currentUser: User | null = null;

  constructor(
    private api: ApiClient,
    private tokenKey: string,
    private refreshTokenKey: string,
    private onAuthSuccess?: () => void,
    private onAuthError?: () => void
  ) {
    this.loadTokenFromStorage();
  }

  get tokenInfo(): TokenInfo | null {
    return this._tokenInfo;
  }

  get currentUser(): User | null {
    return this._currentUser;
  }

  get isAuthenticated(): boolean {
    return !!this._tokenInfo?.access_token;
  }

  private loadTokenFromStorage(): void {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      
      if (token && refreshToken) {
        this._tokenInfo = {
          access_token: token,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 3600 // Default, should be updated from server
        };
      }
    } catch (error) {
      console.warn('Failed to load token from storage:', error);
    }
  }

  private saveTokenToStorage(tokenInfo: TokenInfo): void {
    try {
      localStorage.setItem(this.tokenKey, tokenInfo.access_token);
      localStorage.setItem(this.refreshTokenKey, tokenInfo.refresh_token);
      this._tokenInfo = tokenInfo;
    } catch (error) {
      console.error('Failed to save token to storage:', error);
    }
  }

  private clearTokenFromStorage(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      this._tokenInfo = null;
      this._currentUser = null;
    } catch (error) {
      console.warn('Failed to clear token from storage:', error);
    }
  }

  async login(
    credentials: LoginCredentials, 
    callbacks?: AuthCallbacks
  ): Promise<TokenInfo> {
    try {
      // Validate input
      validateEmail(credentials.email);
      validateMinLength(credentials.password, 6, 'Password');

      // Make login request
      const response = await this.api.post<TokenInfo>('/auth/login', credentials);
      const tokenInfo = response.data;

      // Save token
      this.saveTokenToStorage(tokenInfo);

      // Get user data
      await this.initUserData();

      // Call callbacks
      callbacks?.success?.(tokenInfo);
      this.onAuthSuccess?.();

      return tokenInfo;

    } catch (error) {
      // Clear any partial auth state
      this.clearTokenFromStorage();
      
      callbacks?.error?.(error as Error);
      this.onAuthError?.();
      throw error;
    } finally {
      callbacks?.finally?.();
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    // Validate input
    validateRequired(credentials.username, 'Username');
    validateEmail(credentials.email);
    validateMinLength(credentials.password, 6, 'Password');

    const response = await this.api.post<User>('/auth/register', credentials);
    return response.data;
  }

  async initUserData(): Promise<User | null> {
    if (!this.isAuthenticated) {
      return null;
    }

    try {
      const response = await this.api.get<User>('/auth/me');
      this._currentUser = response.data;
      return this._currentUser;
    } catch (error) {
      console.error('Failed to get user data:', error);
      // Don't clear tokens here, might be temporary network issue
      return null;
    }
  }

  async refreshToken(): Promise<TokenInfo | null> {
    if (!this._tokenInfo?.refresh_token) {
      return null;
    }

    try {
      const response = await this.api.post<TokenInfo>('/auth/refresh', {
        refresh_token: this._tokenInfo.refresh_token
      });

      const newTokenInfo = response.data;
      this.saveTokenToStorage(newTokenInfo);
      
      return newTokenInfo;

    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearTokenFromStorage();
      this.onAuthError?.();
      return null;
    }
  }

  logout(callback?: () => void): void {
    // Optional: Call logout endpoint
    if (this.isAuthenticated) {
      this.api.post('/auth/logout').catch(console.error);
    }

    // Clear local state
    this.clearTokenFromStorage();
    
    callback?.();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    validateMinLength(currentPassword, 6, 'Current password');
    validateMinLength(newPassword, 6, 'New password');

    const response = await this.api.post<{ success: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword
    });

    return response.data.success;
  }

  async resetPassword(email: string): Promise<boolean> {
    validateEmail(email);

    const response = await this.api.post<{ success: boolean }>('/auth/reset-password', {
      email
    });

    return response.data.success;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    validateRequired(data, 'Profile data');

    const response = await this.api.put<User>('/auth/profile', data);
    this._currentUser = response.data;
    
    return this._currentUser;
  }

  // Get current access token for API requests
  getAccessToken(): string | null {
    return this._tokenInfo?.access_token || null;
  }
}