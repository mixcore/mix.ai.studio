// TypeScript/ES6 BaseRestService class inspired by AngularJS base-rest-service.js
// This is a generic base class for RESTful resource services
// Features:
// - Automatic token refresh on 401 errors
// - Request queuing during token refresh
// - Integration with AuthService for seamless auth handling
// - Generic CRUD operations (Create, Read, Update, Delete)
// - Automatic Bearer token injection from localStorage

import { MixcoreClient } from '@mixcore/sdk-client';
import type { AuthService } from './auth.service';
import type { PaginationResult } from '$lib/models';

/**
 * Generic base class for RESTful resource services
 * 
 * @template T The type of the resource this service manages
 * 
 * @example
 * ```typescript
 * // Extend the base service for specific resources
 * class UserService extends BaseRestService<User> {
 *   constructor(authService: AuthService) {
 *     super('users', authService);
 *   }
 * }
 * 
 * // Or use the factory function
 * const productService = createRestService<Product>('products', authService);
 * ```
 */
export class BaseRestService<T> {
  protected baseUrl: string;
  protected endpoint: string;
  protected mixClient: MixcoreClient;
  protected authService?: AuthService;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: Function;
    reject: Function;
    request: RequestInit & { url: string };
  }> = [];

  constructor(modelName: string, authService?: AuthService) {
    // Load base URL from environment variable with fallback
    this.baseUrl = import.meta.env.VITE_MIXCORE_API_URL || 'https://localhost:5010';
    this.endpoint = `${this.baseUrl}/${modelName}`;
    this.authService = authService;
    this.mixClient = new MixcoreClient({
      endpoint: this.baseUrl,
      tokenKey: 'mixcore_access_token',
      refreshTokenKey: 'mixcore_refresh_token',
    });
  }

  protected async getRestApiResult(
    req: RequestInit & { url: string }
  ): Promise<any> {
    // Ensure token is included in headers before executing request
    const token = localStorage.getItem('mixcore_access_token');
    
    // Merge existing headers with Authorization header
    req.headers = {
      'Content-Type': 'application/json',
      ...(req.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    };

    console.log('🔐 Making API request with token:', token ? '***' + token.slice(-10) : 'No token');
    console.log('📤 Request URL:', req.url);
    console.log('📤 Request Method:', req.method);
    
    return this.executeRequest(req);
  }

  private async executeRequest(
    req: RequestInit & { url: string },
    isRetry = false
  ): Promise<any> {
    // Ensure token is always present in headers (in case it wasn't set in getRestApiResult)
    const token = localStorage.getItem('mixcore_access_token');
    const headers = req.headers as Record<string, string> || {};
    
    if (!headers.Authorization && token) {
      req.headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }

    console.log(`🚀 Executing ${isRetry ? 'retry ' : ''}request to:`, req.url);
    
    const response = await fetch(req.url, req);

    console.log(`📥 Response status: ${response.status} ${response.statusText}`);

    // Handle 401 Unauthorized - token refresh logic
    if (response.status === 401 && !isRetry) {
      console.log('🔒 Unauthorized response, attempting token refresh...');
      return this.handleUnauthorized(req);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      throw new Error(
        errorText || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log('✅ API Success:', typeof result === 'object' && result !== null ? Object.keys(result) : 'Response received');
    return result;
  }

  private async handleUnauthorized(
    originalRequest: RequestInit & { url: string }
  ): Promise<any> {
    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, request: originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      // Use AuthService for token refresh if available
      if (this.authService) {
        console.log('🔄 Using AuthService to refresh token...');
        await this.authService.refreshToken();
      } else {
        // Fallback: Direct token refresh call
        const refreshToken = localStorage.getItem('mixcore_refresh_token');
        const accessToken = localStorage.getItem('mixcore_access_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log('🔄 Using fallback token refresh...');
        const refreshResponse = await fetch(
          `${this.baseUrl}/auth/user/renew-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken: refreshToken,
              accessToken: accessToken,
            }),
          }
        );

        if (!refreshResponse.ok) {
          throw new Error(`Token refresh failed: ${refreshResponse.status}`);
        }

        const tokenData = await refreshResponse.json();

        // Update the stored tokens
        if (tokenData.accessToken) {
          localStorage.setItem('mixcore_access_token', tokenData.accessToken);
        }
        if (tokenData.refreshToken) {
          localStorage.setItem('mixcore_refresh_token', tokenData.refreshToken);
        }
        
        console.log('✅ Token refreshed successfully via fallback!');
      }

      // Process all queued requests with success
      this.processQueue(null);

      // Retry the original request with the new token
      return this.executeRequest(originalRequest, true);
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      // Process queue with error (reject all pending requests)
      this.processQueue(error);

      // AuthService already handles logout and redirect with returnUrl when refreshToken fails
      // So we just need to throw the error
      throw new Error('Authentication failed. Please log in again.');
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject, request }) => {
      if (error) {
        reject(error);
      } else {
        resolve(this.executeRequest(request, true));
      }
    });

    this.failedQueue = [];
  }

  async getList(queryParams: Record<string, any> = {}): Promise<PaginationResult<T>> {
    const url = this.buildUrl(this.endpoint, queryParams);
    const response = await this.getRestApiResult({ url, method: 'GET' });
    
    // Handle different response formats
    if (response && typeof response === 'object') {
      // If response already has pagination structure
      if (response.items && Array.isArray(response.items)) {
        return response as PaginationResult<T>;
      }
      
      // If response is an array, wrap it in pagination structure
      if (Array.isArray(response)) {
        return {
          items: response,
          pageIndex: 0,
          pageSize: response.length,
          total: response.length,
          totalPage: 1
        };
      }
      
      // If response has different pagination fields, map them
      if (response.data && Array.isArray(response.data)) {
        return {
          items: response.data,
          pageIndex: response.pageIndex || 0,
          pageSize: response.pageSize || response.data.length,
          total: response.total || response.data.length,
          totalPage: response.totalPage || 1
        };
      }
    }
    
    // Fallback: return empty pagination result
    return {
      items: [],
      pageIndex: 0,
      pageSize: 0,
      total: 0,
      totalPage: 0
    };
  }

  async getSingle(
    id: string | number,
    queryParams: Record<string, any> = {}
  ): Promise<T> {
    const url = this.buildUrl(`${this.endpoint}/${id}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

  async create(objData: T): Promise<T> {
    return this.getRestApiResult({
      url: this.endpoint,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objData),
    });
  }

  async update(id: string | number, objData: Partial<T>): Promise<T> {
    return this.getRestApiResult({
      url: `${this.endpoint}/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objData),
    });
  }

  async delete(id: string | number): Promise<void> {
    await this.getRestApiResult({
      url: `${this.endpoint}/${id}`,
      method: 'DELETE',
    });
  }

  protected buildUrl(base: string, params: Record<string, any>): string {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return query ? `${base}?${query}` : base;
  }

  /**
   * Get the MixcoreClient instance for advanced operations
   */
  protected getMixcoreClient(): MixcoreClient {
    return this.mixClient;
  }

  /**
   * Set the AuthService for automatic token refresh
   */
  setAuthService(authService: AuthService): void {
    this.authService = authService;
  }
}

/**
 * Factory function to create BaseRestService instances with AuthService integration
 */
export function createRestService<T>(modelName: string, authService?: AuthService): BaseRestService<T> {
  return new BaseRestService<T>(modelName, authService);
}
