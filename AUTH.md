# AuthService Documentation

The `AuthService` is a comprehensive authentication service for the Mix AI Studio application, built with SvelteKit and TypeScript. It provides secure user authentication, automatic token refresh, and reactive state management.

## Features

- ✅ **User Authentication**: Login, registration, and logout
- ✅ **Automatic Token Refresh**: Handles token expiry and refresh automatically
- ✅ **Reactive State Management**: Uses Svelte stores for real-time UI updates
- ✅ **Error Handling**: Comprehensive error handling with user-friendly messages
- ✅ **Password Reset**: Forgot password functionality
- ✅ **TypeScript Support**: Fully typed for better development experience
- ✅ **SSR Safe**: Works with server-side rendering

## How Automatic Token Refresh Works

- All authentication is managed through the `AuthService` instance
- Tokens are automatically monitored for expiry (checks every 5 minutes)
- If a token expires within 10 minutes, it's automatically refreshed
- If refresh fails, the user is securely logged out
- UI shows real-time indicators for token status and refresh progress

## Quick Start

### Import the AuthService

```typescript
import { authService, userActions, authState } from '$lib/stores';
```

### Basic Usage in Svelte Components

```svelte
<script lang="ts">
  import { authService, authState } from '$lib/stores';
  
  // Reactive authentication state
  $: ({ isAuthenticated, isLoading, user, error } = $authState);
  
  async function handleLogin() {
    const result = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.success) {
      console.log('Login successful!');
    } else {
      console.error('Login failed:', result.error);
    }
  }
</script>

{#if isAuthenticated}
  <p>Welcome, {user?.email}!</p>
  <button on:click={() => authService.logout()}>Logout</button>
{:else}
  <button on:click={handleLogin}>Login</button>
{/if}
```

## API Reference

### AuthService Methods

#### `login(credentials: LoginRequest)`
Authenticate a user with email and password.

```typescript
const result = await authService.login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true // optional
});
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

#### `register(data: RegisterRequest)`
Register a new user account.

```typescript
const result = await authService.register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  confirmPassword: 'password123'
});
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

#### `logout(redirectTo?: string)`
Log out the current user and optionally redirect.

```typescript
await authService.logout('/login'); // Optional redirect
```

**Returns**: `Promise<void>`

#### `refreshToken()`
Manually refresh the authentication token.

```typescript
const success = await authService.refreshToken();
```

**Returns**: `Promise<boolean>`

#### `resetPassword(email: string)`
Send a password reset email.

```typescript
const result = await authService.resetPassword('user@example.com');
```

**Returns**: `Promise<{ success: boolean; error?: string }>`

### Reactive Stores

#### `authState`
Complete authentication state in a single store.

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiry: Date | null;
  isRefreshing: boolean;
  isTokenExpiring: boolean;
}
```

#### Individual Stores
For more granular access:

- `user` - Current user information
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state for auth operations
- `authError` - Current error message
- `tokenExpiry` - Token expiration date
- `isRefreshing` - Token refresh in progress
- `isTokenExpiring` - Token expires soon (within 10 minutes)

## Example Usage

See `example-auth-usage.svelte` for a complete working example that demonstrates:

- Login and registration forms
- Password reset functionality
- Authentication status display
- Automatic token refresh monitoring
- Error handling and loading states

## Security Features

- Secure token storage in localStorage (browser-only, SSR-safe)
- Automatic token refresh before expiry
- Proper cleanup on logout
- CSRF protection via token-based authentication
- Error handling that doesn't leak sensitive information
- SSR-compatible initialization (no localStorage errors during server-side rendering)

If the refresh fails, ensure the user is logged out and all tokens are cleared from storage.

## BaseRestService Integration

The AuthService is designed to work seamlessly with the BaseRestService for automatic API authentication. See [BASE-REST-SERVICE.md](./BASE-REST-SERVICE.md) for detailed documentation.

Quick example:

```typescript
import { BaseRestService } from './base-rest-service';
import { authService } from '../stores';

class UserService extends BaseRestService<User> {
  constructor() {
    super('users', authService); // Automatic token refresh!
  }
}

export const userService = new UserService();
```

## SSR Considerations

The authentication system is designed to work seamlessly with SvelteKit's server-side rendering:

- **localStorage Access**: All localStorage operations are wrapped with browser checks to prevent SSR errors
- **Initialization**: The auth service gracefully handles initialization on both server and client
- **Hydration**: Authentication state is restored from localStorage after the page loads in the browser

### Browser-Only Operations

The following operations only work in the browser and are safely skipped during SSR:
- Token storage and retrieval
- Automatic token refresh monitoring
- localStorage cleanup on logout

### Storage Utilities

For consistent SSR-safe localStorage access, use the provided storage utilities:

```typescript
import { getStorageItem, setStorageItem, isStorageAvailable } from '$lib/utils/storage';

// Safe localStorage access
const token = getStorageItem('my-token');
setStorageItem('my-data', 'value');

// Check if storage is available
if (isStorageAvailable()) {
  // Safe to use localStorage directly
}
```

## Example Usage in Svelte

See `example-auth-usage.svelte` for a full example of how to use the stores and trigger manual refreshes.

---

**Security Note:** Never expose refresh tokens to the client in public apps. Always use secure storage and HTTPS.
