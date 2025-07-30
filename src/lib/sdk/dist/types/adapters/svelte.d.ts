/**
 * @fileoverview Svelte stores adapter for the Mixcore SDK
 *
 * This module provides Svelte stores that integrate seamlessly with the Mixcore SDK,
 * offering reactive state management for authentication, data fetching, and other
 * SDK operations. These stores follow Svelte best practices and provide automatic
 * reactivity throughout your Svelte application.
 *
 * Supports both Svelte 4 (traditional stores) and Svelte 5 (runes) reactivity systems:
 * - Traditional stores API for backward compatibility
 * - Runes-based composables for Svelte 5+ projects
 * - Automatic detection and graceful fallbacks
 * - Full SvelteKit 2 integration with SSR support
 *
 * For SvelteKit-specific features (SSR, load functions, form actions), use:
 * @see '@mixcore/sdk-client/adapters/sveltekit' for SvelteKit 2+ specific integrations
 *
 * Note: This module requires Svelte as a peer dependency. Import it only in Svelte applications.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
/**
 * Svelte authentication state interface
 */
export interface SvelteAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    token: string | null;
    error: Error | null;
}
/**
 * Svelte data fetching state interface
 */
export interface SvelteDataState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}
/** @deprecated Use SvelteAuthState instead */
export type AuthState = SvelteAuthState;
/** @deprecated Use SvelteDataState instead */
export type DataState<T> = SvelteDataState<T>;
/**
 * Store options for authentication
 */
export interface AuthStoreOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    onAuthChange?: (isAuthenticated: boolean) => void;
}
/**
 * Store options for data fetching
 */
export interface DataStoreOptions {
    cacheTime?: number;
    refetchInterval?: number;
    enabled?: boolean;
}
/**
 * Svelte 5 runes-based auth state (for new projects)
 */
export interface AuthRunes {
    isAuthenticated: () => boolean;
    isLoading: () => boolean;
    user: () => any | null;
    token: () => string | null;
    error: () => Error | null;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}
/**
 * Svelte 5 runes-based data state (for new projects)
 */
export interface DataRunes<T> {
    data: () => T | null;
    isLoading: () => boolean;
    error: () => Error | null;
    refetch: () => Promise<void>;
    reset: () => void;
}
/**
 * Create an authentication store for the Mixcore SDK
 *
 * Provides reactive authentication state management with automatic updates
 * when the user logs in, logs out, or when tokens expire. Integrates seamlessly
 * with Svelte's reactivity system.
 *
 * Works with both Svelte 4 (traditional stores) and Svelte 5 (runes).
 *
 * @param client - MixcoreClient instance
 * @param options - Store configuration options
 * @returns Svelte store with authentication state and methods
 *
 * @example
 * ```svelte
 * <!-- Svelte 4 & 5 compatible -->
 * <script>
 *   import { MixcoreClient } from '@mixcore/sdk-client';
 *   import { createAuthStore } from '@mixcore/sdk-client/adapters/svelte';
 *
 *   const client = new MixcoreClient({ ... });
 *   const auth = createAuthStore(client);
 *
 *   const handleLogin = async () => {
 *     await auth.login({ email: 'user@example.com', password: 'password' });
 *   };
 * </script>
 *
 * {#if $auth.isLoading}
 *   <div>Loading...</div>
 * {:else if !$auth.isAuthenticated}
 *   <button on:click={handleLogin}>Login</button>
 * {:else}
 *   <div>
 *     <p>Welcome, {$auth.user?.username}!</p>
 *     <button on:click={auth.logout}>Logout</button>
 *   </div>
 * {/if}
 * ```
 */
