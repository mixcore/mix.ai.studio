import { __awaiter } from 'tslib';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';

// SDK Configuration Constants
const DEFAULT_CONFIG = {
    BASE_DOMAIN: "https://api.mixcore.io",
    BASE_API_PATH: "/api/v2",
    TOKEN_TYPE: "Bearer",
    TOKEN_KEY: "mix_access_token",
    REFRESH_TOKEN_KEY: "mix_refresh_token",
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    REQUEST_TIMEOUT: 30000, // 30 seconds
};
const SDK_HEADERS = {
    "x-sdk-name": "Web",
    "x-sdk-platform": "client",
    "x-sdk-language": "web",
    "x-sdk-version": "0.0.1",
};
const ENDPOINTS = {
    auth: {
        signIn: "/rest/auth/user/login",
        externalLogin: "/rest/auth/p4ps/external-login-unsecure",
        register: "/rest/auth/user/register",
        update: "/rest/auth/user/save",
        getProfile: "/rest/auth/user/my-profile",
        culture: "/rest/mix-portal/culture",
        renewToken: "/rest/auth/user/renew-token",
    },
    global: {
        globalSetting: "/rest/shared/get-global-settings",
        dashboardInfo: "/rest/mix-portal/common/en-US/dashboard",
        restartApp: "/rest/shared/stop-application",
        clearCache: "/rest/shared/clear-cache",
    },
    content: {
        pageContent: "/rest/mix-portal/mix-page-content",
        application: "/rest/mix-portal/mix-application",
        postContent: "/rest/mix-portal/mix-post-content",
        moduleContent: "/rest/mix-portal/mix-module-content",
        moduleData: "/rest/mix-portal/mix-module-data",
        postToPost: "/rest/mix-portal/mix-post-post",
        template: "/rest/mix-portal/mix-template",
        database: "/rest/mix-portal/mix-database",
        databaseRelation: "/rest/mix-portal/mix-database-relationship",
        databaseContext: "/rest/mix-portal/mixdb-context",
        getDatabaseBySystemName: "/rest/mix-portal/mix-database/get-by-name",
        mixDb: "/rest/mix-portal/mix-db",
        mixDbColumn: "/rest/mix-portal/mix-database-column",
    },
    storage: {
        upload: "/rest/mix-storage/upload-file",
        uploadBase64: "/rest/mix-storage/upload-file-stream",
        delete: "/rest/mix-storage/delete-file",
    },
    service: {
        metadata: "/rest/mix-services/metadata",
        getMetadata: "/rest/mix-services/metadata/get-metadata",
        createMetadataAsc: "/rest/mix-services/metadata/create-metadata-association",
        deleteMetadataAsc: "/rest/mix-services/metadata/delete-metadata-association",
        sync: "/api/daphale/sync/products",
    },
    settings: {
        config: "/rest/mix-portal/configuration",
    },
    user: {
        list: "/rest/auth/user/list",
        detail: "/rest/auth/user/details",
        register: "/rest/auth/user/register",
        changePassword: "/rest/auth/user/change-password",
        role: "/rest/auth/role",
        permission: "/rest/mix-services/permission",
        delete: "/rest/auth/user/remove-user",
        toggleRole: "/rest/auth/user/user-in-role",
    },
    events: {
        scheduler: "/scheduler",
    },
    log: {
        search: "/rest/mix-log/audit-log/search",
    },
    database: "/rest/mix-portal/mixdb-context",
    table: "/rest/mix-portal/mix-database",
};

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
 * Browser localStorage implementation
 *
 * Uses the browser's localStorage API with safe error handling.
 * Falls back gracefully when localStorage is not available.
 */
class BrowserStorageAdapter {
    setItem(key, value) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
                return true;
            }
            return false;
        }
        catch (error) {
            console.warn(`Failed to store item in localStorage: ${error}`);
            return false;
        }
    }
    getItem(key) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const value = window.localStorage.getItem(key);
                if (!value)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return value;
                }
            }
            return null;
        }
        catch (error) {
            console.warn('LocalStorage is not available:', error);
            return null;
        }
    }
    removeItem(key) {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
                return true;
            }
            return false;
        }
        catch (error) {
            console.warn(`Failed to remove item from localStorage: ${error}`);
            return false;
        }
    }
    isAvailable() {
        try {
            if (typeof window === 'undefined' || !window.localStorage) {
                return false;
            }
            const testKey = '__mixcore_test__';
            const testValue = 'test';
            window.localStorage.setItem(testKey, testValue);
            const retrieved = window.localStorage.getItem(testKey);
            window.localStorage.removeItem(testKey);
            return retrieved === testValue;
        }
        catch (_error) {
            return false;
        }
    }
    clear() {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.clear();
                return true;
            }
            return false;
        }
        catch (error) {
            console.warn(`Failed to clear localStorage: ${error}`);
            return false;
        }
    }
}
/**
 * Memory storage implementation
 *
 * Uses in-memory storage as a fallback when other storage methods
 * are not available. Data is lost when the application restarts.
 */
class MemoryStorageAdapter {
    constructor() {
        this.storage = new Map();
    }
    setItem(key, value) {
        try {
            this.storage.set(key, value);
            return true;
        }
        catch (error) {
            console.warn(`Failed to store item in memory: ${error}`);
            return false;
        }
    }
    getItem(key) {
        try {
            const value = this.storage.get(key);
            if (!value)
                return null;
            try {
                return JSON.parse(value);
            }
            catch (_a) {
                return value;
            }
        }
        catch (error) {
            console.warn('Memory storage error:', error);
            return null;
        }
    }
    removeItem(key) {
        try {
            return this.storage.delete(key);
        }
        catch (error) {
            console.warn(`Failed to remove item from memory: ${error}`);
            return false;
        }
    }
    isAvailable() {
        return true;
    }
    clear() {
        try {
            this.storage.clear();
            return true;
        }
        catch (error) {
            console.warn(`Failed to clear memory storage: ${error}`);
            return false;
        }
    }
}
/**
 * Node.js storage implementation using file system
 *
 * For server-side applications or Node.js environments where
 * localStorage is not available. Stores data in JSON files.
 */
class NodeStorageAdapter {
    constructor(storagePath = './.mixcore-storage.json') {
        this.data = {};
        this.initialized = false;
        this.storagePath = storagePath;
    }
    ensureInitialized() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized)
                return;
            try {
                // Check if we're in Node.js environment
                if (typeof window === 'undefined' && typeof require !== 'undefined') {
                    const fs = require('fs').promises;
                    try {
                        const data = yield fs.readFile(this.storagePath, 'utf8');
                        this.data = JSON.parse(data);
                    }
                    catch (error) {
                        // File doesn't exist or is invalid, start with empty data
                        this.data = {};
                    }
                }
                this.initialized = true;
            }
            catch (error) {
                console.warn('Failed to initialize Node storage:', error);
                this.data = {};
                this.initialized = true;
            }
        });
    }
    saveData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (typeof window === 'undefined' && typeof require !== 'undefined') {
                    const fs = require('fs').promises;
                    yield fs.writeFile(this.storagePath, JSON.stringify(this.data, null, 2));
                }
            }
            catch (error) {
                console.warn('Failed to save Node storage:', error);
            }
        });
    }
    setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureInitialized();
                this.data[key] = value;
                yield this.saveData();
                return true;
            }
            catch (error) {
                console.warn(`Failed to store item in Node storage: ${error}`);
                return false;
            }
        });
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureInitialized();
                const value = this.data[key];
                if (!value)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch (_a) {
                    return value;
                }
            }
            catch (error) {
                console.warn('Node storage error:', error);
                return null;
            }
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureInitialized();
                delete this.data[key];
                yield this.saveData();
                return true;
            }
            catch (error) {
                console.warn(`Failed to remove item from Node storage: ${error}`);
                return false;
            }
        });
    }
    isAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return typeof window === 'undefined' && typeof require !== 'undefined';
            }
            catch (_a) {
                return false;
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.ensureInitialized();
                this.data = {};
                yield this.saveData();
                return true;
            }
            catch (error) {
                console.warn(`Failed to clear Node storage: ${error}`);
                return false;
            }
        });
    }
}
/**
 * Storage adapter factory
 *
 * Automatically detects the environment and returns the most appropriate
 * storage adapter. Provides a seamless experience across different platforms.
 */
class StorageAdapterFactory {
    /**
     * Create the best storage adapter for the current environment
     *
     * @param customAdapter - Optional custom storage adapter to use
     * @returns The most appropriate storage adapter
     */
    static create(customAdapter) {
        if (customAdapter) {
            return customAdapter;
        }
        // Browser environment with localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
            const browserAdapter = new BrowserStorageAdapter();
            if (browserAdapter.isAvailable()) {
                return browserAdapter;
            }
        }
        // Node.js environment
        if (typeof window === 'undefined' && typeof require !== 'undefined') {
            return new NodeStorageAdapter();
        }
        // Fallback to memory storage
        return new MemoryStorageAdapter();
    }
    /**
     * Create a specific type of storage adapter
     *
     * @param type - The type of storage adapter to create
     * @param options - Configuration options for the adapter
     * @returns The specified storage adapter
     */
    static createSpecific(type, options) {
        switch (type) {
            case 'browser':
                return new BrowserStorageAdapter();
            case 'memory':
                return new MemoryStorageAdapter();
            case 'node':
                return new NodeStorageAdapter(options === null || options === void 0 ? void 0 : options.storagePath);
            default:
                throw new Error(`Unknown storage adapter type: ${type}`);
        }
    }
}
/**
 * Default storage adapter instance
 *
 * A singleton instance that can be used throughout the SDK.
 * Automatically selects the best adapter for the current environment.
 */
