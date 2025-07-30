/**
 * @fileoverview Angular services adapter for the Mixcore SDK
 *
 * This module provides Angular services that integrate seamlessly with the Mixcore SDK,
 * offering reactive state management using RxJS observables for authentication, data
 * fetching, and other SDK operations. These services follow Angular best practices
 * and support dependency injection.
 *
 * Note: This module requires Angular as a peer dependency. Import it only in Angular applications.
 *
 * @author Mixcore Team
 * @version 0.0.2-dev.36+
 */
/**
 * Authentication state interface for Angular services
 */
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    token: string | null;
    error: Error | null;
}
/**
 * Data fetching state interface for Angular services
 */
export interface DataState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}
/**
 * Service options for authentication
 */
export interface AuthServiceOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}
/**
 * Service options for data operations
 */
export interface DataServiceOptions {
    cacheTime?: number;
    retryCount?: number;
    retryDelay?: number;
}
/**
 * Angular service for managing authentication state
 *
 * Provides reactive authentication state management using RxJS observables
 * with automatic updates when the user logs in, logs out, or when tokens expire.
 * Integrates seamlessly with Angular's dependency injection system.
 *
 * @example
 * ```typescript
 * import { Component, OnInit } from '@angular/core';
 * import { MixcoreAuthService } from '@mixcore/sdk-client/adapters/angular';
 *
 * @Component({
 *   selector: 'app-auth',
 *   template: `
 *     <div *ngIf="authService.isLoading$ | async">Loading...</div>
 *     <div *ngIf="!(authService.isAuthenticated$ | async)">
 *       <button (click)="login()">Login</button>
 *     </div>
 *     <div *ngIf="authService.isAuthenticated$ | async">
 *       <p>Welcome, {{ (authService.user$ | async)?.username }}!</p>
 *       <button (click)="logout()">Logout</button>
 *     </div>
 *   `
 * })
 * export class AuthComponent implements OnInit {
 *   constructor(public authService: MixcoreAuthService) {}
 *
 *   async login() {
 *     await this.authService.login({ email: 'user@example.com', password: 'password' });
 *   }
 *
 *   logout() {
 *     this.authService.logout();
 *   }
 * }
 * ```
 */
export declare class MixcoreAuthService {
    constructor();
}
/**
 * Angular service for data operations with the Mixcore SDK
 *
 * Provides reactive data fetching with caching, error handling, and retry logic
 * using RxJS observables. Works with all SDK data operations.
 *
 * @example
 * ```typescript
 * import { Component, OnInit } from '@angular/core';
 * import { MixcoreDataService } from '@mixcore/sdk-client/adapters/angular';
 * import { MixQuery } from '@mixcore/sdk-client';
 *
 * @Component({
 *   selector: 'app-users',
 *   template: `
 *     <button (click)="loadUsers()">Refresh</button>
 *     <div *ngIf="users$ | async as users">
 *       <ul>
 *         <li *ngFor="let user of users.items">{{ user.name }}</li>
 *       </ul>
 *     </div>
 *   `
 * })
 * export class UsersComponent implements OnInit {
 *   users$ = this.dataService.getData(
 *     'users',
 *     () => this.client.database.getData('users', new MixQuery().take(10))
 *   );
 *
 *   constructor(
 *     private dataService: MixcoreDataService,
 *     private client: any
 *   ) {}
 *
 *   loadUsers() {
 *     this.dataService.invalidateCache('users');
 *     this.users$ = this.dataService.getData('users',
 *       () => this.client.database.getData('users', new MixQuery().take(10))
 *     );
 *   }
 * }
 * ```
 */
export declare class MixcoreDataService {
    constructor();
}
/**
 * Angular module for Mixcore SDK integration
 *
 * @example
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { MixcoreModule } from '@mixcore/sdk-client/adapters/angular';
 * import { MixcoreClient } from '@mixcore/sdk-client';
 *
 * const client = new MixcoreClient({ ... });
 *
 * @NgModule({
 *   imports: [
 *     MixcoreModule.forRoot(client, {
 *       auth: { autoRefresh: true },
 *       data: { cacheTime: 600000 }
 *     })
 *   ],
 *   // ...
 * })
 * export class AppModule {}
 * ```
 */
export declare class MixcoreModule {
    static forRoot(client: any, options?: {
        auth?: AuthServiceOptions;
        data?: DataServiceOptions;
    }): void;
}
/**
 * Utility function to create Angular providers for the Mixcore SDK
 *
 * @param client - MixcoreClient instance
 * @param options - Configuration options
 * @returns Array of Angular providers
 */
export declare function provideMixcore(client: any, options?: {
    auth?: AuthServiceOptions;
    data?: DataServiceOptions;
}): void;
/**
 * Installation and usage guide for Angular
 */
export declare const angularGuide: {
    installation: string;
    setup: string;
    features: string[];
};
