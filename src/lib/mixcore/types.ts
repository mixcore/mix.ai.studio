// Mixcore SDK Types
export interface IClientConfig {
  endpoint?: string;
  tokenKey: string;
  refreshTokenKey: string;
  tokenType?: string;
  events?: Record<MixcoreEvent, () => void>;
}

export type MixcoreEvent = 'onAuthSuccess' | 'onAuthError';

export interface TokenInfo {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  name?: string;
  role?: string;
  createdDate?: string;
  lastLoginDate?: string;
}

export interface DatabaseRecord {
  id: string | number;
  [key: string]: any;
}

export interface QueryOptions {
  loadNestedData?: boolean;
  selectColumns?: string[];
}

export interface ExportOptions {
  format?: 'csv' | 'json' | 'xlsx';
  query?: MixQuery;
}

export interface AssociationData {
  parentDbName: string;
  childDbName: string;
  parentId: string | number;
  childId: string | number;
  metadata?: Record<string, any>;
}

export interface FilterAssociationsOptions {
  parentDbName: string;
  pageSize?: number;
  page?: number;
}

// Error Types
export class MixcoreSDKError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'MixcoreSDKError';
  }
}

export class AuthenticationError extends MixcoreSDKError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends MixcoreSDKError {
  constructor(message: string, statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends MixcoreSDKError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

// Cache Types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}