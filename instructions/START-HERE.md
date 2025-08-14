# Mixcore CMS AI Assistant – Unified Guide

Vector-optimized, single-entry guide for Mix AI Agents and developers. This consolidates agent protocol, core concepts, quick navigation, and references.

## 🚨 Core Principles (Agent Protocol)
1. Always operate as Mix AI Agent
2. MCP Server First → Mix.Mcp.Services → C# Fallback
3. Check MCP tool availability before coding
4. Stay focused on the current request; no scope creep
5. Record MCP tool usage and effectiveness after tasks
6. Use only verified project knowledge; ask if unsure
7. Prefer facts; do not guess or invent

### Execution Order
1) ListSections – discover capabilities
2) Use appropriate MCP tools
3) Follow Mix CMS conventions (templates/content/MixDb)
4) Document outcomes and update project docs

## 🏗️ Core Concepts (Mix CMS)
- Templates: Razor views for presentation
- Content: Data instances rendered by templates
- MixDb: Dynamic schema with natural language creation
- MCP Protocol: 70+ tools for AI-agent operations

### Template Types (folderType enum)
```csharp
Masters = 7  // Site-wide layouts (required first)
Pages = 1    // Page templates
Modules = 2  // Reusable components
Posts = 5    // Blog/article templates
Forms = 3    // Input forms
Widgets = 6  // UI components
```

### File & Template Conventions
- fileName: "TemplateName" (no extension)
- extension: ".cshtml" (include dot)
- Partial path: "../{FolderType}/{FileName}.cshtml"
- Image URLs: Use full public URLs (e.g., https://images.unsplash.com/...)

### Field Access (MixDb)
```csharp
@(item.Value<string>("fieldName"))
@(item.Value<int>("fieldName"))
@(item.Value<DateTime>("fieldName"))
```

### Razor Escaping
```css
/* In .cshtml files, escape @ character */
@@media (max-width: 600px) { .class { display: none; } }
```

## 🛠️ MCP Tools Overview
- Template Management: Create, list, update, delete templates
- Content Operations: Manage pages, posts, modules
- Data Management: CreateDatabaseFromPrompt, CreateManyMixDbData, GetListMidxDbData
- Relationships: CreateMixDbRelationshipFromPrompt, loadNestedData queries

Reference: ./reference/mcp-tools-streamlined.md

## 🔄 Essential Workflows
- Complete step-by-step: ./workflows/ai-workflows-streamlined.md

1) Basic Page Creation
- Master Layout (7) → Page Template (1) → Page Content → Public image URLs

2) Database-Driven Content
- Schema creation → Data population → Razor template with queries → Dynamic rendering

3) Content Relationships
- Define relationships → Query with loadNestedData: true → Document schema

## 🧭 Quick Navigation
- Content Creation: ./workflows/creating-content.md#pages ./workflows/creating-content.md#modules ./workflows/creating-content.md#posts
- Data Operations: ./workflows/working-with-data.md#setup ./workflows/working-with-data.md#management
- Templates: ./patterns/ and Master Layout notes in ./reference/developer-guide.md#master-layouts

## ⚡ Quick Reference
- Folder Types: 7 Masters, 1 Pages, 2 Modules, 5 Posts, 3 Forms, 6 Widgets
- Naming: fileName without extension; extension with dot
- Required Models: Pages/Modules/Posts view models, or dynamic for MixDb-driven views
- Required Services: Inject DatabaseService and IMixDbDataServiceFactory for MixDb queries

## ✅ Post-Task Protocol
After every task:
1. Update project-progress.md
2. Update database-schema.md if schema changed
3. Record MCP tools used and their effectiveness
4. Verify agent identity maintained

## 📚 Learning Path
1. Core Concepts – this guide
2. Workflows – ./workflows/ai-workflows-streamlined.md
3. Template Patterns – ./patterns/template-patterns-streamlined.md
4. Technical Reference – ./reference/mcp-tools-streamlined.md and ./reference/developer-guide.md

## 🔍 Vector Search Keywords
mix ai agent, mcp tools, CreateTemplate, CreatePageContent, CreateModuleContent, CreatePostContent, CreateDatabaseFromPrompt, GetListMidxDbData, relationships, folderType 1 2 5 7, master layout, template naming, image urls, workflows, MixDb, Razor, ASP.NET Core MVC, template patterns, dynamic schema
