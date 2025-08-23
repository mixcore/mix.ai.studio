// Simple example demonstrating how to use the AuthService

import { authService, userActions } from '$lib/stores';

// Example 1: Login with reactive state
async function loginExample() {
  const result = await authService.login({
    email: 'user@example.com',
    password: 'password123',
    rememberMe: true
  });

  if (result.success) {
    console.log('✅ Login successful!');
  } else {
    console.error('❌ Login failed:', result.error);
  }
}

// Example 2: Register new user
async function registerExample() {
  const result = await authService.register({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securepass',
    confirmPassword: 'securepass'
  });

  if (result.success) {
    console.log('✅ Registration successful!');
  } else {
    console.error('❌ Registration failed:', result.error);
  }
}

// Example 3: Using reactive stores in Svelte components
/*
<script>
  import { authState, authService } from '$lib/stores';
  
  // Reactive auth state
  $: ({ isAuthenticated, isLoading, user, error } = $authState);
  
  async function handleLogin() {
    await authService.login({ email, password });
  }
</script>

{#if isAuthenticated}
  <p>Welcome, {user.email}!</p>
  <button on:click={() => authService.logout()}>Logout</button>
{:else}
  <form on:submit|preventDefault={handleLogin}>
    <input bind:value={email} type="email" placeholder="Email" />
    <input bind:value={password} type="password" placeholder="Password" />
    <button type="submit" disabled={isLoading}>
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
  </form>
{/if}

{#if error}
  <div class="alert alert-error">{error}</div>
{/if}
*/

// Example 4: Password reset
async function resetPasswordExample() {
  const result = await authService.resetPassword('user@example.com');
  
  if (result.success) {
    console.log('✅ Reset email sent!');
  } else {
    console.error('❌ Reset failed:', result.error);
  }
}

// Example 5: Manual token refresh
async function refreshTokenExample() {
  const success = await authService.refreshToken();
  
  if (success) {
    console.log('✅ Token refreshed successfully');
  } else {
    console.log('❌ Token refresh failed - user logged out');
  }
}

// Example 6: Checking auth state
function checkAuthState() {
  console.log('Current user:', authService.currentUser);
  console.log('Is authenticated:', authService.authenticated);
}

// Example 7: Logout with redirect
async function logoutWithRedirect() {
  await authService.logout('/login');
}

// Example 8: Initialize authentication on app start
async function initializeAuth() {
  const restored = await authService.initializeFromStorage();
  
  if (restored) {
    console.log('✅ Authentication state restored');
  } else {
    console.log('ℹ️ No previous authentication found');
  }
}

export {
  loginExample,
  registerExample,
  resetPasswordExample,
  refreshTokenExample,
  checkAuthState,
  logoutWithRedirect,
  initializeAuth
};
