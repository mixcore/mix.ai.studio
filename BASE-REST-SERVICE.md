# BaseRestService Documentation

The `BaseRestService` is a generic base class for creating RESTful API services in the Mix AI Studio application. It provides automatic token refresh, request queuing, and seamless integration with the AuthService.

## Features

- ✅ **Automatic Token Refresh**: Handles 401 errors and refreshes tokens automatically
- ✅ **Request Queuing**: Queues failed requests during token refresh and retries them
- ✅ **AuthService Integration**: Seamlessly integrates with the AuthService for authentication
- ✅ **Generic CRUD Operations**: Provides standard Create, Read, Update, Delete methods
- ✅ **Bearer Token Injection**: Automatically adds Bearer tokens to all requests
- ✅ **TypeScript Support**: Fully typed for better development experience
- ✅ **MixcoreClient Integration**: Includes MixcoreClient for advanced operations

## Basic Usage

### Extending BaseRestService

```typescript
import { BaseRestService } from './base-rest-service';
import { authService } from '../stores';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

class UserService extends BaseRestService<User> {
  constructor() {
    super('users', authService); // 'users' is the API endpoint
  }

  // Add custom methods specific to users
  async getCurrentUser(): Promise<User> {
    return this.getSingle('me');
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.update('me', profileData);
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.getList({ search: query });
  }
}

export const userService = new UserService();
```

### Using the Factory Function

```typescript
import { createRestService } from './base-rest-service';
import { authService } from '../stores';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Create a service instance using the factory function
export const productService = createRestService<Product>('products', authService);

// Usage
async function examples() {
  // Get all products
  const products = await productService.getList();
  
  // Get products with filtering
  const electronics = await productService.getList({ category: 'electronics' });
  
  // Get a single product
  const product = await productService.getSingle(123);
  
  // Create a new product
  const newProduct = await productService.create({
    name: 'New Product',
    price: 99.99,
    category: 'electronics'
  });
  
  // Update a product
  const updated = await productService.update(123, { price: 89.99 });
  
  // Delete a product
  await productService.delete(123);
}
```

## API Reference

### Constructor

```typescript
constructor(modelName: string, authService?: AuthService)
```

- `modelName`: The API endpoint name (e.g., 'users', 'products')
- `authService`: Optional AuthService instance for automatic token refresh

### Built-in Methods

#### `getList(queryParams?: Record<string, any>): Promise<T[]>`
Fetches a list of resources with optional query parameters.

```typescript
const users = await userService.getList();
const filteredUsers = await userService.getList({ role: 'admin', active: true });
```

#### `getSingle(id: string | number, queryParams?: Record<string, any>): Promise<T>`
Fetches a single resource by ID.

```typescript
const user = await userService.getSingle(123);
const userWithDetails = await userService.getSingle(123, { include: 'profile' });
```

#### `create(objData: T): Promise<T>`
Creates a new resource.

```typescript
const newUser = await userService.create({
  email: 'john@example.com',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe'
});
```

#### `update(id: string | number, objData: Partial<T>): Promise<T>`
Updates an existing resource.

```typescript
const updatedUser = await userService.update(123, {
  firstName: 'Jane',
  lastName: 'Smith'
});
```

#### `delete(id: string | number): Promise<void>`
Deletes a resource.

```typescript
await userService.delete(123);
```

### Advanced Methods

#### `setAuthService(authService: AuthService): void`
Sets or updates the AuthService for an existing service instance.

```typescript
const service = createRestService<Product>('products');
service.setAuthService(authService); // Add auth service later
```

#### `getMixcoreClient(): MixcoreClient`
Returns the MixcoreClient instance for advanced operations.

```typescript
const client = userService.getMixcoreClient();
// Use client for advanced MixCore operations
```

#### `getRestApiResult(req: RequestInit & { url: string }): Promise<any>`
Makes a custom API request with automatic token handling.

```typescript
class UserService extends BaseRestService<User> {
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return this.getRestApiResult({
      url: `${this.endpoint}/change-password`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }
}
```

## Token Refresh Mechanism

The BaseRestService automatically handles token refresh when a 401 Unauthorized error occurs:

1. **Detection**: When a request returns 401, the service detects token expiry
2. **Queuing**: If a refresh is already in progress, new requests are queued
3. **Refresh**: Uses AuthService (if available) or falls back to direct API call
4. **Retry**: After successful refresh, retries the original request and all queued requests
5. **Failure Handling**: If refresh fails, logs out the user and rejects all requests

```typescript
// This happens automatically - no code needed
try {
  const data = await userService.getList();
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // User has been logged out due to refresh failure
    // Redirect to login page
  }
}
```

## Error Handling

The service provides structured error handling:

```typescript
try {
  const user = await userService.getSingle(123);
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // Token refresh failed - user needs to log in
    console.log('Please log in again');
  } else if (error.message.includes('HTTP 404')) {
    // Resource not found
    console.log('User not found');
  } else if (error.message.includes('HTTP 403')) {
    // Forbidden - user doesn't have permission
    console.log('Access denied');
  } else {
    // Other errors
    console.error('API Error:', error.message);
  }
}
```

## Configuration

### Base URL Configuration

The service uses a default base URL of `https://mixcore.net`. To change this:

```typescript
class CustomService extends BaseRestService<MyType> {
  constructor() {
    super('myendpoint', authService);
    this.baseUrl = 'https://my-api.com';
    this.endpoint = `${this.baseUrl}/myendpoint`;
  }
}
```

### Custom Headers

Add custom headers by overriding the `getRestApiResult` method:

```typescript
class ApiService extends BaseRestService<MyType> {
  protected async getRestApiResult(req: RequestInit & { url: string }): Promise<any> {
    // Add custom headers
    req.headers = {
      ...req.headers,
      'X-Custom-Header': 'my-value',
      'X-API-Version': '1.0'
    };
    
    return super.getRestApiResult(req);
  }
}
```

## Best Practices

1. **Always pass AuthService**: For automatic token refresh functionality
2. **Use TypeScript interfaces**: Define clear interfaces for your resources
3. **Handle errors appropriately**: Check for authentication failures
4. **Extend for custom logic**: Add domain-specific methods to your service classes
5. **Use query parameters**: Leverage the built-in query parameter support

```typescript
// Good: Type-safe service with custom methods
interface User {
  id: string;
  email: string;
  username: string;
}

class UserService extends BaseRestService<User> {
  constructor() {
    super('users', authService);
  }

  async getActiveUsers(): Promise<User[]> {
    return this.getList({ active: true });
  }

  async searchByEmail(email: string): Promise<User[]> {
    return this.getList({ email });
  }
}

// Good: Error handling
try {
  const users = await userService.getActiveUsers();
} catch (error) {
  if (error.message.includes('Authentication failed')) {
    // Handle auth failure
  } else {
    // Handle other errors
  }
}
```

## Integration with AuthService

The BaseRestService works seamlessly with the AuthService:

```typescript
import { authService } from '../stores';
import { BaseRestService } from './base-rest-service';

// The service will automatically use authService for token refresh
class MyService extends BaseRestService<MyType> {
  constructor() {
    super('myresource', authService);
  }
}

// Token refresh happens automatically on 401 errors
// No additional code needed!
```

This integration ensures that all API calls are properly authenticated and tokens are refreshed as needed without any manual intervention.
