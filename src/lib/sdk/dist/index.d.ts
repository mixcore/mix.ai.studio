import { MixQuery as MixQuery$1 } from 'query';
import * as axios from 'axios';
import { AxiosError, AxiosResponse } from 'axios';
import { IBase64UploadConfiguration as IBase64UploadConfiguration$1 } from 'types';

declare enum EDataType {
    String = "String",
    Custom = "Custom",
    DateTime = "DateTime",
    Date = "Date",
    Time = "Time",
    DateTimeLocal = "DateTimeLocal",
    Duration = "Duration",
    PhoneNumber = "PhoneNumber",
    Double = "Double",
    Text = "Text",
    Html = "Html",
    MultilineText = "MultilineText",
    EmailAddress = "EmailAddress",
    Password = "Password",
    Url = "Url",
    ImageUrl = "ImageUrl",
    CreditCard = "CreditCard",
    PostalCode = "PostalCode",
    Upload = "Upload",
    Color = "Color",
    Boolean = "Boolean",
    Icon = "Icon",
    VideoYoutube = "VideoYoutube",
    TuiEditor = "TuiEditor",
    Integer = "Integer",
    Guid = "Guid",
    Reference = "Reference",
    QRCode = "QRCode",
    Tag = "Tag",
    Json = "Json",
    Array = "Array",
    ArrayMedia = "ArrayMedia",
    ArrayRadio = "ArrayRadio",
    Long = "Long"
}

/**
 * Enum representing different search methods that can be used in queries
 */
declare enum ESearchMethod {
    /** Performs a LIKE search operation */
    Like = "Like",
    /** Performs an IN search operation */
    In = "In",
    /** Performs a range-based search operation */
    InRange = "InRange",
    /** Performs an exact match search operation */
    Equal = "Equal"
}
/**
 * Enum representing different comparison operators for filtering data
 */
declare enum ECompareOperator {
    /** Case-sensitive pattern matching */
    Like = "Like",
    /** Case-insensitive pattern matching */
    ILike = "ILike",
    /** Exact equality comparison */
    Equal = "Equal",
    /** Not equal comparison */
    NotEqual = "NotEqual",
    /** Less than or equal to comparison */
    LessThanOrEqual = "LessThanOrEqual",
    /** Less than comparison */
    LessThan = "LessThan",
    /** Greater than comparison */
    GreaterThan = "GreaterThan",
    /** Greater than or equal to comparison */
    GreaterThanOrEqual = "GreaterThanOrEqual",
    /** Checks if value contains the specified string */
    Contain = "Contain",
    /** Checks if value does not contain the specified string */
    NotContain = "NotContain",
    /** Checks if value falls within a specified range */
    InRange = "InRange"
}
/**
 * Enum representing sort directions for ordering data
 */
declare enum ESortDirection {
    /** Sort in ascending order */
    Asc = "Asc",
    /** Sort in descending order */
    Desc = "Desc"
}
/**
 * Interface representing a sort configuration for data
 */
interface IMixSort {
    /** Display name for the sort column */
    displayName?: string;
    /** System name of the column to sort by */
    colSysName: string;
    /** Direction of the sort (ascending or descending) */
    direction: ESortDirection;
    /** Indicates if this is a temporary sort */
    temporary?: boolean;
}
/**
 * Interface representing a pagination request model
 * Used for requesting paginated data with various filtering and sorting options
 */
