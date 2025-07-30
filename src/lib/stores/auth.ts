import { writable, type Writable } from 'svelte/store';
import { mixcoreService, type User } from '$lib/services/mixcore';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  async function initialize() {
    try {
      const initialized = await mixcoreService.initialize();
      if (initialized) {
        const currentUser = mixcoreService.currentUser;
        if (currentUser) {
          set({
            isAuthenticated: true,
            user: currentUser,
            loading: false,
            error: null,
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        } else {
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
        }
      } else {
        set({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error as Error,
      });
    } finally {
      update(state => ({ ...state, loading: false }));
    }
  }

  async function login(email: string, password: string) {
    try {
      update(state => ({ ...state, loading: true, error: null }));
      const user = await mixcoreService.login(email, password);
      if (user) {
        set({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error as Error,
      });
      throw error;
    }
  }

  async function logout() {
    await mixcoreService.logout();
    set({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
  }

  return {
    subscribe,
    initialize,
    login,
    logout,
  };
}

export const auth = createAuthStore();
export type AuthStore = ReturnType<typeof createAuthStore>;
