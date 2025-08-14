# Mix CMS Instructions Directory

Vector-optimized documentation for Mix AI Agents working with Mix CMS. Structured for efficient embedding and semantic search.

## 🤖 Mix AI Agent Core Protocol

**Identity**: Mix AI Agent - ASP.NET Core MVC developer specializing in Mixcore CMS
**Priority**: MCP Server First → Mix.Mcp.Services → C# Fallback
**Documentation**: Record MCP tool usage and effectiveness

## 📍 Navigation Paths

| Need | File | Purpose |
|------|------|---------|
| **Quick Start** | `workflows/ai-workflows-streamlined.md` | All development tasks (PRIMARY) |
| **Concepts** | `START-HERE.md` | Unified getting started & agent protocol |
| **Templates** | `patterns/` | Reusable patterns |
| **Reference** | `reference/` | Technical documentation |

## �️ Directory Structure

### `/workflows/` - Task Execution
- `ai-workflows-streamlined.md` - Comprehensive workflow guide (PRIMARY REFERENCE)

### `/patterns/` - Template Patterns
- `template-patterns-streamlined.md` - Complete template pattern guide
- Individual pattern files for specific folderTypes

### `/reference/` - Technical Reference
- `mcp-tools-streamlined.md` - Complete MCP command reference (PRIMARY)
- `developer-guide.md` - C# development guidelines
- `mix-cms-reference.md` - Mix CMS technical reference

### Root Files
- `MIXCORE-CMS-OVERVIEW.md` - System architecture overview
- `START-HERE.md` - Unified concepts and protocols
- `mixdb-lessons-learned.md` - Best practices and troubleshooting
- `website-building-best-practices.md` - Project methodology

## ⚡ Quick Reference

### Template Folder Types
```csharp
Masters = 7     // Site-wide layouts (required first)
Pages = 1       // Page templates
Modules = 2     // Reusable components
Posts = 5       // Blog/article templates
Forms = 3       // User input forms
Widgets = 6     // UI components
```

### Template Models
```csharp
@model Mixcore.Domain.ViewModels.PageContentViewModel     // Pages
@model Mixcore.Domain.ViewModels.ModuleContentViewModel   // Modules
@model Mixcore.Domain.ViewModels.PostContentViewModel     // Posts
@model dynamic                                            // Database content
```

### Essential Services
```csharp
@inject Mix.Database.Services.MixGlobalSettings.DatabaseService dbSrv;
@inject IMixDbDataServiceFactory mixDbDataServiceFactory
```

## 🎯 Task-Based Usage

### Content Creation
- **Pages**: Master Layout → Page Template → Page Content
- **Modules**: Module Template → Module Content → Association
- **Posts**: Post Template → Post Content → Publication

### Data Management
- **Schema**: `CreateDatabaseFromPrompt` with natural language
- **Population**: `CreateManyMixDbData` with JSON arrays
- **Queries**: `GetListMidxDbData` with filtering and sorting

### Template Development
- **Creation**: `CreateTemplate` with appropriate `folderType`
- **Patterns**: Follow template-specific conventions
- **Integration**: Use MCP tools for content, Razor for presentation

## 🔍 Vector Search Keywords

**Architecture**: ASP.NET Core MVC, Mixcore CMS, modular design, multi-tenancy, headless CMS
**AI Integration**: MCP protocol, Mix AI Agent, 70+ tools, model context protocol
**Content Types**: pages, modules, posts, templates, master layouts, forms, widgets
**Data Management**: MixDb, dynamic schema, natural language queries, relationships
**Development**: Razor views, C# code, template patterns, folderType enum
**Workflow**: MCP-first approach, content creation, template rendering, data binding
- **Modular structure** makes updates easier
- **Single responsibility** per file
- **Consistent formatting** across all guides

## Legacy Documentation

The original comprehensive guide has been restructured into focused, topic-specific files. This new organization provides:
- Better discoverability of specific topics
- Reduced cognitive load per document
- Easier maintenance and updates
- Clearer learning progression