interface IPaginationRequestModel {
    /** Number of items per page */
    pageSize?: number;
    /** Search keyword for filtering results */
    keyword?: string;
    /** Current page index (0-based) */
    pageIndex?: number;
    /** Columns to search in when using keyword */
    searchColumns?: string | string[];
    /** Method to use for searching */
    searchMethod?: ESearchMethod;
    /** Sort direction for the results */
    direction?: ESortDirection;
    /** ID of the parent entity */
    parentId?: number;
    /** GUID of the parent entity */
    guidParentId?: string;
    /** Name of the parent entity */
    parentName?: string;
    /** Column to order results by */
    orderBy?: string;
    /** Status filter */
    status?: string;
    /** Additional filters to apply */
    filters?: {
        [key: string]: unknown;
    };
    /** Sort configurations */
    sorts?: IMixSort[];
    /** Query filters */
    queries?: IMixFilter[];
    /** Metadata query filters */
    metadataQueries?: IMixFilter[];
    /** Whether to load nested data */
    loadNestedData?: boolean;
    /** Name of the database to query */
    mixDatabaseName?: string;
    /** Additional properties */
    [key: string]: unknown;
}
/**
 * Interface representing a filter condition
 */
interface IMixFilter {
    /** Name of the field to filter on */
    fieldName: string;
    /** Value to compare against */
    value: string | number | null | Date | boolean;
    /** Operator to use for comparison */
    compareOperator: ECompareOperator;
    /** Whether this filter is required */
    isRequired?: boolean;
    /** Display name for the filter */
    displayName?: string;
    /** Available options for the filter */
    options?: string[];
    /** Type of the filter (select or date) */
    type?: 'select' | 'date';
    /** Whether this is a draft filter */
    draft?: boolean;
}

type TApiError = AxiosError<{
    code?: string;
    message?: string;
}>;
type TApiErrorResponse = {
    status: number;
    data?: TApiError;
};

type TApiResponse<T> = AxiosResponse<T>;

declare class PaginationModel {
    pageIndex: number;
    page?: number;
    pageSize: number;
    total?: number;
    totalPage?: number;
    canGoNext?: boolean;
    canGoPrevious?: boolean;
    static default(): PaginationModel;
    constructor(value?: Partial<PaginationModel>);
}
interface IPaginationResultModel<T> {
    items: T[];
    pagingData: PaginationModel;
}

declare enum EMixContentStatus {
    All = "All",
    Deleted = "Deleted",
    Preview = "Preview",
    Published = "Published",
    Draft = "Draft",
    Schedule = "Schedule"
}

interface ILoginRequest {
    email?: string | undefined;
    username: string | undefined;
    password: string | undefined;
    rememberMe?: boolean;
    returnUrl?: string | undefined;
}
interface ITokenInfo {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
    expiresIn: number | undefined;
    clientId: string | undefined;
    issuedAt: Date | undefined;
    expiresAt: Date | undefined;
    deviceId: string | undefined;
    redirectUrl: string | null;
}

interface IRegisterAccountRequest {
    userName: string;
    email: string;
    phoneNumber?: string;
    provider?: 'Facebook';
    providerKey?: string;
    password: string;
    confirmPassword: string;
    data?: Record<string, string>;
}

interface IRsaKeys {
    PrivateKey: string;
    PublicKey: string;
}
interface IGlobalSettings {
    domain: string;
    apiEncryptKey: string;
    rsaKeys: IRsaKeys;
    isEncryptApi: boolean;
    pageTypes: string[];
    moduleTypes: string[];
    mixDatabaseTypes: string[];
    dataTypes: string[];
    statuses: string[];
    expiredAt: Date;
}

interface IActionCallback<T> {
    success?: (data: T) => void;
    error?: (error: any) => void;
    finally?: () => void;
}

interface ICulture {
    id?: number;
    specificulture: string;
    lcid: string;
    alias: string;
    fullName: string;
    description: string;
    icon: string;
    isSupported: boolean;
    displayName?: string;
}

