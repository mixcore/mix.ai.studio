/**
 * @fileoverview React hooks adapter for the Mixcore SDK
 *
 * This module provides React hooks that integrate seamlessly with the Mixcore SDK,
 * offering reactive state management for authentication, data fetching, and other
 * SDK operations. These hooks follow React best practices and provide automatic
 * re-rendering when SDK state changes.
 *
 * Note: This module requires React as a peer dependency. Import it only in React applications.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
/**
 * Authentication state interface for React hooks
 */
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    token: string | null;
    error: Error | null;
}
/**
 * Data fetching state interface for React hooks
 */
export interface DataState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
/**
 * Hook options for authentication
 */
export interface UseAuthOptions {
    autoRefresh?: boolean;
    onAuthChange?: (isAuthenticated: boolean) => void;
}
/**
 * Hook options for data fetching
 */
export interface UseDataOptions {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchInterval?: number;
}
/**
 * React hook for managing authentication state
 *
 * Provides reactive authentication state management with automatic updates
 * when the user logs in, logs out, or when tokens expire. Integrates seamlessly
 * with the Mixcore SDK authentication module.
 *
 * @param client - MixcoreClient instance
 * @param options - Hook configuration options
 * @returns Authentication state and methods
 *
 * @example
 * ```tsx
 * import { MixcoreClient } from '@mixcore/sdk-client';
 * import { useAuth } from '@mixcore/sdk-client/adapters/react';
 *
 * const client = new MixcoreClient({ ... });
 *
 * function AuthComponent() {
 *   const { isAuthenticated, isLoading, user, login, logout } = useAuth(client);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   if (!isAuthenticated) {
 *     return (
 *       <button onClick={() => login({ email: 'user@example.com', password: 'password' })}>
 *         Login
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.username}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useAuth(client: any, options?: UseAuthOptions): void;
/**
 * React hook for data fetching with the Mixcore SDK
 *
 * Provides reactive data fetching with loading states, error handling,
 * and automatic refetching capabilities. Works with any SDK data operation.
 *
 * @param fetcher - Async function that fetches data using the SDK
 * @param dependencies - Dependencies that trigger refetch when changed
 * @param options - Hook configuration options
 * @returns Data state and refetch function
 *
 * @example
 * ```tsx
 * import { useData } from '@mixcore/sdk-client/adapters/react';
 * import { MixQuery } from '@mixcore/sdk-client';
 *
 * function UserList({ client }) {
 *   const { data: users, isLoading, error, refetch } = useData(
 *     () => client.database.getData('users', new MixQuery().take(10)),
 *     [],
 *     { refetchOnMount: true }
 *   );
 *
 *   if (isLoading) return <div>Loading users...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <button onClick={refetch}>Refresh</button>
 *       <ul>
 *         {users?.items?.map(user => (
 *           <li key={user.id}>{user.name}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useData<T>(fetcher: () => Promise<T>, dependencies?: any[], options?: UseDataOptions): DataState<T>;
/**
 * React hook for managing SDK client configuration
 *
 * Provides reactive client configuration management with the ability
 * to update settings and storage adapters at runtime.
 *
 * @param initialClient - Initial MixcoreClient instance
 * @returns Client and configuration management functions
 *
 * @example
 * ```tsx
 * function App() {
 *   const { client, updateConfig, setStorageAdapter } = useClient(initialClient);
 *
 *   const switchToMemoryStorage = () => {
 *     setStorageAdapter(new MemoryStorageAdapter());
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={switchToMemoryStorage}>Use Memory Storage</button>
 *       <AuthComponent client={client} />
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useClient(initialClient: any): void;
/**
 * Higher-order component for providing Mixcore client context
 *
 * @example
 * ```tsx
 * import { MixcoreProvider, useAuth } from '@mixcore/sdk-client/adapters/react';
 *
 * const client = new MixcoreClient({ ... });
 *
 * function App() {
 *   return (
 *     <MixcoreProvider client={client}>
 *       <AuthComponent />
 *     </MixcoreProvider>
 *   );
 * }
 *
 * function AuthComponent() {
 *   const { isAuthenticated, login } = useAuth();
 *   // ...
 * }
 * ```
 */
export declare function MixcoreProvider({ client, children }: {
    client: any;
    children: any;
}): void;
/**
 * Hook to access the Mixcore client from context
 */
export declare function useMixcoreClient(): void;
/**
 * Installation and usage guide for React
 */
export declare const reactGuide: {
    installation: string;
    setup: string;
    features: string[];
};
