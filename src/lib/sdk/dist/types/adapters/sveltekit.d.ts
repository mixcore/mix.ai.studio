/**
 * @fileoverview SvelteKit 2 adapter for the Mixcore SDK
 *
 * This module provides SvelteKit-specific integration for the Mixcore SDK,
 * offering server-side rendering support, load function helpers, and
 * seamless integration with SvelteKit's stores and routing system.
 *
 * Features:
 * - SSR-safe client initialization
 * - Load function helpers for server and client-side data fetching
 * - Integration with SvelteKit stores ($page, $navigating, etc.)
 * - Environment variable integration
 * - Hydration-safe state management
 * - SvelteKit 2 app directory structure support
 *
 * Compatible with:
 * - SvelteKit 2.x
 * - Svelte 5 with runes
 * - Server-side rendering
 * - Client-side hydration
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
/**
 * SvelteKit client configuration
 */
export interface SvelteKitConfig {
    endpoint: string;
    tokenKey?: string;
    refreshTokenKey?: string;
    enableSSR?: boolean;
    enableHydration?: boolean;
    enableServiceWorker?: boolean;
}
/**
 * Server load context for Mixcore operations
 */
export interface ServerLoadContext {
    client: any;
    cookies: any;
    url: URL;
    request: Request;
}
/**
 * Client load context for Mixcore operations
 */
export interface ClientLoadContext {
    client: any;
    url: URL;
    route: any;
}
/**
 * Load function result with Mixcore data
 */
export interface MixcoreLoadResult {
    props?: Record<string, any>;
    cache?: {
        maxage?: number;
        private?: boolean;
    };
    status?: number;
    error?: Error;
}
/**
 * SvelteKit-specific authentication state
 */
export interface SvelteKitAuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    token: string | null;
    error: Error | null;
    isSSR: boolean;
    isHydrated: boolean;
}
/**
 * Create a SSR-safe Mixcore client for SvelteKit
 *
 * This function creates a Mixcore client that works correctly in both
 * server-side rendering and client-side environments. It automatically
 * detects the environment and configures appropriate storage adapters.
 *
 * @param config - SvelteKit configuration options
 * @returns SSR-safe Mixcore client
 *
 * @example
 * ```typescript
 * // lib/mixcore.ts
 * import { createSvelteKitClient } from '@mixcore/sdk-client/adapters/sveltekit';
 * import { PUBLIC_MIXCORE_ENDPOINT } from '$env/static/public';
 *
 * export const client = createSvelteKitClient({
 *   endpoint: PUBLIC_MIXCORE_ENDPOINT,
 *   enableSSR: true,
 *   enableHydration: true
 * });
 * ```
 */
export declare function createSvelteKitClient(config: SvelteKitConfig): void;
/**
 * Server load function helper for Mixcore data fetching
 *
 * Provides a helper for fetching data in SvelteKit server load functions
 * with proper error handling and caching support.
 *
 * @param fetcher - Async function that fetches data using the SDK
 * @param options - Load options including caching and error handling
 * @returns Load function result
 *
 * @example
 * ```typescript
 * // src/routes/users/+page.server.ts
 * import type { PageServerLoad } from './$types';
 * import { loadMixcoreData } from '@mixcore/sdk-client/adapters/sveltekit';
 * import { client } from '$lib/mixcore';
 * import { MixQuery } from '@mixcore/sdk-client';
 *
 * export const load: PageServerLoad = async ({ cookies, url, request }) => {
 *   return loadMixcoreData(
 *     async (context) => {
 *       // Server-side data fetching
 *       const users = await context.client.database.getData(
 *         'users',
 *         new MixQuery().take(10)
 *       );
 *       return { users };
 *     },
 *     {
 *       client,
 *       cookies,
 *       url,
 *       request,
 *       cache: { maxage: 300 }
 *     }
 *   );
 * };
 * ```
 */
