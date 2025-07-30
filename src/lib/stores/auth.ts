import { writable, get } from 'svelte/store';
import { mixcoreService } from '$lib/services/mixcore';
import { encryptAES, generateKey } from '$lib/utils/crypto.mjs';
import type { User } from '$lib/services/mixcore';
import type { ITokenInfo } from '$lib/sdk-client/packages/sdk-client/src/types';

export const auth = writable({
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null as User | null,
  isAuthenticated: false
});

// Initialize from existing tokens in storage
export async function initializeAuth() {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('mix_access_token');
    refreshToken = localStorage.getItem('mix_refresh_token');
  }
  
  if (accessToken && refreshToken) {
    auth.set({
      accessToken,
      refreshToken,
      user: mixcoreService.currentUser,
      isAuthenticated: !!mixcoreService.currentUser
    });
  }
}

export async function login(username: string, password: string) {
  try {
    // Encrypt credentials
    const key = generateKey();
    const message = encryptAES(JSON.stringify({ username, password }), key);

    const user = await mixcoreService.login(username, password);
    // Note: The encrypted message is not currently used by mixcoreService.login()
    // but we'll keep the encryption for future use or other API calls
    if (user) {
      const accessToken = mixcoreService.getClient().auth.tokenInfo?.accessToken;
      const refreshToken = mixcoreService.getClient().auth.tokenInfo?.refreshToken;

      auth.set({
        accessToken: accessToken || null,
        refreshToken: refreshToken || null,
        user,
        isAuthenticated: true
      });

      // Store tokens in localStorage
      if (accessToken) localStorage.setItem('mix_access_token', accessToken);
      if (refreshToken) localStorage.setItem('mix_refresh_token', refreshToken);
    }
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function refreshToken() {
  try {
    const client = mixcoreService.getClient();
    const currentTokens = get(auth);
    const { API } = await import('$lib/sdk-client/packages/sdk-client/src/api');
    const { ENDPOINTS } = await import('$lib/sdk-client/packages/sdk-client/src/config/constants');
    
    const response = await API.post<{refreshToken: string, accessToken: string}, {data: ITokenInfo}>(
      ENDPOINTS.auth.renewToken,
      {
        refreshToken: currentTokens.refreshToken || '',
        accessToken: currentTokens.accessToken || ''
      }
    );
    const accessToken = response.data?.accessToken;
    const refreshToken = response.data?.refreshToken;

    if (accessToken && refreshToken) {
      auth.update(state => ({
        ...state,
        accessToken,
        refreshToken
      }));

      localStorage.setItem('mix_access_token', accessToken);
      localStorage.setItem('mix_refresh_token', refreshToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
    return false;
  }
}

export function logout() {
  mixcoreService.logout();
  auth.set({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false
  });
  localStorage.removeItem('mix_access_token');
  localStorage.removeItem('mix_refresh_token');
}

// Initialize auth state on module load
initializeAuth();
