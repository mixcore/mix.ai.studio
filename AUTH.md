# Authentication & Automatic Token Refresh

This project uses a robust authentication system with support for automatic access token refresh using refresh tokens. Below are the steps and best practices to ensure your API calls are resilient to token expiry (401 errors) and refresh tokens are handled securely.

## How Automatic Token Refresh Works

- All API calls are made through an `ApiService` instance.
- If an API call returns a 401 (Unauthorized), the `ApiService` will automatically attempt to refresh the access token using a refresh token.
- If the refresh is successful, the original API call is retried with the new access token.
- If the refresh fails, the user is logged out.

## Required Setup

### 1. Implement a Refresh Token Function

Your `mixcoreService` (or equivalent) should expose a method to refresh the access token using the stored refresh token. Example:

```ts
async refreshAuthToken(): Promise<boolean> {
  // ...get refresh token from storage
  // ...call AuthService.refreshToken(refreshToken, accessToken)
  // ...update tokens in storage
  // ...return true if successful, false otherwise
}
```

### 2. Pass `onRefreshToken` to ApiService

When you create your `ApiService` instance, provide an `onRefreshToken` callback that:
- Calls your refresh logic (e.g., `mixcoreService.refreshAuthToken()`)
- Returns the new access token string if successful, or `null` if not

Example:

```ts
import { ApiService } from '@mixcore/api';
import { mixcoreService } from '...'; // your service

const apiService = new ApiService({
  apiBaseUrl: 'https://your-api-url',
  apiKey: localStorage.getItem('mixcore_access_token'),
  async onRefreshToken() {
    const refreshed = await mixcoreService.refreshAuthToken();
    if (refreshed) {
      return localStorage.getItem('mixcore_access_token');
    }
    return null;
  }
});
```

### 3. ApiService Will Handle 401s Automatically

No need to manually catch 401s in your app code. The `ApiService` will:
- Detect a 401 response
- Call `onRefreshToken`
- Retry the original request with the new token

### 4. Update Token Storage

After a successful refresh, always update both the access and refresh tokens in localStorage (or your preferred storage).

### 5. Logging Out

If the refresh fails, ensure the user is logged out and all tokens are cleared from storage.

## Example Usage in Svelte

See `example-auth-usage.svelte` for a full example of how to use the stores and trigger manual refreshes.

---

**Security Note:** Never expose refresh tokens to the client in public apps. Always use secure storage and HTTPS.
