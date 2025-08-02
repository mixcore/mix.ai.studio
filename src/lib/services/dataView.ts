/**
 * Data View Service for MixDB Table Data
 * 
 * Provides functionality to fetch table schema and data using the Mixcore API
 * following the specific API flow patterns provided by the user.
 */

// No need to import stores as we're using localStorage directly

export interface TableSchema {
  id: string;
  displayName: string;
  systemName: string;
  description?: string;
  columns: TableColumn[];
  mixDbDatabaseId: string;
  mixDbDatabaseName: string;
  status: string;
}

export interface TableColumn {
  name: string;
  displayName: string;
  dataType: string;
  isRequired: boolean;
  isUnique: boolean;
  maxLength?: number;
  defaultValue?: any;
  description?: string;
}

export interface TableDataFilter {
  pageSize: number;
  pageIndex: number;
  status?: string;
  sortBy?: string;
  direction?: 'Asc' | 'Desc';
  fromDate?: string | null;
  toDate?: string | null;
  keyword?: string;
  searchColumns?: string;
  compareOperator?: 'Like' | 'Equal' | 'Contains';
  conjunction?: 'And' | 'Or';
  mixDbTableName: string;
  mixDbTableId: string;
  filterType?: 'contain' | 'equal';
  isGroup?: boolean;
  queries?: any[];
}

export interface TableDataResult {
  isSucceed: boolean;
  data: {
    items: any[];
    totalCount: number;
    pageIndex: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
}

export class DataViewService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_MIXCORE_ENDPOINT || 'https://mixcore.net';
    
    // Get access token from localStorage (mixcore service handles the token)
    this.accessToken = localStorage.getItem('mix_access_token') || localStorage.getItem('mixcore_access_token');
    