interface IRole {
    roleId: string;
    userId: string;
}
interface IProfile {
    joinDate: Date;
    isActived: false;
    lastModified?: Date;
    modifiedBy: string;
    registerType?: string;
    avatar?: string;
    name?: string;
    nickName?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    countryId?: number;
    culture?: ICulture;
    dob?: string;
    roles?: IRole[];
    claims?: string[];
    logins?: string[];
    id: string;
    userName: string;
    normalizedUserName?: string;
    email: string;
    normalizedEmail?: string;
    emailConfirmed: boolean;
    passwordHash: string;
    securityStamp: string;
    concurrencyStamp: string;
    phoneNumber?: string;
    phoneNumberConfirmed: boolean;
    contactNumber?: string;
    twoFactorEnabled: boolean;
    fullname?: string;
    birthDate?: Date;
    userData?: Record<string, string>;
    province?: string;
    district?: string;
    ward?: string;
    address?: string;
}
interface IUser {
    id: string;
    userName: string;
    email: string;
    createdDateTime: string;
    isActived: boolean;
    userData: IUserData;
    roles: IRole[];
    endpoints: any[];
    isChangePassword: boolean;
}
interface IUserData {
    Id: number;
    CreatedDateTime: string;
    LastModified: any;
    MixTenantId: number;
    CreatedBy: any;
    ModifiedBy: any;
    Priority: number;
    Status: string;
    IsDeleted: boolean;
    ParentId: string;
    ParentType: string;
    PhoneNumber: string;
    FullName: string;
    Email: string;
    DateOfBirth: string;
    Username: string;
    Avatar: string;
}
interface IRegisterResult {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
    expiresIn: number;
    issued: string;
    expires: string;
    isActive: boolean;
    emailConfirmed: boolean;
    info: IRegisterResultInfo;
}
interface IRegisterResultInfo {
    parentId: string;
    parentType: string;
    username: string;
    email: string;
    phoneNumber: any;
}

interface IExportDataResponse {
    extension: string;
    fileFolder: string;
    filename: string;
    fullPath: string;
    webPath: string;
}

declare enum MixcoreEvent {
    LoginSuccess = "loginSuccess",
    LoginFail = "loginFail",
    Logout = "logout"
}

interface IBaseAuditedEntity<T = number> {
    createdDateTime?: Date;
    created_date_time?: Date;
    lastModifiedDate?: Date;
    id: T;
    displayName?: string;
    systemName?: string;
    priority?: number;
}

