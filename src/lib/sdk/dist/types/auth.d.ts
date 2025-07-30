/**
 * @fileoverview Authentication module for the Mixcore SDK
 *
 * This module handles all authentication-related operations including login, logout,
 * user registration, profile management, and secure token storage. It provides
 * encrypted login capabilities and automatic token management.
 *
 * @author Mixcore Team
 * @version 0.0.1-dev.21+
 */
import { IPaginationResultModel } from "./base";
import type { MixcoreClient } from "./client";
import { IActionCallback, ILoginRequest, IProfile, IRegisterAccountRequest, IRegisterResult, ITokenInfo, IUser } from "./types";
import { MixQuery } from "query";
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
export declare class MixcoreAuth {
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
    get config(): import("./client").IClientConfig;
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
    getUsers: (query: MixQuery, callBack?: IActionCallback<IPaginationResultModel<IUser>>) => Promise<IPaginationResultModel<IUser>>;
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
