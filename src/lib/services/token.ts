import { SafeLocalStorage } from '$lib/sdk-client/packages/sdk-client/src/helpers/local-storage.helper';

/**
 * Centralized token management service
 * 
 * Handles all token operations using SafeLocalStorage with consistent keys
 * and proper error handling.
 */
export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'mix_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'mix_refresh_token';

  /**
   * Get the access token
   * @returns Promise resolving to the access token or null if not found/unavailable
   */
  static async getAccessToken(): Promise<string | null> {
    return SafeLocalStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get the refresh token
   * @returns Promise resolving to the refresh token or null if not found/unavailable
   */
  static async getRefreshToken(): Promise<string | null> {
    return SafeLocalStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set both access and refresh tokens
   * @param accessToken The access token
   * @param refreshToken The refresh token
   * @returns Promise resolving to true if both tokens were saved successfully
   */
  static async setTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      console.log('Saving tokens to localStorage...', { 
        accessToken: accessToken ? '***' : 'null',
        refreshToken: refreshToken ? '***' : 'null' 
      });
      const accessSaved = SafeLocalStorage.setItemSync(this.ACCESS_TOKEN_KEY, accessToken);
      const refreshSaved = SafeLocalStorage.setItemSync(this.REFRESH_TOKEN_KEY, refreshToken);
      
      console.log('Token save results:', { accessSaved, refreshSaved });
      
      // Verify tokens were actually saved
      const storedAccess = SafeLocalStorage.getItemSync(this.ACCESS_TOKEN_KEY);
      const storedRefresh = SafeLocalStorage.getItemSync(this.REFRESH_TOKEN_KEY);
      console.log('Stored tokens:', {
        accessToken: storedAccess ? '***' : 'null',
        refreshToken: storedRefresh ? '***' : 'null'
      });
      
      return accessSaved && refreshSaved;
    } catch (error) {
      console.error('Failed to save tokens:', error);
      return false;
    }
  }

  /**
   * Clear both access and refresh tokens
   * @returns Promise resolving to true if both tokens were cleared successfully
   */
  static async clearTokens(): Promise<boolean> {
    try {
      const accessCleared = await SafeLocalStorage.removeItem(this.ACCESS_TOKEN_KEY);
      const refreshCleared = await SafeLocalStorage.removeItem(this.REFRESH_TOKEN_KEY);
      return accessCleared && refreshCleared;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      return false;
    }
  }

  /**
   * Check if tokens exist
   * @returns Promise resolving to true if both tokens exist
   */
  static async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!accessToken && !!refreshToken;
  }

  /**
   * Check if storage is available
   * @returns Promise resolving to true if storage is available
   */
  static async isStorageAvailable(): Promise<boolean> {
    return SafeLocalStorage.isAvailable();
  }
}
