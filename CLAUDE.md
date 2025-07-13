# Lovable-Inspired AI Development Platform

## Project Overview

This is a web-based AI-powered development platform similar to Lovable, where users can build web applications through natural language chat interactions. The platform provides a complete development environment with real-time preview, code generation, and deployment capabilities.

## Tech Stack

- **Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS v4 + daisyUI v5
- **UI Components**: daisyUI component system
- **Icons**: Lucide Svelte
- **State Management**: Svelte stores
- **Dark/Light Mode**: daisyUI theming system
- **Package Manager**: Bun
- **Development Server**: Vite

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
│   │   └── preview/
│   │       └── PreviewPanel.svelte    # Right preview area
│   ├── stores/
│   │   └── index.ts                   # Svelte stores for state management
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   └── utils.ts                       # Utility functions (cn helper)
└── static/
    └── favicon.svg                    # App icon
```

## Key Features Implemented

### 1. Main Layout Structure (37.4% / 62.6% split)
```
┌─────────────────────────────────────────┐
│           Navigation Bar                │
├───────────────┬─────────────────────────┤
│               │                         │
│  Chat Panel   │    Preview Panel        │
│   (37.4%)     │      (62.6%)           │
│               │                         │
│               │                         │
└───────────────┴─────────────────────────┘
```

### 2. Navigation Bar Components
- **Project Logo & Name**: Gradient logo with project name
- **Project Controls**: Refresh, external preview, URL bar
- **Collaboration Tools**: Invite, GitHub, Supabase buttons
- **Theme Toggle**: Sun/moon icon for dark/light mode
- **Publish Button**: Prominent green CTA
- **User Menu**: Avatar dropdown with profile options

### 3. Chat Interface (Left Panel)
- **Welcome Screen**: Friendly AI assistant introduction
- **Message History**: User/AI conversation with proper styling
- **Message Actions**: Copy, thumbs up/down for AI responses
- **Chat Input**: Multi-line textarea with image upload support
- **Mode Selector**: Default, Chat-only, Agent mode options
- **Loading States**: Animated dots during AI processing

### 4. Preview Panel (Right Panel)
- **Live Preview**: Iframe showing generated application
- **Device Responsiveness**: Desktop/tablet/mobile view options
- **Code/Visual Toggle**: Switch between preview and code view
- **Preview Controls**: Refresh and external link buttons
- **Demo Application**: Interactive sample app with counter, forms

### 5. Theme System
- **daisyUI Integration**: Semantic color system
- **Auto Theme Detection**: Respects system preferences
- **Theme Toggle**: Manual light/dark mode switching
- **Consistent Colors**: All components adapt automatically

## Installation & Setup

### Prerequisites
- Node.js (compatible with Tailwind CSS v4)
- Bun package manager

### Installation Steps

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Start development server**:
   ```bash
   bun run dev
   ```

3. **Access the application**:
   - Main app: `http://localhost:5173`
   - Demo preview: `http://localhost:5173/demo`

### Dependencies

```json
{
  "devDependencies": {
    "@sveltejs/adapter-auto": "^6.0.1",
    "@sveltejs/kit": "^2.22.5",
    "@sveltejs/vite-plugin-svelte": "^6.0.0",
    "@tailwindcss/postcss": "^4.1.11",
    "autoprefixer": "^10.4.21",
    "daisyui": "^5.0.46",
    "postcss": "^8.5.6",
    "svelte": "^5.35.6",
    "svelte-check": "^4.2.2",
    "tailwindcss": "^4.1.11",
    "typescript": "^5.8.3",
    "vite": "^7.0.4"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-svelte": "^0.525.0",
    "mode-watcher": "^1.1.0",
    "tailwind-merge": "^3.3.1",
    "tailwind-variants": "^1.0.0"
  }
}
```

## Configuration Files

### Tailwind CSS Configuration (`tailwind.config.js`)
```javascript
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### PostCSS Configuration (`postcss.config.js`)
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

### App Styles (`src/app.css`)
```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark --prefersdark;
}

/* Custom spacing utilities */
@layer utilities {
  .panel-header { @apply p-4 border-b border-base-300; }
  .panel-content { @apply p-4; }
  .button-group { @apply flex items-center gap-2; }
  .message-spacing { @apply space-y-4; }
  .gap-standard { @apply gap-2; }
  .gap-content { @apply gap-4; }
  .gap-tight { @apply gap-1; }
}
```

## State Management

### Store Structure (`src/lib/stores/index.ts`)
```typescript
// User & Project State
export const user = writable<User | null>(null);
export const currentProject = writable<Project | null>(null);
export const workspace = writable<Workspace | null>(null);

// Chat State
export const chatMessages = writable<ChatMessage[]>([]);
export const chatLoading = writable(false);
export const chatMode = writable<'default' | 'chat-only' | 'agent'>('default');
export const chatInput = writable('');

// Preview State
export const previewUrl = writable('');
export const previewLoading = writable(false);
export const showCodeView = writable(false);

// UI State
export const showSettingsModal = writable(false);
export const showInviteModal = writable(false);
export const showPublishModal = writable(false);
```

### TypeScript Interfaces (`src/lib/types/index.ts`)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  visibility: 'public' | 'private' | 'workspace';
  collaborators: User[];
  github?: GitHubConnection;
  supabase?: SupabaseConnection;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: string[];
}
```

## Design System

