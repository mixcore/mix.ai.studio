# Template Patterns - Masters (Consolidated)

This content has been consolidated. See: ./template-patterns-streamlined.md

## Mandatory Sections (must exist in your master layout)
```razor
@RenderSection("Schema", false)     <!-- For structured data -->
@RenderSection("Seo", false)        <!-- For SEO meta tags -->
<!--[STYLES]-->                     <!-- Mix CMS styles injection point -->
@RenderSection("Styles", false)     <!-- For page-specific styles -->
@RenderSection("Scripts", false)    <!-- For page-specific scripts -->
```

## 🔍 Vector Search Keywords
template patterns, master layout, layout, template
