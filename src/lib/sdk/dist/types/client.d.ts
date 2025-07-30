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
import { MixcoreAuth } from "./auth";
import { IPaginationResultModel } from "./base";
import { MixcoreDatabase } from "./database";
import { MixcoreTable } from "./database-data";
import { MixcoreMixDBAssociation } from "./database-data-associations";
import { MixcoreStorage } from "./storage";
import { IActionCallback, ICulture, IGlobalSettings, MixcoreEvent } from "./types";
/**
 * Configuration interface for initializing the Mixcore client
 *
 * @interface IClientConfig
 * @example
 * ```typescript
 * const config: IClientConfig = {
 *   endpoint: 'https://api.example.com/v2',
 *   tokenKey: 'my_access_token',
 *   refreshTokenKey: 'my_refresh_token',
 *   tokenType: 'Bearer',
 *   events: {
 *     onAuthSuccess: () => console.log('Authenticated!'),
 *     onAuthError: () => console.log('Auth failed')
 *   }
 * };
 * ```
 */
export interface IClientConfig {
    /** Base API endpoint URL. Defaults to DEFAULT_CONFIG.BASE_ENDPOINT */
    endpoint?: string;
    /** Key used to store access tokens in local storage */
    tokenKey: string;
    /** Key used to store refresh tokens in local storage */
    refreshTokenKey: string;
    /** Token type prefix (e.g., 'Bearer'). Defaults to 'Bearer' */
    tokenType?: string;
    /** Event handlers for various SDK events */
    events?: Record<MixcoreEvent, () => void>;
    /**  */
    unAuthorizedCallback?: () => void;
}
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
export declare class MixcoreClient {
    /** Base API endpoint URL (read-only) */
    readonly BASE_ENDPOINT: "https://api.mixcore.io";
    /** All available API endpoints (read-only) */
    readonly ENDPOINT: {
        readonly auth: {
            readonly signIn: "/rest/auth/user/login";
            readonly externalLogin: "/rest/auth/p4ps/external-login-unsecure";
            readonly register: "/rest/auth/user/register";
            readonly update: "/rest/auth/user/save";
            readonly getProfile: "/rest/auth/user/my-profile";
            readonly culture: "/rest/mix-portal/culture";
            readonly renewToken: "/rest/auth/user/renew-token";
        };
        readonly global: {
            readonly globalSetting: "/rest/shared/get-global-settings";
            readonly dashboardInfo: "/rest/mix-portal/common/en-US/dashboard";
            readonly restartApp: "/rest/shared/stop-application";
            readonly clearCache: "/rest/shared/clear-cache";
        };
        readonly content: {
            readonly pageContent: "/rest/mix-portal/mix-page-content";
            readonly application: "/rest/mix-portal/mix-application";
            readonly postContent: "/rest/mix-portal/mix-post-content";
            readonly moduleContent: "/rest/mix-portal/mix-module-content";
            readonly moduleData: "/rest/mix-portal/mix-module-data";
            readonly postToPost: "/rest/mix-portal/mix-post-post";
            readonly template: "/rest/mix-portal/mix-template";
            readonly database: "/rest/mix-portal/mix-database";
            readonly databaseRelation: "/rest/mix-portal/mix-database-relationship";
            readonly databaseContext: "/rest/mix-portal/mixdb-context";
            readonly getDatabaseBySystemName: "/rest/mix-portal/mix-database/get-by-name";
            readonly mixDb: "/rest/mix-portal/mix-db";
            readonly mixDbColumn: "/rest/mix-portal/mix-database-column";
        };
        readonly storage: {
            readonly upload: "/rest/mix-storage/upload-file";
            readonly uploadBase64: "/rest/mix-storage/upload-file-stream";
            readonly delete: "/rest/mix-storage/delete-file";
        };
        readonly service: {
            readonly metadata: "/rest/mix-services/metadata";
            readonly getMetadata: "/rest/mix-services/metadata/get-metadata";
            readonly createMetadataAsc: "/rest/mix-services/metadata/create-metadata-association";
            readonly deleteMetadataAsc: "/rest/mix-services/metadata/delete-metadata-association";
            readonly sync: "/api/daphale/sync/products";
        };
        readonly settings: {
            readonly config: "/rest/mix-portal/configuration";
        };
        readonly user: {
            readonly list: "/rest/auth/user/list";
            readonly detail: "/rest/auth/user/details";
            readonly register: "/rest/auth/user/register";
            readonly changePassword: "/rest/auth/user/change-password";
            readonly role: "/rest/auth/role";
            readonly permission: "/rest/mix-services/permission";
            readonly delete: "/rest/auth/user/remove-user";
            readonly toggleRole: "/rest/auth/user/user-in-role";
        };
        readonly events: {
            readonly scheduler: "/scheduler";
        };
        readonly log: {
            readonly search: "/rest/mix-log/audit-log/search";
        };
        readonly database: "/rest/mix-portal/mixdb-context";
        readonly table: "/rest/mix-portal/mix-database";
    };
    /**
     * Client configuration with defaults merged
     * Contains endpoint, token keys, and other settings
     */
    config: IClientConfig;
    /** Default headers sent with all requests (read-only) */
    readonly headers: {
        "x-sdk-name": "Web";
        "x-sdk-platform": "client";
        "x-sdk-language": "web";
        "x-sdk-version": "0.0.1";
    };
    /** Authentication module for login/logout/user management */
    auth: MixcoreAuth;
    /** Database module for CRUD operations */
    database: MixcoreDatabase;
    /** Enhanced MixDB module for advanced database operations */
    table: MixcoreTable;
    /** MixDB Association module for relationship management */
    mixdbAssociation: MixcoreMixDBAssociation;
    /** Storage module for file operations */
    storage: MixcoreStorage;
    /**
     * Array of available cultures/locales
     * Populated after calling initLocalization()
     */
    cultures: ICulture[];
    /**
     * Flag indicating if culture data has been loaded
     * Prevents redundant API calls to fetch culture data
     */
    initializedCulture: boolean;
    /**
     * Setter for global settings
     * Updates the internal global settings and can trigger events
     *
     * @param value - Global settings object or undefined to clear
     */
    set globalSetting(value: IGlobalSettings | undefined);
    /**
     * Getter for global settings
     *
     * @returns Current global settings or undefined if not loaded
     */
    get globalSetting(): IGlobalSettings | undefined;
    /** Private storage for global settings */
    private _globalSetting?;
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
    constructor(config?: Partial<IClientConfig>);
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
    getGlobalSetting: (callBack?: IActionCallback<IGlobalSettings>) => Promise<IGlobalSettings>;
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
    initLocalization: () => Promise<IPaginationResultModel<ICulture>>;
}