declare const DbContextFixId: {
    All: number;
    MasterDb: number;
};
declare enum EMixDatabaseProvider {
    SQLSERVER = "SQLSERVER",
    MySQL = "MySQL",
    PostgreSQL = "PostgreSQL",
    SQLITE = "SQLITE"
}
declare enum EMixDataType {
    String = "String",
    Custom = "Custom",
    DateTime = "DateTime",
    Date = "Date",
    Time = "Time",
    DateTimeLocal = "DateTimeLocal",
    Duration = "Duration",
    PhoneNumber = "PhoneNumber",
    Double = "Double",
    Text = "Text",
    Html = "Html",
    MultilineText = "MultilineText",
    EmailAddress = "EmailAddress",
    Password = "Password",
    Url = "Url",
    ImageUrl = "ImageUrl",
    CreditCard = "CreditCard",
    PostalCode = "PostalCode",
    Upload = "Upload",
    Color = "Color",
    Boolean = "Boolean",
    Icon = "Icon",
    VideoYoutube = "VideoYoutube",
    TuiEditor = "TuiEditor",
    Integer = "Integer",
    Guid = "Guid",
    Reference = "Reference",
    QRCode = "QRCode",
    Tag = "Tag",
    Json = "Json",
    Array = "Array",
    ArrayMedia = "ArrayMedia",
    ArrayRadio = "ArrayRadio",
    Long = "Long"
}
declare enum MixTableType {
    Service = "Service",
    GuidService = "GuidService"
}
declare enum EMixRelationShipType {
    OneToMany = "OneToMany",
    ManyToMany = "ManyToMany"
}
declare enum ENamingConvention {
    SnakeCase = "SnakeCase",
    TitleCase = "TitleCase"
}
interface IUploadConfiguration {
    arrayAccepts: string[];
    accepts: string;
    isCrop: boolean;
}
interface IMixColumnConfig {
    isRequire: boolean;
    isEncrypt: boolean;
    upload?: IUploadConfiguration;
    allowedValues?: string[];
}
interface IMixTableRelationShip {
    parentId: number;
    childId: number;
    displayName: string;
    sourceDatabaseName: string;
    destinateDatabaseName: string;
    type: EMixRelationShipType;
    referenceColumnName: string;
    id: number;
    createdDateTime: string;
    priority: number;
    status: string;
    isDeleted: boolean;
    new: boolean;
}
declare class MixColumn {
    systemName: string;
    displayName: string;
    mixDatabaseName?: string;
    dataType: EMixDataType;
    mixDatabaseId?: number;
    columnConfigurations: IMixColumnConfig;
    id: number;
    createdDateTime?: string;
    createdBy: string;
    priority: number;
    status: string;
    isValid?: boolean;
    errors?: string[];
    new: boolean;
    constructor(data: Partial<MixColumn>, configuration?: IMixColumnConfig);
}
declare class MixTable {
    systemName: string;
    type: MixTableType;
    selfManaged: boolean;
    columns: MixColumn[];
    relationships: IMixTableRelationShip[];
    displayName: string;
    mixTenantId: number;
    id: number;
    createdDateTime: string;
    priority: number;
    status: string;
    isValid: boolean;
    errors: string[];
    namingConvention?: ENamingConvention;
    updatePermissions: string[] | undefined;
    readPermissions: string[] | undefined;
    createPermissions: string[] | undefined;
    deletePermissions: string[] | undefined;
    mixDatabaseContextId: number | undefined;
    constructor(value: MixTable);
    static parsePermission(value: string[] | object | undefined): any;
}
interface MixDatabase extends IBaseAuditedEntity {
    databaseProvider: EMixDatabaseProvider;
    connectionString: string;
    schema: string;
    namingConvention?: ENamingConvention;
    databases?: MixTable[];
    status?: EMixContentStatus;
    displayName: string;
}

