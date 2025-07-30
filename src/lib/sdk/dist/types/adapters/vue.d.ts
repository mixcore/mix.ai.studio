/**
 * @fileoverview Vue composables adapter for the Mixcore SDK
 *
 * This module provides Vue 3 composables that integrate seamlessly with the Mixcore SDK,
 * offering reactive state management for authentication, data fetching, and other
 * SDK operations. These composables follow Vue 3 Composition API best practices.
 *
 * Note: This module requires Vue 3 as a peer dependency. Import it only in Vue applications.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
/**
 * Authentication state interface for Vue composables
 */
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    token: string | null;
    error: Error | null;
}
/**
 * Data fetching state interface for Vue composables
 */
export interface DataState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}
/**
 * Composable options for authentication
 */
export interface UseAuthOptions {
    autoRefresh?: boolean;
    immediate?: boolean;
    onAuthChange?: (isAuthenticated: boolean) => void;
}
/**
 * Composable options for data fetching
 */
export interface UseDataOptions {
    enabled?: boolean;
    immediate?: boolean;
    refetchInterval?: number;
    deep?: boolean;
}
/**
 * Vue composable for managing authentication state
 *
 * Provides reactive authentication state management with automatic updates
 * when the user logs in, logs out, or when tokens expire. Integrates seamlessly
 * with the Mixcore SDK authentication module.
 *
 * @param client - MixcoreClient instance
 * @param options - Composable configuration options
 * @returns Reactive authentication state and methods
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <div v-if="isLoading">Loading...</div>
 *     <div v-else-if="!isAuthenticated">
 *       <button @click="handleLogin">Login</button>
 *     </div>
 *     <div v-else>
 *       <p>Welcome, {{ user?.username }}!</p>
 *       <button @click="logout">Logout</button>
 *     </div>
 *   </div>
 * </template>
 *
 * <script setup>
 * import { MixcoreClient } from '@mixcore/sdk-client';
 * import { useAuth } from '@mixcore/sdk-client/adapters/vue';
 *
 * const client = new MixcoreClient({ ... });
 * const { isAuthenticated, isLoading, user, login, logout } = useAuth(client);
 *
 * const handleLogin = async () => {
 *   await login({ email: 'user@example.com', password: 'password' });
 * };
 * </script>
 * ```
 */
export declare function useAuth(client: any, options?: UseAuthOptions): void;
/**
 * Vue composable for data fetching with the Mixcore SDK
 *
 * Provides reactive data fetching with loading states, error handling,
 * and automatic refetching capabilities. Works with any SDK data operation.
 *
 * @param fetcher - Async function that fetches data using the SDK
 * @param options - Composable configuration options
 * @returns Reactive data state and methods
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="refetch" :disabled="isLoading">Refresh</button>
 *     <div v-if="isLoading">Loading users...</div>
 *     <div v-else-if="error">Error: {{ error.message }}</div>
 *     <ul v-else-if="data">
 *       <li v-for="user in data.items" :key="user.id">
 *         {{ user.name }}
 *       </li>
 *     </ul>
 *   </div>
 * </template>
 *
 * <script setup>
 * import { useData } from '@mixcore/sdk-client/adapters/vue';
 * import { MixQuery } from '@mixcore/sdk-client';
 *
 * const { data, isLoading, error, refetch } = useData(
 *   () => client.database.getData('users', new MixQuery().take(10))
 * );
 * </script>
 * ```
 */
export declare function useData<T>(fetcher: () => Promise<T>, options?: UseDataOptions): void;
/**
 * Vue composable for managing SDK client configuration
 *
 * Provides reactive client configuration management with the ability
 * to update settings and storage adapters at runtime.
 *
 * @param initialClient - Initial MixcoreClient instance
 * @returns Client and configuration management functions
 *
 * @example
 * ```vue
 * <script setup>
 * import { useClient, MemoryStorageAdapter } from '@mixcore/sdk-client/adapters/vue';
 *
 * const { client, updateConfig, setStorageAdapter } = useClient(initialClient);
 *
 * const switchToMemoryStorage = () => {
 *   setStorageAdapter(new MemoryStorageAdapter());
 * };
 * </script>
 * ```
 */
export declare function useClient(initialClient: any): void;
/**
 * Vue composable for query building
 *
 * Provides reactive query building with the MixQuery class.
 *
 * @example
 * ```vue
 * <script setup>
 * import { useQuery } from '@mixcore/sdk-client/adapters/vue';
 *
 * const { query, where, orderBy, take, reset } = useQuery();
 *
 * // Build query reactively
 * where('status', 'active');
 * orderBy('createdDate', 'desc');
 * take(10);
 *
 * // Use query in data fetching
 * const { data } = useData(() => client.database.getData('users', query.value));
 * </script>
 * ```
 */
export declare function useQuery(): void;
/**
 * Vue plugin for global Mixcore client injection
 *
 * @example
 * ```ts
 * import { createApp } from 'vue';
 * import { MixcorePlugin } from '@mixcore/sdk-client/adapters/vue';
 * import { MixcoreClient } from '@mixcore/sdk-client';
 *
 * const client = new MixcoreClient({ ... });
 * const app = createApp(App);
 *
 * app.use(MixcorePlugin, { client });
 * app.mount('#app');
 * ```
 */
export declare const MixcorePlugin: {
    install(): never;
};
/**
 * Composable to inject the global Mixcore client
 */
export declare function useMixcoreClient(): void;
/**
 * Installation and usage guide for Vue 3
 */
export declare const vueGuide: {
    installation: string;
    setup: string;
    features: string[];
};