    // For testing purposes, log the initialization
    console.log('DataViewService initialized with baseUrl:', this.baseUrl);
    console.log('Available tokens in localStorage:', {
      mix_access_token: !!localStorage.getItem('mix_access_token'),
      mixcore_access_token: !!localStorage.getItem('mixcore_access_token')
    });
  }

  private getHeaders(): HeadersInit {
    return {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8,zh-CN;q=0.7,zh;q=0.6',
      'authorization': `Bearer ${this.accessToken}`,
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin'
    };
  }

  /**
   * Get table schema by table name
   * Uses the pattern: /api/v2/rest/mix-portal/mix-db-table/get-by-name/{tableName}
   */
  async getTableSchema(tableName: string): Promise<TableSchema | null> {
    try {
      const url = `${this.baseUrl}/api/v2/rest/mix-portal/mix-db-table/get-by-name/${tableName}`;
      
      console.log('Fetching table schema from:', url);
      console.log('Using access token:', this.accessToken ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'include'
      });

      console.log('Schema response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Schema fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch table schema: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Schema response:', result);
      
      // Check if the response has the table data directly
      if (result && result.systemName) {
        return this.transformTableSchema(result);
      }
      
      // Also check the standard format with isSucceed and data wrapper
      if (result.isSucceed && result.data) {
        return this.transformTableSchema(result.data);
      }

      console.warn(`No schema found for table: ${tableName}. Response:`, result);
      return null;
    } catch (error) {
      console.error('Error fetching table schema:', error);
      return null;
    }
  }

  /**
   * Get table data with filtering and pagination
   * Uses the pattern: /api/v2/rest/mix-portal/mix-db/{tableName}/filter
   */
  async getTableData(tableName: string, options: Partial<TableDataFilter> = {}): Promise<TableDataResult> {
    try {
      // First get table schema to get table ID
      const schema = await this.getTableSchema(tableName);
      if (!schema) {
        throw new Error(`Could not find schema for table: ${tableName}`);
      }

      const filter: TableDataFilter = {
        pageSize: 20,
        pageIndex: 0,
        status: 'Published',
        sortBy: 'id',
        direction: 'Desc',
        fromDate: null,
        toDate: null,
        keyword: '',
        searchColumns: '',
        compareOperator: 'Like',
        conjunction: 'Or',
        mixDbTableName: tableName,
        mixDbTableId: schema.id,
        filterType: 'contain',
        isGroup: false,
        queries: [],
        ...options
      };

      const url = `${this.baseUrl}/api/v2/rest/mix-portal/mix-db/${tableName}/filter`;
      
      console.log('Fetching table data from:', url);
      console.log('Filter parameters:', filter);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'content-type': 'application/json'
        },
        body: JSON.stringify(filter),
        mode: 'cors',
        credentials: 'include'
      });

      console.log('Data response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Data fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch table data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Table data response:', result);
      
      // Transform the response to match our expected format
      return {
        isSucceed: true,
        data: {
          items: result.items || [],
          totalCount: result.pagingData?.total || 0,
          pageIndex: result.pagingData?.pageIndex || 0,
          pageSize: result.pagingData?.pageSize || 20,
          totalPages: result.pagingData?.totalPage || 0
        }
      };
    } catch (error) {
      console.error('Error fetching table data:', error);
      return {
        isSucceed: false,
        data: {
          items: [],
          totalCount: 0,
          pageIndex: 0,
          pageSize: 0,
          totalPages: 0
        },
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Search table data with custom query
   */
  async searchTableData(
    tableName: string, 
    keyword: string, 
    searchColumns: string[] = [],
    options: Partial<TableDataFilter> = {}
  ): Promise<TableDataResult> {
    return this.getTableData(tableName, {
      ...options,
      keyword,
      searchColumns: searchColumns.join(',')
    });
  }

  /**
   * Get paginated table data
   */
  async getPaginatedTableData(
    tableName: string,
    pageIndex: number = 0,
    pageSize: number = 20,
    sortBy: string = 'name',
    direction: 'Asc' | 'Desc' = 'Desc'
  ): Promise<TableDataResult> {
    return this.getTableData(tableName, {
      pageIndex,
      pageSize,
      sortBy,
      direction
    });
  }

  /**
   * Transform API response to our TableSchema interface
   */
  private transformTableSchema(data: any): TableSchema {
    return {
      id: data.id?.toString() || data.systemName,
      displayName: data.displayName || data.systemName,
      systemName: data.systemName || data.displayName,
      description: data.description,
      mixDbDatabaseId: data.mixDbDatabaseId?.toString(),
      mixDbDatabaseName: data.mixDbDatabaseName || data.mixDbDatabase?.systemName,
      status: data.status || 'Published',
      columns: this.transformColumns(data.columns || data.fields || [])
    };
  }

  /**
   * Transform API columns to our TableColumn interface
   */
  private transformColumns(columns: any[]): TableColumn[] {
    return columns.map(col => ({
      name: col.systemName || col.name || col.fieldName,
      displayName: col.displayName || col.name || col.systemName,
      dataType: col.dataType || col.type || 'varchar',
      isRequired: col.columnConfigurations?.isRequire || col.isRequired || col.required || false,
      isUnique: col.columnConfigurations?.isUnique || col.isUnique || col.unique || false,
      maxLength: col.maxLength || col.length,
      defaultValue: col.defaultValue || col.default,
      description: col.description || col.note
    }));
  }

  /**
   * List all available tables
   * Uses the pattern: /api/v2/rest/mix-portal/mix-db-table
   */
  async listTables(mixDbDatabaseId?: string): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams({
        pageSize: '100',
        status: 'Published'
      });
      
      if (mixDbDatabaseId) {
        queryParams.set('mixDbDatabaseId', mixDbDatabaseId);
      }
      
      const url = `${this.baseUrl}/api/v2/rest/mix-portal/mix-db-table?${queryParams}`;
      console.log('Fetching available tables from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to fetch tables:', response.status, response.statusText);
        return [];
      }

      const result = await response.json();
      console.log('Available tables response:', result);
      
      if (result.isSucceed && result.data?.items) {
        const tableNames = result.data.items.map((table: any) => table.systemName || table.displayName).filter(Boolean);
        console.log('Available table names:', tableNames);
        return tableNames;
      }

      return [];
    } catch (error) {
      console.error('Error fetching available tables:', error);
      return [];
    }
  }

  /**
   * Update access token for authentication
   */
  updateAccessToken(token: string) {
    this.accessToken = token;
  }
}

// Create singleton instance
let dataViewService: DataViewService | null = null;

export function createDataViewService(): DataViewService {
  if (!dataViewService) {
    dataViewService = new DataViewService();
  }
  return dataViewService;
}

export function getDataViewService(): DataViewService | null {
  return dataViewService;
}