const defaultStorageAdapter = StorageAdapterFactory.create();

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
class SafeLocalStorage {
    /**
     * Set a custom storage adapter
     *
     * @param adapter - Custom storage adapter to use
     */
    static setAdapter(adapter) {
        this.adapter = adapter;
    }
    /**
     * Get the current storage adapter
     *
     * @returns Current storage adapter instance
     */
    static getAdapter() {
        return this.adapter;
    }
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
    static setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.adapter.setItem(key, value);
                return Promise.resolve(result);
            }
            catch (error) {
                console.warn(`Failed to store item: ${error}`);
                return false;
            }
        });
    }
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
    static getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.adapter.getItem(key);
                return Promise.resolve(result);
            }
            catch (error) {
                console.warn('Storage retrieval error:', error);
                return null;
            }
        });
    }
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
    static removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.adapter.removeItem(key);
                return Promise.resolve(result);
            }
            catch (error) {
                console.warn(`Failed to remove item: ${error}`);
                return false;
            }
        });
    }
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
    static isAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.adapter.isAvailable();
                return Promise.resolve(result);
            }
            catch (_a) {
                return false;
            }
        });
    }
    /**
     * Clear all stored data
     *
     * @returns True if clearing was successful, false otherwise
     */
    static clear() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.adapter.clear) {
                    const result = yield this.adapter.clear();
                    return Promise.resolve(result);
                }
                return false;
            }
            catch (error) {
                console.warn(`Failed to clear storage: ${error}`);
                return false;
            }
        });
    }
    // Backward compatibility - synchronous methods
    // These methods work synchronously when the adapter supports it,
    // otherwise they return default values or false
    /**
     * Synchronous version of setItem for backward compatibility
     * @deprecated Use async setItem instead
     */
    static setItemSync(key, value) {
        try {
            const result = this.adapter.setItem(key, value);
            return result instanceof Promise ? false : result;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Synchronous version of getItem for backward compatibility
     * @deprecated Use async getItem instead
     */
    static getItemSync(key) {
        try {
            const result = this.adapter.getItem(key);
            return result instanceof Promise ? null : result;
        }
        catch (_a) {
            return null;
        }
    }
    /**
     * Synchronous version of removeItem for backward compatibility
     * @deprecated Use async removeItem instead
     */
    static removeItemSync(key) {
        try {
            const result = this.adapter.removeItem(key);
            return result instanceof Promise ? false : result;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Synchronous version of isAvailable for backward compatibility
     * @deprecated Use async isAvailable instead
     */
    static isAvailableSync() {
        try {
            const result = this.adapter.isAvailable();
            return result instanceof Promise ? false : result;
        }
        catch (_a) {
            return false;
        }
    }
}
SafeLocalStorage.adapter = defaultStorageAdapter;

// SDK Error Types
class MixcoreSDKError extends Error {
    constructor(message, code, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'MixcoreSDKError';
    }
}
class AuthenticationError extends MixcoreSDKError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTH_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}
class NetworkError extends MixcoreSDKError {
    constructor(message = 'Network request failed') {
        super(message, 'NETWORK_ERROR');
        this.name = 'NetworkError';
    }
}
class ValidationError extends MixcoreSDKError {
    constructor(message = 'Validation failed') {
        super(message, 'VALIDATION_ERROR', 400);
        this.name = 'ValidationError';
    }
}

/**
 * @fileoverview Input validation utilities for the Mixcore SDK
 *
 * This module provides comprehensive validation functions for SDK inputs including
 * parameter validation, database name validation, and data integrity checks.
 * These validations help prevent common errors and ensure data quality.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
/**
 * Validates that a value is not null, undefined, or empty string
 *
 * This function checks for the presence of required parameters and throws
 * a descriptive error if the value is missing. It's used throughout the SDK
 * to ensure all required parameters are provided before making API calls.
 *
 * @param value - The value to validate
 * @param paramName - Name of the parameter for error messages
 * @throws {ValidationError} When value is null, undefined, or empty string
 *
 * @example
 * ```typescript
 * // Valid usage
 * validateRequired('users', 'databaseName'); // passes
 * validateRequired(123, 'userId'); // passes
 * validateRequired(false, 'isActive'); // passes (boolean false is valid)
 *
 * // Invalid usage (throws ValidationError)
 * validateRequired(null, 'email'); // throws: "email is required"
 * validateRequired(undefined, 'password'); // throws: "password is required"
 * validateRequired('', 'username'); // throws: "username cannot be empty"
 * validateRequired('   ', 'token'); // throws: "token cannot be empty" (trimmed)
 * ```
 */
function validateRequired(value, paramName) {
    if (value === null || value === undefined) {
        throw new ValidationError(`${paramName} is required`);
    }
    // Check for empty strings (including whitespace-only strings)
    if (typeof value === 'string' && value.trim() === '') {
        throw new ValidationError(`${paramName} cannot be empty`);
    }
}
/**
 * Validates database system names according to Mixcore naming conventions
 *
 * Database system names must follow specific rules to ensure compatibility
 * with the Mixcore API and prevent security issues. This function validates
 * the name format and characters used.
 *
 * Validation Rules:
 * - Must not be empty or only whitespace
 * - Must be between 1 and 100 characters
 * - Can contain letters, numbers, underscores, and hyphens
 * - Cannot start or end with special characters
 * - Cannot contain consecutive special characters
 *
 * @param name - The database system name to validate
 * @throws {ValidationError} When name doesn't meet requirements
 *
 * @example
 * ```typescript
 * // Valid database names
 * validateDatabaseSystemName('users'); // passes
 * validateDatabaseSystemName('user_profiles'); // passes
 * validateDatabaseSystemName('product-categories'); // passes
 * validateDatabaseSystemName('mix_database_2024'); // passes
 *
 * // Invalid database names (throws ValidationError)
 * validateDatabaseSystemName(''); // empty
 * validateDatabaseSystemName('user@profiles'); // invalid character @
 * validateDatabaseSystemName('_users'); // starts with underscore
 * validateDatabaseSystemName('users-'); // ends with hyphen
 * validateDatabaseSystemName('user__profiles'); // consecutive underscores
 * validateDatabaseSystemName('a'.repeat(101)); // too long
 * ```
 */
function validateDatabaseSystemName(name) {
    validateRequired(name, 'databaseSystemName');
    // Check length constraints
    if (name.length > 100) {
        throw new ValidationError('Database system name cannot exceed 100 characters');
    }
    // Check for valid characters: letters, numbers, underscores, hyphens
    const validCharPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validCharPattern.test(name)) {
        throw new ValidationError('Database system name can only contain letters, numbers, underscores, and hyphens');
    }
    // Check that it doesn't start or end with special characters
    const startsOrEndsWithSpecial = /^[_-]|[_-]$/;
    if (startsOrEndsWithSpecial.test(name)) {
        throw new ValidationError('Database system name cannot start or end with underscores or hyphens');
    }
    // Check for consecutive special characters
    const consecutiveSpecial = /[_-]{2,}/;
    if (consecutiveSpecial.test(name)) {
        throw new ValidationError('Database system name cannot contain consecutive underscores or hyphens');
    }
}
/**
 * Validates that a value is a non-null object
 *
 * This function ensures that data parameters are valid objects that can be
 * processed by the API. It checks for proper object type and rejects primitives,
 * arrays, functions, and other non-object types.
 *
 * @param obj - The value to validate as an object
 * @param paramName - Name of the parameter for error messages
 * @throws {ValidationError} When value is not a valid object
 *
 * @example
 * ```typescript
 * // Valid usage
 * validateObject({ name: 'John', age: 30 }, 'userData'); // passes
 * validateObject({ id: 1 }, 'updateData'); // passes
 * validateObject({}, 'emptyObject'); // passes (empty object is valid)
 *
 * // Invalid usage (throws ValidationError)
 * validateObject(null, 'data'); // throws: "data must be a valid object"
 * validateObject(undefined, 'userData'); // throws: "userData is required"
 * validateObject('string', 'data'); // throws: "data must be a valid object"
 * validateObject([1, 2, 3], 'data'); // throws: "data must be a valid object"
 * validateObject(123, 'data'); // throws: "data must be a valid object"
 * validateObject(function() {}, 'data'); // throws: "data must be a valid object"
 * ```
 */
function validateObject(obj, paramName) {
    validateRequired(obj, paramName);
    // Check that it's actually an object and not an array, function, or primitive
    if (typeof obj !== 'object' || Array.isArray(obj) || obj instanceof Date) {
        throw new ValidationError(`${paramName} must be a valid object`);
    }
}

let unAuthorizedHandling;
const API = axios.create({
    baseURL: "",
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
    },
});
const renewToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = yield SafeLocalStorage.getItem(DEFAULT_CONFIG.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }
    try {
        // Send request to renew token
        const response = yield API.post(ENDPOINTS.auth.renewToken, { refreshToken });
        const data = response.data;
        return data;
    }
    catch (error) {
        console.error("Error renewing token:", error);
        throw error;
    }
});
// Add request interceptor
API.interceptors.request.use((config) => {
    const token = SafeLocalStorage.getItemSync("mix_access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
API.interceptors.response.use((response) => response, (error) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const originalRequest = error.config; // Use 'any' to handle custom properties like '_retry'
    if (originalRequest &&
        ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 &&
        !originalRequest._retry) {
        originalRequest._retry = true; // Mark the request as retried
        try {
            // Attempt to renew the token
            const newTokenInfo = yield renewToken();
            // Update the Authorization header with the new token
            API.defaults.headers.common.Authorization = `Bearer ${newTokenInfo.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newTokenInfo.accessToken}`;
            // Retry the original request
            return API(originalRequest);
        }
        catch (renewError) {
            // Save redirect URL if in browser environment
            if (typeof window !== 'undefined') {
                SafeLocalStorage.setItemSync("mix_redirect_url", window.location.href);
            }
            unAuthorizedHandling === null || unAuthorizedHandling === void 0 ? void 0 : unAuthorizedHandling();
            // If token renewal fails, propagate the original error
            throw renewError;
        }
    }
    throw {
        status: ((_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.status) || 500,
        data: ((_c = error === null || error === void 0 ? void 0 : error.response) === null || _c === void 0 ? void 0 : _c.data) || {
            code: "UNKNOWN_ERROR",
            message: "An unknown error occurred",
        },
        message: ((_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || "An unknown error occurred",
    };
}));
/**
 * Sets the authorization token in the Axios instance
 * @param token - The authorization token, if undefined, the token will be removed
 * @param type - The token type (default: 'Bearer')
 */
const setAuthToken = (accessToken, type = "Bearer") => {
    if (accessToken)
        API.defaults.headers.common.Authorization = `${type} ${accessToken}`;
    else
        delete API.defaults.headers.common.Authorization;
};
/**
 * Sets the base URL for the Axios instance
 * @param baseUrl - The base domain of mixcore server to set, if undefined, it will reset to the default BASE_URL
 */
const setBaseUrl = (baseUrl) => {
    API.defaults.baseURL = `${baseUrl}`;
};
const setUnAuthorizedHandling = (callback) => {
    unAuthorizedHandling = callback;
};

class CryptoService {
    constructor() {
        this.size = 256;
    }
    encryptAES(message, iCompleteEncodedKey) {
        const aesKeys = new AESKey(iCompleteEncodedKey);
        const options = {
            iv: aesKeys.iv,
            keySize: this.size / 8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        };
        return CryptoJS.AES.encrypt(message, aesKeys.key, options).toString();
    }
    decryptAES(ciphertext, iCompleteEncodedKey) {
        const aesKeys = new AESKey(iCompleteEncodedKey);
        const options = {
            iv: aesKeys.iv,
            keySize: this.size / 8,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        };
        const decrypted = CryptoJS.AES.decrypt(ciphertext, aesKeys.key, options);
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}
class AESKey {
    constructor(encryptedKeys) {
        const keyStrings = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(encryptedKeys)).split(',');
        this.iv = CryptoJS.enc.Base64.parse(keyStrings[0]);
        this.key = CryptoJS.enc.Base64.parse(keyStrings[1]);
    }
}
const cryptoService = new CryptoService();

/**
 * @fileoverview Authentication module for the Mixcore SDK
 *
 * This module handles all authentication-related operations including login, logout,
 * user registration, profile management, and secure token storage. It provides
 * encrypted login capabilities and automatic token management.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
/**
 * Authentication module for the Mixcore SDK
 *
 * The MixcoreAuth class provides comprehensive authentication functionality including
 * secure login with AES encryption, user registration, profile management, and
 * automatic token storage. It integrates with the main MixcoreClient to provide
 * seamless authentication across all SDK operations.
 *
 * @class MixcoreAuth
 * @example
 * ```typescript
 * // Access through client instance
 * const client = new MixcoreClient({ ... });
 * const auth = client.auth;
 *
 * // Login with email/password
 * const tokenInfo = await auth.login({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 *
 * // Check authentication status
 * console.log('Authenticated:', !!auth.tokenInfo);
 * console.log('Current user:', auth.currentUser);
 *
 * // Logout
 * auth.logout(() => {
 *   console.log('User logged out successfully');
 * });
 * ```
 */
class MixcoreAuth {
    /**
     * Gets the client configuration
     * Provides access to token keys, endpoint settings, and other config
     *
     * @returns Client configuration object
     */
    get config() {
        return this.client.config;
    }
    /**
     * Creates a new MixcoreAuth instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client) {
        this.roles = null;
        /**
         * Authenticates a user with encrypted credentials
         *
         * This method performs secure user authentication by encrypting the login request
         * using AES encryption with the API encryption key from global settings. Upon
         * successful authentication, it stores the tokens securely and sets up the
         * authentication headers for future requests.
         *
         * @param request - Login credentials (email/username and password)
         * @param callBack - Optional callback handlers for success/error/finally events
         * @returns Promise that resolves to token information on successful login
         * @throws {AuthenticationError} When login credentials are invalid
         * @throws {NetworkError} When the request fails or server is unreachable
         * @throws {ValidationError} When request data is invalid
         *
         * @example
         * ```typescript
         * // Basic login
         * const tokenInfo = await auth.login({
         *   email: 'user@example.com',
         *   password: 'mySecurePassword'
         * });
         * console.log('Access token:', tokenInfo.accessToken);
         *
         * // Login with callback handling
         * await auth.login({
         *   username: 'johndoe',
         *   password: 'password123'
         * }, {
         *   success: (data) => {
         *     console.log('Login successful!', data);
         *     // Redirect to dashboard
         *   },
         *   error: (error) => {
         *     console.error('Login failed:', error.message);
         *     // Show error message to user
         *   },
         *   finally: () => {
         *     console.log('Login attempt completed');
         *     // Hide loading spinner
         *   }
         * });
         *
         * // Check if user is authenticated
         * if (auth.tokenInfo) {
         *   console.log('User is authenticated');
         * }
         * ```
         */
        this.login = (request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            // Encrypt the login request using the API encryption key
            // This ensures credentials are never sent in plain text
            const encrypted = cryptoService.encryptAES(JSON.stringify(request), ((_a = this.client.globalSetting) === null || _a === void 0 ? void 0 : _a.apiEncryptKey) || "");
            try {
                // Send encrypted login request to server
                const response = yield API.post(ENDPOINTS.auth.signIn, {
                    message: encrypted,
                });
                const data = response.data;
                yield this._handleAuthSuccess(data);
                const profile = yield this.initUserData();
                // Notify success callback if provided
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _b === void 0 ? void 0 : _b.call(callBack, Object.assign(Object.assign(Object.assign({}, data), profile), { redirectUrl: this.getRedirectUrl() }));
                return data;
            }
            catch (error) {
                // Notify error callback if provided
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _c === void 0 ? void 0 : _c.call(callBack, error);
                throw error;
            }
            finally {
                // Always call finally callback if provided
                (_d = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _d === void 0 ? void 0 : _d.call(callBack);
            }
        });
        this.checkAuthSessionExpired = () => {
            const token = SafeLocalStorage.getItemSync(this.config.tokenKey);
            if (!token) {
                this.setRedirectUrl();
                return true; // No token means session is expired
            }
            try {
                const base64Url = token.split(".")[1];
                if (!base64Url)
                    throw new Error("Invalid JWT");
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join(""));
                const payload = JSON.parse(jsonPayload);
                const now = Math.floor(Date.now() / 1000);
                const isExpired = payload.exp && now >= payload.exp;
                if (isExpired) {
                    this.setRedirectUrl();
                }
                return isExpired;
            }
            catch (err) {
                console.error("Failed to decode JWT:", err);
                return true;
            }
        };
        /**
         * Registers a new user account
         *
         * Creates a new user account with the provided registration data. The user
         * will need to verify their account (if email verification is enabled) before
         * they can log in.
         *
         * @param userData - Registration information including username, email, password, etc.
         * @param callBack - Optional callback handlers for success/error/finally events
         * @returns Promise that resolves when registration is successful
         * @throws {ValidationError} When registration data is invalid or incomplete
         * @throws {NetworkError} When the request fails or server is unreachable
         * @throws {AuthenticationError} When registration is not allowed or conflicts exist
         *
         * @example
         * ```typescript
         * // Basic registration
         * await auth.register({
         *   username: 'newuser',
         *   email: 'newuser@example.com',
         *   password: 'securePassword123',
         *   firstName: 'John',
         *   lastName: 'Doe'
         * });
         *
         * // Registration with callback handling
         * await auth.register({
         *   username: 'jane_doe',
         *   email: 'jane@example.com',
         *   password: 'myPassword456'
         * }, {
         *   success: () => {
         *     console.log('Registration successful!');
         *     // Show success message or redirect to verification page
         *   },
         *   error: (error) => {
         *     console.error('Registration failed:', error.message);
         *     // Show specific error (email taken, weak password, etc.)
         *   },
         *   finally: () => {
         *     console.log('Registration request completed');
         *     // Re-enable form or hide loading state
         *   }
         * });
         * ```
         */
        this.register = (userData, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // Send registration request to server
                const response = yield API.post(ENDPOINTS.auth.register, userData);
                const data = response.data;
                // Notify success callback if provided
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                // Notify error callback if provided
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
            finally {
                // Always call finally callback if provided
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.getRedirectUrl = () => {
            // Retrieve the redirect URL from local storage
            const redirectUrl = SafeLocalStorage.getItemSync("mix_redirect_url");
            return redirectUrl;
        };
        this.clearRedirectUrl = () => {
            SafeLocalStorage.removeItemSync("mix_redirect_url");
        };
        this.setRedirectUrl = () => {
            if (typeof window !== 'undefined' && window.location) {
                SafeLocalStorage.setItemSync("mix_redirect_url", window.location.pathname);
            }
        };
        /**
         * Initializes or refreshes current user profile data
         *
         * Fetches the current authenticated user's profile information from the server
         * and stores it in the currentUser property. This method is useful for getting
         * up-to-date user information or initializing user data after login.
         *
         * @returns Promise that resolves to the user profile data
         * @throws {AuthenticationError} When user is not authenticated
         * @throws {NetworkError} When the request fails or server is unreachable
         *
         * @example
         * ```typescript
         * // Get current user profile
         * const profile = await auth.initUserData();
         * console.log('User details:', profile);
         * console.log('Username:', profile.username);
         * console.log('Email:', profile.email);
         * console.log('Roles:', profile.roles);
         *
         * // Access cached user data
         * console.log('Cached user:', auth.currentUser);
         *
         * // Refresh user data (e.g., after profile update)
         * const updatedProfile = await auth.initUserData();
         * console.log('Updated profile:', updatedProfile);
         * ```
         */
        this.initUserData = (callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const fetchUserProfile = () => __awaiter(this, void 0, void 0, function* () {
                const response = yield API.get(ENDPOINTS.auth.getProfile);
                return response.data;
            });
            try {
                const profile = yield fetchUserProfile();
                this.currentUser = profile;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, profile);
                return profile;
            }
            catch (e) {
                this.setRedirectUrl();
                this.currentUser = undefined;
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, e);
                throw e;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.getUsers = (query, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // Fetch user list from the server
                const response = yield API.get(ENDPOINTS.user.list, { params: query });
                const data = response.data;
                // Notify success callback if provided
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                // Notify error callback if provided
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
            finally {
                // Always call finally callback if provided
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.updateUserProfile = (userData, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const response = yield API.put(ENDPOINTS.auth.update, userData);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.getUserProfileById = (userId, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Fetch user profile by ID from the server
                const response = yield API.get(`${ENDPOINTS.user.detail}/${userId}`);
                const data = response.data;
                // Notify success callback if provided
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                // Notify error callback if provided
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
        });
        this.removeUserById = (userId, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Fetch user profile by ID from the server
                const response = yield API.get(`${ENDPOINTS.user.delete}/${userId}`);
                const data = response.data;
                // Notify success callback if provided
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                // Notify error callback if provided
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
        });
        this.changeUserPassword = (data, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const response = yield API.post(`${ENDPOINTS.user.changePassword}`, data);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, response.data);
            }
            catch (error) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Handles successful authentication
         *
         * This private method processes successful login responses by storing tokens
         * securely in local storage and setting up authentication headers for future
         * API requests. It's called automatically after successful login.
         *
         * @private
         * @param data - Token information from successful login
         */
        this._handleAuthSuccess = (data) => __awaiter(this, void 0, void 0, function* () {
            // Store token information in memory
            this.tokenInfo = data;
            // Securely store tokens in local storage for persistence
            yield SafeLocalStorage.setItem(this.config.tokenKey, data.accessToken);
            yield SafeLocalStorage.setItem(this.config.refreshTokenKey, data.refreshToken);
            // Set authentication header for all future requests
            setAuthToken(data.accessToken, data.tokenType || "Bearer");
        });
        this.client = client;
    }
    getUserRoles() {
        // Get the current authentication token
        const token = SafeLocalStorage.getItemSync(this.config.tokenKey);
        if (!token)
            return [];
        if (this.roles !== null)
            return this.roles || [];
        try {
            // Decode token payload
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""));
            const payload = JSON.parse(jsonPayload);
            // Extract roles from claim
            const roleClaim = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
            const roles = (payload[roleClaim] || payload.roles || []);
            // remove any suffixes like "-1" or "–1" from role names of tenant id
            const cleanedRoles = roles.map((role) => role.replace(/[-–]\d+$/, ""));
            this.roles = cleanedRoles;
            return this.roles;
        }
        catch (e) {
            console.error("Failed to decode or extract roles:", e);
            return [];
        }
    }
    /**
     * Logs out the current user
     *
     * Performs a complete logout by clearing all stored authentication tokens,
     * removing user data from memory, and optionally executing a callback function.
     * This ensures the user is completely signed out and no sensitive data remains
     * in local storage or memory.
     *
     * @param callback - Optional function to execute after logout is complete
     *
     * @example
     * ```typescript
     * // Simple logout
     * auth.logout();
     *
     * // Logout with callback for cleanup/navigation
     * auth.logout(() => {
     *   console.log('User logged out successfully');
     *   // Clear application state
     *   // Redirect to login page
     *   window.location.href = '/login';
     * });
     *
     * // Check authentication status after logout
     * console.log('Still authenticated:', !!auth.tokenInfo); // false
     * console.log('User data:', auth.currentUser); // undefined
     * ```
     */
    logout(callback) {
        // Clear stored authentication tokens from local storage
        SafeLocalStorage.removeItemSync(this.config.tokenKey);
        SafeLocalStorage.removeItemSync(this.config.refreshTokenKey);
        // Clear in-memory authentication data
        this.tokenInfo = undefined;
        this.currentUser = undefined;
        // Execute optional callback for additional cleanup
        if (callback)
            callback();
    }
}

var EDataType;
(function (EDataType) {
    EDataType["String"] = "String";
    EDataType["Custom"] = "Custom";
    EDataType["DateTime"] = "DateTime";
    EDataType["Date"] = "Date";
    EDataType["Time"] = "Time";
    EDataType["DateTimeLocal"] = "DateTimeLocal";
    EDataType["Duration"] = "Duration";
    EDataType["PhoneNumber"] = "PhoneNumber";
    EDataType["Double"] = "Double";
    EDataType["Text"] = "Text";
    EDataType["Html"] = "Html";
    EDataType["MultilineText"] = "MultilineText";
    EDataType["EmailAddress"] = "EmailAddress";
    EDataType["Password"] = "Password";
    EDataType["Url"] = "Url";
    EDataType["ImageUrl"] = "ImageUrl";
    EDataType["CreditCard"] = "CreditCard";
    EDataType["PostalCode"] = "PostalCode";
    EDataType["Upload"] = "Upload";
    EDataType["Color"] = "Color";
    EDataType["Boolean"] = "Boolean";
    EDataType["Icon"] = "Icon";
    EDataType["VideoYoutube"] = "VideoYoutube";
    EDataType["TuiEditor"] = "TuiEditor";
    EDataType["Integer"] = "Integer";
    EDataType["Guid"] = "Guid";
    EDataType["Reference"] = "Reference";
    EDataType["QRCode"] = "QRCode";
    EDataType["Tag"] = "Tag";
    EDataType["Json"] = "Json";
    EDataType["Array"] = "Array";
    EDataType["ArrayMedia"] = "ArrayMedia";
    EDataType["ArrayRadio"] = "ArrayRadio";
    EDataType["Long"] = "Long";
})(EDataType || (EDataType = {}));

/**
 * Enum representing different search methods that can be used in queries
 */
var ESearchMethod;
(function (ESearchMethod) {
    /** Performs a LIKE search operation */
    ESearchMethod["Like"] = "Like";
    /** Performs an IN search operation */
    ESearchMethod["In"] = "In";
    /** Performs a range-based search operation */
    ESearchMethod["InRange"] = "InRange";
    /** Performs an exact match search operation */
    ESearchMethod["Equal"] = "Equal";
})(ESearchMethod || (ESearchMethod = {}));
/**
 * Enum representing different comparison operators for filtering data
 */
var ECompareOperator;
(function (ECompareOperator) {
    /** Case-sensitive pattern matching */
    ECompareOperator["Like"] = "Like";
    /** Case-insensitive pattern matching */
    ECompareOperator["ILike"] = "ILike";
    /** Exact equality comparison */
    ECompareOperator["Equal"] = "Equal";
    /** Not equal comparison */
    ECompareOperator["NotEqual"] = "NotEqual";
    /** Less than or equal to comparison */
    ECompareOperator["LessThanOrEqual"] = "LessThanOrEqual";
    /** Less than comparison */
    ECompareOperator["LessThan"] = "LessThan";
    /** Greater than comparison */
    ECompareOperator["GreaterThan"] = "GreaterThan";
    /** Greater than or equal to comparison */
    ECompareOperator["GreaterThanOrEqual"] = "GreaterThanOrEqual";
    /** Checks if value contains the specified string */
    ECompareOperator["Contain"] = "Contain";
    /** Checks if value does not contain the specified string */
    ECompareOperator["NotContain"] = "NotContain";
    /** Checks if value falls within a specified range */
    ECompareOperator["InRange"] = "InRange";
})(ECompareOperator || (ECompareOperator = {}));
/**
 * Enum representing sort directions for ordering data
 */
var ESortDirection;
(function (ESortDirection) {
    /** Sort in ascending order */
    ESortDirection["Asc"] = "Asc";
    /** Sort in descending order */
    ESortDirection["Desc"] = "Desc";
})(ESortDirection || (ESortDirection = {}));

class PaginationModel {
    static default() {
        return new PaginationModel();
    }
    constructor(value) {
        var _a, _b;
        this.pageIndex = 0;
        this.pageSize = 10;
        if (value) {
            this.pageIndex = (_a = value.pageIndex) !== null && _a !== void 0 ? _a : 0;
            this.page = value.page;
            this.pageSize = (_b = value.pageSize) !== null && _b !== void 0 ? _b : 10;
            this.total = value.total;
            this.totalPage = value.totalPage;
            this.canGoNext = (value.pageIndex || 0) < (value.totalPage || 1) - 1;
            this.canGoPrevious = (value.pageIndex || 0) > 0;
        }
    }
}

var EMixContentStatus;
(function (EMixContentStatus) {
    EMixContentStatus["All"] = "All";
    EMixContentStatus["Deleted"] = "Deleted";
    EMixContentStatus["Preview"] = "Preview";
    EMixContentStatus["Published"] = "Published";
    EMixContentStatus["Draft"] = "Draft";
    EMixContentStatus["Schedule"] = "Schedule";
})(EMixContentStatus || (EMixContentStatus = {}));

/**
 * A query builder class for constructing complex database queries with pagination, filtering, and sorting capabilities.
 * Implements IPaginationRequestModel to support pagination and filtering operations.
 */
class MixQuery {
    /**
     * Creates a new MixQuery instance
     * @param value - Optional initial values for the query
     */
    constructor(value) {
        this.conjunction = "And";
        if (value)
            Object.assign(this, value);
    }
    /**
     * Sets default pagination values
     * @param pageSize - Number of items per page (default: 25)
     * @returns The current MixQuery instance for method chaining
     */
    default(pageSize = 25) {
        this.pageIndex = 0;
        this.pageSize = pageSize;
        return this;
    }
    /**
     * Sets pagination parameters for the query
     * @param pageIndex - Zero-based index of the page to retrieve
     * @param pageSize - Number of items per page
     * @returns The current MixQuery instance for method chaining
     * @example
     * // Get the second page with 10 items per page
     * const query = new MixQuery().page(1, 10);
     */
    page(pageIndex, pageSize) {
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        return this;
    }
    /**
     * Sets sorting parameters for the query
     * @param column - Name of the column to sort by
     * @param direction - Sort direction ('Asc' or 'Desc')
     * @returns The current MixQuery instance for method chaining
     * @example
     */
    sort(column, direction) {
        this.direction = direction;
        this.orderBy = column;
        return this;
    }
    /**
     * Specifies columns to select in the query
     * @param columns - List of column names to select
     * @returns The current MixQuery instance for method chaining
     */
    select(...columns) {
        this.selectColumns = columns.join(", ");
        return this;
    }
    /**
     * Adds a LIKE condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to search for
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    like(colName, value, isRequired = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.Like(colName, value, isRequired),
        ];
        return this;
    }
    /**
     * Adds an EQUAL condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to match exactly
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    equal(colName, value, isRequired = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.Equal(colName, value, isRequired),
        ];
        return this;
    }
    between(colName, value1, value2, isRequired = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.GreaterThan(colName, value1, isRequired),
            MixQuery.LessThan(colName, value2, isRequired),
        ];
        return this;
    }
    /**
     * Adds an IN condition to the query
     * @param colName - Name of the column to filter
     * @param value - Array of values to match
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    includes(colName, value, isRequired = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.Includes(colName, value, isRequired),
        ];
        return this;
    }
    /**
     * Adds a GREATER THAN condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (>= instead of >)
     * @returns The current MixQuery instance for method chaining
     */
    greaterThan(colName, value, isRequired = false, isEquals = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.GreaterThan(colName, value, isRequired, isEquals),
        ];
        return this;
    }
    /**
     * Adds a LESS THAN condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (<= instead of <)
     * @returns The current MixQuery instance for method chaining
     */
    lessThan(colName, value, isRequired = false, isEquals = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.LessThan(colName, value, isRequired, isEquals),
        ];
        return this;
    }
    /**
     * Adds a keyword search condition to the query
     * @param keyword - Search term to look for
     * @param searchColumns - Columns to search in
     * @returns The current MixQuery instance for method chaining
     */
    searchByKeyword(keyword, searchColumns) {
        this.keyword = keyword;
        this.searchColumns = searchColumns;
        this.compareOperator = ESearchMethod.Like;
        this.conjunction = "And";
        return this;
    }
    /**
     * Adds a text search condition to the query
     * @param colName - Name of the column to search in
     * @param value - Text to search for
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    searchByText(colName, value, isRequired = false) {
        this.queries = [
            ...(this.queries || []),
            MixQuery.Search(colName, value, isRequired),
        ];
        return this;
    }
    /**
     * Conditionally adds a filter to the query
     * @param condition - Boolean condition to evaluate
     * @param fn - Function that returns a filter to add if condition is true
     * @returns The current MixQuery instance for method chaining
     */
    whereIf(condition, fn) {
        if (condition) {
            this.queries = [...(this.queries || []), fn()];
        }
        return this;
    }
    fromQueryParams(url) {
        var _a;
        if (url === void 0) { url = (_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.href; }
        if (!url)
            return this;
        const queryString = url.split("?")[1] || "";
        const params = new URLSearchParams(queryString);
        const pageIndex = params.get("pageIndex");
        if (pageIndex) {
            this.pageIndex = parseInt(pageIndex, 10);
            params.delete("pageIndex");
        }
        const pageSize = params.get("pageSize");
        if (pageSize) {
            this.pageSize = parseInt(pageSize, 10);
            params.delete("pageSize");
        }
        const keyword = params.get("keyword");
        if (keyword) {
            this.keyword = keyword;
            params.delete("keyword");
        }
        for (const [key, value] of params.entries()) {
            this.queries = [...(this.queries || []), MixQuery.Equal(key, value)];
        }
        return this;
    }
    /**
     * Creates a LIKE filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to search for
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the LIKE condition
     */
    static Like(colName, value, isRequired = false) {
        return {
            value: value,
            fieldName: colName,
            compareOperator: ECompareOperator.Like,
            isRequired,
        };
    }
    /**
     * Creates an EQUAL filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to match exactly
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the EQUAL condition
     */
    static Equal(colName, value, isRequired = false) {
        return {
            value: value,
            fieldName: colName,
            compareOperator: ECompareOperator.Equal,
            isRequired,
        };
    }
    /**
     * Creates a case-insensitive LIKE filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to search for
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the case-insensitive LIKE condition
     */
    static Search(colName, value, isRequired = false) {
        return {
            value: value,
            fieldName: colName,
            compareOperator: ECompareOperator.ILike,
            isRequired,
        };
    }
    /**
     * Creates a GREATER THAN filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (>= instead of >)
     * @returns A filter object for the GREATER THAN condition
     */
    static GreaterThan(colName, value, isRequired = false, isEquals = false) {
        return {
            value: value,
            fieldName: colName,
            compareOperator: isEquals
                ? ECompareOperator.GreaterThanOrEqual
                : ECompareOperator.GreaterThan,
            isRequired,
        };
    }
    /**
     * Creates a LESS THAN filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (<= instead of <)
     * @returns A filter object for the LESS THAN condition
     */
    static LessThan(colName, value, isRequired = false, isEquals = false) {
        return {
            value: value,
            fieldName: colName,
            compareOperator: isEquals
                ? ECompareOperator.LessThanOrEqual
                : ECompareOperator.LessThan,
            isRequired,
        };
    }
    /**
     * Creates an IN filter condition
     * @param colName - Name of the column to filter
     * @param value - Array of values to match
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the IN condition
     */
    static Includes(colName, value, isRequired) {
        return {
            value: value === null || value === void 0 ? void 0 : value.join(","),
            fieldName: colName,
            compareOperator: ECompareOperator.InRange,
            isRequired,
        };
    }
}

/**
 * @fileoverview Database operations module for the Mixcore SDK
 *
 * This module provides comprehensive CRUD (Create, Read, Update, Delete) operations
 * for interacting with Mixcore databases. It includes input validation, caching,
 * query building, and bulk operations with proper error handling.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
class MixcoreDatabase {
    constructor(client) {
        this.getDatabases = (query, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const response = yield API.get(this.client.ENDPOINT.database, { params: query });
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, response.data);
                return response.data;
            }
            catch (error) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.getMasterDatabaseTables = (callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const response = yield API.get(this.client.ENDPOINT.table);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, response.data);
                return response.data;
            }
            catch (error) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, error);
                throw error;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Before using a database that you have created for the first time, it must be migrated into a single table.
         *
         */
        this.migrateToSingleTable = (dbSysName, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const result = yield API.post(`${this.client.ENDPOINT.content.database}/migrate/${dbSysName}`);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, result.data);
                return result;
            }
            catch (err) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, err);
                throw err;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * When you activate this button, the system will automatically backup your data in case you need it in the future.
         *
         */
        this.backupTable = (dbSysName, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const result = yield API.post(`${this.client.ENDPOINT.content.database}/backup/${dbSysName}`);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, result.data);
                return result;
            }
            catch (err) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, err);
                throw err;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Depending on when you last backed up the data, the system will restore it.
         *
         */
        this.restoreTable = (dbSysName, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const result = yield API.post(`${this.client.ENDPOINT.content.database}/restore/${dbSysName}`);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, result.data);
                return result;
            }
            catch (err) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, err);
                throw err;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * When you wish to make changes to your database or add new columns, run this migration.
         *
         */
        this.updateDataTable = (dbSysName, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const result = yield API.post(`${this.client.ENDPOINT.content.database}/update/${dbSysName}`);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, result.data);
                return result;
            }
            catch (err) {
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, err);
                throw err;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.client = client;
    }
}

