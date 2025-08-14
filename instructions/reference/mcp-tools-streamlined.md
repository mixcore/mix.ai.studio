# MCP Tools Reference: Vector-Optimized

Comprehensive Mix CMS MCP tools reference optimized for vector database embedding and semantic search.

## 🤖 Core Protocol

**Access**: Via `Mix.Mcp.Services` interface
**Priority**: Check MCP Server support before fallback to C# code
**Documentation**: Record tool usage and effectiveness

## 📑 Template Management Tools

### CreateTemplate
Create new template with specified type and content.

**Parameters**:
- `folderType` (int): Template type enum value (7=Masters, 1=Pages, 2=Modules, 5=Posts, 3=Forms, 6=Widgets)
- `fileName` (string): Template name without extension (e.g., "HomePage")
- `extension` (string): File extension with dot (e.g., ".cshtml")
- `mixThemeId` (int): Theme ID (typically 1)
- `content` (string): Razor template content

**Usage**:
```csharp
CreateTemplate(
    folderType: 7,
    fileName: "MasterLayout",
    extension: ".cshtml",
    mixThemeId: 1,
    content: "<!DOCTYPE html><html>...</html>"
)
```

### ListTemplates
Retrieve all existing templates with their properties.

**Returns**: Array of templates with id, fileName, folderType, extension, mixThemeId

**Usage**: `ListTemplates()`

### UpdateTemplate
Modify existing template content or properties.

**Parameters**:
- `id` (int): Template ID
- `content` (string): New template content
- Other template properties as needed

### DeleteTemplate
Remove template from system.

**Parameters**:
- `id` (int): Template ID to delete

## 📄 Content Management Tools

### CreatePageContent
Create webpage instance using page template.

**Parameters**:
- `title` (string): Page title
- `content` (string): HTML content
- `seoName` (string): URL-friendly name
- `templateId` (int): Page template ID (folderType: 1)
- `layoutId` (int): Master layout ID (folderType: 7)
- `tenantId` (int): Tenant ID (typically 1)
- `status` (int): Publication status (2=Published)

**Usage**:
```csharp
CreatePageContent(
    title: "About Us",
    content: "<p>Company information...</p>",
    seoName: "about-us",
    templateId: 123,
    layoutId: 456,
    tenantId: 1
)
```

### CreateModuleContent
Create reusable module instance.

**Parameters**:
- `title` (string): Module title
- `excerpt` (string): Module content/description
- `systemName` (string): Unique system identifier
- `pageSize` (int): Items per page for data modules
- `tenantId` (int): Tenant ID
- `type` (int): Module type (typically 0)

### CreatePostContent
Create blog post or article instance.

**Parameters**:
- `title` (string): Post title
- `content` (string): HTML post content
- `excerpt` (string): Post summary
- `seoName` (string): URL-friendly name
- `templateId` (int): Post template ID (folderType: 5)
- `layoutId` (int): Master layout ID (folderType: 7)
- `tenantId` (int): Tenant ID
- `status` (int): Publication status (2=Published)
- `publishedDateTime` (datetime): Publication date

### List[ContentType]Contents
Retrieve content instances by type.

**Available**:
- `ListPageContents()` - All pages
- `ListModuleContents()` - All modules  
- `ListPostContents()` - All posts

### Update[ContentType]Content
Modify existing content instances.

**Parameters**: Content ID + modified properties

### Delete[ContentType]Content
Remove content instances.

**Parameters**: Content ID

## 🗃️ Database Management Tools

### CreateDatabaseFromPrompt
Create database table using natural language description.

**Parameters**:
- `displayName` (string): Human-readable table name
- `schemaDescription` (string): Natural language schema description
- `llmModel` (string): AI model for schema parsing (default: "deepseek-chat")
- `llmServiceType` (int): AI service type (default: 2)

**Usage**:
```csharp
CreateDatabaseFromPrompt(
    displayName: "Products",
    schemaDescription: "Product catalog with name (text), description (text), price (decimal), image (text url), category (text)"
)
```

### CreateManyMixDbData
Insert multiple records into database table.

**Parameters**:
- `databaseSystemName` (string): System table name (e.g., "mix_products")
- `dataJson` (string): JSON array of records
- `createdBy` (string): Creator username (optional)

**Usage**:
```csharp
CreateManyMixDbData(
    databaseSystemName: "mix_products",
    dataJson: '[{"name":"Product 1","price":99.99,"image":"https://images.unsplash.com/..."}]'
)
```

### CreateMixDbData
Insert single record into database table.

**Parameters**:
- `databaseSystemName` (string): System table name
- `dataJson` (string): JSON record object
- `createdBy` (string): Creator username (optional)

### GetListMidxDbData
Query database records with filtering and sorting.

**Parameters**:
- `databaseSystemName` (string): System table name
- `queryJson` (string): JSON query conditions array
- `sortJson` (string): JSON sort conditions array
- `selectColumns` (string): Comma-separated column list
- `loadNestedData` (bool): Include related data

