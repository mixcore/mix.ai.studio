import { SafeLocalStorage } from '$lib/sdk-client/packages/sdk-client/src/helpers/local-storage.helper';
import type { TokenInfo } from '$lib/mixcore/types';


/**
 * Centralized token management service with enhanced validation and storage abstraction
 * 
 * Handles all token operations using SafeLocalStorage with consistent keys,
 * proper error handling, and token validation.
 */
export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'mix_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'mix_refresh_token';
  private static readonly TOKEN_METADATA_KEY = 'mix_token_metadata';

  /**
   * Validate token format
   */
  private static validateToken(token: string, tokenType: 'access' | 'refresh'): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Basic JWT format validation (should have 3 parts separated by dots)
    if (tokenType === 'access' && token.split('.').length !== 3) {
      console.warn(`Invalid ${tokenType} token format`);
      return false;
    }
    
    return true;
  }

  /**
   * Get the access token with validation
   * @returns Promise resolving to the access token or null if not found/invalid
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await SafeLocalStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (token && this.validateToken(token, 'access')) {
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get the refresh token with validation
   * @returns Promise resolving to the refresh token or null if not found/invalid
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      const token = await SafeLocalStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (token && this.validateToken(token, 'refresh')) {
        return token;
      }
      return null;
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get token metadata
   */
  static async getTokenMetadata(): Promise<{ timestamp: number; expiresIn: number } | null> {
    try {
      const metadata = await SafeLocalStorage.getItem(this.TOKEN_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error('Failed to get token metadata:', error);
      return null;
    }
  }

  /**
   * Set both access and refresh tokens with enhanced validation and metadata
   * @param accessToken The access token
   * @param refreshToken The refresh token
   * @param expiresIn Token expiration time in seconds (optional)
   * @returns Promise resolving to true if both tokens were saved successfully
   */
  static async setTokens(accessToken: string, refreshToken: string, expiresIn?: number): Promise<boolean> {
    // Validate tokens before saving
    if (!this.validateToken(accessToken, 'access')) {
      console.error('Invalid access token format');
      return false;
    }
    
    if (!this.validateToken(refreshToken, 'refresh')) {
      console.error('Invalid refresh token format');
      return false;
    }

    try {
      const timestamp = Date.now();
      const metadata = {
        timestamp,
        expiresIn: expiresIn || 3600
      };

      // Save tokens and metadata atomically
      const results = await Promise.all([
        SafeLocalStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken),
        SafeLocalStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken),
        SafeLocalStorage.setItem(this.TOKEN_METADATA_KEY, JSON.stringify(metadata))
      ]);
      
      const allSaved = results.every(result => result);
      
      if (allSaved) {
        console.log('Tokens saved successfully with metadata');
      } else {
        console.error('Failed to save some tokens or metadata');
        // Cleanup on partial failure
        await this.clearTokens();
      }
      
      return allSaved;
    } catch (error) {
      console.error('Failed to save tokens:', error);
      await this.clearTokens(); // Cleanup on error
      return false;
    }
  }

  /**
   * Clear all token-related data
   * @returns Promise resolving to true if all data was cleared successfully
   */
  static async clearTokens(): Promise<boolean> {
    try {
      const results = await Promise.all([
        SafeLocalStorage.removeItem(this.ACCESS_TOKEN_KEY),
        SafeLocalStorage.removeItem(this.REFRESH_TOKEN_KEY),
        SafeLocalStorage.removeItem(this.TOKEN_METADATA_KEY)
      ]);
      
      const allCleared = results.every(result => result);
      if (allCleared) {
        console.log('All tokens and metadata cleared successfully');
      } else {
        console.warn('Some tokens or metadata failed to clear');
      }
      
      return allCleared;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      return false;
    }
  }

  /**
   * Check if valid tokens exist
   * @returns Promise resolving to true if both valid tokens exist
   */
  static async hasTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    const refreshToken = await this.getRefreshToken();
    return !!accessToken && !!refreshToken;
  }

  /**
   * Check if tokens are expired based on metadata
   * @returns Promise resolving to true if tokens are expired
   */
  static async areTokensExpired(): Promise<boolean> {
    const metadata = await this.getTokenMetadata();
    if (!metadata) {
      return true; // Consider expired if no metadata
    }
    
    const now = Date.now();
    const expirationTime = metadata.timestamp + (metadata.expiresIn * 1000);
    const bufferTime = 60 * 1000; // 1 minute buffer
    
    return now >= (expirationTime - bufferTime);
  }

  /**
   * Get complete token info with metadata
   */
  static async getTokenInfo(): Promise<TokenInfo | null> {
    const [accessToken, refreshToken, metadata] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
      this.getTokenMetadata()
    ]);
    
    if (!accessToken || !refreshToken) {
      return null;
    }
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: metadata?.expiresIn || 3600
    };
  }

  /**
   * Check if storage is available
   * @returns Promise resolving to true if storage is available
   */
  static async isAvailable(): Promise<boolean> {
    return SafeLocalStorage.isAvailable();
  }
}
