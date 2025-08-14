# Mix AI Agent Workflows: Streamlined Guide

Vector-optimized workflow reference for Mix CMS development tasks. Designed for efficient embedding and semantic search.

## 🤖 Mix AI Agent Protocol

**Identity**: Mix AI Agent - ASP.NET Core MVC specialist for Mixcore CMS
**Approach**: MCP Server First → Mix.Mcp.Services → C# Fallback
**Documentation**: Record tool usage and maintain project progress

## ⚡ Quick Reference

### Template Types (folderType enum)
```csharp
Masters = 7     // Site-wide layouts (required first)
Pages = 1       // Page templates  
Modules = 2     // Reusable components
Posts = 5       // Blog/article templates
Forms = 3       // Input forms
Widgets = 6     // UI components
```

### Essential MCP Tools
- **Templates**: `CreateTemplate`, `ListTemplates`, `UpdateTemplate`, `DeleteTemplate`
- **Content**: `CreatePageContent`, `CreatePostContent`, `CreateModuleContent`
- **Data**: `CreateDatabaseFromPrompt`, `CreateManyMixDbData`, `GetListMidxDbData`
- **Relationships**: `CreateMixDbRelationshipFromPrompt`

## 📋 Workflow 1: Page Creation

### Prerequisites Check
```csharp
// Verify MCP Server support
ListTemplates()  // Check existing templates
GetTables()      // Verify database connectivity
```

### Template Creation
```csharp
// Master Layout (required first)
CreateTemplate(
    folderType: 7,
    fileName: "MasterLayout",
    extension: ".cshtml",
    mixThemeId: 1,
    content: "<!DOCTYPE html><html><head><title>@ViewBag.Title</title></head><body>@RenderBody()</body></html>"
)

// Page Template
CreateTemplate(
    folderType: 1,
    fileName: "StandardPage",
    extension: ".cshtml",
    mixThemeId: 1,
    content: "@model Mixcore.Domain.ViewModels.PageContentViewModel\n<div class=\"page\"><h1>@Model.Title</h1>@Html.Raw(Model.Content)</div>"
)
```

### Content Creation
```csharp
CreatePageContent(
    title: "Welcome",
    content: "<h1>Welcome</h1><p>Page content here</p>",
    seoName: "welcome",
    templateId: {page_template_id},    // folderType: 1
    layoutId: {master_layout_id},      // folderType: 7
    tenantId: 1
)
```

## 📋 Workflow 2: Module Creation

### Module Content
```csharp
CreateModuleContent(
    title: "Featured Content",
    excerpt: "Reusable module content",
    systemName: "featured-content",
    pageSize: 10,
    tenantId: 1,
    type: 0
)
```

### Module Template
```csharp
CreateTemplate(
    folderType: 2,
    fileName: "FeaturedContent",
    extension: ".cshtml",
    mixThemeId: 1,
    content: "@model Mixcore.Domain.ViewModels.ModuleContentViewModel\n<div class=\"module\"><h2>@Model.Title</h2>@Html.Raw(Model.Excerpt)</div>"
)
```

## 📋 Workflow 3: Blog Posts

### Post Template
```csharp
CreateTemplate(
    folderType: 5,
    fileName: "BlogPost",
    extension: ".cshtml",
    mixThemeId: 1,
    content: "@model Mixcore.Domain.ViewModels.PostContentViewModel\n<article><h1>@Model.Title</h1><div class=\"meta\">@Model.PublishedDateTime</div>@Html.Raw(Model.Content)</article>"
)
```

### Post Content
```csharp
CreatePostContent(
    title: "Blog Post Title",
    content: "<p>Blog post content with HTML</p>",
    excerpt: "Brief summary",
    seoName: "blog-post-title",
    templateId: {post_template_id},    // folderType: 5
    layoutId: {master_layout_id},      // folderType: 7
    tenantId: 1,
    status: 2  // Published
)
```

## 📋 Workflow 4: Database-Driven Content

### Schema Creation
```csharp
CreateDatabaseFromPrompt(
    displayName: "Products",
    schemaDescription: "Product catalog with name (text), description (text), price (decimal), image (text url)"
)
```

### Data Population
```csharp
CreateManyMixDbData(
    databaseSystemName: "mix_products",
    dataJson: '[{"name":"Product 1","description":"Description","price":99.99,"image":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}]'
)
```

### Data-Driven Template
```csharp
@model dynamic
@using Mix.Mixdb.Interfaces
@using Mix.Shared.Models
@using Mix.Shared.Dtos
@using Mix.Constant.Enums
@using Mix.Constant.Constants

@inject Mix.Database.Services.MixGlobalSettings.DatabaseService dbSrv;
@inject IMixDbDataServiceFactory mixDbDataServiceFactory

@{
    var mixDbDataService = mixDbDataServiceFactory.Create(dbSrv.DatabaseProvider, dbSrv.GetConnectionString(MixConstants.CONST_CMS_CONNECTION));
    var request = new SearchMixDbRequestModel
    {
        TableName = "mix_products",
        Queries = new List<MixQueryField>()
    };
    var products = await mixDbDataService.GetListByAsync(request);
}

@foreach (var product in products)
{
    <div class="product-card">
        <img src="@(product.Value<string>("image"))" alt="@(product.Value<string>("name"))" />
        <h3>@(product.Value<string>("name"))</h3>
        <p>@(product.Value<string>("description"))</p>
        <span class="price">$@(product.Value<decimal>("price"))</span>
    </div>
}
```

