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
import { TokenService } from '$lib/services/token';

export interface AuthCallbacks {
  success?: (data: any) => void;
  error?: (error: Error) => void;
  finally?: () => void;
}

// A simple helper to distinguish email from username
const isEmailFormat = (input: string): boolean => !!input && input.includes('@');

export class AuthModule {
  private _tokenInfo: TokenInfo | null = null;
  private _currentUser: User | null = null;

  private isRefreshingToken = false;
  private tokenRefreshPromise: Promise<TokenInfo | null> | null = null;

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

  private async loadTokenFromStorage(): Promise<void> {
    try {
      const [token, refreshToken] = await Promise.all([
        TokenService.getAccessToken(),
        TokenService.getRefreshToken()
      ]);
      
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

  private async saveTokenToStorage(tokenInfo: TokenInfo): Promise<void> {
    try {
      const saved = await TokenService.setTokens(tokenInfo.access_token, tokenInfo.refresh_token);
      if (!saved) {
        throw new Error('Failed to save tokens');
      }
      this._tokenInfo = tokenInfo;
    } catch (error) {
      console.error('Failed to save token to storage:', error);
    }
  }

  private async clearTokenFromStorage(): Promise<void> {
    try {
      const cleared = await TokenService.clearTokens();
      if (!cleared) {
        throw new Error('Failed to clear tokens');
      }
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
    let tokenInfo: TokenInfo;
    try {
      // The incoming credentials might have `email` or `usernameOrEmail`.
      // We handle both to make the module robust. The `email` property is
      // likely being used as a generic identifier field.
      const identifier = (credentials as any).email || (credentials as any).usernameOrEmail;
      const { password } = credentials;
      // Validate input
      validateRequired(identifier, 'Username or Email');
      validateMinLength(password, 6, 'Password');
      const payload: { password: string; email?: string; userName?: string } = { password };
      if (isEmailFormat(identifier)) {
        validateEmail(identifier);
        payload.email = identifier;
      } else {
        // Assuming it's a username if it's not in email format.
        payload.userName = identifier;
      }
      // Make login request
      const response = await this.api.post<TokenInfo>('/rest/auth/user/login-unsecure', payload);
      tokenInfo = response.data;
      // Save token
      this.saveTokenToStorage(tokenInfo);
      // Get user data
      await this.initUserData();
    } catch (error) {
      // Clear any partial auth state
      this.logout();
      callbacks?.error?.(error as Error);
      this.onAuthError?.();
      callbacks?.finally?.();
      // Re-throw a more user-friendly error for login failures
      if (error instanceof Error && error.message.includes('HTTP Error')) {
        throw new Error('Login failed. Please check your credentials and ensure the API server is reachable.');
      }
      throw error; // Re-throw original error for other cases
    }

    // If we reach here, the try block was successful.
    // Call success callbacks outside the try...catch block to prevent their errors
    // from being caught by our authentication logic.
    callbacks?.success?.(tokenInfo);
    this.onAuthSuccess?.();
    callbacks?.finally?.();

    return tokenInfo;
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    // Validate input
    validateRequired(credentials.username, 'Username');
    validateEmail(credentials.email);
    validateMinLength(credentials.password, 6, 'Password');

      // Construct payload with correct key casing
      const payload = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      };

    const response = await this.api.post<User>('/rest/auth/register/', payload);
    return response.data;
  }

  async initUserData(): Promise<User | null> {
    if (!this.isAuthenticated) {
      return null;
    }

    try {
      const response = await this.api.get<User>('/rest/auth/me/');
      this._currentUser = response.data;
      return this._currentUser;
    } catch (error) {
      console.error('Failed to get user data:', error);
      // Don't clear tokens here, might be temporary network issue
      return null;
    }
  }

  async refreshToken(): Promise<TokenInfo | null> {
    // If a refresh is already in progress, wait for it to complete
    if (this.isRefreshingToken) {
      return this.tokenRefreshPromise;
    }

    if (!this._tokenInfo?.refresh_token) {
      return Promise.resolve(null);
    }

    this.isRefreshingToken = true;
    this.tokenRefreshPromise = (async () => {
      try {
        console.log('🔄 Attempting to refresh token...');
        const response = await this.api.post<TokenInfo>('/rest/auth/refresh/', {
          refresh_token: this._tokenInfo!.refresh_token
        });
        const newTokenInfo = response.data;
        this.saveTokenToStorage(newTokenInfo);
        console.log('✅ Token refreshed successfully!');
        return newTokenInfo;
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        this.logout(); // Clears all tokens and user data
        return null;
      } finally {
        this.isRefreshingToken = false;
        this.tokenRefreshPromise = null;
      }
    })();
    return this.tokenRefreshPromise;
  }

  logout(callback?: () => void): void {
    // Optional: Call logout endpoint
    if (this.isAuthenticated) {
      this.api.post('/rest/auth/logout/').catch(console.error);
    }

    // Clear local state
    this.clearTokenFromStorage();
    this.onAuthError?.(); // Notify listeners that auth state is lost
    
    callback?.();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    validateMinLength(currentPassword, 6, 'Current password');
    validateMinLength(newPassword, 6, 'New password');

    const response = await this.api.post<{ success: boolean }>('/rest/auth/change-password/', {
      currentPassword,
      newPassword
    });

    return response.data.success;
  }

  async resetPassword(usernameOrEmail: string): Promise<boolean> {
    validateRequired(usernameOrEmail, 'Username or Email');

    const payload: { email?: string; username?: string } = {};
    if (isEmailFormat(usernameOrEmail)) {
      validateEmail(usernameOrEmail);
      payload.email = usernameOrEmail;
    } else {
      payload.username = usernameOrEmail;
    }

    const response = await this.api.post<{ success: boolean }>('/rest/auth/reset-password/', payload);
    return response.data.success;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    validateRequired(data, 'Profile data');

    const response = await this.api.put<User>('/rest/auth/profile/', data);
    this._currentUser = response.data;
    
    return this._currentUser;
  }

  // Get current access token for API requests
  getAccessToken(): string | null {
    return this._tokenInfo?.access_token || null;
  }
}
