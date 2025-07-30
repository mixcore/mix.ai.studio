// Main exports for the Mixcore SDK
export { MixcoreClient } from './client';
export { MixQuery } from './query';

// Type exports
export type {
  IClientConfig,
  LoginCredentials,
  RegisterCredentials,
  User,
  TokenInfo,
  DatabaseRecord,
  QueryOptions,
  ExportOptions,
  AssociationData,
  FilterAssociationsOptions
} from './types';

// Error classes export
export {
  MixcoreSDKError,
  AuthenticationError,
  NetworkError,
  ValidationError
} from './types';

// Utility exports
export {
  defaultCache,
  generateCacheKey
} from './cache';

export {
  validateRequired,
  validateDatabaseSystemName,
  validateEmail,
  validateMinLength,
  validateObject
} from './helpers';