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
import { IPaginationRequestModel, IPaginationResultModel, IMixFilter } from "./base";
import type { MixcoreClient } from "./client";
import { MixQuery } from "./query";
import { IActionCallback, MixTable } from "./types";
/**
 * Interface for getting data by IDs request
 */
export interface IGetByIdsRequest {
    /** Array of IDs to retrieve */
    ids: (string | number)[];
    /** Whether to load nested data */
    loadNestedData?: boolean;
    /** Columns to select */
    selectColumns?: string[];
}
/**
 * Interface for getting data by column request
 */
export interface IGetByColumnRequest {
    /** Name of the column */
    columnName: string;
    /** Value to search for */
    columnValue: string | number;
    /** Whether to load nested data */
    loadNestedData?: boolean;
    /** Columns to select */
    selectColumns?: string[];
}
/**
 * Interface for getting data by parent request
 */
export interface IGetByParentRequest {
    /** Type of the parent */
    parentType: string;
    /** ID of the parent */
    parentId: string | number;
    /** Whether to load nested data */
    loadNestedData?: boolean;
    /** Columns to select */
    selectColumns?: string[];
    /** Additional query filters */
    queries?: IMixFilter[];
}
/**
 * Interface for nested data filtering
 */
export interface INestedDataFilterRequest extends IPaginationRequestModel {
    /** Database name */
    mixDatabaseName: string;
    /** Nested data configuration */
    nestedConfig?: {
        /** Related table name */
        relatedTable: string;
        /** Join condition */
        joinCondition: string;
        /** Additional filters for nested data */
        nestedFilters?: IMixFilter[];
    };
}
/**
 * Interface for export request
 */
export interface IExportRequest {
    /** Export format (json, csv, excel) */
    format?: "json" | "csv" | "excel";
    /** Query filters for export */
    query: MixQuery;
    /** Columns to export */
    columns?: string[];
    /** Whether to include nested data */
    includeNestedData?: boolean;
}
/**
 * Interface for import request
 */
export interface IImportRequest {
    /** File content or data to import */
    data: any[];
    /** Import format (json, csv, excel) */
    format?: "json" | "csv" | "excel";
    /** Whether to update existing records */
    updateExisting?: boolean;
    /** Column mapping configuration */
    columnMapping?: Record<string, string>;
}
/**
 * Interface for data relationship response
 */
export interface IDataRelationship {
    /** Relationship ID */
    id: string;
    /** Parent table name */
    parentTable: string;
    /** Child table name */
    childTable: string;
    /** Relationship type */
    relationshipType: "OneToOne" | "OneToMany" | "ManyToMany";
    /** Foreign key column */
    foreignKey: string;
    /** Reference key column */
    referenceKey: string;
    /** Related data */
    relatedData?: any[];
}
/**
 * Interface for hub connection data
 */
export interface IHubData {
    /** Connection ID */
    connectionId: string;
    /** User ID */
    userId?: string;
    /** Group name */
    groupName?: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
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
export declare class MixcoreTable {
    /** Reference to the parent MixcoreClient instance */
    client: MixcoreClient;
    /**
     * Creates a new MixcoreTable instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client: MixcoreClient);
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
    getDataByIds: <T>(databaseName: string, request: IGetByIdsRequest, callBack?: IActionCallback<T[]>) => Promise<T[]>;
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
    filterData: <T>(databaseName: string, query: MixQuery, callBack?: IActionCallback<IPaginationResultModel<T>>) => Promise<IPaginationResultModel<T>>;
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
    getNestedData: <T>(databaseName: string, request: INestedDataFilterRequest, callBack?: IActionCallback<IPaginationResultModel<T>>) => Promise<IPaginationResultModel<T>>;
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
    exportData: <T>(databaseName: string, request: IExportRequest, callBack?: IActionCallback<any>) => Promise<any>;
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
    importData: <T>(databaseName: string, request: IImportRequest, callBack?: IActionCallback<any>) => Promise<any>;
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
    getDataById: <T>(databaseName: string, id: string | number, callBack?: IActionCallback<T>) => Promise<T>;
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
    getDataByColumn: <T>(databaseName: string, columnName: string, columnValue: string | number, callBack?: IActionCallback<T>) => Promise<T>;
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
    getDataByParent: <T>(databaseName: string, parentType: string, parentId: string | number, callBack?: IActionCallback<T[]>) => Promise<T[]>;
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
    getDataByGuidParent: <T>(databaseName: string, parentType: string, parentId: string, callBack?: IActionCallback<T[]>) => Promise<T[]>;
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
    createData: <T>(databaseName: string, data: Partial<T>, callBack?: IActionCallback<T>) => Promise<T>;
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
    updateData: <T>(databaseName: string, id: string | number, data: Partial<T>, callBack?: IActionCallback<T>) => Promise<T>;
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
    deleteData: <T>(databaseName: string, id: string | number, callBack?: IActionCallback<T>) => Promise<T>;
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
    getDataRelationships: (databaseName: string, callBack?: IActionCallback<IDataRelationship[]>) => Promise<IDataRelationship[]>;
    getTableInfoByName: (databaseSystemName: string, callBack?: IActionCallback<MixTable>) => Promise<MixTable>;
    /**
     * Private method to wrap errors with consistent error types
     *
     * @param error - Original error
     * @param defaultMessage - Default error message
     * @returns Wrapped error with proper type
     */
    private _wrapError;
}