export declare function loadMixcoreData<T>(fetcher: (context: ServerLoadContext) => Promise<T>, options: {
    client: any;
    cookies: any;
    url: URL;
    request: Request;
    cache?: {
        maxage?: number;
        private?: boolean;
    };
    errorStatus?: number;
}): Promise<MixcoreLoadResult>;
/**
 * Client load function helper for Mixcore data fetching
 *
 * Provides a helper for client-side data fetching in SvelteKit load functions
 * with hydration support and client-side caching.
 *
 * @param fetcher - Async function that fetches data using the SDK
 * @param options - Client load options
 * @returns Load function result
 *
 * @example
 * ```typescript
 * // src/routes/dashboard/+page.ts
 * import type { PageLoad } from './$types';
 * import { loadMixcoreClientData } from '@mixcore/sdk-client/adapters/sveltekit';
 * import { client } from '$lib/mixcore';
 * import { MixQuery } from '@mixcore/sdk-client';
 *
 * export const load: PageLoad = async ({ url, route, data }) => {
 *   return loadMixcoreClientData(
 *     async (context) => {
 *       // Client-side data fetching
 *       const stats = await context.client.database.getData(
 *         'dashboard_stats',
 *         new MixQuery().take(1)
 *       );
 *       return { stats, serverData: data };
 *     },
 *     {
 *       client,
 *       url,
 *       route
 *     }
 *   );
 * };
 * ```
 */
export declare function loadMixcoreClientData<T>(fetcher: (context: ClientLoadContext) => Promise<T>, options: {
    client: any;
    url: URL;
    route: any;
}): Promise<MixcoreLoadResult>;
/**
 * Create SvelteKit-aware authentication store
 *
 * Provides authentication state management that works correctly with
 * SvelteKit's SSR and hydration lifecycle.
 *
 * @param client - Mixcore client instance
 * @param options - SvelteKit authentication options
 * @returns SvelteKit authentication store
 *
 * @example
 * ```typescript
 * // lib/auth.ts
 * import { createSvelteKitAuth } from '@mixcore/sdk-client/adapters/sveltekit';
 * import { client } from '$lib/mixcore';
 *
 * export const auth = createSvelteKitAuth(client, {
 *   enableSSR: true,
 *   enableHydration: true,
 *   cookieOptions: {
 *     httpOnly: true,
 *     secure: true,
 *     sameSite: 'strict'
 *   }
 * });
 * ```
 */
export declare function createSvelteKitAuth(client: any, options?: {
    enableSSR?: boolean;
    enableHydration?: boolean;
    cookieOptions?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    };
}): void;
/**
 * SvelteKit page store integration
 *
 * Integrates Mixcore data with SvelteKit's page store for reactive
 * URL-based data fetching and navigation-aware updates.
 *
 * @param client - Mixcore client instance
 * @param fetcher - Data fetching function based on page data
 * @returns Reactive store tied to page navigation
 *
 * @example
 * ```svelte
 * <!-- src/routes/posts/[slug]/+page.svelte -->
 * <script>
 *   import { page } from '$app/stores';
 *   import { createPageData } from '@mixcore/sdk-client/adapters/sveltekit';
 *   import { client } from '$lib/mixcore';
 *   import { MixQuery } from '@mixcore/sdk-client';
 *
 *   const postData = createPageData(client, ($page) => {
 *     return client.database.getData('posts',
 *       new MixQuery().where('slug', $page.params.slug)
 *     );
 *   });
 * </script>
 *
 * {#if $postData.isLoading}
 *   <div>Loading post...</div>
 * {:else if $postData.data}
 *   <h1>{$postData.data.items[0]?.title}</h1>
 *   <div>{$postData.data.items[0]?.content}</div>
 * {/if}
 * ```
 */