export declare function createAuthStore(client: any, options?: AuthStoreOptions): void;
/**
 * Create authentication runes for Svelte 5+
 *
 * Provides reactive authentication state using Svelte 5's new runes system.
 * This is the recommended approach for new Svelte 5 projects.
 *
 * @param client - MixcoreClient instance
 * @param options - Store configuration options
 * @returns Runes-based authentication state and methods
 *
 * @example
 * ```svelte
 * <!-- Svelte 5 with runes -->
 * <script>
 *   import { MixcoreClient } from '@mixcore/sdk-client';
 *   import { createAuthRunes } from '@mixcore/sdk-client/adapters/svelte';
 *
 *   const client = new MixcoreClient({ ... });
 *   const auth = createAuthRunes(client);
 *
 *   const handleLogin = async () => {
 *     await auth.login({ email: 'user@example.com', password: 'password' });
 *   };
 * </script>
 *
 * {#if auth.isLoading()}
 *   <div>Loading...</div>
 * {:else if !auth.isAuthenticated()}
 *   <button onclick={handleLogin}>Login</button>
 * {:else}
 *   <div>
 *     <p>Welcome, {auth.user()?.username}!</p>
 *     <button onclick={auth.logout}>Logout</button>
 *   </div>
 * {/if}
 * ```
 */
export declare function createAuthRunes(client: any, options?: AuthStoreOptions): AuthRunes;
/**
 * Create a data store for the Mixcore SDK
 *
 * Provides reactive data fetching with caching, loading states, and error handling.
 * Works with any SDK data operation and integrates with Svelte's reactivity.
 *
 * Compatible with both Svelte 4 and Svelte 5.
 *
 * @param fetcher - Async function that fetches data using the SDK
 * @param options - Store configuration options
 * @returns Svelte store with data state and methods
 *
 * @example
 * ```svelte
 * <script>
 *   import { createDataStore } from '@mixcore/sdk-client/adapters/svelte';
 *   import { MixQuery } from '@mixcore/sdk-client';
 *
 *   const usersStore = createDataStore(
 *     () => client.database.getData('users', new MixQuery().take(10)),
 *     { refetchInterval: 30000 }
 *   );
 *
 *   const handleRefresh = () => {
 *     usersStore.refetch();
 *   };
 * </script>
 *
 * <button on:click={handleRefresh} disabled={$usersStore.isLoading}>
 *   Refresh
 * </button>
 *
 * {#if $usersStore.isLoading}
 *   <div>Loading users...</div>
 * {:else if $usersStore.error}
 *   <div>Error: {$usersStore.error.message}</div>
 * {:else if $usersStore.data}
 *   <ul>
 *     {#each $usersStore.data.items as user (user.id)}
 *       <li>{user.name}</li>
 *     {/each}
 *   </ul>
 * {/if}
 * ```
 */
export declare function createDataStore<T>(fetcher: () => Promise<T>, options?: DataStoreOptions): void;
/**
 * Create data runes for Svelte 5+
 *
 * Provides reactive data fetching using Svelte 5's new runes system.
 * This is the recommended approach for new Svelte 5 projects.
 *
 * @param fetcher - Async function that fetches data using the SDK
 * @param options - Store configuration options
 * @returns Runes-based data state and methods
 *
 * @example
 * ```svelte
 * <!-- Svelte 5 with runes -->
 * <script>
 *   import { createDataRunes } from '@mixcore/sdk-client/adapters/svelte';
 *   import { MixQuery } from '@mixcore/sdk-client';
 *
 *   const users = createDataRunes(
 *     () => client.database.getData('users', new MixQuery().take(10)),
 *     { refetchInterval: 30000 }
 *   );
 *
 *   const handleRefresh = () => {
 *     users.refetch();
 *   };
 * </script>
 *
 * <button onclick={handleRefresh} disabled={users.isLoading()}>
 *   Refresh
 * </button>
 *
 * {#if users.isLoading()}
 *   <div>Loading users...</div>
 * {:else if users.error()}
 *   <div>Error: {users.error().message}</div>
 * {:else if users.data()}
 *   <ul>
 *     {#each users.data().items as user (user.id)}
 *       <li>{user.name}</li>
 *     {/each}
 *   </ul>
 * {/if}
 * ```
 */
