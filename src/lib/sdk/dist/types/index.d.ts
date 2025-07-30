/**
 * @fileoverview Main entry point for the Mixcore SDK
 *
 * This file exports all public APIs, types, and classes from the SDK,
 * providing a clean interface for consuming applications.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
export { MixcoreClient } from "./client";
export type { IClientConfig } from "./client";
export { MixcoreAuth } from "./auth";
export { MixcoreDatabase } from "./database";
export { MixcoreTable } from "./database-data";
export type { IGetByIdsRequest, IGetByColumnRequest, IGetByParentRequest, INestedDataFilterRequest, IExportRequest, IImportRequest, IDataRelationship, IHubData, } from "./database-data";
export { MixcoreMixDBAssociation } from "./database-data-associations";
export type { IMixDbAssociation, ICreateAssociationRequest, IUpdateAssociationRequest, IBulkAssociationRequest, IAssociationFilterRequest, IDefaultAssociationConfig, } from "./database-data-associations";
export { MixcoreStorage } from "./storage";
export * from "./base";
export { DEFAULT_CONFIG, ENDPOINTS } from "./config/constants";
export * from "./types";
export * from "./query";
export { IStorageAdapter, BrowserStorageAdapter, MemoryStorageAdapter, NodeStorageAdapter, StorageAdapterFactory, defaultStorageAdapter, } from "./helpers/storage-adapter";
