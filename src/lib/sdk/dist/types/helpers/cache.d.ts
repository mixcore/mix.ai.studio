export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
export declare class SimpleCache {
    private cache;
    /**
     * Set a cache entry with TTL
     */
    set<T>(key: string, data: T, ttlMs?: number): void;
    /**
     * Get a cache entry if it's still valid
     */
    get<T>(key: string): T | null;
    /**
     * Check if a key exists and is valid
     */
    has(key: string): boolean;
    /**
     * Remove a specific cache entry
     */
    delete(key: string): boolean;
    /**
     * Clear all cache entries
     */
    clear(): void;
    /**
     * Clear all cache entries that start with the given prefix
     */
    clearByPrefix(prefix: string): number;
    /**
     * Clean up expired entries
     */
    cleanup(): number;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        entries: Array<{
            key: string;
            age: number;
            ttl: number;
        }>;
    };
}
export declare const defaultCache: SimpleCache;
/**
 * Generate a cache key from parameters
 */
export declare function generateCacheKey(prefix: string, ...params: unknown[]): string;
/**
 * Cache decorator for methods (can be used with database methods)
 */
export declare function cached<T extends (...args: unknown[]) => Promise<unknown>>(keyGenerator: (...args: Parameters<T>) => string, ttlMs?: number): (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => void;