export declare function createPageData<T>(client: any, fetcher: (page: any) => Promise<T>): void;
/**
 * SvelteKit form action helper
 *
 * Provides helpers for handling form submissions with Mixcore operations
 * in SvelteKit's enhanced form actions.
 *
 * @param client - Mixcore client instance
 * @param handler - Form action handler
 * @returns SvelteKit action result
 *
 * @example
 * ```typescript
 * // src/routes/login/+page.server.ts
 * import type { Actions } from './$types';
 * import { createMixcoreAction } from '@mixcore/sdk-client/adapters/sveltekit';
 * import { client } from '$lib/mixcore';
 * import { redirect } from '@sveltejs/kit';
 *
 * export const actions: Actions = {
 *   login: createMixcoreAction(client, async ({ request, cookies }) => {
 *     const formData = await request.formData();
 *     const email = formData.get('email') as string;
 *     const password = formData.get('password') as string;
 *
 *     try {
 *       await client.auth.login({ email, password });
 *       // Set authentication cookie
 *       cookies.set('auth_token', client.auth.getToken(), {
 *         httpOnly: true,
 *         secure: true,
 *         sameSite: 'strict',
 *         maxAge: 60 * 60 * 24 * 7 // 1 week
 *       });
 *       throw redirect(302, '/dashboard');
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: error.message
 *       };
 *     }
 *   })
 * };
 * ```
 */
export declare function createMixcoreAction(client: any, handler: (event: any) => Promise<any>): void;
/**
 * Service worker integration for offline support
 *
 * Provides service worker integration for offline data caching
 * and background sync with Mixcore APIs.
 *
 * @param client - Mixcore client instance
 * @param options - Service worker options
 * @returns Service worker registration helper
 *
 * @example
 * ```typescript
 * // src/service-worker.ts
 * import { createMixcoreServiceWorker } from '@mixcore/sdk-client/adapters/sveltekit';
 * import { client } from '$lib/mixcore';
 *
 * createMixcoreServiceWorker(client, {
 *   enableOfflineCache: true,
 *   enableBackgroundSync: true,
 *   cacheStrategy: 'cache-first',
 *   maxCacheAge: 60 * 60 * 24 // 24 hours
 * });
 * ```
 */
export declare function createMixcoreServiceWorker(client: any, options?: {
    enableOfflineCache?: boolean;
    enableBackgroundSync?: boolean;
    cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    maxCacheAge?: number;
}): void;
/**
 * Environment-aware client factory
 *
 * Creates a Mixcore client that automatically adapts to different
 * SvelteKit environments (development, preview, production).
 *
 * @param configs - Environment-specific configurations
 * @returns Environment-aware client
 *
 * @example
 * ```typescript
 * // lib/mixcore.ts
 * import { createEnvironmentClient } from '@mixcore/sdk-client/adapters/sveltekit';
 * import {
 *   PUBLIC_MIXCORE_ENDPOINT_DEV,
 *   PUBLIC_MIXCORE_ENDPOINT_PROD
 * } from '$env/static/public';
 * import { dev } from '$app/environment';
 *
 * export const client = createEnvironmentClient({
 *   development: {
 *     endpoint: PUBLIC_MIXCORE_ENDPOINT_DEV,
 *     tokenKey: 'dev_token',
 *     enableDebugging: true
 *   },
 *   production: {
 *     endpoint: PUBLIC_MIXCORE_ENDPOINT_PROD,
 *     tokenKey: 'prod_token',
 *     enableDebugging: false
 *   }
 * });
 * ```
 */
export declare function createEnvironmentClient(configs: {
    development?: SvelteKitConfig;
    preview?: SvelteKitConfig;
    production?: SvelteKitConfig;
}): void;
/**
 * SvelteKit 2 feature compatibility checker
 *
 * Checks if the current SvelteKit installation supports the features
 * used by this adapter.
 *
 * @returns Compatibility information
 */
export declare function checkSvelteKitCompatibility(): {
    isCompatible: boolean;
    version: string;
    features: {
        enhancedRouting: boolean;
        improvedSSR: boolean;
        serviceWorkers: boolean;
        formActions: boolean;
    };
};
/**
 * SvelteKit installation and setup guide
 */
export declare const svelteKitGuide: {
    installation: string;
    svelteKit2Setup: string;
    features: string[];
    compatibility: {
        svelteKit1: string;
        svelteKit2: string;
        svelte4: string;
        svelte5: string;
        nodejs: string;
        browser: string;
        serviceWorker: string;
    };
    examples: {
        basicSetup: string;
        ssr: string;
        spa: string;
        hybrid: string;
        offline: string;
        forms: string;
        realtime: string;
    };
};