/**
 * @fileoverview Enhanced MixDB operations module for the Mixcore SDK
 *
 * This module provides comprehensive operations for the Mix Portal MixDB API endpoints,
 * including data management, relationship handling, export/import capabilities,
 * and advanced querying with proper validation and error handling.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.22+
 */
/**
 * Enhanced MixDB operations module for the Mixcore SDK
 *
 * The MixcoreTable class provides a comprehensive interface for all Mix Portal
 * MixDB operations including advanced data retrieval, relationship management,
 * export/import capabilities, and real-time hub connections.
 *
 * @class MixcoreTable
 * @example
 * ```typescript
 * // Access through client instance
 * const client = new MixcoreClient({ ... });
 * const mixdb = client.mixdb;
 *
 * // Get data by multiple IDs
 * const users = await mixdb.getDataByIds('users', { ids: [1, 2, 3] });
 *
 * // Get data by column value
 * const activeUsers = await mixdb.getDataByColumn('users', 'status', 'active');
 *
 * // Get nested data with relationships
 * const usersWithPosts = await mixdb.getNestedData('users', query);
 *
 * // Export data
 * const exportResult = await mixdb.exportData('users', { format: 'csv', query });
 *
 * // Import data
 * const importResult = await mixdb.importData('users', { data: csvData });
 * ```
 */
