# AI Development Platform

## Project Overview

This is a web-based AI-powered development platform similar to AI build UI, where users can build web applications through natural language chat interactions. The platform provides a complete development environment with real-time preview, code generation, and deployment capabilities.

## Tech Stack

- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS v4 + daisyUI v5
- **UI Components**: daisyUI component system
- **Icons**: Lucide Svelte
- **State Management**: Svelte stores
- **Dark/Light Mode**: daisyUI theming system
- **Package Manager**: Bun
- **Development Server**: Vite

## SDK Integration

### Mixcore SDK Client

This project integrates with the **Mixcore SDK Client** (`lib/sdk-client/`) as a Git submodule, providing comprehensive platform integration capabilities:

#### Core Features
- **Authentication**: Secure login/logout with AES encryption and token management
- **Database Operations**: Full CRUD operations with MixQuery builder for filtering and sorting
- **File Storage**: Upload, download, and manage files with multiple storage backends
- **Cross-Platform Support**: Works in browser, Node.js, React Native, and SSR environments
- **Framework Adapters**: Native support for React, Vue, Angular, and Svelte/SvelteKit
- **TypeScript**: Full type safety and IntelliSense support
- **Caching**: Built-in response caching for performance optimization
- **Error Handling**: Comprehensive error types and validation

#### Integration Architecture

```typescript
// SDK Client Wrapper (src/lib/sdk/client.ts)
export class MixcoreSDKClient {
  // Configuration with environment-specific defaults
  private config: AppClientConfig;
  
  // Core modules
  get auth() { /* Authentication methods */ }
  get database() { /* Database operations */ }  
  get storage() { /* File management */ }
}

// Service Layer Integration
// src/lib/services/llm.ts - LLM providers with MCP integration
// src/lib/services/database.ts - Database abstraction layer
// src/lib/services/mixcore.ts - Platform-specific services
```

#### Svelte/SvelteKit Integration

The SDK provides native Svelte adapters for both traditional stores and Svelte 5 runes:

```typescript
// Svelte 4 Traditional Stores
import { createAuthStore, createDataStore } from '$lib/sdk-client/packages/sdk-client/src/adapters/svelte';

// Svelte 5 Runes API  
import { createAuthRunes, createDataRunes } from '$lib/sdk-client/packages/sdk-client/src/adapters/svelte';

// SvelteKit SSR Support
import { createSvelteKitClient, loadMixcoreData } from '$lib/sdk-client/packages/sdk-client/src/adapters/sveltekit';
```

#### LLM Service Integration

The LLM service (`src/lib/services/llm.ts`) integrates multiple AI providers:

- **OpenAI**: GPT-3.5, GPT-4, GPT-4o models
- **Anthropic Claude**: Claude-3.5 Sonnet, Claude-3 Haiku, Claude-3 Opus
- **Google Gemini**: Gemini Pro, Gemini Flash models
- **DeepSeek**: DeepSeek Chat, DeepSeek Coder models
- **MCP Integration**: Model Context Protocol for enhanced functionality

#### Database Service

Provides unified interface for data operations with:
- Query builder with filtering, sorting, pagination
- CRUD operations with type safety
- Bulk operations and data export
- Real-time data synchronization
- Connection management and error handling

#### Storage & File Management

- Multi-backend storage support (localStorage, memory, filesystem)
- File upload/download with progress tracking
- Image processing and optimization
- Secure file access with permissions
- Cross-platform compatibility

## Project Structure

```
src/
├── app.html                          # Main HTML template
├── app.css                           # Global styles and daisyUI config
├── routes/
│   ├── +layout.svelte                # Root layout with ModeWatcher
│   ├── +page.svelte                  # Main application page
│   └── demo/
│       └── +page.svelte              # Demo preview page
├── lib/
│   ├── components/
│   │   ├── layout/
│   │   │   └── ResizableLayout.svelte # Draggable panel divider
│   │   ├── navigation/
│   │   │   ├── Navigation.svelte      # Top navigation bar
│   │   │   ├── PublishButton.svelte   # Green publish CTA
│   │   │   ├── ThemeToggle.svelte     # Dark/light mode toggle
│   │   │   └── UserMenu.svelte        # User dropdown menu
│   │   ├── chat/
│   │   │   ├── ChatPanel.svelte       # Left sidebar chat interface
│   │   │   ├── ChatMessage.svelte     # Individual message component
│   │   │   ├── ChatInput.svelte       # Message input with controls
│   │   │   └── ModeSelector.svelte    # Chat mode toggle
│   │   ├── auth/                      # Authentication components
│   │   ├── database/                  # Database UI components
│   │   ├── vscode/                    # VS Code integration components
│   │   ├── settings/                  # Settings and configuration UI
│   │   └── preview/
│   │       └── PreviewPanel.svelte    # Right preview area
│   ├── sdk/
│   │   └── client.ts                  # Mixcore SDK client wrapper
│   ├── services/
│   │   ├── llm.ts                     # LLM integration service
│   │   ├── database.ts                # Database service layer
│   │   └── mixcore.ts                 # Mixcore platform integration
│   ├── mixcore/                       # Core Mixcore functionality
│   │   ├── client.ts                  # Main Mixcore client
│   │   ├── auth.ts                    # Authentication module
│   │   ├── database.ts                # Database operations
│   │   ├── storage.ts                 # File storage operations
│   │   └── types.ts                   # Type definitions
│   ├── stores/
│   │   └── index.ts                   # Svelte stores for state management
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   └── utils.ts                       # Utility functions (cn helper)
│   ├── sdk-client/                    # Mixcore SDK Client submodule
│   │   ├── packages/sdk-client/       # Core SDK package
│   │   │   ├── src/                   # SDK source code
│   │   │   │   ├── client.ts          # Main MixcoreClient class
│   │   │   │   ├── auth.ts            # Authentication module
│   │   │   │   ├── database.ts        # Database operations
│   │   │   │   ├── storage.ts         # File storage module
│   │   │   │   ├── query/             # MixQuery builder
│   │   │   │   ├── adapters/          # Framework integrations
│   │   │   │   │   ├── svelte.ts      # Svelte stores & runes
│   │   │   │   │   ├── sveltekit.ts   # SvelteKit SSR support
│   │   │   │   │   ├── react.ts       # React hooks
│   │   │   │   │   ├── vue.ts         # Vue composables
│   │   │   │   │   └── angular.ts     # Angular services
│   │   │   │   └── helpers/           # Utilities and validation
│   │   │   └── examples/              # Framework integration examples
│   │   └── wiki/                      # SDK documentation
└── static/
    └── favicon.svg                    # App icon
```