### Color Scheme (daisyUI)
- **Primary**: Blue tones for main actions and highlights
- **Secondary**: Gray tones for secondary elements
- **Success**: Green for publish button and success states
- **Base Colors**: Semantic background and text colors
- **Auto-adapting**: Colors change automatically with theme

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Sizes**: 
  - Small: 0.75rem (12px)
  - Default: 0.875rem (14px)
  - Medium: 1rem (16px)
  - Large: 1.125rem (18px)

### Spacing Hierarchy
- **Headers**: `p-4` (16px padding)
- **Content**: `p-4` (16px padding)
- **Buttons**: daisyUI `btn-sm` classes
- **Gaps**: `gap-1` (4px), `gap-2` (8px), `gap-4` (16px)

### Layout Specifications
- **Chat Panel**: 37.4% of viewport width
- **Preview Panel**: 62.6% of viewport width
- **Navigation Height**: 48px (`h-12`)
- **Panel Resize**: Draggable, constrained between 25% and 65%

## Component Architecture

### Navigation Components
- **Navigation.svelte**: Main navigation bar with all controls
- **ThemeToggle.svelte**: daisyUI theme switching
- **UserMenu.svelte**: daisyUI dropdown with user actions
- **PublishButton.svelte**: Prominent success button

### Layout Components
- **ResizableLayout.svelte**: Draggable panel divider with constraints
- Uses MutationObserver for smooth resizing
- Maintains panel width ratios

### Chat Components
- **ChatPanel.svelte**: Main chat interface container
- **ChatMessage.svelte**: Individual message with actions
- **ChatInput.svelte**: Advanced input with mode selection
- **ModeSelector.svelte**: Chat mode dropdown

### Preview Components
- **PreviewPanel.svelte**: Iframe container with controls
- Device responsiveness toggle
- Code/visual view switching
- Loading states and error handling

## Key Features Deep Dive

### Resizable Panels
```javascript
// Draggable panel implementation
function startResize(e: MouseEvent) {
  isResizing = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

function handleResize(e: MouseEvent) {
  if (!isResizing || !container) return;
  const containerRect = container.getBoundingClientRect();
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
  leftPanelWidth = Math.max(25, Math.min(65, newWidth)); // Constrained
}
```

### Theme Switching
```javascript
// daisyUI theme switching
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  html.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
}
```

### Chat Simulation
```javascript
// Simulated AI chat responses
function handleSubmit() {
  const message = {
    id: Date.now().toString(),
    content: $chatInput,
    role: 'user' as const,
    timestamp: new Date()
  };
  
  chatMessages.update(messages => [...messages, message]);
  
  // Simulate AI response with loading
  setTimeout(() => {
    const response = {
      id: (Date.now() + 1).toString(),
      content: "I'll help you build that!",
      role: 'assistant' as const,
      timestamp: new Date()
    };
    chatMessages.update(messages => [...messages, response]);
  }, 2000);
}
```

## Development Guidelines

### Styling Conventions
1. **Use daisyUI classes**: `btn`, `btn-primary`, `bg-base-100`, etc.
2. **Consistent spacing**: Use utility classes from app.css
3. **Semantic colors**: Leverage daisyUI's color system
4. **Responsive design**: Mobile-first approach

### Component Best Practices
1. **Single responsibility**: Each component has one clear purpose
2. **TypeScript**: All components are typed
3. **Accessibility**: Proper ARIA labels and keyboard navigation
4. **Performance**: Reactive updates and efficient rerenders

### State Management
1. **Svelte stores**: For reactive state across components
2. **Local state**: For component-specific state
3. **Props**: For parent-child communication
4. **Events**: For child-parent communication

## Deployment

### Build Commands
```bash
# Development
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Environment Setup
- Ensure Node.js compatibility with Tailwind CSS v4
- Use Bun for fast dependency management
- Configure deployment platform for SvelteKit

## Future Enhancements

### Phase 1: Core Functionality
- [ ] Real AI integration (OpenAI, Anthropic)
- [ ] Authentication system (Firebase/Supabase)
- [ ] Project persistence and saving
- [ ] File management system

### Phase 2: Advanced Features
- [ ] Real-time collaboration
- [ ] GitHub integration
- [ ] Code generation and editing
- [ ] Template system

### Phase 3: Platform Features
- [ ] Deployment integration
- [ ] Analytics and monitoring
- [ ] Team management
- [ ] Custom domains

## Troubleshooting

### Common Issues

1. **Tailwind classes not working**:
   - Ensure Tailwind CSS v4 and daisyUI are properly installed
   - Check PostCSS configuration
   - Verify content paths in tailwind.config.js

2. **Theme toggle not working**:
   - Check data-theme attribute on html element
   - Verify daisyUI theme configuration
   - Ensure ThemeToggle component is properly imported

3. **Panel resizing issues**:
   - Check MutationObserver cleanup
   - Verify event listeners are properly removed
   - Check CSS constraints (25% - 65%)

4. **Build errors**:
   - Ensure Bun is up to date
   - Check TypeScript types
   - Verify all imports are correct

### Performance Optimization
- Use Svelte's reactive statements efficiently
- Implement virtual scrolling for large chat histories
- Optimize iframe loading for preview panel
- Use code splitting for better load times

## Contributing

1. Follow the established component structure
2. Use consistent spacing utilities
3. Maintain TypeScript type safety
4. Test theme switching functionality
5. Ensure responsive design
6. Update this documentation for new features

---

**Note**: This project replicates Lovable's UI and functionality for educational purposes. The actual implementation uses SvelteKit and daisyUI for a modern, maintainable codebase.