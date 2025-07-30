import type { 
  LoginCredentials, 
  RegisterCredentials, 
  TokenInfo, 
  User 
} from './types';
import { 
  validateRequired, 
  validateLoginCredentials,
  validateRegistrationCredentials,
  validateMinLength,
  validateEmail,
  isEmailFormat
} from './helpers';
import type { ApiClient } from './api';
import { TokenService } from '$lib/services/token';

export interface AuthCallbacks {
  success?: (data: any) => void;
  error?: (error: Error) => void;
  finally?: () => void;
}


export class AuthModule {
  private _tokenInfo: TokenInfo | null = null;
  private _currentUser: User | null = null;

  private isRefreshingToken = false;
  private tokenRefreshPromise: Promise<TokenInfo | null> | null = null;

  constructor(
    private api: ApiClient,
    tokenKey: string, // Not used directly anymore, kept for interface compatibility
    refreshTokenKey: string, // Not used directly anymore, kept for interface compatibility
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
      // Use the enhanced TokenService method that includes validation and metadata
      const tokenInfo = await TokenService.getTokenInfo();
      
      if (tokenInfo) {
        // Check if tokens are expired
        const expired = await TokenService.areTokensExpired();
        if (!expired) {
          this._tokenInfo = tokenInfo;
        } else {
          console.log('Tokens are expired, clearing storage');
          await this.clearTokenFromStorage();
        }
      }
    } catch (error) {
      console.warn('Failed to load token from storage:', error);
      await this.clearTokenFromStorage(); // Cleanup on error
    }
  }

  private async saveTokenToStorage(tokenInfo: TokenInfo): Promise<void> {
    try {
      const accessToken = (tokenInfo as any).accessToken || tokenInfo.access_token;
      const refreshToken = (tokenInfo as any).refreshToken || tokenInfo.refresh_token;
      const expiresIn = tokenInfo.expires_in;

      const saved = await TokenService.setTokens(accessToken, refreshToken, expiresIn);
      if (!saved) {
        throw new Error('Failed to save tokens');
      }
      this._tokenInfo = tokenInfo;
    } catch (error) {
      console.error('Failed to save token to storage:', error);
      throw error; // Re-throw to handle upstream
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
      const identifier = (credentials as any).email || (credentials as any).usernameOrEmail;
      const { password } = credentials;
      
      // Enhanced validation using new validation helpers
      const validationResults = validateLoginCredentials(identifier, password);
      const errors = validationResults.filter(result => !result.isValid);
      
      if (errors.length > 0) {
        throw new Error(errors.map(error => error.error).join(', '));
      }
      
      // Use the exact format from the working curl example
      const payload = {
        email: isEmailFormat(identifier) ? identifier : "", // Use actual email or empty string
        userName: isEmailFormat(identifier) ? "" : identifier, // Use actual username or empty string  
        phoneNumber: "", // Empty string for optional field
        password: password,
        rememberMe: true,
        returnUrl: "" // Empty string for optional field
      };
      
      console.log('🔐 Auth: Login payload:', JSON.stringify(payload, null, 2));
      const response = await this.api.post<TokenInfo>('/rest/auth/user/login-unsecure', payload);
      tokenInfo = response.data;
      
      // Save token with enhanced storage
      await this.saveTokenToStorage(tokenInfo);
      
      // Get user data
      await this.initUserData();
    } catch (error) {
      // Clear any partial auth state
      await this.logout();
      callbacks?.error?.(error as Error);
      this.onAuthError?.();
      callbacks?.finally?.();
      // Re-throw a more user-friendly error for login failures
      if (error instanceof Error && error.message.includes('HTTP Error')) {
        throw new Error('Login failed. Please check your credentials and ensure the API server is reachable.');
      }
      throw error;
    }

    // Success callbacks
    callbacks?.success?.(tokenInfo);
    this.onAuthSuccess?.();
    callbacks?.finally?.();

    return tokenInfo;
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    // Enhanced validation using new validation helpers
    const validationResults = validateRegistrationCredentials(
      credentials.username,
      credentials.email,
      credentials.password
    );
    
    const errors = validationResults.filter(result => !result.isValid);
    if (errors.length > 0) {
      throw new Error(errors.map(error => error.error).join(', '));
    }

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
      const response = await this.api.get<User>('/rest/auth/user/my-profile');
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

  async logout(callback?: () => void): Promise<void> {
    // Optional: Call logout endpoint
    if (this.isAuthenticated) {
      await this.api.post('/rest/auth/logout/').catch(console.error);
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
      const emailValidation = validateEmail(usernameOrEmail);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error || 'Invalid email format');
      }
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

  setToken(token: string, refreshToken: string): void {
    this._tokenInfo = {
      access_token: token,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600 // Default, should be updated from server
    };

    this.saveTokenToStorage(this._tokenInfo);
  }

  // Get current access token for API requests
  getAccessToken(): string | null {
    return this._tokenInfo?.access_token || null;
  }
}
