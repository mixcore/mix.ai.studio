import type { DatabaseRecord, QueryOptions } from './types';
import { MixQuery } from './query';
import { 
  validateRequired, 
  validateDatabaseSystemName, 
  validateObject
} from './helpers';
import { defaultCache, generateCacheKey } from './cache';
import type { ApiClient } from './api';

export class DatabaseModule {
  constructor(private api: ApiClient) {}

  // Basic CRUD Operations

  async getData<T extends DatabaseRecord>(
    databaseName: string, 
    query?: MixQuery
  ): Promise<T[]> {
    validateDatabaseSystemName(databaseName);

    // Check cache first
    const cacheKey = generateCacheKey('getData', databaseName, query?.toQueryParams());
    const cached = defaultCache.get<T[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const params = query?.toQueryParams() || {};
    const response = await this.api.get<T[]>(`/database/${databaseName}/data`, params);
    
    // Cache the result
    defaultCache.set(cacheKey, response.data, 300000); // 5 minutes
    
    return response.data;
  }

  async getDataById<T extends DatabaseRecord>(
    databaseName: string, 
    id: string | number
  ): Promise<T> {
    validateDatabaseSystemName(databaseName);
    validateRequired(id, 'ID');

    const cacheKey = generateCacheKey('getDataById', databaseName, id);
    const cached = defaultCache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.api.get<T>(`/database/${databaseName}/data/${id}`);
    
    // Cache the result
    defaultCache.set(cacheKey, response.data, 300000);
    
    return response.data;
  }

  async getDataByColumn<T extends DatabaseRecord>(
    databaseName: string, 
    columnName: string, 
    value: any
  ): Promise<T | null> {
    validateDatabaseSystemName(databaseName);
    validateRequired(columnName, 'Column name');
    validateRequired(value, 'Value');

    const query = new MixQuery().where(columnName, value).take(1);
    const results = await this.getData<T>(databaseName, query);
    
    return results.length > 0 ? results[0] : null;
  }

  async createData<T extends DatabaseRecord>(
    databaseName: string, 
    data: Omit<T, 'id'>
  ): Promise<T> {
    validateDatabaseSystemName(databaseName);
    validateObject(data, 'Data');

    const response = await this.api.post<T>(`/database/${databaseName}/data`, data);
    
    // Invalidate relevant cache entries
    this.invalidateCache(databaseName);
    
    return response.data;
  }

  async updateData<T extends DatabaseRecord>(
    databaseName: string, 
    id: string | number, 
    data: Partial<T>
  ): Promise<T> {
    validateDatabaseSystemName(databaseName);
    validateRequired(id, 'ID');
    validateObject(data, 'Data');

    const response = await this.api.put<T>(`/database/${databaseName}/data/${id}`, data);
    
    // Invalidate cache
    this.invalidateCache(databaseName);
    
    return response.data;
  }

  async updateManyData<T extends DatabaseRecord>(
    databaseName: string, 
    updates: Array<{ id: string | number } & Partial<T>>
  ): Promise<T[]> {
    validateDatabaseSystemName(databaseName);
    validateRequired(updates, 'Updates');

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates must be a non-empty array');
    }

    const response = await this.api.put<T[]>(`/database/${databaseName}/data/bulk`, {
      updates
    });
    
    // Invalidate cache
    this.invalidateCache(databaseName);
    
    return response.data;
  }

