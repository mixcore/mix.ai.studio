import { writable, type Writable } from 'svelte/store';
import { mixcoreService, type User } from '$lib/services/mixcore';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: Error | null;
  lastActivity: number | null;
  tokenExpiry: number | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    lastActivity: null,
    tokenExpiry: null,
  });

  async function initialize() {
    try {
      const initialized = await mixcoreService.initialize();
      const now = Date.now();
      
      if (initialized) {
        const currentUser = mixcoreService.currentUser;
        const tokenInfo = await mixcoreService.getClient().auth.tokenInfo;
        
        if (currentUser && tokenInfo) {
          const tokenExpiry = tokenInfo.expires_in ? now + (tokenInfo.expires_in * 1000) : null;
          
          set({
            isAuthenticated: true,
            user: currentUser,
            loading: false,
            error: null,
            lastActivity: now,
            tokenExpiry,
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
            lastActivity: null,
            tokenExpiry: null,
          });
        }
      } else {
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
          lastActivity: null,
          tokenExpiry: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error as Error,
        lastActivity: null,
        tokenExpiry: null,
      });
    }
  }

  async function login(email: string, password: string) {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      const user = await mixcoreService.login(email, password);
      const now = Date.now();
      
      if (user) {
        // Get token expiry information
        const tokenInfo = mixcoreService.getClient().auth.tokenInfo;
        const tokenExpiry = tokenInfo?.expires_in ? now + (tokenInfo.expires_in * 1000) : null;
        
        set({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
          lastActivity: now,
          tokenExpiry,
        });
      } else {
        console.warn('⚠️ Login succeeded but no user data received - this should not happen with the new implementation');
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: new Error('Login succeeded but no user data received'),
          lastActivity: null,
          tokenExpiry: null,
        });
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error as Error,
        lastActivity: null,
        tokenExpiry: null,
      });
      throw error;
    }
  }

  async function logout() {
    try {
      await mixcoreService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        lastActivity: null,
        tokenExpiry: null,
      });
    }
  }

  // Helper function to update activity timestamp
  function updateActivity() {
    update(state => ({
      ...state,
      lastActivity: Date.now()
    }));
  }

  // Helper function to check if session is expired
  function isSessionExpired(state: AuthState): boolean {
    if (!state.tokenExpiry) return false;
    return Date.now() >= state.tokenExpiry;
  }

  return {
    subscribe,
    initialize,
    login,
    logout,
    updateActivity,
    isSessionExpired,
  };
}

export const auth = createAuthStore();
export type AuthStore = ReturnType<typeof createAuthStore>;