class MixcoreTable {
    /**
     * Creates a new MixcoreTable instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client) {
        /**
         * Retrieves multiple records by their IDs
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param request - Request containing IDs and options
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to array of records
         *
         * @example
         * ```typescript
         * const users = await mixdb.getDataByIds('users', {
         *   ids: [1, 2, 3, 4],
         *   loadNestedData: true,
         *   selectColumns: ['id', 'name', 'email']
         * });
         * ```
         */
        this.getDataByIds = (databaseName, request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(request.ids, "ids");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/by-ids`;
                const response = yield API.post(endpoint, request);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch data by IDs");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves data filtered with advanced query options
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param query - MixQuery object for filtering
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to paginated results
         *
         * @example
         * ```typescript
         * const result = await mixdb.filterData('users',
         *   new MixQuery()
         *     .where('status', 'active')
         *     .where('age', '>=', 18)
         *     .orderBy('createdDate', 'desc')
         *     .take(20)
         * );
         * ```
         */
        this.filterData = (databaseName, query, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(query, "query");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/filter`;
                query.mixDatabaseName = databaseName;
                const response = yield API.post(endpoint, query);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to filter data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves nested data with relationship information
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param request - Request with nested data configuration
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to paginated results with nested data
         *
         * @example
         * ```typescript
         * const usersWithPosts = await mixdb.getNestedData('users', {
         *   mixDatabaseName: 'users',
         *   pageSize: 10,
         *   nestedConfig: {
         *     relatedTable: 'posts',
         *     joinCondition: 'users.id = posts.userId'
         *   }
         * });
         * ```
         */
        this.getNestedData = (databaseName, request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(request, "request");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/nested-data/filter`;
                request.mixDatabaseName = databaseName;
                const response = yield API.post(endpoint, request);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch nested data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Exports data from the database
         *
         * @template T - The type of data being exported
         * @param databaseName - Name of the database
         * @param request - Export configuration
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to export result
         *
         * @example
         * ```typescript
         * const exportResult = await mixdb.exportData('users', {
         *   format: 'csv',
         *   query: new MixQuery().where('status', 'active'),
         *   columns: ['id', 'name', 'email', 'createdDate'],
         *   includeNestedData: false
         * });
         * ```
         */
        this.exportData = (databaseName, request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(request.query, "query");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/export`;
                request.query.mixDatabaseName = databaseName;
                const response = yield API.post(endpoint, request);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to export data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Imports data into the database
         *
         * @template T - The type of data being imported
         * @param databaseName - Name of the database
         * @param request - Import configuration and data
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to import result
         *
         * @example
         * ```typescript
         * const importResult = await mixdb.importData('users', {
         *   data: csvData,
         *   format: 'csv',
         *   updateExisting: true,
         *   columnMapping: {
         *     'Full Name': 'name',
         *     'Email Address': 'email'
         *   }
         * });
         * ```
         */
        this.importData = (databaseName, request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(request.data, "data");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/import`;
                const response = yield API.post(endpoint, request);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to import data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves a single record by ID
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param id - Record ID
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the record
         *
         * @example
         * ```typescript
         * const user = await mixdb.getDataById('users', 123);
         * ```
         */
        this.getDataById = (databaseName, id, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(id, "id");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/${id}`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch data by ID");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves data by column value
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param columnName - Name of the column
         * @param columnValue - Value to search for
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the record
         *
         * @example
         * ```typescript
         * const user = await mixdb.getDataByColumn('users', 'email', 'john@example.com');
         * ```
         */
        this.getDataByColumn = (databaseName, columnName, columnValue, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(columnName, "columnName");
                validateRequired(columnValue, "columnValue");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/get-by-column/${columnName}/${columnValue}`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch data by column");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves data by parent relationship
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param parentType - Type of the parent entity
         * @param parentId - ID of the parent entity
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to array of related records
         *
         * @example
         * ```typescript
         * const userPosts = await mixdb.getDataByParent('posts', 'user', 123);
         * ```
         */
        this.getDataByParent = (databaseName, parentType, parentId, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(parentType, "parentType");
                validateRequired(parentId, "parentId");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/get-by-parent/${parentType}/${parentId}`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch data by parent");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves data by GUID parent relationship
         *
         * @template T - The type of data being retrieved
         * @param databaseName - Name of the database
         * @param parentType - Type of the parent entity
         * @param parentId - GUID of the parent entity
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to array of related records
         *
         * @example
         * ```typescript
         * const relatedData = await mixdb.getDataByGuidParent('comments', 'post', 'abc-123-def');
         * ```
         */
        this.getDataByGuidParent = (databaseName, parentType, parentId, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(parentType, "parentType");
                validateRequired(parentId, "parentId");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/get-by-guid-parent/${parentType}/${parentId}`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch data by GUID parent");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Creates a new record in the database
         *
         * @template T - The type of data being created
         * @param databaseName - Name of the database
         * @param data - Data to create
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the created record
         *
         * @example
         * ```typescript
         * const newUser = await mixdb.createData('users', {
         *   name: 'John Doe',
         *   email: 'john@example.com',
         *   status: 'active'
         * });
         * ```
         */
        this.createData = (databaseName, data, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateObject(data, "data");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}`;
                const response = yield API.post(endpoint, data);
                const responseData = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, responseData);
                return responseData;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to create data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Updates an existing record in the database
         *
         * @template T - The type of data being updated
         * @param databaseName - Name of the database
         * @param id - ID of the record to update
         * @param data - Data to update
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the updated record
         *
         * @example
         * ```typescript
         * const updatedUser = await mixdb.updateData('users', 123, {
         *   name: 'Jane Doe',
         *   status: 'inactive'
         * });
         * ```
         */
        this.updateData = (databaseName, id, data, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(id, "id");
                validateObject(data, "data");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/${id}`;
                const response = yield API.put(endpoint, data);
                const responseData = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, responseData);
                return responseData;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to update data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Deletes a record from the database
         *
         * @param databaseName - Name of the database
         * @param id - ID of the record to delete
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to true if successful
         *
         * @example
         * ```typescript
         * const success = await mixdb.deleteData('users', 123);
         * console.log('Deleted:', success);
         * ```
         */
        this.deleteData = (databaseName, id, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                validateRequired(id, "id");
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/${id}`;
                const result = yield API.delete(endpoint);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, result.data);
                return result.data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to delete data");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves data relationships for a database
         *
         * @param databaseName - Name of the database
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to relationship data
         *
         * @example
         * ```typescript
         * const relationships = await mixdb.getDataRelationships('users');
         * ```
         */
        this.getDataRelationships = (databaseName, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseName);
                const endpoint = `${this.client.ENDPOINT.content.mixDb}/${databaseName}/data-relationship`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, "Failed to fetch data relationships");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.getTableInfoByName = (databaseSystemName, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(databaseSystemName);
                const endpoint = `${this.client.ENDPOINT.content.database}/get-by-name/${databaseSystemName}`;
                const response = yield API.get(endpoint);
                const tableInfo = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, tableInfo);
                return tableInfo;
            }
            catch (error) {
                // Preserve existing SDK errors, wrap unknown errors in NetworkError
                const wrappedError = error instanceof ValidationError ||
                    error instanceof NetworkError ||
                    error instanceof AuthenticationError
                    ? error
                    : new NetworkError(error instanceof Error
                        ? error.message
                        : "Failed to fetch table info");
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.client = client;
    }
    /**
     * Private method to wrap errors with consistent error types
     *
     * @param error - Original error
     * @param defaultMessage - Default error message
     * @returns Wrapped error with proper type
     */
    _wrapError(error, defaultMessage) {
        if (error instanceof ValidationError ||
            error instanceof NetworkError ||
            error instanceof AuthenticationError) {
            return error;
        }
        return new NetworkError(error instanceof Error ? error.message : defaultMessage);
    }
}

/**
 * @fileoverview MixDB Association operations module for the Mixcore SDK
 *
 * This module provides comprehensive operations for the Mix Portal MixDB Association API endpoints,
 * including association management, relationship handling, and cache operations with proper
 * validation and error handling.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.22+
 */
/**
 * MixDB Association operations module for the Mixcore SDK
 *
 * The MixcoreMixDBAssociation class provides a comprehensive interface for managing
 * database associations including creation, updates, deletion, filtering, and
 * cache management operations.
 *
 * @class MixcoreMixDBAssociation
 * @example
 * ```typescript
 * // Access through client instance
 * const client = new MixcoreClient({ ... });
 * const associations = client.mixdbAssociation;
 *
 * // Create an association
 * const association = await associations.createAssociation({
 *   parentDbName: 'users',
 *   childDbName: 'posts',
 *   parentId: 123,
 *   childId: 456
 * });
 *
 * // Get association by specific IDs
 * const existing = await associations.getAssociation('users', 'posts', 123, 456);
 *
 * // Filter associations
 * const results = await associations.filterAssociations({
 *   parentDbName: 'users',
 *   pageSize: 20
 * });
 * ```
 */
class MixcoreMixDBAssociation {
    /**
     * Creates a new MixcoreMixDBAssociation instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client) {
        /**
         * Retrieves a specific association by database names and IDs
         *
         * @param parentDbName - Parent database name
         * @param childDbName - Child database name
         * @param parentId - Parent record ID
         * @param childId - Child record ID
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the association data
         *
         * @example
         * ```typescript
         * const association = await associations.getAssociation('users', 'posts', 123, 456);
         * console.log('Association metadata:', association.metadata);
         * ```
         */
        this.getAssociation = (parentDbName, childDbName, parentId, childId, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(parentDbName);
                validateDatabaseSystemName(childDbName);
                validateRequired(parentId, 'parentId');
                validateRequired(childId, 'childId');
                const endpoint = `/rest/mix-portal/mix-db-association/${parentDbName}/${childDbName}/${parentId}/${childId}`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to fetch association');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Deletes a specific association by database names and IDs
         *
         * @param parentDbName - Parent database name
         * @param childDbName - Child database name
         * @param parentId - Parent record ID
         * @param childId - Child record ID
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to true if successful
         *
         * @example
         * ```typescript
         * const success = await associations.deleteAssociation('users', 'posts', 123, 456);
         * console.log('Association deleted:', success);
         * ```
         */
        this.deleteAssociation = (parentDbName, childDbName, parentId, childId, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateDatabaseSystemName(parentDbName);
                validateDatabaseSystemName(childDbName);
                validateRequired(parentId, 'parentId');
                validateRequired(childId, 'childId');
                const endpoint = `/rest/mix-portal/mix-db-association/${parentDbName}/${childDbName}/${parentId}/${childId}`;
                yield API.delete(endpoint);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, true);
                return true;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to delete association');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves all associations with optional filtering
         *
         * @param request - Filter request parameters
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to paginated association results
         *
         * @example
         * ```typescript
         * const associations = await associations.getAllAssociations({
         *   pageSize: 50,
         *   parentDbName: 'users'
         * });
         * ```
         */
        this.getAllAssociations = (request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const endpoint = '/rest/mix-portal/mix-db-association';
                const queryParams = request ? new URLSearchParams(request).toString() : '';
                const fullEndpoint = queryParams ? `${endpoint}?${queryParams}` : endpoint;
                const response = yield API.get(fullEndpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to fetch associations');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Updates multiple associations (partial update)
         *
         * @param associations - Array of associations to update
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to updated associations
         *
         * @example
         * ```typescript
         * const updated = await associations.patchManyAssociations([
         *   { id: 1, metadata: { priority: 'high' } },
         *   { id: 2, sortOrder: 10 }
         * ]);
         * ```
         */
        this.patchManyAssociations = (associations, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateRequired(associations, 'associations');
                const endpoint = '/rest/mix-portal/mix-db-association/patch-many';
                const response = yield API.patch(endpoint, associations);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to patch associations');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Creates a new association
         *
         * @param request - Association creation data
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the created association
         *
         * @example
         * ```typescript
         * const newAssociation = await associations.createAssociation({
         *   parentDbName: 'users',
         *   childDbName: 'posts',
         *   parentId: 123,
         *   childId: 456,
         *   metadata: { relationship: 'author' }
         * });
         * ```
         */
        this.createAssociation = (request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateObject(request, 'request');
                validateDatabaseSystemName(request.parentDbName);
                validateDatabaseSystemName(request.childDbName);
                validateRequired(request.parentId, 'parentId');
                validateRequired(request.childId, 'childId');
                const endpoint = '/rest/mix-portal/mix-db-association';
                const response = yield API.post(endpoint, request);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to create association');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Retrieves a specific association by ID
         *
         * @param id - Association ID
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the association
         *
         * @example
         * ```typescript
         * const association = await associations.getAssociationById('123');
         * ```
         */
        this.getAssociationById = (id, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateRequired(id, 'id');
                const endpoint = `/rest/mix-portal/mix-db-association/${id}`;
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to fetch association by ID');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Deletes an association by ID
         *
         * @param id - Association ID
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to true if successful
         *
         * @example
         * ```typescript
         * const success = await associations.deleteAssociationById('123');
         * ```
         */
        this.deleteAssociationById = (id, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateRequired(id, 'id');
                const endpoint = `/rest/mix-portal/mix-db-association/${id}`;
                yield API.delete(endpoint);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, true);
                return true;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to delete association by ID');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Updates an association by ID
         *
         * @param id - Association ID
         * @param updates - Updates to apply
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to the updated association
         *
         * @example
         * ```typescript
         * const updated = await associations.updateAssociationById('123', {
         *   metadata: { priority: 'low' },
         *   sortOrder: 5
         * });
         * ```
         */
        this.updateAssociationById = (id, updates, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateRequired(id, 'id');
                validateObject(updates, 'updates');
                const endpoint = `/rest/mix-portal/mix-db-association/${id}`;
                const response = yield API.put(endpoint, updates);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to update association');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Removes cache for a specific association
         *
         * @param id - Association ID
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to true if successful
         *
         * @example
         * ```typescript
         * const success = await associations.removeCacheById('123');
         * ```
         */
        this.removeCacheById = (id, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateRequired(id, 'id');
                const endpoint = `/rest/mix-portal/mix-db-association/remove-cache/${id}`;
                yield API.delete(endpoint);
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, true);
                return true;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to remove cache');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Saves multiple associations in bulk
         *
         * @param associations - Array of associations to save
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to saved associations
         *
         * @example
         * ```typescript
         * const saved = await associations.saveManyAssociations([
         *   { parentDbName: 'users', childDbName: 'posts', parentId: 1, childId: 10 },
         *   { parentDbName: 'users', childDbName: 'posts', parentId: 2, childId: 20 }
         * ]);
         * ```
         */
        this.saveManyAssociations = (associations, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateRequired(associations, 'associations');
                const endpoint = '/rest/mix-portal/mix-db-association/save-many';
                const response = yield API.post(endpoint, associations);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to save associations');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Filters associations with advanced query options
         *
         * @param request - Filter request with query parameters
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to filtered associations
         *
         * @example
         * ```typescript
         * const filtered = await associations.filterAssociations({
         *   parentDbName: 'users',
         *   childDbName: 'posts',
         *   pageSize: 25,
         *   queries: [
         *     { fieldName: 'status', value: 'active', compareOperator: 'Equal' }
         *   ]
         * });
         * ```
         */
        this.filterAssociations = (request, callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                validateObject(request, 'request');
                const endpoint = '/rest/mix-portal/mix-db-association/filter';
                const response = yield API.post(endpoint, request);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to filter associations');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Gets default association configuration
         *
         * @param callBack - Optional callback handlers
         * @returns Promise that resolves to default configuration
         *
         * @example
         * ```typescript
         * const defaultConfig = await associations.getDefaultConfig();
         * ```
         */
        this.getDefaultConfig = (callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const endpoint = '/rest/mix-portal/mix-db-association/default';
                const response = yield API.get(endpoint);
                const data = response.data;
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, data);
                return data;
            }
            catch (error) {
                const wrappedError = this._wrapError(error, 'Failed to fetch default config');
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        this.client = client;
    }
    /**
     * Private method to wrap errors with consistent error types
     *
     * @param error - Original error
     * @param defaultMessage - Default error message
     * @returns Wrapped error with proper type
     */
    _wrapError(error, defaultMessage) {
        if (error instanceof ValidationError || error instanceof NetworkError || error instanceof AuthenticationError) {
            return error;
        }
        return new NetworkError(error instanceof Error ? error.message : defaultMessage);
    }
}

/**
 * @fileoverview File storage module for the Mixcore SDK
 *
 * This module handles file upload, download, and management operations
 * for the Mixcore platform. It provides methods for handling various
 * file types with proper error handling and validation.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
/**
 * File storage operations module for the Mixcore SDK
 *
 * The MixcoreStorage class provides comprehensive file management functionality
 * including file uploads, downloads, deletion, and metadata retrieval. It supports
 * various file types and includes proper validation and error handling.
 *
 * @class MixcoreStorage
 * @example
 * ```typescript
 * // Access through client instance
 * const client = new MixcoreClient({ ... });
 * const storage = client.storage;
 *
 * // Upload a file
 * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
 * const file = fileInput.files?.[0];
 * if (file) {
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   const result = await storage.uploadFile(formData);
 *   console.log('File uploaded:', result.url);
 * }
 *
 * // Delete a file
 * await storage.deleteFile('uploads/documents/file.pdf');
 * ```
 */
class MixcoreStorage {
    /**
     * Creates a new MixcoreStorage instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client) {
        /**
         * Uploads a file to the Mixcore storage system
         *
         * This method handles file uploads with support for various file types.
         * The file should be provided as FormData with proper multipart encoding.
         *
         * @param fileData - FormData object containing the file and optional metadata
         * @param folder - Optional folder path to organize uploaded files
         * @returns Promise that resolves to upload result with file URL and metadata
         * @throws {ValidationError} When file data is invalid or missing
         * @throws {NetworkError} When upload fails or server error occurs
         * @throws {AuthenticationError} When user lacks upload permission
         *
         * @example
         * ```typescript
         * // Basic file upload
         * const fileInput = document.getElementById('fileInput') as HTMLInputElement;
         * const file = fileInput.files?.[0];
         *
         * if (file) {
         *   const formData = new FormData();
         *   formData.append('file', file);
         *   formData.append('description', 'User avatar image');
         *
         *   const uploadResult = await storage.uploadFile(formData);
         *   console.log('File URL:', uploadResult.url);
         *   console.log('File ID:', uploadResult.id);
         * }
         *
         * // Upload to specific folder
         * const documentUpload = await storage.uploadFile(formData, 'documents/invoices');
         *
         * // Upload with custom metadata
         * const customFormData = new FormData();
         * customFormData.append('file', file);
         * customFormData.append('title', 'Important Document');
         * customFormData.append('category', 'legal');
         * customFormData.append('tags', JSON.stringify(['contract', 'signed']));
         *
         * const result = await storage.uploadFile(customFormData);
         * ```
         */
        this.uploadFile = (file_1, ...args_1) => __awaiter(this, [file_1, ...args_1], void 0, function* (file, folder = "MixContent/StaticFiles") {
            // Validate input parameters
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);
            // Make API request to upload file
            const response = yield API.post(this.client.ENDPOINT.storage.upload, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        });
        this.uploadFileBase64 = (request) => __awaiter(this, void 0, void 0, function* () {
            const response = yield API.post(this.client.ENDPOINT.storage.uploadBase64, request, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        });
        /**
         * Downloads a file from the storage system
         *
         * Retrieves a file by its path or ID and returns the file data.
         * This method can be used to download files for local storage or display.
         *
         * @param filePath - Path or ID of the file to download
         * @returns Promise that resolves to file blob data
         * @throws {ValidationError} When file path is invalid
         * @throws {NetworkError} When file not found or download fails
         * @throws {AuthenticationError} When user lacks download permission
         *
         * @example
         * ```typescript
         * // Download file and create download link
         * const fileBlob = await storage.downloadFile('uploads/documents/report.pdf');
         * const downloadUrl = URL.createObjectURL(fileBlob);
         *
         * const link = document.createElement('a');
         * link.href = downloadUrl;
         * link.download = 'report.pdf';
         * link.click();
         *
         * // Clean up the object URL
         * URL.revokeObjectURL(downloadUrl);
         *
         * // Download and display image
         * const imageBlob = await storage.downloadFile('uploads/images/avatar.jpg');
         * const imageUrl = URL.createObjectURL(imageBlob);
         * const img = document.getElementById('avatar') as HTMLImageElement;
         * img.src = imageUrl;
         * ```
         */
        this.downloadFile = (filePath) => __awaiter(this, void 0, void 0, function* () {
            // Validate input parameters
            validateRequired(filePath, "filePath");
            // Make API request to download file
            const response = yield API.get(`${this.client.ENDPOINT.storage.upload.replace("/upload-file", "/download")}/${encodeURIComponent(filePath)}`, {
                responseType: "blob",
            });
            return response.data;
        });
        /**
         * Deletes a file from the storage system
         *
         * Permanently removes a file from storage. This operation cannot be undone,
         * so use with caution. The file will be immediately unavailable.
         *
         * @param filePath - Path or ID of the file to delete
         * @returns Promise that resolves to true if deletion was successful
         * @throws {ValidationError} When file path is invalid
         * @throws {NetworkError} When file not found or deletion fails
         * @throws {AuthenticationError} When user lacks delete permission
         *
         * @example
         * ```typescript
         * // Delete a file
         * const success = await storage.deleteFile('uploads/temp/old-file.pdf');
         * if (success) {
         *   console.log('File deleted successfully');
         * }
         *
         * // Delete with error handling
         * try {
         *   await storage.deleteFile('uploads/images/avatar.jpg');
         *   console.log('Avatar deleted');
         * } catch (error) {
         *   if (error instanceof NetworkError && error.statusCode === 404) {
         *     console.log('File not found');
         *   } else if (error instanceof AuthenticationError) {
         *     console.log('Permission denied');
         *   } else {
         *     console.error('Delete failed:', error);
         *   }
         * }
         *
         * // Conditional deletion
         * const fileExists = await storage.getFileInfo('uploads/temp/cache.json')
         *   .then(() => true)
         *   .catch(() => false);
         *
         * if (fileExists) {
         *   await storage.deleteFile('uploads/temp/cache.json');
         * }
         * ```
         */
        this.deleteFile = (filePath) => __awaiter(this, void 0, void 0, function* () {
            // Validate input parameters
            validateRequired(filePath, "filePath");
            // Make API request to delete file
            yield API.delete(`${this.client.ENDPOINT.storage.delete}/${encodeURIComponent(filePath)}`);
            // Return true to indicate successful deletion
            return true;
        });
        /**
         * Retrieves metadata information about a file
         *
         * Gets detailed information about a file including size, type, upload date,
         * and other metadata without downloading the actual file content.
         *
         * @param filePath - Path or ID of the file to get information about
         * @returns Promise that resolves to file metadata
         * @throws {ValidationError} When file path is invalid
         * @throws {NetworkError} When file not found or request fails
         * @throws {AuthenticationError} When user lacks access permission
         *
         * @example
         * ```typescript
         * // Get file information
         * const fileInfo = await storage.getFileInfo('uploads/documents/contract.pdf');
         * console.log('File size:', fileInfo.size, 'bytes');
         * console.log('File type:', fileInfo.mimetype);
         * console.log('Uploaded:', new Date(fileInfo.uploadDate));
         *
         * // Check if file exists
         * try {
         *   const info = await storage.getFileInfo('uploads/images/logo.png');
         *   console.log('File exists:', info.filename);
         * } catch (error) {
         *   if (error instanceof NetworkError && error.statusCode === 404) {
         *     console.log('File does not exist');
         *   }
         * }
         *
         * // Display file details in UI
         * const fileInfo = await storage.getFileInfo(selectedFilePath);
         * document.getElementById('fileName').textContent = fileInfo.filename;
         * document.getElementById('fileSize').textContent = `${Math.round(fileInfo.size / 1024)} KB`;
         * document.getElementById('fileType').textContent = fileInfo.mimetype;
         * ```
         */
        this.getFileInfo = (filePath) => __awaiter(this, void 0, void 0, function* () {
            // Validate input parameters
            validateRequired(filePath, "filePath");
            // Make API request to get file info
            const response = yield API.get(`${this.client.ENDPOINT.storage.upload.replace("/upload-file", "/info")}/${encodeURIComponent(filePath)}`);
            return response.data;
        });
        /**
         * Lists files in a specific folder or directory
         *
         * Retrieves a list of files in the specified folder with pagination support.
         * This is useful for building file browsers or managing file collections.
         *
         * @param folder - Folder path to list files from (empty string for root)
         * @param page - Page number for pagination (1-based, default: 1)
         * @param pageSize - Number of files per page (default: 50)
         * @returns Promise that resolves to paginated file list
         * @throws {ValidationError} When parameters are invalid
         * @throws {NetworkError} When request fails
         * @throws {AuthenticationError} When user lacks access permission
         *
         * @example
         * ```typescript
         * // List all files in root directory
         * const rootFiles = await storage.listFiles('');
         * console.log(`Found ${rootFiles.total} files`);
         *
         * // List files in specific folder
         * const documentFiles = await storage.listFiles('documents');
         * documentFiles.items.forEach(file => {
         *   console.log(`${file.filename} (${file.size} bytes)`);
         * });
         *
         * // Paginated file listing
         * const page1 = await storage.listFiles('uploads/images', 1, 20);
         * const page2 = await storage.listFiles('uploads/images', 2, 20);
         *
         * // Build file browser
         * const fileList = await storage.listFiles('user-uploads/2024');
         * const fileListElement = document.getElementById('fileList');
         *
         * fileList.items.forEach(file => {
         *   const listItem = document.createElement('li');
         *   listItem.innerHTML = `
         *     <span>${file.filename}</span>
         *     <span>${Math.round(file.size / 1024)} KB</span>
         *     <button onclick="downloadFile('${file.id}')">Download</button>
         *   `;
         *   fileListElement.appendChild(listItem);
         * });
         * ```
         */
        this.listFiles = (...args_1) => __awaiter(this, [...args_1], void 0, function* (folder = "", page = 1, pageSize = 50) {
            // Validate input parameters
            if (page < 1) {
                throw new ValidationError("Page number must be greater than 0");
            }
            if (pageSize < 1 || pageSize > 1000) {
                throw new ValidationError("Page size must be between 1 and 1000");
            }
            // Make API request to list files
            const response = yield API.get(this.client.ENDPOINT.storage.upload.replace("/upload-file", "/list"), {
                params: {
                    folder: folder || "",
                    page,
                    pageSize,
                },
            });
            return response.data;
        });
        this.client = client;
    }
}

/**
 * @fileoverview Main client class for the Mixcore SDK
 *
 * This file contains the primary MixcoreClient class that serves as the entry point
 * for all SDK functionality. It manages authentication, database operations, storage,
 * and global configuration.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.22+
 */
/**
 * Main Mixcore SDK Client
 *
 * The MixcoreClient class is the primary interface for interacting with the Mixcore API.
 * It provides a unified interface for authentication, database operations, file storage,
 * and other platform features.
 *
 * @class MixcoreClient
 * @example
 * ```typescript
 * // Basic initialization
 * const client = new MixcoreClient({
 *   tokenKey: 'my_token',
 *   refreshTokenKey: 'my_refresh_token'
 * });
 *
 * // With custom endpoint
 * const client = new MixcoreClient({
 *   endpoint: 'https://my-api.com/v2',
 *   tokenKey: 'my_token',
 *   refreshTokenKey: 'my_refresh_token'
 * });
 *
 * // Login and use
 * await client.auth.login({ email: 'user@example.com', password: 'password' });
 * const data = await client.database.getData('users', query);
 * ```
 */
class MixcoreClient {
    /**
     * Setter for global settings
     * Updates the internal global settings and can trigger events
     *
     * @param value - Global settings object or undefined to clear
     */
    set globalSetting(value) {
        this._globalSetting = value;
    }
    /**
     * Getter for global settings
     *
     * @returns Current global settings or undefined if not loaded
     */
    get globalSetting() {
        return this._globalSetting;
    }
    /**
     * Creates a new MixcoreClient instance
     *
     * Initializes the client with the provided configuration, sets up API base URL,
     * fetches global settings, and creates instances of auth, database, and storage modules.
     *
     * @param config - Partial client configuration. Missing values will use defaults
     *
     * @example
     * ```typescript
     * // Minimal configuration
     * const client = new MixcoreClient({
     *   tokenKey: 'app_token',
     *   refreshTokenKey: 'app_refresh_token'
     * });
     *
     * // Full configuration
     * const client = new MixcoreClient({
     *   endpoint: 'https://api.example.com/v2',
     *   tokenKey: 'app_token',
     *   refreshTokenKey: 'app_refresh_token',
     *   tokenType: 'Bearer',
     *   events: {
     *     onAuthSuccess: () => console.log('User authenticated'),
     *     onAuthError: () => console.log('Authentication failed')
     *   }
     * });
     * ```
     */
    constructor(config = {}) {
        /** Base API endpoint URL (read-only) */
        this.BASE_ENDPOINT = DEFAULT_CONFIG.BASE_DOMAIN;
        /** All available API endpoints (read-only) */
        this.ENDPOINT = ENDPOINTS;
        /**
         * Client configuration with defaults merged
         * Contains endpoint, token keys, and other settings
         */
        this.config = {
            endpoint: this.BASE_ENDPOINT,
            tokenType: DEFAULT_CONFIG.TOKEN_TYPE,
            tokenKey: DEFAULT_CONFIG.TOKEN_KEY,
            refreshTokenKey: DEFAULT_CONFIG.REFRESH_TOKEN_KEY,
        };
        /** Default headers sent with all requests (read-only) */
        this.headers = Object.assign({}, SDK_HEADERS);
        /**
         * Array of available cultures/locales
         * Populated after calling initLocalization()
         */
        this.cultures = [];
        /**
         * Flag indicating if culture data has been loaded
         * Prevents redundant API calls to fetch culture data
         */
        this.initializedCulture = false;
        /**
         * Fetches global settings from the server
         *
         * Global settings contain application-wide configuration such as API encryption keys,
         * feature flags, and other system-level settings. This method is called automatically
         * during client initialization but can also be called manually to refresh settings.
         *
         * @param callBack - Optional callback handlers for success/error/finally
         * @returns Promise that resolves to the global settings object
         * @throws {NetworkError} When the request fails or server is unreachable
         *
         * @example
         * ```typescript
         * // Simple usage
         * const settings = await client.getGlobalSetting();
         * console.log('API encryption key:', settings.apiEncryptKey);
         *
         * // With callback handlers
         * await client.getGlobalSetting({
         *   success: (settings) => console.log('Settings loaded:', settings),
         *   error: (error) => console.error('Failed to load settings:', error),
         *   finally: () => console.log('Settings request completed')
         * });
         * ```
         */
        this.getGlobalSetting = (callBack) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // Fetch global settings from the server
                const response = yield API.get(this.ENDPOINT.global.globalSetting);
                const settings = response.data;
                // Store settings in the client instance
                this.globalSetting = settings;
                // Notify success callback if provided
                (_a = callBack === null || callBack === void 0 ? void 0 : callBack.success) === null || _a === void 0 ? void 0 : _a.call(callBack, settings);
                return settings;
            }
            catch (error) {
                // Wrap unknown errors in NetworkError for consistency
                const wrappedError = error instanceof Error
                    ? error
                    : new NetworkError("Failed to fetch global settings");
                // Notify error callback if provided
                (_b = callBack === null || callBack === void 0 ? void 0 : callBack.error) === null || _b === void 0 ? void 0 : _b.call(callBack, wrappedError);
                throw wrappedError;
            }
            finally {
                // Always call finally callback if provided
                (_c = callBack === null || callBack === void 0 ? void 0 : callBack.finally) === null || _c === void 0 ? void 0 : _c.call(callBack);
            }
        });
        /**
         * Initializes localization data by fetching available cultures
         *
         * Cultures define the available languages and locales supported by the application.
         * This method fetches the list of cultures from the server and caches them locally.
         * Subsequent calls will return the cached data unless explicitly refreshed.
         *
         * @returns Promise that resolves to paginated culture data
         * @throws {NetworkError} When the request fails or server is unreachable
         *
         * @example
         * ```typescript
         * // Initialize localization
         * const culturesResult = await client.initLocalization();
         * console.log('Available cultures:', culturesResult.items);
         *
         * // Access cached cultures
         * console.log('Cached cultures:', client.cultures);
         * console.log('Is initialized:', client.initializedCulture);
         *
         * // Culture data structure
         * culturesResult.items.forEach(culture => {
         *   console.log(`${culture.displayName} (${culture.name})`);
         * });
         * ```
         */
        this.initLocalization = () => __awaiter(this, void 0, void 0, function* () {
            // Return cached data if already initialized
            if (this.initializedCulture) {
                return {
                    items: this.cultures,
                    pagingData: {
                        pageIndex: 0,
                        pageSize: this.cultures.length,
                        total: this.cultures.length,
                        totalPage: 1,
                    },
                };
            }
            try {
                // Fetch cultures from server with maximum page size
                const response = yield API.get(this.ENDPOINT.auth.culture, {
                    params: { pageSize: DEFAULT_CONFIG.MAX_PAGE_SIZE },
                });
                const result = response.data;
                // Cache the results to avoid future API calls
                this.initializedCulture = true;
                this.cultures = result.items || [];
                return result;
            }
            catch (error) {
                // Re-throw with proper error type
                throw error instanceof Error
                    ? error
                    : new NetworkError("Failed to initialize localization");
            }
        });
        // Merge provided config with defaults
        this.config = Object.assign(Object.assign({}, this.config), config);
        // Set the base URL for all API requests
        setBaseUrl(this.config.endpoint || this.BASE_ENDPOINT);
        setUnAuthorizedHandling(this.config.unAuthorizedCallback ||
            (() => {
                console.warn("[MixcoreClient] Not provide unauthorized callback.");
            }));
        // Initialize global settings (async, doesn't block constructor)
        this.getGlobalSetting();
        // Create module instances with this client as dependency
        this.auth = new MixcoreAuth(this);
        this.database = new MixcoreDatabase(this);
        this.table = new MixcoreTable(this);
        this.storage = new MixcoreStorage(this);
        this.mixdbAssociation = new MixcoreMixDBAssociation(this);
    }
}

var MixcoreEvent;
(function (MixcoreEvent) {
    MixcoreEvent["LoginSuccess"] = "loginSuccess";
    MixcoreEvent["LoginFail"] = "loginFail";
    MixcoreEvent["Logout"] = "logout";
})(MixcoreEvent || (MixcoreEvent = {}));

const DbContextFixId = {
    All: -2,
    MasterDb: -1,
};
var EMixDatabaseProvider;
(function (EMixDatabaseProvider) {
    EMixDatabaseProvider["SQLSERVER"] = "SQLSERVER";
    EMixDatabaseProvider["MySQL"] = "MySQL";
    EMixDatabaseProvider["PostgreSQL"] = "PostgreSQL";
    EMixDatabaseProvider["SQLITE"] = "SQLITE";
})(EMixDatabaseProvider || (EMixDatabaseProvider = {}));
var EMixDataType;
(function (EMixDataType) {
    EMixDataType["String"] = "String";
    EMixDataType["Custom"] = "Custom";
    EMixDataType["DateTime"] = "DateTime";
    EMixDataType["Date"] = "Date";
    EMixDataType["Time"] = "Time";
    EMixDataType["DateTimeLocal"] = "DateTimeLocal";
    EMixDataType["Duration"] = "Duration";
    EMixDataType["PhoneNumber"] = "PhoneNumber";
    EMixDataType["Double"] = "Double";
    EMixDataType["Text"] = "Text";
    EMixDataType["Html"] = "Html";
    EMixDataType["MultilineText"] = "MultilineText";
    EMixDataType["EmailAddress"] = "EmailAddress";
    EMixDataType["Password"] = "Password";
    EMixDataType["Url"] = "Url";
    EMixDataType["ImageUrl"] = "ImageUrl";
    EMixDataType["CreditCard"] = "CreditCard";
    EMixDataType["PostalCode"] = "PostalCode";
    EMixDataType["Upload"] = "Upload";
    EMixDataType["Color"] = "Color";
    EMixDataType["Boolean"] = "Boolean";
    EMixDataType["Icon"] = "Icon";
    EMixDataType["VideoYoutube"] = "VideoYoutube";
    EMixDataType["TuiEditor"] = "TuiEditor";
    EMixDataType["Integer"] = "Integer";
    EMixDataType["Guid"] = "Guid";
    EMixDataType["Reference"] = "Reference";
    EMixDataType["QRCode"] = "QRCode";
    EMixDataType["Tag"] = "Tag";
    EMixDataType["Json"] = "Json";
    EMixDataType["Array"] = "Array";
    EMixDataType["ArrayMedia"] = "ArrayMedia";
    EMixDataType["ArrayRadio"] = "ArrayRadio";
    EMixDataType["Long"] = "Long";
})(EMixDataType || (EMixDataType = {}));
var MixTableType;
(function (MixTableType) {
    MixTableType["Service"] = "Service";
    MixTableType["GuidService"] = "GuidService";
})(MixTableType || (MixTableType = {}));
var EMixRelationShipType;
(function (EMixRelationShipType) {
    EMixRelationShipType["OneToMany"] = "OneToMany";
    EMixRelationShipType["ManyToMany"] = "ManyToMany";
})(EMixRelationShipType || (EMixRelationShipType = {}));
var ENamingConvention;
(function (ENamingConvention) {
    ENamingConvention["SnakeCase"] = "SnakeCase";
    ENamingConvention["TitleCase"] = "TitleCase";
})(ENamingConvention || (ENamingConvention = {}));
class MixColumn {
    constructor(data, configuration) {
        var _a, _b, _c, _d, _e;
        this.new = false;
        this.displayName = (_a = data.displayName) !== null && _a !== void 0 ? _a : "";
        this.systemName = (_b = data.systemName) !== null && _b !== void 0 ? _b : "";
        this.dataType = (_c = data.dataType) !== null && _c !== void 0 ? _c : EMixDataType.Text;
        this.new = (_d = data.new) !== null && _d !== void 0 ? _d : false;
        this.priority = (_e = data.priority) !== null && _e !== void 0 ? _e : 0;
        this.columnConfigurations = {
            isRequire: (configuration === null || configuration === void 0 ? void 0 : configuration.isRequire) || false,
            isEncrypt: (configuration === null || configuration === void 0 ? void 0 : configuration.isEncrypt) || false,
        };
    }
}
class MixTable {
    constructor(value) {
        var _a, _b, _c;
        this.type = (_a = value.type) !== null && _a !== void 0 ? _a : MixTableType.Service;
        this.systemName = value.systemName;
        this.type = value.type;
        this.selfManaged = value.selfManaged;
        this.columns = (_b = value.columns) === null || _b === void 0 ? void 0 : _b.sort((a, b) => a.priority - b.priority);
        this.relationships = value.relationships;
        this.displayName = value.displayName;
        this.mixTenantId = value.mixTenantId;
        this.id = value.id;
        this.createdDateTime = value.createdDateTime;
        this.priority = value.priority;
        this.status = value.status;
        this.isValid = value.isValid;
        this.errors = value.errors;
        this.mixDatabaseContextId =
            (_c = value.mixDatabaseContextId) !== null && _c !== void 0 ? _c : DbContextFixId.MasterDb;
        this.updatePermissions = MixTable.parsePermission(value.updatePermissions);
        this.readPermissions = MixTable.parsePermission(value.readPermissions);
        this.deletePermissions = MixTable.parsePermission(value.deletePermissions);
        this.createPermissions = MixTable.parsePermission(value.createPermissions);
        this.namingConvention = value.namingConvention;
    }
    static parsePermission(value) {
        return value instanceof Array
            ? value
            : value
                ? JSON.parse(value.toString())
                : [];
    }
}

export { BrowserStorageAdapter, DEFAULT_CONFIG, DbContextFixId, ECompareOperator, EDataType, EMixContentStatus, EMixDataType, EMixDatabaseProvider, EMixRelationShipType, ENDPOINTS, ENamingConvention, ESearchMethod, ESortDirection, MemoryStorageAdapter, MixColumn, MixQuery, MixTable, MixTableType, MixcoreAuth, MixcoreClient, MixcoreDatabase, MixcoreEvent, MixcoreMixDBAssociation, MixcoreStorage, MixcoreTable, NodeStorageAdapter, PaginationModel, StorageAdapterFactory, defaultStorageAdapter };
//# sourceMappingURL=index.esm.js.map
