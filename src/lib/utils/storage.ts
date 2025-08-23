/**
 * Storage utility functions that safely handle localStorage access
 * Prevents SSR errors by checking browser environment
 */

/**
 * Safely get an item from localStorage
 * @param key - The key to retrieve
 * @returns The stored value or null if not found or not in browser
 */
export function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get storage item '${key}':`, error);
    }
  }
  return null;
}

/**
 * Safely set an item in localStorage
 * @param key - The key to set
 * @param value - The value to store
 * @returns true if successful, false otherwise
 */
export function setStorageItem(key: string, value: string): boolean {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to set storage item '${key}':`, error);
    }
  }
  return false;
}

/**
 * Safely remove an item from localStorage
 * @param key - The key to remove
 * @returns true if successful, false otherwise
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove storage item '${key}':`, error);
    }
  }
  return false;
}

/**
 * Safely clear all localStorage
 * @returns true if successful, false otherwise
 */
export function clearStorage(): boolean {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }
  return false;
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Safely get and parse JSON from localStorage
 * @param key - The key to retrieve
 * @returns The parsed object or null if not found or invalid JSON
 */
export function getStorageJSON<T = any>(key: string): T | null {
  const value = getStorageItem(key);
  if (value) {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON for storage item '${key}':`, error);
    }
  }
  return null;
}

/**
 * Safely stringify and set JSON in localStorage
 * @param key - The key to set
 * @param value - The object to store
 * @returns true if successful, false otherwise
 */
export function setStorageJSON(key: string, value: any): boolean {
  try {
    const jsonString = JSON.stringify(value);
    return setStorageItem(key, jsonString);
  } catch (error) {
    console.warn(`Failed to stringify JSON for storage item '${key}':`, error);
    return false;
  }
}
