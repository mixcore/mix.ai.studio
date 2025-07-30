import { 
  NetworkError, 
  AuthenticationError, 
  MixcoreSDKError 
} from './types.js';

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  isRetry?: boolean; // Flag to prevent infinite retry loops
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class ApiClient {
  private onAuthFailure?: () => Promise<boolean>;

  constructor(
    private baseURL: string,
    private getAuthToken: () => string | null
  ) {}

  public setAuthFailureHandler(handler: () => Promise<boolean>): void {
    this.onAuthFailure = handler;
  }

  private async makeRequest<T>(
    endpoint: string, 
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    // Robustly join URL parts to prevent double slashes
    const url = `${this.baseURL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json-patch+json',
      ...config.headers
    };

    // Add authentication header
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
      method: config.method,
      headers,
    };

    // Add body for non-GET requests
    if (config.body && config.method !== 'GET') {
      if (config.body instanceof FormData) {
        // Remove Content-Type for FormData (browser sets it automatically)
        delete headers['Content-Type'];
        requestInit.body = config.body;
      } else {
        requestInit.body = JSON.stringify(config.body);
      }
    }

    // Add timeout support
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);
    requestInit.signal = controller.signal;

    try {
      console.log(`API Request: ${config.method} ${url}`);
      
      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);

      // Handle different response types
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      // Handle HTTP errors
      if (!response.ok) {
        // If we get a 401, try to refresh the token and retry the request once.
        if (response.status === 401 && !config.isRetry && this.onAuthFailure) {
          const refreshed = await this.onAuthFailure();
          if (refreshed) {
            console.log('Retrying original request...');
            return this.makeRequest(endpoint, { ...config, isRetry: true });
          }
        }

        // Handle other errors or if refresh fails
        if (response.status === 401 || response.status === 403) { 
          throw new AuthenticationError('Authentication failed');
        } else if (response.status >= 500) {
          throw new NetworkError(`Server error: ${response.statusText}`, response.status);
        } else {
          throw new MixcoreSDKError(
            `HTTP Error: ${response.statusText}`, 
            'HTTP_ERROR', 
            response.status
          );
        }
      }

      console.log(`API Response: ${response.status} ${response.statusText}`);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      
      if (error instanceof MixcoreSDKError) {
        throw error;
      }
      
      // Network or other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
      throw new NetworkError(`Network error: ${errorMessage}`);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.makeRequest<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  async delete<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
      body: data
    });
  }

  // File upload method
  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData
    });
  }
}