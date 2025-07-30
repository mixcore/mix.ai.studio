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
import { IPaginationResultModel } from "./base";
import type { MixcoreClient } from "./client";
import { MixQuery } from "./query";
import { IActionCallback, IExportDataResponse, MixDatabase } from "./types";
/**
 * Database operations module for the Mixcore SDK
 *
 * The MixcoreDatabase class provides a comprehensive interface for all database
 * operations including CRUD operations, bulk operations, querying, and data export.
 * All methods include input validation, caching for performance, and proper error
 * handling with specific error types.
 *
 * @class MixcoreDatabase
 * @example
 * ```typescript
 * // Access through client instance
 * const client = new MixcoreClient({ ... });
 * const db = client.database;
 *
 * // Basic operations
 * const users = await db.getData('users', new MixQuery().take(10));
 * const user = await db.getDataById('users', 123);
 * const newUser = await db.createData('users', { name: 'John', email: 'john@example.com' });
 * const success = await db.deleteData('users', 123);
 *
 * // Query with conditions
 * const activeUsers = await db.getData('users',
 *   new MixQuery()
 *     .where('status', 'active')
 *     .orderBy('createdDate', 'desc')
 *     .take(20)
 * );
 * ```
 */
export declare class MixcoreTable {
    client: MixcoreClient;
    constructor(client: MixcoreClient);
    /**
     * Retrieves data from a database with optional query parameters
     *
     * This method fetches data from the specified database system with support for
     * filtering, sorting, pagination, and caching. Results are automatically cached
     * to improve performance for repeated requests.
     *
     * @template T - The type of data being retrieved
     * @param databaseSystemName - Name of the database system (e.g., 'users', 'products')
     * @param query - MixQuery object for filtering, sorting, and pagination
     * @returns Promise that resolves to paginated results
     * @throws {ValidationError} When database name or query is invalid
     * @throws {NetworkError} When the request fails or server is unreachable
     * @throws {AuthenticationError} When user lacks permission to access the database
     *
     * @example
     * ```typescript
     * // Get all users with pagination
     * const allUsers = await db.getData('users', new MixQuery().take(50));
     *
     * // Get active users sorted by creation date
     * const activeUsers = await db.getData('users',
     *   new MixQuery()
     *     .where('status', 'active')
     *     .orderBy('createdDate', 'desc')
     *     .skip(0)
     *     .take(20)
     * );
     *
     * // Complex query with multiple conditions
     * const premiumUsers = await db.getData('users',
     *   new MixQuery()
     *     .where('subscription', 'premium')
     *     .where('lastLoginDate', '>=', '2024-01-01')
     *     .orWhere('vipStatus', true)
     *     .orderBy('lastLoginDate', 'desc')
     *     .take(100)
     * );
     *
     * // Access results
     * console.log('Total users:', allUsers.pagingData.total);
     * allUsers.items.forEach(user => {
     *   console.log(`${user.name} (${user.email})`);
     * });
     * ```
     */
    getData: <T>(databaseSystemName: string, query: MixQuery, callBack?: IActionCallback<IPaginationResultModel<T>>) => Promise<IPaginationResultModel<T>>;
    /**
     * Retrieves a single record by its unique identifier
     *
     * Fetches a specific record from the database using its ID. This method includes
     * caching and input validation to ensure data integrity and performance.
     *
     * @template T - The type of data being retrieved
     * @param databaseSystemName - Name of the database system
     * @param dataId - Unique identifier of the record (number or string)
     * @returns Promise that resolves to the record data
     * @throws {ValidationError} When database name or ID is invalid
     * @throws {NetworkError} When the request fails or record not found
     * @throws {AuthenticationError} When user lacks permission to access the record
     *
     * @example
     * ```typescript
     * // Get user by ID
     * const user = await db.getDataById('users', 123);
     * console.log('User name:', user.name);
     *
     * // Get product by string ID
     * const product = await db.getDataById('products', 'prod-abc-123');
     * console.log('Product price:', product.price);
     *
     * // Handle case where record might not exist
     * try {
     *   const user = await db.getDataById('users', 999);
     *   console.log('Found user:', user);
     * } catch (error) {
     *   if (error instanceof NetworkError && error.statusCode === 404) {
     *     console.log('User not found');
     *   } else {
     *     console.error('Error fetching user:', error);
     *   }
     * }
     * ```
     */
    getDataById: <T>(databaseSystemName: string, dataId: number | string, callBack?: IActionCallback<T>) => Promise<T>;
    /**
     * Searches for records by a specific column value
     *
     * Finds all records where the specified column matches the given value.
     * This is useful for searches by email, username, or other unique fields.
     *
     * @template T - The type of data being retrieved
     * @param databaseSystemName - Name of the database system
     * @param column - Column name to search in
     * @param value - Value to search for
     * @returns Promise that resolves to paginated search results
     * @throws {ValidationError} When any parameter is invalid
     * @throws {NetworkError} When the request fails
     * @throws {AuthenticationError} When user lacks permission
     *
     * @example
     * ```typescript
     * // Find user by email
     * const userByEmail = await db.getDataByColumn('users', 'email', 'john@example.com');
     * if (userByEmail.items.length > 0) {
     *   console.log('User found:', userByEmail.items[0]);
     * }
     *
     * // Find products by category
     * const electronics = await db.getDataByColumn('products', 'category', 'electronics');
     * console.log(`Found ${electronics.items.length} electronics products`);
     *
     * // Find orders by status
     * const pendingOrders = await db.getDataByColumn('orders', 'status', 'pending');
     * pendingOrders.items.forEach(order => {
     *   console.log(`Order ${order.id} is pending`);
     * });
     * ```
     */
    getDataByColumn: <T>(databaseSystemName: string, column: string, value: string | number, callBack?: IActionCallback<T>) => Promise<T>;
    /**
     * Creates a new record in the database
     *
     * Inserts a new record with the provided data. The data object is validated
     * before being sent to the server, and cache is invalidated to ensure
     * consistency.
     *
     * @template T - The type of data being created
     * @param databaseSystemName - Name of the database system
     * @param data - Object containing the record data to create
     * @returns Promise that resolves to the created record with generated ID
     * @throws {ValidationError} When database name or data is invalid
     * @throws {NetworkError} When the request fails or server error occurs
     * @throws {AuthenticationError} When user lacks permission to create records
     *
     * @example
     * ```typescript
     * // Create a new user
     * const newUser = await db.createData('users', {
     *   name: 'John Doe',
     *   email: 'john@example.com',
     *   role: 'user',
     *   active: true
     * });
     * console.log('Created user with ID:', newUser.id);
     *
     * // Create a product with complex data
     * const newProduct = await db.createData('products', {
     *   name: 'Wireless Headphones',
     *   description: 'High-quality wireless headphones with noise cancellation',
     *   price: 199.99,
     *   category: 'electronics',
     *   tags: ['wireless', 'audio', 'noise-cancelling'],
     *   specifications: {
     *     battery: '30 hours',
     *     connectivity: 'Bluetooth 5.0'
     *   }
     * });
     * console.log('Created product:', newProduct);
     * ```
     */
    createData: <T>(databaseSystemName: string, data: Partial<T>, callBack?: IActionCallback<Partial<T>>) => Promise<Partial<T>>;
    /**
     * Updates an existing record in the database
     *
     * Modifies an existing record by ID with the provided data. Only the fields
     * included in the data object will be updated. Cache is invalidated to ensure
     * data consistency.
     *
     * @template T - The type of data being updated
     * @param databaseSystemName - Name of the database system
     * @param id - Unique identifier of the record to update
     * @param data - Object containing the fields to update
     * @returns Promise that resolves to the updated record
     * @throws {ValidationError} When any parameter is invalid
     * @throws {NetworkError} When the request fails or record not found
     * @throws {AuthenticationError} When user lacks permission to update
     *
     * @example
     * ```typescript
     * // Update user profile
     * const updatedUser = await db.updateData('users', 123, {
     *   name: 'Jane Doe',
     *   lastLoginDate: new Date().toISOString()
     * });
     * console.log('Updated user:', updatedUser);
     *
     * // Update product price
     * const updatedProduct = await db.updateData('products', 'prod-123', {
     *   price: 149.99,
     *   onSale: true,
     *   salePrice: 129.99
     * });
     *
     * // Partial update with complex data
     * const updatedOrder = await db.updateData('orders', 456, {
     *   status: 'shipped',
     *   tracking: {
     *     carrier: 'UPS',
     *     trackingNumber: '1Z999AA1234567890',
     *     estimatedDelivery: '2024-06-15'
     *   }
     * });
     * ```
     */
    updateData: <T>(databaseSystemName: string, dataId: number | string, data: Partial<T>, callBack?: IActionCallback<Partial<T>>) => Promise<Partial<T>>;
    /**
     * Updates multiple records in a single operation
     *
     * Performs bulk updates on multiple records. Each item in the updates array
     * should contain an ID field and the data to update. This is more efficient
     * than updating records individually.
     *
     * @template T - The type of data being updated
     * @param databaseSystemName - Name of the database system
     * @param updates - Array of objects containing ID and update data
     * @returns Promise that resolves to array of updated records
     * @throws {ValidationError} When any parameter is invalid
     * @throws {NetworkError} When the request fails
     * @throws {AuthenticationError} When user lacks permission
     *
     * @example
     * ```typescript
     * // Update multiple users at once
     * const bulkUpdates = [
     *   { id: 1, name: 'Updated Name 1', active: true },
     *   { id: 2, name: 'Updated Name 2', active: false },
     *   { id: 3, email: 'newemail@example.com' }
     * ];
     *
     * const updatedUsers = await db.updateManyData('users', bulkUpdates);
     * console.log(`Updated ${updatedUsers.length} users`);
     *
     * // Update product prices in bulk
     * const priceUpdates = [
     *   { id: 'prod-1', price: 99.99, onSale: true },
     *   { id: 'prod-2', price: 149.99, onSale: false },
     *   { id: 'prod-3', price: 79.99, salePrice: 59.99 }
     * ];
     *
     * const updatedProducts = await db.updateManyData('products', priceUpdates);
     * updatedProducts.forEach(product => {
     *   console.log(`${product.name}: $${product.price}`);
     * });
     * ```
     */
    updateManyData: <T>(databaseSystemName: string, data: Partial<T>[], callBack?: IActionCallback<Partial<T>[]>) => Promise<Partial<T>[]>;
    /**
     * Deletes a record from the database
     *
     * Permanently removes a record by its ID. This operation cannot be undone,
     * so use with caution. Cache is invalidated to ensure consistency.
     *
     * @param databaseSystemName - Name of the database system
     * @param id - Unique identifier of the record to delete
     * @returns Promise that resolves to true if deletion was successful
     * @throws {ValidationError} When database name or ID is invalid
     * @throws {NetworkError} When the request fails or record not found
     * @throws {AuthenticationError} When user lacks permission to delete
     *
     * @example
     * ```typescript
     * // Delete a user
     * const success = await db.deleteData('users', 123);
     * if (success) {
     *   console.log('User deleted successfully');
     * }
     *
     * // Delete with error handling
     * try {
     *   await db.deleteData('products', 'prod-123');
     *   console.log('Product deleted');
     * } catch (error) {
     *   if (error instanceof NetworkError && error.statusCode === 404) {
     *     console.log('Product not found');
     *   } else if (error instanceof AuthenticationError) {
     *     console.log('Permission denied');
     *   } else {
     *     console.error('Delete failed:', error);
     *   }
     * }
     *
     * // Conditional deletion
     * const userToDelete = await db.getDataById('users', 456);
     * if (userToDelete.status === 'inactive') {
     *   await db.deleteData('users', 456);
     *   console.log('Inactive user deleted');
     * }
     * ```
     */
    deleteData: <T>(databaseSystemName: string, dataId: number | string | undefined, callBack?: IActionCallback<boolean>) => Promise<boolean>;
    /**
     * Exports data from the database with optional filtering
     *
     * Generates an export of data from the specified database, optionally filtered
     * by a query. This is useful for creating backups, reports, or data migration.
     * The export format depends on server configuration (CSV, JSON, Excel, etc.).
     *
     * @template T - The type of data being exported
     * @param databaseSystemName - Name of the database system
     * @param query - Optional MixQuery for filtering the export data
     * @returns Promise that resolves to export result with download URL or data
     * @throws {ValidationError} When database name is invalid
     * @throws {NetworkError} When the request fails
     * @throws {AuthenticationError} When user lacks export permission
     *
     * @example
     * ```typescript
     * // Export all users
     * const allUsersExport = await db.exportData('users');
     * console.log('Export URL:', allUsersExport.downloadUrl);
     *
     * // Export filtered data
     * const activeUsersExport = await db.exportData('users',
     *   new MixQuery()
     *     .where('status', 'active')
     *     .where('createdDate', '>=', '2024-01-01')
     * );
     *
     * // Export with specific columns (if supported)
     * const userContactsExport = await db.exportData('users',
     *   new MixQuery()
     *     .select(['name', 'email', 'phone'])
     *     .where('subscribed', true)
     * );
     *
     * // Handle export result
     * if (allUsersExport.downloadUrl) {
     *   // Server provides download URL
     *   window.open(allUsersExport.downloadUrl, '_blank');
     * } else if (allUsersExport.data) {
     *   // Server returns data directly
     *   console.log('Export data:', allUsersExport.data);
     * }
     * ```
     */
    exportData: <T>(databaseSystemName: string, query: MixQuery, callBack?: IActionCallback<IExportDataResponse>) => Promise<IExportDataResponse>;
}
export declare class MixcoreDatabase {
    client: MixcoreClient;
    constructor(client: MixcoreClient);
    getDatabases: (query: MixQuery, callBack?: IActionCallback<IPaginationResultModel<MixDatabase>>) => Promise<IPaginationResultModel<MixDatabase>>;
    getMasterDatabaseTables: (callBack?: IActionCallback<IPaginationResultModel<MixcoreTable>>) => Promise<IPaginationResultModel<MixcoreTable>>;
    /**
     * Before using a database that you have created for the first time, it must be migrated into a single table.
     *
     */
    migrateToSingleTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * When you activate this button, the system will automatically backup your data in case you need it in the future.
     *
     */
    backupTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * Depending on when you last backed up the data, the system will restore it.
     *
     */
    restoreTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * When you wish to make changes to your database or add new columns, run this migration.
     *
     */
    updateDataTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<import("axios").AxiosResponse<any, any>>;
}