  async deleteData(databaseName: string, id: string | number): Promise<boolean> {
    validateDatabaseSystemName(databaseName);
    validateRequired(id, 'ID');

    try {
      await this.api.delete(`/database/${databaseName}/data/${id}`);
      
      // Invalidate cache
      this.invalidateCache(databaseName);
      
      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }

  async exportData<T extends DatabaseRecord>(
    databaseName: string, 
    query?: MixQuery,
    format: 'csv' | 'json' | 'xlsx' = 'json'
  ): Promise<string | T[]> {
    validateDatabaseSystemName(databaseName);

    const params = {
      ...query?.toQueryParams(),
      format
    };

    const response = await this.api.get<string | T[]>(`/database/${databaseName}/export`, params);
    return response.data;
  }

  // Advanced Operations

  async getDataByIds<T extends DatabaseRecord>(
    databaseName: string, 
    options: {
      ids: (string | number)[];
      loadNestedData?: boolean;
      selectColumns?: string[];
    }
  ): Promise<T[]> {
    validateDatabaseSystemName(databaseName);
    validateRequired(options.ids, 'IDs');

    if (!Array.isArray(options.ids) || options.ids.length === 0) {
      return [];
    }

    const response = await this.api.post<T[]>(`/database/${databaseName}/data/by-ids`, options);
    return response.data;
  }

  async searchData<T extends DatabaseRecord>(
    databaseName: string,
    searchTerm: string,
    searchColumns: string[] = [],
    query?: MixQuery
  ): Promise<T[]> {
    validateDatabaseSystemName(databaseName);
    validateRequired(searchTerm, 'Search term');

    const params = {
      search: searchTerm,
      searchColumns,
      ...query?.toQueryParams()
    };

    const response = await this.api.get<T[]>(`/database/${databaseName}/search`, params);
    return response.data;
  }

  async countData(databaseName: string, query?: MixQuery): Promise<number> {
    validateDatabaseSystemName(databaseName);

    const params = query?.toQueryParams() || {};
    const response = await this.api.get<{ count: number }>(`/database/${databaseName}/count`, params);
    
    return response.data.count;
  }

  // Database Schema Operations

  async getDatabaseSchema(databaseName: string): Promise<any> {
    validateDatabaseSystemName(databaseName);

    const response = await this.api.get(`/database/${databaseName}/schema`);
    return response.data;
  }

  async createDatabase(databaseName: string, schema: any): Promise<boolean> {
    validateDatabaseSystemName(databaseName);
    validateObject(schema, 'Schema');

    try {
      await this.api.post(`/database/${databaseName}`, schema);
      return true;
    } catch (error) {
      console.error('Database creation failed:', error);
      return false;
    }
  }

  async updateDatabaseSchema(databaseName: string, schema: any): Promise<boolean> {
    validateDatabaseSystemName(databaseName);
    validateObject(schema, 'Schema');

    try {
      await this.api.put(`/database/${databaseName}/schema`, schema);
      
      // Clear cache for this database
      this.invalidateCache(databaseName);
      
      return true;
    } catch (error) {
      console.error('Schema update failed:', error);
      return false;
    }
  }

  async deleteDatabase(databaseName: string): Promise<boolean> {
    validateDatabaseSystemName(databaseName);

    try {
      await this.api.delete(`/database/${databaseName}`);
      
      // Clear cache for this database
      this.invalidateCache(databaseName);
      
      return true;
    } catch (error) {
      console.error('Database deletion failed:', error);
      return false;
    }
  }

  async listDatabases(): Promise<string[]> {
    const response = await this.api.get<string[]>('/database');
    return response.data;
  }

  // Cache management
  private invalidateCache(databaseName: string): void {
    // This is a simple implementation - in a real scenario you might want
    // to be more selective about which cache entries to invalidate
    const cacheKeys = [
      `getData:${databaseName}`,
      `getDataById:${databaseName}`,
      `count:${databaseName}`
    ];

    cacheKeys.forEach(key => {
      // Remove all cache entries that start with this key
      const cache = defaultCache as any;
      if (cache.cache) {
        for (const cacheKey of cache.cache.keys()) {
          if (cacheKey.startsWith(key)) {
            cache.cache.delete(cacheKey);
          }
        }
      }
    });
  }

  // Utility methods
  clearCache(): void {
    defaultCache.clear();
  }

  getCacheStats() {
    return defaultCache.getStats();
  }
}