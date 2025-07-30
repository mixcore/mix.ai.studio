export interface RequestConfig {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: unknown;
    params?: Record<string, unknown>;
}
export interface ResponseData {
    status: number;
    statusText: string;
    data: unknown;
    headers?: Record<string, string>;
}
export interface ErrorResponse {
    status?: number;
    message?: string;
    code?: string;
    response?: ResponseData;
}
/**
 * Request interceptor to add authentication headers and logging
 */
export declare function requestInterceptor(config: RequestConfig): RequestConfig;
/**
 * Response interceptor for logging and error handling
 */
export declare function responseInterceptor(response: ResponseData): ResponseData;
/**
 * Error interceptor to handle different types of API errors
 */
export declare function errorInterceptor(error: ErrorResponse): never;
/**
 * Token refresh interceptor to handle automatic token renewal
 */
export declare function tokenRefreshInterceptor(error: ErrorResponse, refreshTokenCallback: () => Promise<string>): Promise<ResponseData>;
