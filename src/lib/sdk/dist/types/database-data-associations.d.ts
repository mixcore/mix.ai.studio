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
import { IPaginationRequestModel, IPaginationResultModel } from "./base";
import type { MixcoreClient } from "./client";
import { IActionCallback } from "./types";
/**
 * Interface for database association data
 */
export interface IMixDbAssociation {
    /** Association ID */
    id?: string | number;
    /** Parent database name */
    parentDbName: string;
    /** Child database name */
    childDbName: string;
    /** Parent record ID */
    parentId: string | number;
    /** Child record ID */
    childId: string | number;
    /** Association metadata */
    metadata?: Record<string, any>;
    /** Creation date */
    createdDate?: string;
    /** Last modified date */
    modifiedDate?: string;
    /** Created by user */
    createdBy?: string;
    /** Last modified by user */
    modifiedBy?: string;
    /** Association status */
    status?: string;
    /** Sort order */
    sortOrder?: number;
}
/**
 * Interface for creating association request
 */
export interface ICreateAssociationRequest {
    /** Parent database name */
    parentDbName: string;
    /** Child database name */
    childDbName: string;
    /** Parent record ID */
    parentId: string | number;
    /** Child record ID */
    childId: string | number;
    /** Additional metadata */
    metadata?: Record<string, any>;
    /** Sort order */
    sortOrder?: number;
}
/**
 * Interface for updating association request
 */
export interface IUpdateAssociationRequest {
    /** Association ID */
    id: string | number;
    /** Updated metadata */
    metadata?: Record<string, any>;
    /** Updated sort order */
    sortOrder?: number;
    /** Updated status */
    status?: string;
}
/**
 * Interface for bulk association operations
 */
export interface IBulkAssociationRequest {
    /** Array of associations to process */
    associations: IMixDbAssociation[];
    /** Operation type */
    operation?: 'create' | 'update' | 'delete';
    /** Whether to validate before processing */
    validate?: boolean;
}
/**
 * Interface for association filter request
 */
export interface IAssociationFilterRequest extends Omit<IPaginationRequestModel, 'parentId'> {
    /** Parent database name filter */
    parentDbName?: string;
    /** Child database name filter */
    childDbName?: string;
    /** Parent ID filter */
    parentId?: string | number;
    /** Child ID filter */
    childId?: string | number;
    /** Status filter */
    status?: string;
}
/**
 * Interface for default association configuration
 */
export interface IDefaultAssociationConfig {
    /** Parent database name */
    parentDbName: string;
    /** Child database name */
    childDbName: string;
    /** Default metadata */
    defaultMetadata?: Record<string, any>;
    /** Default sort order */
    defaultSortOrder?: number;
    /** Auto-create associations */
    autoCreate?: boolean;
}
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
export declare class MixcoreMixDBAssociation {
    /** Reference to the parent MixcoreClient instance */
    client: MixcoreClient;
    /**
     * Creates a new MixcoreMixDBAssociation instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client: MixcoreClient);
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
    getAssociation: (parentDbName: string, childDbName: string, parentId: string | number, childId: string | number, callBack?: IActionCallback<IMixDbAssociation>) => Promise<IMixDbAssociation>;
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
    deleteAssociation: (parentDbName: string, childDbName: string, parentId: string | number, childId: string | number, callBack?: IActionCallback<boolean>) => Promise<boolean>;
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
    getAllAssociations: (request?: IAssociationFilterRequest, callBack?: IActionCallback<IPaginationResultModel<IMixDbAssociation>>) => Promise<IPaginationResultModel<IMixDbAssociation>>;
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
    patchManyAssociations: (associations: Partial<IMixDbAssociation>[], callBack?: IActionCallback<IMixDbAssociation[]>) => Promise<IMixDbAssociation[]>;
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
    createAssociation: (request: ICreateAssociationRequest, callBack?: IActionCallback<IMixDbAssociation>) => Promise<IMixDbAssociation>;
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
    getAssociationById: (id: string | number, callBack?: IActionCallback<IMixDbAssociation>) => Promise<IMixDbAssociation>;
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
    deleteAssociationById: (id: string | number, callBack?: IActionCallback<boolean>) => Promise<boolean>;
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
    updateAssociationById: (id: string | number, updates: Partial<IMixDbAssociation>, callBack?: IActionCallback<IMixDbAssociation>) => Promise<IMixDbAssociation>;
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
    removeCacheById: (id: string | number, callBack?: IActionCallback<boolean>) => Promise<boolean>;
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
    saveManyAssociations: (associations: IMixDbAssociation[], callBack?: IActionCallback<IMixDbAssociation[]>) => Promise<IMixDbAssociation[]>;
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
    filterAssociations: (request: IAssociationFilterRequest, callBack?: IActionCallback<IPaginationResultModel<IMixDbAssociation>>) => Promise<IPaginationResultModel<IMixDbAssociation>>;
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
    getDefaultConfig: (callBack?: IActionCallback<IDefaultAssociationConfig>) => Promise<IDefaultAssociationConfig>;
    /**
     * Private method to wrap errors with consistent error types
     *
     * @param error - Original error
     * @param defaultMessage - Default error message
     * @returns Wrapped error with proper type
     */
    private _wrapError;
}