**Query Format**:
```json
[{
    "Field": "price",
    "Value": "100",
    "Method": "GreaterThan"
}]
```

**Sort Format**:
```json
[{
    "Field": "name",
    "Direction": "Ascending"
}]
```

### GetPagingMixDbData
Query database with pagination support.

**Parameters**:
- `databaseSystemName` (string): System table name
- `page` (int): Page number (1-based)
- `pageSize` (int): Records per page
- `queryJson` (string): Query conditions
- `sortJson` (string): Sort conditions

### GetMixDbDataById
Retrieve single record by ID.

**Parameters**:
- `databaseSystemName` (string): System table name
- `id` (int): Record ID

### UpdateMixDbData
Modify existing database record.

**Parameters**:
- `databaseSystemName` (string): System table name
- `strId` (string): Record ID as string
- `dataJson` (string): Updated record data
- `modifiedBy` (string): Modifier username

### DeleteMixDbData
Remove database record.

**Parameters**:
- `databaseSystemName` (string): System table name
- `id` (int): Record ID

## 🔗 Relationship Management Tools

### CreateMixDbRelationshipFromPrompt
Create relationships between database tables.

**Parameters**:
- `sourceTableName` (string): Source table name
- `destinateTableName` (string): Destination table name
- `displayName` (string): Relationship display name
- `propertyName` (string): Property name for related data
- `relationshipType` (int): Relationship type (0=One-to-Many, 1=Many-to-Many)

**Usage**:
```csharp
CreateMixDbRelationshipFromPrompt(
    sourceTableName: "mix_products",
    destinateTableName: "mix_categories",
    displayName: "Product Categories",
    propertyName: "Categories",
    relationshipType: 0
)
```

### CreatePageModuleAssociation
Link page with module content.

**Parameters**:
- `pageContentId` (int): Page content ID
- `moduleContentId` (int): Module content ID
- `position` (int): Display order position

### CreateModulePostAssociation
Link module with post content.

**Parameters**:
- `moduleContentId` (int): Module content ID
- `postContentId` (int): Post content ID
- `position` (int): Display order position

## 📊 Database Schema Tools

### GetTables
List all available database tables.

**Returns**: Array of table names

### GetTableColumns
Get column information for specific table.

**Parameters**:
- `tableName` (string): Table name

**Returns**: Column details with types and constraints

### GetTableData
Retrieve sample data from table.

**Parameters**:
- `tableName` (string): Table name
- `limit` (int): Maximum records (default: 100)

### ExecuteQuery
Execute read-only SQL query.

**Parameters**:
- `query` (string): SQL SELECT statement

## 🔧 System Management Tools

### GetDatabaseInfo
Retrieve database connection and configuration details.

### ListSections
List all available MCP resource sections.

**Returns**: Available resource categories

### GetSection
Retrieve all resources in specific section.

**Parameters**:
- `section` (string): Section name (e.g., "Prompts", "Error Messages")

### GetResource
Get specific resource by section and key.

**Parameters**:
- `section` (string): Section name
- `key` (string): Resource key

## ⚡ Query Methods and Operators

### Search Query Fields
```json
{
    "Field": "fieldName",
    "Value": "searchValue", 
    "Method": "operator"
}
```

### Available Operators
- `Equal` - Exact match
- `NotEqual` - Not equal
- `Contains` - Substring search
- `NotContains` - Does not contain
- `GreaterThan` - Numeric/date comparison
- `GreaterThanOrEqual` - Numeric/date comparison
- `LessThan` - Numeric/date comparison
- `LessThanOrEqual` - Numeric/date comparison
- `StartsWith` - Text prefix match
- `EndsWith` - Text suffix match

### Sort Directions
- `Ascending` - A to Z, 1 to 9, oldest to newest
- `Descending` - Z to A, 9 to 1, newest to oldest

## 🎯 Common Usage Patterns

### Check Prerequisites
```csharp
ListTemplates()  // Verify existing templates
GetTables()      // Check database connectivity
```

### Content Creation Flow
```csharp
1. CreateTemplate(folderType: 7)  // Master Layout
2. CreateTemplate(folderType: 1)  // Page Template
3. CreatePageContent()            // Page Instance
```

### Database-Driven Content
```csharp
1. CreateDatabaseFromPrompt()     // Schema
2. CreateManyMixDbData()          // Data
3. GetListMidxDbData()           // Query in templates
```

### Content Relationships
```csharp
1. CreateMixDbRelationshipFromPrompt()  // Define relationship
2. Query with loadNestedData: true      // Include related data
```

## 🔍 Vector Search Keywords

**MCP Tools**: CreateTemplate, CreatePageContent, CreateDatabaseFromPrompt, GetListMidxDbData, CreateMixDbRelationshipFromPrompt
**Template Management**: folderType enum, master layouts, page templates, module templates, template creation
**Content Operations**: page content, module content, post content, content associations, content lifecycle
**Database Operations**: schema creation, data insertion, data querying, relationships, natural language schema
**Query Patterns**: SearchMixDbRequestModel, field operators, sorting, pagination, nested data loading
