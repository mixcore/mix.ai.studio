/**
 * Test script to verify authentication persistence across page refreshes
 * This can be run in the browser console to test auth persistence
 */

export function testAuthPersistence() {
  console.log('🧪 Testing Authentication Persistence...');
  
  // Check if localStorage has auth tokens
  const tokenKey = 'mix_access_token';
  const refreshTokenKey = 'mix_refresh_token';
  const userKey = `${tokenKey}_user`;
  const expiresKey = `${tokenKey}_expires_at`;
  
  const token = localStorage.getItem(tokenKey);
  const refreshToken = localStorage.getItem(refreshTokenKey);
  const userData = localStorage.getItem(userKey);
  const expiresAt = localStorage.getItem(expiresKey);
  
  console.log('📋 Auth Storage Check:');
  console.log('  Access Token:', token ? '✅ Present' : '❌ Missing');
  console.log('  Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
  console.log('  User Data:', userData ? '✅ Present' : '❌ Missing');
  console.log('  Expires At:', expiresAt ? '✅ Present' : '❌ Missing');
  
  if (token && refreshToken) {
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt);
      const now = Date.now();
      const timeUntilExpiry = expirationTime - now;
      
      console.log('⏰ Token Expiration:');
      console.log('  Current Time:', new Date(now).toISOString());
      console.log('  Expires At:', new Date(expirationTime).toISOString());
      console.log('  Time Until Expiry:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes');
      console.log('  Status:', timeUntilExpiry > 0 ? '✅ Valid' : '❌ Expired');
    }
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('👤 Stored User Data:');
        console.log('  ID:', user.id);
        console.log('  Username:', user.username);
        console.log('  Email:', user.email);
      } catch (error) {
        console.log('❌ Failed to parse user data:', error);
      }
    }
    
    console.log('✅ Auth persistence appears to be working!');
    console.log('💡 Try refreshing the page to see if auth state is restored.');
  } else {
    console.log('❌ No auth tokens found. Please log in first.');
  }
}

// Instructions for manual testing
export const testInstructions = `
🧪 Testing Authentication Persistence

1. Open browser dev tools (F12)
2. Log in using the authentication form
3. Run: testAuthPersistence()
4. Refresh the page (F5 or Ctrl+R)
5. Check if you're still logged in
6. Run testAuthPersistence() again to verify tokens are still there

Expected behavior:
- Auth tokens should persist in localStorage
- User should remain logged in after page refresh
- Auth state should be restored automatically
- Token expiration should be handled gracefully
`;

// Auto-run test if in development mode
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Make test function available globally for manual testing
  (window as any).testAuthPersistence = testAuthPersistence;
  console.log('🧪 Auth persistence test available. Run testAuthPersistence() in console.');
}