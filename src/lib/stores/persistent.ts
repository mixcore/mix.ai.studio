import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Creates a Svelte store that persists its value to localStorage
 * @param key - The localStorage key to use for persistence
 * @param initialValue - The initial value if nothing is found in localStorage
 * @param serializer - Custom serialization functions (defaults to JSON)
 */
export function persistentStore<T>(
  key: string,
  initialValue: T,
  serializer: {
    stringify: (value: T) => string;
    parse: (text: string) => T;
  } = {
    stringify: JSON.stringify,
    parse: JSON.parse
  }
): Writable<T> {
  // Load initial value from localStorage if in browser
  let storedValue = initialValue;
  
  if (browser) {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        storedValue = serializer.parse(item);
      }
    } catch (error) {
      console.warn(`Failed to load stored value for key "${key}":`, error);
      // Clear corrupted data
      localStorage.removeItem(key);
    }
  }

  const store = writable<T>(storedValue);

  // Subscribe to store changes and persist to localStorage
  if (browser) {
    store.subscribe((value) => {
      try {
        if (value === null || value === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, serializer.stringify(value));
        }
      } catch (error) {
        console.warn(`Failed to persist value for key "${key}":`, error);
      }
    });
  }

  return store;
}

/**
 * Creates a persistent store specifically for authentication data
 */
export function createAuthStore<T>(initialValue: T) {
  return persistentStore('mix_auth_state', initialValue);
}