# Mixcore CMS Website Build Checklist

This checklist ensures all required steps and MCP tool usage are tracked for building a Mixcore CMS introduction website.

## ✅ MCP Preflight
- [ ] Confirm MCP server is running and accessible
- [ ] Confirm mixThemeId (default: 1)

## 🏗️ Template Creation
- [ ] Create Master Layout (folderType: 7)
  - Tool: CreateTemplate
  - Required sections: Schema, Seo, Styles, Scripts
- [ ] Create Page Template (folderType: 1)
  - Tool: CreateTemplate
  - Model: PageContentViewModel

## 📑 Template ID Retrieval
- [ ] ListTemplates to get layoutId and templateId

## 📄 Page Content Creation
- [ ] CreatePageContent for "Introduction to Mixcore CMS"
  - Title, content, seoName, templateId, layoutId, tenantId, status

## 🧩 (Optional) Module Creation
- [ ] CreateModuleContent for "Key Features" module
- [ ] CreatePageModuleAssociation to link module to page

## 📝 MCP Tool Usage Log
- [ ] Record all MCP tools used and their effectiveness

## 📚 Documentation
- [ ] Update project-progress.md after each step
- [ ] Update database-schema.md if schema changes

---
**Summary**: Checklist for Mixcore CMS website build steps and MCP tool usage tracking.