interface IBase64UploadConfiguration {
    folderName?: string;
    fileFolder?: string;
    filename?: string;
    extension?: string;
    content?: string;
    fileBase64: string;
}

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
declare class MixcoreAuth {
    /** Reference to the parent MixcoreClient instance */
    client: MixcoreClient;
    /**
     * Current authentication token information
     * Contains access token, refresh token, token type, and expiration data
     * Set after successful login, cleared on logout
     */
    tokenInfo?: ITokenInfo;
    /**
     * Current authenticated user profile
     * Contains user details like username, email, roles, etc.
     * Populated after successful login or calling initUserData()
     */
    currentUser?: IProfile;
    roles: string[] | null;
    /**
     * Gets the client configuration
     * Provides access to token keys, endpoint settings, and other config
     *
     * @returns Client configuration object
     */
    get config(): IClientConfig;
    /**
     * Creates a new MixcoreAuth instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client: MixcoreClient);
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
    login: (request: ILoginRequest, callBack?: IActionCallback<ITokenInfo>) => Promise<ITokenInfo>;
    getUserRoles(): string[];
    checkAuthSessionExpired: () => any;
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
    register: (userData: IRegisterAccountRequest, callBack?: IActionCallback<IRegisterResult>) => Promise<IRegisterResult>;
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
    logout(callback?: () => void): void;
    getRedirectUrl: () => string | null;
    clearRedirectUrl: () => void;
    setRedirectUrl: () => void;
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
    initUserData: (callBack?: IActionCallback<IProfile>) => Promise<IProfile>;
    getUsers: (query: MixQuery$1, callBack?: IActionCallback<IPaginationResultModel<IUser>>) => Promise<IPaginationResultModel<IUser>>;
    updateUserProfile: (userData: Partial<IUser>, callBack?: IActionCallback<IUser>) => Promise<IUser>;
    getUserProfileById: (userId: string, callBack?: IActionCallback<IUser>) => Promise<IUser>;
    removeUserById: (userId: string, callBack?: IActionCallback<IUser>) => Promise<IUser>;
    changeUserPassword: (data: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }, callBack?: IActionCallback<void>) => Promise<void>;
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
    private _handleAuthSuccess;
}

/**
 * A query builder class for constructing complex database queries with pagination, filtering, and sorting capabilities.
 * Implements IPaginationRequestModel to support pagination and filtering operations.
 */
declare class MixQuery implements IPaginationRequestModel {
    [key: string]: unknown;
    pageSize?: number | undefined;
    keyword?: string | undefined;
    pageIndex?: number | undefined;
    searchColumns?: string | string[] | undefined;
    selectColumns?: string | undefined;
    searchMethod?: ESearchMethod | undefined;
    direction?: ESortDirection | undefined;
    parentId?: number | undefined;
    guidParentId?: string | undefined;
    parentName?: string | undefined;
    orderBy?: string | undefined;
    status?: string | undefined;
    filters?: {
        [key: string]: unknown;
    } | undefined;
    sorts?: IMixSort[] | undefined;
    queries?: IMixFilter[] | undefined;
    metadataQueries?: IMixFilter[] | undefined;
    loadNestedData?: boolean | undefined;
    mixDatabaseName?: string | undefined;
    columns?: string | undefined;
    compareOperator?: ESearchMethod | undefined;
    conjunction?: "And" | "Or";
    /**
     * Creates a new MixQuery instance
     * @param value - Optional initial values for the query
     */
    constructor(value?: Partial<IPaginationRequestModel>);
    /**
     * Sets default pagination values
     * @param pageSize - Number of items per page (default: 25)
     * @returns The current MixQuery instance for method chaining
     */
    default(pageSize?: number): this;
    /**
     * Sets pagination parameters for the query
     * @param pageIndex - Zero-based index of the page to retrieve
     * @param pageSize - Number of items per page
     * @returns The current MixQuery instance for method chaining
     * @example
     * // Get the second page with 10 items per page
     * const query = new MixQuery().page(1, 10);
     */
    page(pageIndex: number, pageSize: number): this;
    /**
     * Sets sorting parameters for the query
     * @param column - Name of the column to sort by
     * @param direction - Sort direction ('Asc' or 'Desc')
     * @returns The current MixQuery instance for method chaining
     * @example
     */
    sort(column: string, direction: ESortDirection): this;
    /**
     * Specifies columns to select in the query
     * @param columns - List of column names to select
     * @returns The current MixQuery instance for method chaining
     */
    select(...columns: string[]): this;
    /**
     * Adds a LIKE condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to search for
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    like(colName: string, value: string | number | Date | null, isRequired?: boolean): this;
    /**
     * Adds an EQUAL condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to match exactly
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    equal(colName: string, value: string | number | Date | boolean | null, isRequired?: boolean): this;
    between(colName: string, value1: string | number | Date | boolean | null, value2: string | number | Date | boolean | null, isRequired?: boolean): this;
    /**
     * Adds an IN condition to the query
     * @param colName - Name of the column to filter
     * @param value - Array of values to match
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    includes(colName: string, value: (string | number)[], isRequired?: boolean): this;
    /**
     * Adds a GREATER THAN condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (>= instead of >)
     * @returns The current MixQuery instance for method chaining
     */
    greaterThan(colName: string, value: string | number | Date | null, isRequired?: boolean, isEquals?: boolean): this;
    /**
     * Adds a LESS THAN condition to the query
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (<= instead of <)
     * @returns The current MixQuery instance for method chaining
     */
    lessThan(colName: string, value: string | number | Date | null, isRequired?: boolean, isEquals?: boolean): this;
    /**
     * Adds a keyword search condition to the query
     * @param keyword - Search term to look for
     * @param searchColumns - Columns to search in
     * @returns The current MixQuery instance for method chaining
     */
    searchByKeyword(keyword: string, searchColumns: string | string[]): this;
    /**
     * Adds a text search condition to the query
     * @param colName - Name of the column to search in
     * @param value - Text to search for
     * @param isRequired - Whether this condition is required
     * @returns The current MixQuery instance for method chaining
     */
    searchByText(colName: string, value: string, isRequired?: boolean): this;
    /**
     * Conditionally adds a filter to the query
     * @param condition - Boolean condition to evaluate
     * @param fn - Function that returns a filter to add if condition is true
     * @returns The current MixQuery instance for method chaining
     */
    whereIf(condition: boolean | undefined, fn: () => IMixFilter): this;
    fromQueryParams(url?: string): this;
    /**
     * Creates a LIKE filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to search for
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the LIKE condition
     */
    static Like(colName: string, value: string | number | Date | null, isRequired?: boolean): IMixFilter;
    /**
     * Creates an EQUAL filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to match exactly
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the EQUAL condition
     */
    static Equal(colName: string, value: string | number | Date | boolean | null, isRequired?: boolean): IMixFilter;
    /**
     * Creates a case-insensitive LIKE filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to search for
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the case-insensitive LIKE condition
     */
    static Search(colName: string, value: string | number | Date | null, isRequired?: boolean): IMixFilter;
    /**
     * Creates a GREATER THAN filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (>= instead of >)
     * @returns A filter object for the GREATER THAN condition
     */
    static GreaterThan(colName: string, value: string | number | Date | boolean | null, isRequired?: boolean, isEquals?: boolean): IMixFilter;
    /**
     * Creates a LESS THAN filter condition
     * @param colName - Name of the column to filter
     * @param value - Value to compare against
     * @param isRequired - Whether this condition is required
     * @param isEquals - Whether to include equality (<= instead of <)
     * @returns A filter object for the LESS THAN condition
     */
    static LessThan(colName: string, value: string | number | Date | boolean | null, isRequired?: boolean, isEquals?: boolean): IMixFilter;
    /**
     * Creates an IN filter condition
     * @param colName - Name of the column to filter
     * @param value - Array of values to match
     * @param isRequired - Whether this condition is required
     * @returns A filter object for the IN condition
     */
    static Includes(colName: string, value: (string | number)[], isRequired?: boolean): IMixFilter;
}

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
declare class MixcoreTable$1 {
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
declare class MixcoreDatabase {
    client: MixcoreClient;
    constructor(client: MixcoreClient);
    getDatabases: (query: MixQuery, callBack?: IActionCallback<IPaginationResultModel<MixDatabase>>) => Promise<IPaginationResultModel<MixDatabase>>;
    getMasterDatabaseTables: (callBack?: IActionCallback<IPaginationResultModel<MixcoreTable$1>>) => Promise<IPaginationResultModel<MixcoreTable$1>>;
    /**
     * Before using a database that you have created for the first time, it must be migrated into a single table.
     *
     */
    migrateToSingleTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<axios.AxiosResponse<any, any>>;
    /**
     * When you activate this button, the system will automatically backup your data in case you need it in the future.
     *
     */
    backupTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<axios.AxiosResponse<any, any>>;
    /**
     * Depending on when you last backed up the data, the system will restore it.
     *
     */
    restoreTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<axios.AxiosResponse<any, any>>;
    /**
     * When you wish to make changes to your database or add new columns, run this migration.
     *
     */
    updateDataTable: (dbSysName: string, callBack?: IActionCallback<IExportDataResponse>) => Promise<axios.AxiosResponse<any, any>>;
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
 * Interface for getting data by IDs request
 */
interface IGetByIdsRequest {
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
interface IGetByColumnRequest {
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
interface IGetByParentRequest {
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
interface INestedDataFilterRequest extends IPaginationRequestModel {
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
interface IExportRequest {
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
interface IImportRequest {
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
interface IDataRelationship {
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
interface IHubData {
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
declare class MixcoreTable {
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
 * Interface for database association data
 */
interface IMixDbAssociation {
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
interface ICreateAssociationRequest {
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
interface IUpdateAssociationRequest {
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
interface IBulkAssociationRequest {
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
interface IAssociationFilterRequest extends Omit<IPaginationRequestModel, 'parentId'> {
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
interface IDefaultAssociationConfig {
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
declare class MixcoreMixDBAssociation {
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
declare class MixcoreStorage {
    /** Reference to the parent MixcoreClient instance */
    client: MixcoreClient;
    /**
     * Creates a new MixcoreStorage instance
     *
     * @param client - The parent MixcoreClient instance
     */
    constructor(client: MixcoreClient);
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
    uploadFile: (file: File, folder?: string) => Promise<string>;
    uploadFileBase64: (request: IBase64UploadConfiguration$1) => Promise<string>;
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
    downloadFile: (filePath: string) => Promise<Blob>;
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
    deleteFile: (filePath: string) => Promise<boolean>;
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
    getFileInfo: (filePath: string) => Promise<{
        id: string;
        filename: string;
        size: number;
        mimetype: string;
        uploadDate: string;
        url: string;
        folder?: string;
        metadata?: Record<string, any>;
    }>;
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
    listFiles: (folder?: string, page?: number, pageSize?: number) => Promise<{
        items: Array<{
            id: string;
            filename: string;
            size: number;
            mimetype: string;
            uploadDate: string;
            url: string;
            folder: string;
        }>;
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
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
interface IClientConfig {
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
declare class MixcoreClient {
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

declare const DEFAULT_CONFIG: {
    readonly BASE_DOMAIN: "https://api.mixcore.io";
    readonly BASE_API_PATH: "/api/v2";
    readonly TOKEN_TYPE: "Bearer";
    readonly TOKEN_KEY: "mix_access_token";
    readonly REFRESH_TOKEN_KEY: "mix_refresh_token";
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly MAX_PAGE_SIZE: 100;
    readonly REQUEST_TIMEOUT: 30000;
};
declare const ENDPOINTS: {
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
 * Storage adapter interface for cross-platform storage operations
 *
 * This interface defines the contract for storage implementations across
 * different environments and frameworks. Implementations can use localStorage,
 * sessionStorage, AsyncStorage, memory storage, or any other storage mechanism.
 *
 * @interface IStorageAdapter
 * @example
 * ```typescript
 * class CustomStorageAdapter implements IStorageAdapter {
 *   async setItem(key: string, value: string): Promise<boolean> {
 *     // Custom implementation
 *     return true;
 *   }
 *
 *   async getItem<T>(key: string): Promise<T | null> {
 *     // Custom implementation
 *     return null;
 *   }
 * }
 * ```
 */
interface IStorageAdapter {
    /**
     * Store a key-value pair
     *
     * @param key - Storage key
     * @param value - Value to store (will be serialized if needed)
     * @returns Promise resolving to true if successful, false otherwise
     */
    setItem(key: string, value: string): Promise<boolean> | boolean;
    /**
     * Retrieve a value by key
     *
     * @param key - Storage key to retrieve
     * @returns Promise resolving to the stored value or null if not found
     */
    getItem<T = string>(key: string): Promise<T | null> | T | null;
    /**
     * Remove a key from storage
     *
     * @param key - Storage key to remove
     * @returns Promise resolving to true if successful, false otherwise
     */
    removeItem(key: string): Promise<boolean> | boolean;
    /**
     * Check if storage is available and functional
     *
     * @returns Promise resolving to true if storage is available, false otherwise
     */
    isAvailable(): Promise<boolean> | boolean;
    /**
     * Clear all stored data (optional)
     *
     * @returns Promise resolving to true if successful, false otherwise
     */
    clear?(): Promise<boolean> | boolean;
}
/**
 * Browser localStorage implementation
 *
 * Uses the browser's localStorage API with safe error handling.
 * Falls back gracefully when localStorage is not available.
 */
declare class BrowserStorageAdapter implements IStorageAdapter {
    setItem(key: string, value: string): boolean;
    getItem<T = string>(key: string): T | null;
    removeItem(key: string): boolean;
    isAvailable(): boolean;
    clear(): boolean;
}
/**
 * Memory storage implementation
 *
 * Uses in-memory storage as a fallback when other storage methods
 * are not available. Data is lost when the application restarts.
 */
declare class MemoryStorageAdapter implements IStorageAdapter {
    private storage;
    setItem(key: string, value: string): boolean;
    getItem<T = string>(key: string): T | null;
    removeItem(key: string): boolean;
    isAvailable(): boolean;
    clear(): boolean;
}
/**
 * Node.js storage implementation using file system
 *
 * For server-side applications or Node.js environments where
 * localStorage is not available. Stores data in JSON files.
 */
declare class NodeStorageAdapter implements IStorageAdapter {
    private storagePath;
    private data;
    private initialized;
    constructor(storagePath?: string);
    private ensureInitialized;
    private saveData;
    setItem(key: string, value: string): Promise<boolean>;
    getItem<T = string>(key: string): Promise<T | null>;
    removeItem(key: string): Promise<boolean>;
    isAvailable(): Promise<boolean>;
    clear(): Promise<boolean>;
}
/**
 * Storage adapter factory
 *
 * Automatically detects the environment and returns the most appropriate
 * storage adapter. Provides a seamless experience across different platforms.
 */
declare class StorageAdapterFactory {
    /**
     * Create the best storage adapter for the current environment
     *
     * @param customAdapter - Optional custom storage adapter to use
     * @returns The most appropriate storage adapter
     */
    static create(customAdapter?: IStorageAdapter): IStorageAdapter;
    /**
     * Create a specific type of storage adapter
     *
     * @param type - The type of storage adapter to create
     * @param options - Configuration options for the adapter
     * @returns The specified storage adapter
     */
    static createSpecific(type: 'browser' | 'memory' | 'node', options?: any): IStorageAdapter;
}
/**
 * Default storage adapter instance
 *
 * A singleton instance that can be used throughout the SDK.
 * Automatically selects the best adapter for the current environment.
 */
declare const defaultStorageAdapter: IStorageAdapter;

export { BrowserStorageAdapter, DEFAULT_CONFIG, DbContextFixId, ECompareOperator, EDataType, EMixContentStatus, EMixDataType, EMixDatabaseProvider, EMixRelationShipType, ENDPOINTS, ENamingConvention, ESearchMethod, ESortDirection, MemoryStorageAdapter, MixColumn, MixQuery, MixTable, MixTableType, MixcoreAuth, MixcoreClient, MixcoreDatabase, MixcoreEvent, MixcoreMixDBAssociation, MixcoreStorage, MixcoreTable, NodeStorageAdapter, PaginationModel, StorageAdapterFactory, defaultStorageAdapter };
export type { IActionCallback, IAssociationFilterRequest, IBase64UploadConfiguration, IBulkAssociationRequest, IClientConfig, ICreateAssociationRequest, ICulture, IDataRelationship, IDefaultAssociationConfig, IExportDataResponse, IExportRequest, IGetByColumnRequest, IGetByIdsRequest, IGetByParentRequest, IGlobalSettings, IHubData, IImportRequest, ILoginRequest, IMixColumnConfig, IMixDbAssociation, IMixFilter, IMixSort, IMixTableRelationShip, INestedDataFilterRequest, IPaginationRequestModel, IPaginationResultModel, IProfile, IRegisterAccountRequest, IRegisterResult, IRegisterResultInfo, IRole, IRsaKeys, IStorageAdapter, ITokenInfo, IUpdateAssociationRequest, IUploadConfiguration, IUser, IUserData, MixDatabase, TApiError, TApiErrorResponse, TApiResponse };