## 📋 Workflow 5: Content Relationships

### Page-Module Association
```csharp
CreatePageModuleAssociation(
    pageContentId: {page_id},
    moduleContentId: {module_id},
    position: 1
)
```

### Database Relationships
```csharp
CreateMixDbRelationshipFromPrompt(
    sourceTableName: "mix_products",
    destinateTableName: "mix_categories",
    displayName: "Product Categories",
    propertyName: "Categories",
    relationshipType: 0  // One-to-Many
)
```

### Querying with Relationships
```csharp
var request = new SearchMixDbRequestModel
{
    TableName = "mix_products",
    LoadNestedData = true,  // Include related data
    Queries = new List<MixQueryField>()
};
```

## 🔧 Essential Patterns

### Template Naming
- **fileName**: "TemplateName" (no extension)
- **extension**: ".cshtml" (include dot)
- **Partial path**: "../{FolderType}/{FileName}.cshtml"

### Field Access
```csharp
@(item.Value<string>("fieldName"))     // String fields
@(item.Value<int>("fieldName"))        // Integer fields
@(item.Value<decimal>("fieldName"))    // Decimal fields
@(item.Value<DateTime>("fieldName"))   // Date fields
```

### Required Using Statements
```csharp
@using Mix.Mixdb.Interfaces
@using Mix.Shared.Models
@using Mix.Shared.Dtos
@using Mix.Constant.Enums
@using Mix.Constant.Constants

@inject Mix.Database.Services.MixGlobalSettings.DatabaseService dbSrv;
@inject IMixDbDataServiceFactory mixDbDataServiceFactory
```

### Razor Escaping
```css
/* CSS in .cshtml files - escape @ character */
@@media (max-width: 600px) {
    .responsive { display: none; }
}
```

### Required Razor Sections in Master Layouts
```razor
@RenderSection("Schema", false)
@RenderSection("Seo", false)
<!--[STYLES]-->
@RenderSection("Styles", false)
@RenderSection("Scripts", false)
```

## 🎯 Common Task Patterns

### Check Template Prerequisites
```csharp
ListTemplates() → Verify Master Layout exists (folderType: 7)
```

### Verify Template FolderType
```csharp
// Before CreatePageContent
templateId must reference folderType: 1 (Pages)
layoutId must reference folderType: 7 (Masters)
```

### Create Complete Page Flow
```csharp
1. CreateTemplate(folderType: 7) // Master Layout
2. CreateTemplate(folderType: 1) // Page Template  
3. CreatePageContent() // Page Instance
4. Document in project-progress.md
```

### Database-Driven Module Flow
```csharp
1. CreateDatabaseFromPrompt() // Schema
2. CreateManyMixDbData() // Data
3. CreateTemplate(folderType: 2) // Module Template
4. CreateModuleContent() // Module Instance
5. Query data in template with SearchMixDbRequestModel
```

## 📝 Documentation Requirements

### After Each Task
Update project documentation:
- `project-progress.md` - Feature completion status
- `database-schema.md` - Schema changes and relationships
- Record MCP tools used and effectiveness
- Note any limitations or fallback to C# code

### Schema Documentation Format
```markdown
## table_name
- **field1** (type) - Description
- **field2** (type) - Description
- **relationships** - Related tables and connection type
```

## 🩺 Troubleshooting & Error Handling

### Common Issues
- "Template already exists": Check with `ListTemplates()` first
- Missing layout: Ensure Master Layout (folderType: 7) exists
- Wrong template type: Verify folderType matches content type
- Data not displaying: Check using statements and DI services
- Broken images: Use full public URLs
- Relationship issues: Ensure `loadNestedData: true`

### Error Handling Patterns
- Include null checks for optional fields
- Use `@Html.Raw()` for HTML content; use `@Model.Property` for plain text

## ⚙️ Quick Command Reference

### Template Management
- `ListTemplates()`
- `CreateTemplate()`
- `UpdateTemplate(id)`
- `DeleteTemplate(id, confirmDelete: "YES")`

### Content Management
- `CreatePageContent()` / `UpdatePageContent()` (Pages: template 1, layout 7)
- `CreatePostContent()` / `UpdatePostContent()` (Posts: template 5)
- `CreateModuleContent()` / `UpdateModuleContent()` (Modules: template 2)
- `ListPageContents()` / `GetPageContent(id)`

### Database Operations
- `CreateDatabaseFromPrompt()`
- `CreateManyMixDbData()`
- `GetTableSchema(tableName)`
- `GetListMidxDbData()`

### Relationships
- `CreateMixDbRelationshipFromPrompt()`
- Use `loadNestedData: true` in queries

## 🔍 Vector Search Keywords

**Workflows**: page creation, module development, blog posts, database content, relationships
**Templates**: folderType enum, master layouts, page templates, module templates, post templates
**MCP Tools**: CreateTemplate, CreatePageContent, CreateDatabaseFromPrompt, GetListMidxDbData
**Data Patterns**: SearchMixDbRequestModel, Value<T> field access, LoadNestedData, relationships
**Development**: ASP.NET Core MVC, Razor views, Mix AI Agent protocol, MCP server integration