## SDK Usage Patterns

### Authentication Flow
```typescript
import { createSDKClient, initializeSDK } from '$lib/sdk/client';
import { createAuthRunes } from '$lib/sdk-client/packages/sdk-client/src/adapters/svelte';

// Initialize SDK with environment config
const client = initializeSDK();
const auth = createAuthRunes(client);

// Login workflow
await auth.login({ 
  email: 'user@example.com', 
  password: 'password123' 
});

// Check authentication state
if (auth.isAuthenticated()) {
  const user = auth.user();
  console.log('Logged in as:', user.username);
}
```

### Database Operations
```typescript
import { MixQuery } from '$lib/sdk-client/packages/sdk-client/src/query';

// Query with filtering and pagination
const query = new MixQuery()
  .where('status', 'active')
  .where('createdDate', '>=', '2024-01-01')
  .orderBy('name', 'asc')
  .take(20);

const users = await client.database.getData('users', query);

// CRUD operations
const newUser = await client.database.createData('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

const updatedUser = await client.database.updateData('users', userId, {
  lastLoginDate: new Date().toISOString()
});
```

### LLM Integration
```typescript
import { createLLMService } from '$lib/services/llm';

const llmService = createLLMService({
  defaultProvider: 'claude',
  defaultModel: 'claude-3-5-sonnet-20241022'
});

// Configure provider
llmService.setProvider('claude', {
  apiKey: 'your-api-key',
  isEnabled: true
});

// Send message with MCP integration
const response = await llmService.sendMessage([
  { role: 'user', content: 'Generate a user registration form' }
], {
  provider: 'claude',
  model: 'claude-3-5-sonnet-20241022'
});
```

## Development Setup

### Prerequisites
- **Bun**: Package manager and runtime
- **Node.js**: v18+ for compatibility
- **Git**: For submodule management

### Installation
```bash
# Clone with submodules
git clone --recursive https://github.com/mixcore/mix.ai.studio.git

# Or initialize submodules after cloning
git submodule update --init --recursive

# Install dependencies
bun install

# Install SDK client dependencies
cd src/lib/sdk-client && pnpm install && cd ../../..
```

### Development Commands
```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run tests
bun run test

# Lint and format
bun run lint
bun run format

# Type checking
bun run check
```

### SDK Client Development
```bash
# Build SDK client
cd src/lib/sdk-client
pnpm build

# Run SDK tests
pnpm test

# Watch mode for SDK development
pnpm build:watch
```

## Environment Configuration

### Required Environment Variables
```bash
# .env.local
VITE_MIXCORE_ENDPOINT=https://api.mixcore.org/v2
VITE_OPENAI_API_KEY=your-openai-key
VITE_CLAUDE_API_KEY=your-claude-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_DEEPSEEK_API_KEY=your-deepseek-key
```

### Client Configuration
```typescript
// src/lib/config/client.ts
export const CLIENT_CONFIG = {
  endpoint: import.meta.env.VITE_MIXCORE_ENDPOINT || 'https://mixcore.net',
  tokenKey: 'mix_access_token',
  refreshTokenKey: 'mix_refresh_token',
  enableCache: true,
  debug: import.meta.env.DEV
};
```

## Memories and Tasks

- **Code Validation Task**: Fetch https://svelte.dev/llms-small.txt and validate code syntax
- **SDK Integration**: Mixcore SDK Client integrated as Git submodule with comprehensive TypeScript support
- **LLM Services**: Multi-provider LLM integration with MCP (Model Context Protocol) support
- **Framework Adapters**: Native Svelte/SvelteKit integration with both stores and runes support

[Rest of the existing content remains unchanged]