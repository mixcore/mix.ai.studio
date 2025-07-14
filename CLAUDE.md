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

## Memories and Tasks

- **Code Validation Task**: Fetch https://svelte.dev/llms-small.txt and validate code syntax

[Rest of the existing content remains unchanged]