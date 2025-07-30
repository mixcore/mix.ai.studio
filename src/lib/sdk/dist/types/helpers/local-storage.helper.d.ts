/**
 * @fileoverview Safe localStorage wrapper for the Mixcore SDK
 *
 * This module provides a safe wrapper around the browser's localStorage API
 * with proper error handling for environments where localStorage is not available
 * or when storage quota is exceeded. It ensures the SDK works reliably across
 * different browsers and environments.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
import { IStorageAdapter } from './storage-adapter';
/**
 * Safe localStorage wrapper with error handling and adapter support
 *
 * This utility class provides safe access to localStorage with fallback behavior
 * when localStorage is not available (e.g., in SSR environments, private browsing,
 * or when storage quota is exceeded). It gracefully handles all localStorage
 * operations without throwing errors and supports custom storage adapters.
 *
 * @class SafeLocalStorage
 * @example
 * ```typescript
 * // Store a token safely
 * SafeLocalStorage.setItem('access_token', 'abc123');
 *
 * // Retrieve a token (returns null if not found or localStorage unavailable)
 * const token = SafeLocalStorage.getItem('access_token');
 *
 * // Remove a token
 * SafeLocalStorage.removeItem('access_token');
 *
 * // Check if localStorage is available
 * if (SafeLocalStorage.isAvailable()) {
 *   console.log('LocalStorage is working');
 * }
 *
 * // Use custom storage adapter
 * SafeLocalStorage.setAdapter(customAdapter);
 * ```
 */
export declare class SafeLocalStorage {
    private static adapter;
    /**
     * Set a custom storage adapter
     *
     * @param adapter - Custom storage adapter to use
     */
    static setAdapter(adapter: IStorageAdapter): void;
    /**
     * Get the current storage adapter
     *
     * @returns Current storage adapter instance
     */
    static getAdapter(): IStorageAdapter;
    /**
     * Safely stores a key-value pair in localStorage
     *
     * Attempts to store the value in localStorage with error handling for cases
     * where storage is unavailable or quota is exceeded. Fails silently to prevent
     * breaking the application flow.
     *
     * @param key - The storage key
     * @param value - The value to store (will be converted to string)
     * @returns True if storage was successful, false otherwise
     *
     * @example
     * ```typescript
     * // Basic usage
     * SafeLocalStorage.setItem('username', 'johndoe');
     *
     * // Store complex data (JSON stringify first)
     * SafeLocalStorage.setItem('userProfile', JSON.stringify({
     *   name: 'John Doe',
     *   email: 'john@example.com'
     * }));
     *
     * // Check if storage was successful
     * const success = SafeLocalStorage.setItem('token', 'abc123');
     * if (!success) {
     *   console.warn('Failed to store token - localStorage unavailable');
     * }
     * ```
     */
    static setItem(key: string, value: string): Promise<boolean>;
    /**
     * Safely retrieves a value from localStorage
     *
     * Attempts to retrieve the value from localStorage with error handling.
     * Returns null if the key doesn't exist, localStorage is unavailable,
     * or any other error occurs.
     *
     * @param key - The storage key to retrieve
     * @returns The stored value as string, or null if not found/unavailable
     *
     * @example
     * ```typescript
     * // Basic retrieval
     * const username = await SafeLocalStorage.getItem('username');
     * if (username) {
     *   console.log('Welcome back,', username);
     * }
     *
     * // Retrieve and parse JSON data
     * const profileData = await SafeLocalStorage.getItem('userProfile');
     * if (profileData) {
     *   try {
     *     const profile = JSON.parse(profileData);
     *     console.log('User email:', profile.email);
     *   } catch (error) {
     *     console.warn('Invalid JSON in userProfile');
     *   }
     * }
     *
     * // With fallback value
     * const theme = (await SafeLocalStorage.getItem('theme')) || 'light';
     * ```
     */
    static getItem<T = string>(key: string): Promise<T | null>;
    /**
     * Safely removes a key from localStorage
     *
     * Attempts to remove the specified key from localStorage with error handling.
     * Fails silently if localStorage is unavailable or other errors occur.
     *
     * @param key - The storage key to remove
     * @returns True if removal was successful, false otherwise
     *
     * @example
     * ```typescript
     * // Remove a specific item
     * await SafeLocalStorage.removeItem('access_token');
     *
     * // Remove user session data
     * await SafeLocalStorage.removeItem('user_session');
     * await SafeLocalStorage.removeItem('refresh_token');
     *
     * // Check if removal was successful
     * const removed = await SafeLocalStorage.removeItem('temp_data');
     * if (removed) {
     *   console.log('Temporary data cleaned up');
     * }
     * ```
     */
    static removeItem(key: string): Promise<boolean>;
    /**
     * Checks if localStorage is available and functional
     *
     * Tests localStorage availability by attempting to store and retrieve a test value.
     * This is more reliable than just checking for the existence of localStorage,
     * as it also detects quota exceeded and permission issues.
     *
     * @returns True if localStorage is available and working, false otherwise
     *
     * @example
     * ```typescript
     * // Check availability before using
     * if (await SafeLocalStorage.isAvailable()) {
     *   await SafeLocalStorage.setItem('app_settings', JSON.stringify(settings));
     * } else {
     *   console.warn('LocalStorage not available - using memory storage');
     *   // Fall back to memory storage or other persistence method
     * }
     *
     * // Conditional feature enabling
     * const canRememberLogin = await SafeLocalStorage.isAvailable();
     * if (canRememberLogin) {
     *   // Show "Remember me" checkbox
     * }
     * ```
     */
    static isAvailable(): Promise<boolean>;
    /**
     * Clear all stored data
     *
     * @returns True if clearing was successful, false otherwise
     */
    static clear(): Promise<boolean>;
    /**
     * Synchronous version of setItem for backward compatibility
     * @deprecated Use async setItem instead
     */
    static setItemSync(key: string, value: string): boolean;
    /**
     * Synchronous version of getItem for backward compatibility
     * @deprecated Use async getItem instead
     */
    static getItemSync<T = string>(key: string): T | null;
    /**
     * Synchronous version of removeItem for backward compatibility
     * @deprecated Use async removeItem instead
     */
    static removeItemSync(key: string): boolean;
    /**
     * Synchronous version of isAvailable for backward compatibility
     * @deprecated Use async isAvailable instead
     */
    static isAvailableSync(): boolean;
}
