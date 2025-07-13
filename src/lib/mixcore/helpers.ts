import { ValidationError } from './types';

// Validation helpers
export function validateRequired(value: any, paramName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${paramName} is required`);
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

export function validateEmail(email: string): void {
  validateRequired(email, 'Email');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
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