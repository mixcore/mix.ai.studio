/**
 * Mixcore SDK Client Integration
 * 
 * This module integrates the Mixcore SDK client with our application,
 * providing a unified interface for all SDK operations.
 */

// Import the SDK client from the built distribution
import { MixcoreClient } from '../sdk/dist/index.esm.js';
import type { IClientConfig } from '../sdk/dist/index.d.ts';

// Configuration interface extending the SDK config
export interface AppClientConfig extends IClientConfig {
  endpoint?: string;
  apiVersion?: string;
  timeout?: number;
  retryCount?: number;
  enableCache?: boolean;
  debug?: boolean;
}

// Default configuration
const DEFAULT_CONFIG: AppClientConfig = {
  endpoint: 'https://mixcore.net',
  apiVersion: 'v2',
  tokenKey: 'mix_access_token',
  refreshTokenKey: 'mix_refresh_token',
  tokenType: 'Bearer',
  timeout: 30000,
  retryCount: 3,
  enableCache: true,
  debug: import.meta.env.DEV
};

// SDK Client wrapper class
export class MixcoreSDKClient {
  private client: any;
  private config: AppClientConfig;

  constructor(config: Partial<AppClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize the SDK client
    this.client = new MixcoreClient({
      endpoint: this.config.endpoint,
      tokenKey: this.config.tokenKey,
      refreshTokenKey: this.config.refreshTokenKey,
      tokenType: this.config.tokenType,
      events: {
        onAuthSuccess: () => this.handleAuthSuccess(),
        onAuthError: () => this.handleAuthError()
      }
    });
  }

  // Authentication methods
  get auth() {
    return this.client.auth;
  }

  // Database methods
  get database() {
    return this.client.database;
  }

  // Storage methods  
  get storage() {
    return this.client.storage;
  }

  // Get the underlying SDK client
  getClient() {
    return this.client;
  }

  // Get current configuration
  getConfig() {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<AppClientConfig>) {
    this.config = { ...this.config, ...newConfig };
    // Reinitialize client with new config if needed
    if (newConfig.endpoint || newConfig.tokenKey || newConfig.refreshTokenKey) {
      this.client = new MixcoreClient({
        endpoint: this.config.endpoint,
        tokenKey: this.config.tokenKey,
        refreshTokenKey: this.config.refreshTokenKey,
        tokenType: this.config.tokenType,
        events: {
          onAuthSuccess: () => this.handleAuthSuccess(),
          onAuthError: () => this.handleAuthError()
        }
      });
    }
  }

  // Connection test
  async testConnection(): Promise<boolean> {
    try {
      // Simple ping or health check
      const response = await fetch(`${this.config.endpoint}/health`);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Event handlers
  private handleAuthSuccess() {
    if (this.config.debug) {
      console.log('SDK Auth Success');
    }
  }

  private handleAuthError() {
    if (this.config.debug) {
      console.log('SDK Auth Error');
    }
  }
}

// Create singleton instance
let sdkClient: MixcoreSDKClient | null = null;

export function createSDKClient(config?: Partial<AppClientConfig>): MixcoreSDKClient {
  if (!sdkClient) {
    sdkClient = new MixcoreSDKClient(config);
  }
  return sdkClient;
}

export function getSDKClient(): MixcoreSDKClient | null {
  return sdkClient;
}

// Initialize with environment variables
export function initializeSDK(): MixcoreSDKClient {
  const config: Partial<AppClientConfig> = {
    endpoint: import.meta.env.VITE_MIXCORE_ENDPOINT || 'https://mixcore.net',
    debug: import.meta.env.DEV
  };

  return createSDKClient(config);
}