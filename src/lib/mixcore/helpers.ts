import { ValidationError } from './types';

// Enhanced validation types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationOptions {
  required?: boolean;
  trim?: boolean;
  allowEmpty?: boolean;
}

// Core validation helpers with enhanced type safety
export function validateRequired(value: unknown, paramName: string): asserts value is NonNullable<unknown> {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${paramName} is required`);
  }
}

export function validateString(value: unknown, paramName: string, options: ValidationOptions = {}): asserts value is string {
  const { required = true, trim = true, allowEmpty = false } = options;
  
  if (!required && (value === null || value === undefined)) {
    return;
  }
  
  if (required) {
    validateRequired(value, paramName);
  }
  
  if (typeof value !== 'string') {
    throw new ValidationError(`${paramName} must be a string`);
  }
  
  const processedValue = trim ? value.trim() : value;
  
  if (!allowEmpty && processedValue === '') {
    throw new ValidationError(`${paramName} cannot be empty`);
  }
}

export function validateEmail(email: string, options: ValidationOptions = {}): ValidationResult {
  try {
    validateString(email, 'Email', options);
    
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email.trim())) {
      throw new ValidationError('Invalid email format');
    }
    
    // Additional email validation rules
    if (email.length > 254) {
      throw new ValidationError('Email address too long');
    }
    
    const [localPart, domain] = email.split('@');
    if (localPart.length > 64) {
      throw new ValidationError('Email local part too long');
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof ValidationError ? error.message : 'Invalid email format'
    };
  }
}

export function validatePassword(password: string, options: { minLength?: number; requireSpecial?: boolean; requireNumber?: boolean; requireUppercase?: boolean } = {}): ValidationResult {
  const { minLength = 6, requireSpecial = false, requireNumber = false, requireUppercase = false } = options;
  
  try {
    validateString(password, 'Password');
    
    if (password.length < minLength) {
      throw new ValidationError(`Password must be at least ${minLength} characters long`);
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }
    
    if (requireNumber && !/\d/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
    
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ValidationError('Password must contain at least one special character');
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof ValidationError ? error.message : 'Invalid password'
    };
  }
}

export function validateUsername(username: string): ValidationResult {
  try {
    validateString(username, 'Username');
    
    if (username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters long');
    }
    
    if (username.length > 50) {
      throw new ValidationError('Username must be less than 50 characters long');
    }
    
    // Allow letters, numbers, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new ValidationError('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    // Must start with a letter or number
    if (!/^[a-zA-Z0-9]/.test(username)) {
      throw new ValidationError('Username must start with a letter or number');
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof ValidationError ? error.message : 'Invalid username'
    };
  }
}

export function validateDatabaseSystemName(name: string): void {
  validateRequired(name, 'Database name');
  
  if (typeof name !== 'string') {
    throw new ValidationError('Database name must be a string');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new ValidationError('Database name can only contain letters, numbers, underscores, and hyphens');
  }
}

export function validateMinLength(value: string, minLength: number, paramName: string): void {
  validateRequired(value, paramName);
  
  if (value.length < minLength) {
    throw new ValidationError(`${paramName} must be at least ${minLength} characters long`);
  }
}

export function validateObject(obj: any, paramName: string): void {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new ValidationError(`${paramName} must be a valid object`);
  }
}

// A simple helper to distinguish email from username
export const isEmailFormat = (input: string): boolean => !!input && input.includes('@');

// Compound validation for auth credentials
export function validateLoginCredentials(identifier: string, password: string): ValidationResult[] {
  // Validate identifier based on its format
  let identifierResult: ValidationResult;
  
  if (isEmailFormat(identifier)) {
    // Validate as email
    identifierResult = validateEmail(identifier);
  } else {
    // Validate as username
    identifierResult = validateUsername(identifier);
  }
  
  const passwordResult = validatePassword(password);
  
  return [identifierResult, passwordResult];
}

export function validateRegistrationCredentials(username: string, email: string, password: string): ValidationResult[] {
  const usernameResult = validateUsername(username);
  const emailResult = validateEmail(email);
  const passwordResult = validatePassword(password, { 
    minLength: 8, 
    requireSpecial: true, 
    requireNumber: true, 
    requireUppercase: true 
  });
  
  return [usernameResult, emailResult, passwordResult];
}

// Utility functions
export function isTokenExpired(tokenInfo: any): boolean {
  if (!tokenInfo?.expires_in) return true;
  
  const now = Date.now();
  const expirationTime = tokenInfo.timestamp + (tokenInfo.expires_in * 1000);
  
  return now >= expirationTime;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}