export declare function createDataRunes<T>(fetcher: () => Promise<T>, options?: DataStoreOptions): DataRunes<T>;
/**
 * Create a query store for building MixQuery instances
 *
 * Provides reactive query building with the MixQuery class.
 * Changes to the query automatically trigger updates.
 *
 * @returns Svelte store with query state and methods
 *
 * @example
 * ```svelte
 * <script>
 *   import { createQueryStore } from '@mixcore/sdk-client/adapters/svelte';
 *
 *   const queryStore = createQueryStore();
 *
 *   const handleFilter = () => {
 *     queryStore.where('status', 'active');
 *     queryStore.orderBy('createdDate', 'desc');
 *     queryStore.take(10);
 *   };
 *
 *   // Use reactive query in data fetching
 *   $: usersStore = createDataStore(
 *     () => client.database.getData('users', $queryStore)
 *   );
 * </script>
 * ```
 */
export declare function createQueryStore(): void;
/**
 * Create a client store for managing SDK configuration
 *
 * Provides reactive client configuration management with the ability
 * to update settings and storage adapters at runtime.
 *
 * @param initialClient - Initial MixcoreClient instance
 * @returns Svelte store with client and configuration methods
 *
 * @example
 * ```svelte
 * <script>
 *   import { createClientStore, MemoryStorageAdapter } from '@mixcore/sdk-client/adapters/svelte';
 *
 *   const clientStore = createClientStore(initialClient);
 *
 *   const switchToMemoryStorage = () => {
 *     clientStore.setStorageAdapter(new MemoryStorageAdapter());
 *   };
 * </script>
 *
 * <button on:click={switchToMemoryStorage}>Use Memory Storage</button>
 * ```
 */
export declare function createClientStore(initialClient: any): void;
/**
 * Global store for the Mixcore client
 *
 * Provides a global singleton store for the Mixcore client that can be
 * imported and used throughout your Svelte application.
 *
 * @example
 * ```svelte
 * <script>
 *   import { mixcoreClient } from '@mixcore/sdk-client/adapters/svelte';
 *   import { MixcoreClient } from '@mixcore/sdk-client';
 *
 *   // Initialize the global client
 *   mixcoreClient.set(new MixcoreClient({ ... }));
 *
 *   // Use the client in components
 *   $: auth = createAuthStore($mixcoreClient);
 * </script>
 * ```
 */
export declare const mixcoreClient: {
    subscribe: () => never;
};
/**
 * Derived store for authentication state from global client
 */
export declare const globalAuth: {
    subscribe: () => never;
};
/**
 * Utility function to create multiple stores at once
 *
 * @param client - MixcoreClient instance
 * @param options - Configuration options for each store type
 * @returns Object containing all store types
 *
 * @example
 * ```svelte
 * <script>
 *   import { createStores } from '@mixcore/sdk-client/adapters/svelte';
 *
 *   const { auth, client, query } = createStores(initialClient, {
 *     auth: { autoRefresh: true }
 *   });
 * </script>
 * ```
 */
export declare function createStores(client: any, options?: {
    auth?: AuthStoreOptions;
    data?: DataStoreOptions;
}): void;
/**
 * Utility function to create multiple runes at once (Svelte 5+)
 *
 * @param client - MixcoreClient instance
 * @param options - Configuration options for each rune type
 * @returns Object containing all rune types
 *
 * @example
 * ```svelte
 * <!-- Svelte 5 with runes -->
 * <script>
 *   import { createRunes } from '@mixcore/sdk-client/adapters/svelte';
 *
 *   const { auth, client } = createRunes(initialClient, {
 *     auth: { autoRefresh: true }
 *   });
 * </script>
 * ```
 */
export declare function createRunes(client: any, options?: {
    auth?: AuthStoreOptions;
    data?: DataStoreOptions;
}): void;
/**
 * Check if the current Svelte version supports runes (v5+)
 *
 * @returns boolean indicating if runes are available
 */
export declare function supportsRunes(): boolean;
/**
 * Installation and usage guide for Svelte 4 & 5
 */
export declare const svelteGuide: {
    installation: string;
    svelte4Setup: string;
    svelte5Setup: string;
    svelteKit2Setup: string;
    migrationGuide: string;
    features: string[];
    compatibility: {
        svelte4: string;
        svelte5: string;
        svelteKit1: string;
        svelteKit2: string;
        migration: string;
        backwards: string;
        ssr: string;
        offline: string;
    };
    svelteKitIntegration: {
        description: string;
        import: string;
        features: string[];
    };
};
