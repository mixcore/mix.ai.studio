/**
 * @fileoverview Storage adapter interface and implementations for cross-platform compatibility
 *
 * This module provides an abstraction layer over different storage mechanisms,
 * enabling the SDK to work seamlessly across different environments like
 * browsers, Node.js, React Native, and other JavaScript runtime environments.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
/**
 * Storage adapter interface for cross-platform storage operations
 *
 * This interface defines the contract for storage implementations across
 * different environments and frameworks. Implementations can use localStorage,
 * sessionStorage, AsyncStorage, memory storage, or any other storage mechanism.
 *
 * @interface IStorageAdapter
 * @example
 * ```typescript
 * class CustomStorageAdapter implements IStorageAdapter {
 *   async setItem(key: string, value: string): Promise<boolean> {
 *     // Custom implementation
 *     return true;
 *   }
 *
 *   async getItem<T>(key: string): Promise<T | null> {
 *     // Custom implementation
 *     return null;
 *   }
 * }
 * ```
 */
export interface IStorageAdapter {
    /**
     * Store a key-value pair
     *
     * @param key - Storage key
     * @param value - Value to store (will be serialized if needed)
     * @returns Promise resolving to true if successful, false otherwise
     */
    setItem(key: string, value: string): Promise<boolean> | boolean;
    /**
     * Retrieve a value by key
     *
     * @param key - Storage key to retrieve
     * @returns Promise resolving to the stored value or null if not found
     */
    getItem<T = string>(key: string): Promise<T | null> | T | null;
    /**
     * Remove a key from storage
     *
     * @param key - Storage key to remove
     * @returns Promise resolving to true if successful, false otherwise
     */
    removeItem(key: string): Promise<boolean> | boolean;
    /**
     * Check if storage is available and functional
     *
     * @returns Promise resolving to true if storage is available, false otherwise
     */
    isAvailable(): Promise<boolean> | boolean;
    /**
     * Clear all stored data (optional)
     *
     * @returns Promise resolving to true if successful, false otherwise
     */
    clear?(): Promise<boolean> | boolean;
}
/**
 * Browser localStorage implementation
 *
 * Uses the browser's localStorage API with safe error handling.
 * Falls back gracefully when localStorage is not available.
 */
export declare class BrowserStorageAdapter implements IStorageAdapter {
    setItem(key: string, value: string): boolean;
    getItem<T = string>(key: string): T | null;
    removeItem(key: string): boolean;
    isAvailable(): boolean;
    clear(): boolean;
}
/**
 * Memory storage implementation
 *
 * Uses in-memory storage as a fallback when other storage methods
 * are not available. Data is lost when the application restarts.
 */
export declare class MemoryStorageAdapter implements IStorageAdapter {
    private storage;
    setItem(key: string, value: string): boolean;
    getItem<T = string>(key: string): T | null;
    removeItem(key: string): boolean;
    isAvailable(): boolean;
    clear(): boolean;
}
/**
 * Node.js storage implementation using file system
 *
 * For server-side applications or Node.js environments where
 * localStorage is not available. Stores data in JSON files.
 */
export declare class NodeStorageAdapter implements IStorageAdapter {
    private storagePath;
    private data;
    private initialized;
    constructor(storagePath?: string);
    private ensureInitialized;
    private saveData;
    setItem(key: string, value: string): Promise<boolean>;
    getItem<T = string>(key: string): Promise<T | null>;
    removeItem(key: string): Promise<boolean>;
    isAvailable(): Promise<boolean>;
    clear(): Promise<boolean>;
}
/**
 * Storage adapter factory
 *
 * Automatically detects the environment and returns the most appropriate
 * storage adapter. Provides a seamless experience across different platforms.
 */
export declare class StorageAdapterFactory {
    /**
     * Create the best storage adapter for the current environment
     *
     * @param customAdapter - Optional custom storage adapter to use
     * @returns The most appropriate storage adapter
     */
    static create(customAdapter?: IStorageAdapter): IStorageAdapter;
    /**
     * Create a specific type of storage adapter
     *
     * @param type - The type of storage adapter to create
     * @param options - Configuration options for the adapter
     * @returns The specified storage adapter
     */
    static createSpecific(type: 'browser' | 'memory' | 'node', options?: any): IStorageAdapter;
}
/**
 * Default storage adapter instance
 *
 * A singleton instance that can be used throughout the SDK.
 * Automatically selects the best adapter for the current environment.
 */
export declare const defaultStorageAdapter: IStorageAdapter;
