/**
 * @fileoverview Framework adapters for the Mixcore SDK
 *
 * This module exports framework-specific adapters that provide seamless integration
 * with popular frontend frameworks like React, Vue, Angular, and Svelte. Each adapter
 * follows the framework's best practices and provides reactive state management.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
export * from '../helpers/storage-adapter';
/**
 * React hooks and components for Mixcore SDK integration
 *
 * @example
 * ```ts
 * import { useAuth, useData, MixcoreProvider } from '@mixcore/sdk-client/adapters/react';
 * ```
 */
export * from './react';
/**
 * Vue 3 composables for Mixcore SDK integration
 *
 * @example
 * ```ts
 * import { useAuth, useData, MixcorePlugin } from '@mixcore/sdk-client/adapters/vue';
 * ```
 */
export * from './vue';
/**
 * Angular services and modules for Mixcore SDK integration
 *
 * @example
 * ```ts
 * import { MixcoreAuthService, MixcoreDataService, MixcoreModule } from '@mixcore/sdk-client/adapters/angular';
 * ```
 */
export * from './angular';
/**
 * Svelte stores for Mixcore SDK integration
 *
 * @example
 * ```ts
 * import { createAuthStore, createDataStore, mixcoreClient } from '@mixcore/sdk-client/adapters/svelte';
 * ```
 */
export * from './svelte';
/**
 * SvelteKit integration for Mixcore SDK with SSR support
 *
 * @example
 * ```ts
 * import { createSvelteKitClient, loadMixcoreData } from '@mixcore/sdk-client/adapters/sveltekit';
 * ```
 */
/**
 * Framework detection utilities
 */
export declare const detectFramework: () => string | null;
/**
 * Get recommended storage adapter for the current environment
 */
export declare const getRecommendedStorageAdapter: () => any;
/**
 * Framework-specific recommendations and setup guides
 */
export declare const getFrameworkGuide: (framework: string) => {
    installation: string;
    setup: string;
    features: string[];
} | {
    installation: string;
    setup: string;
    features: string[];
} | {
    installation: string;
    setup: string;
    features: string[];
} | {
    installation: string;
    setup: string;
    features: string[];
} | {
    installation: string;
    setup: string;
    features: string[];
};
