import { authToken, isAuthenticated } from '$lib/stores';
import { mixcoreService } from '$lib/services/mixcore';
import { get } from 'svelte/store';
import { TokenService } from '$lib/services/token';

export async function injectAuthToken(tokenInfo: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}): Promise<boolean> {
  try {
    // Store tokens using TokenService
    const tokensSaved = await TokenService.setTokens(tokenInfo.accessToken, tokenInfo.refreshToken);
    if (!tokensSaved) {
      throw new Error('Failed to save tokens to storage');
    }

    // Update auth store
    authToken.set({
      accessToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken
    });

    // Initialize auth state
    const success = await mixcoreService.initialize();
    
    // Dispatch custom event when auth state changes
    if (success && get(isAuthenticated)) {
      window.dispatchEvent(new CustomEvent('auth-success'));
    }
    
    return success;
  } catch (error) {
    console.error('Failed to inject auth token:', error);
    window.dispatchEvent(new CustomEvent('auth-error', { detail: error }));
    return false;
  }
}

// Example usage:
// await injectAuthToken({
//   accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   refreshToken: "097afa84-bb87-4f9c-ba3d-6c27ff519c65",
//   expiresIn: 1200
// });
