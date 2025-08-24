import { writable, derived, get, type Writable, type Readable } from 'svelte/store';
import { mixcoreService, type User, MixcoreError } from './mixcore';
import { goto } from '$app/navigation';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiry: Date | null;
  isRefreshing: boolean;
  isTokenExpiring: boolean;
}

export class AuthService {
  // Internal stores
  private _user: Writable<User | null> = writable(null);
  private _isLoading: Writable<boolean> = writable(false);
  private _error: Writable<string | null> = writable(null);
  private _tokenExpiry: Writable<Date | null> = writable(null);
  private _isRefreshing: Writable<boolean> = writable(false);

  // Public readonly stores
  public readonly user: Readable<User | null> = this._user;
  public readonly isLoading: Readable<boolean> = this._isLoading;
  public readonly error: Readable<string | null> = this._error;
  public readonly tokenExpiry: Readable<Date | null> = this._tokenExpiry;
  public readonly isRefreshing: Readable<boolean> = this._isRefreshing;

  // Derived stores
  public readonly isAuthenticated: Readable<boolean> = derived(
    this._user,
    ($user) => !!$user
  );

  public readonly isTokenExpiring: Readable<boolean> = derived(
    this._tokenExpiry,
    ($tokenExpiry) => {
      if (!$tokenExpiry) return false;
      const now = new Date();
      const timeUntilExpiry = $tokenExpiry.getTime() - now.getTime();
      return timeUntilExpiry <= 10 * 60 * 1000 && timeUntilExpiry > 0; // Expires in next 10 minutes
    }
  );

  public readonly authState: Readable<AuthState> = derived(
    [this._user, this._isLoading, this._error, this._tokenExpiry, this._isRefreshing, this.isTokenExpiring],
    ([$user, $isLoading, $error, $tokenExpiry, $isRefreshing, $isTokenExpiring]) => ({
      user: $user,
      isAuthenticated: !!$user,
      isLoading: $isLoading,
      error: $error,
      tokenExpiry: $tokenExpiry,
      isRefreshing: $isRefreshing,
      isTokenExpiring: $isTokenExpiring
    })
  );

  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Initialize from stored data
    this.initializeFromStorage();
  }

  /**
   * Get current user synchronously
   */
  get currentUser(): User | null {
    return get(this._user);
  }

  /**
   * Check if user is currently authenticated
   */
  get authenticated(): boolean {
    return !!get(this._user);
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const user = await mixcoreService.login(credentials.email, credentials.password);
      
      if (user) {
        this._user.set(user);
        
        // Set token expiry (typically 1 hour from now)
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        this._tokenExpiry.set(expiry);
        
        // Store token expiry (browser only)
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('mixcore_token_expiry', expiry.toISOString());
        }
        
        // Start token refresh monitoring
        this.startTokenRefreshMonitoring();
        
        console.log('✅ User logged in successfully:', user);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      const errorMessage = error instanceof MixcoreError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'Login failed';
      
      console.error('Login failed:', error);
      this._error.set(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const user = await mixcoreService.register(data.username, data.email, data.password);
      
      if (user) {
        this._user.set(user);
        
        // Set token expiry
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        this._tokenExpiry.set(expiry);
        
        // Store token expiry (browser only)
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('mixcore_token_expiry', expiry.toISOString());
        }
        
        // Start token refresh monitoring
        this.startTokenRefreshMonitoring();
        
        console.log('✅ User registered successfully:', user);
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      const errorMessage = error instanceof MixcoreError 
        ? error.message 
        : error instanceof Error 
        ? error.message 
        : 'Registration failed';
      
      console.error('Registration failed:', error);
      this._error.set(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Logout current user
   */
  async logout(redirectTo?: string): Promise<void> {
    this.stopTokenRefreshMonitoring();
    
    try {
      await mixcoreService.logout();
    } catch (error) {
      console.warn('Error during logout:', error);
    }
    
    // Clear all stores
    this._user.set(null);
    this._tokenExpiry.set(null);
    this._isRefreshing.set(false);
    this._error.set(null);
    
    // Clear localStorage (browser only)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('mixcore_token_expiry');
    }
    
    console.log('✅ User logged out');
    
    // Redirect if specified
    if (redirectTo) {
      await goto(redirectTo);
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = get(this._user);
    // Note: Current User interface doesn't include roles
    // This would need to be extended if role-based access is needed
    return false;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    if (get(this._isRefreshing)) {
      return false; // Already refreshing
    }

    try {
      this._isRefreshing.set(true);
      this._error.set(null);
      
      const refreshed = await mixcoreService.refreshAuthToken();
      
      if (refreshed) {
        // Update token expiry
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        this._tokenExpiry.set(expiry);
        
        // Store token expiry (browser only)
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          localStorage.setItem('mixcore_token_expiry', expiry.toISOString());
        }
        
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.warn('❌ Token refresh failed - logging out');
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this._error.set('Session expired - please log in again');
      await this.logout();
      return false;
    } finally {
      this._isRefreshing.set(false);
    }
  }

  /**
   * Initialize authentication from stored data
   */
  async initializeFromStorage(): Promise<boolean> {
    try {
      const initialized = await mixcoreService.initialize();
      
      if (initialized) {
        const currentUser = mixcoreService.currentUser;
        
        if (currentUser) {
          this._user.set(currentUser);
          
          // Restore token expiry if available (browser only)
          if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
            const storedExpiry = localStorage.getItem('mixcore_token_expiry');
            if (storedExpiry) {
              this._tokenExpiry.set(new Date(storedExpiry));
            }
          }
          
          // Start token refresh monitoring
          this.startTokenRefreshMonitoring();
          
          console.log('✅ Auth state restored from storage');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      return false;
    }
  }

  /**
   * Reset password (forgot password functionality)
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const client = mixcoreService.getClient();
      const success = await client.auth.resetPassword(email);
      
      if (success) {
        console.log('✅ Password reset email sent');
        return { success: true };
      }
      
      return { success: false, error: 'Failed to send reset email' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      console.error('Password reset failed:', error);
      this._error.set(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Start monitoring token expiry and refresh automatically
   */
  private startTokenRefreshMonitoring(): void {
    this.stopTokenRefreshMonitoring();
    
    // Check every 5 minutes
    this.refreshInterval = setInterval(() => {
      const expiry = get(this._tokenExpiry);
      if (!expiry) return;
      
      const now = new Date();
      const timeUntilExpiry = expiry.getTime() - now.getTime();
      
      // Refresh if token expires in the next 10 minutes
      if (timeUntilExpiry <= 10 * 60 * 1000 && timeUntilExpiry > 0) {
        console.log('🔄 Token expiring soon, refreshing...');
        this.refreshToken();
      } else if (timeUntilExpiry <= 0) {
        console.warn('⚠️ Token expired, logging out');
        this.logout();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop token refresh monitoring
   */
  private stopTokenRefreshMonitoring(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Destroy the service and clean up resources
   */
  destroy(): void {
    this.stopTokenRefreshMonitoring();
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export stores for direct access (for backward compatibility with existing code)
export const user = authService.user;
export const isAuthenticated = authService.isAuthenticated;
export const isLoading = authService.isLoading;
export const authError = authService.error;
export const tokenExpiry = authService.tokenExpiry;
export const isRefreshing = authService.isRefreshing;
export const isTokenExpiring = authService.isTokenExpiring;
export const authState = authService.authState;
