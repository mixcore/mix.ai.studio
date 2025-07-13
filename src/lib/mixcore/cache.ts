import type { CacheEntry, CacheStats } from './types';

export class SimpleCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = { size: 0, hits: 0, misses: 0 };

  set(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { size: 0, hits: 0, misses: 0 };
  }

  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
    
    this.stats.size = this.cache.size;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache utility functions
export function generateCacheKey(prefix: string, ...params: any[]): string {
  const keyParts = [prefix, ...params.map(p => 
    typeof p === 'object' ? JSON.stringify(p) : String(p)
  )];
  return keyParts.join(':');
}

// Global cache instance
export const defaultCache = new SimpleCache();