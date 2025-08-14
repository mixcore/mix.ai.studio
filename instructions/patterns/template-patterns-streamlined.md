# Template Patterns: Vector-Optimized Reference

Streamlined guide for Mix CMS template development patterns, optimized for vector database embedding and semantic search.

## 🎯 Template Type Overview

### Core Template Types
| Type | folderType | Purpose | Model |
|------|------------|---------|-------|
| **Masters** | 7 | Site-wide layouts | N/A |
| **Pages** | 1 | Page templates | `PageContentViewModel` |
| **Modules** | 2 | Reusable components | `ModuleContentViewModel` or `dynamic` |
| **Posts** | 5 | Blog/article templates | `PostContentViewModel` |
| **Forms** | 3 | Input forms | `dynamic` |
| **Widgets** | 6 | UI components | `dynamic` |

## 🏗️ Master Layout Patterns (folderType: 7)

### Basic Master Layout
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@ViewBag.Title</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container">
                <a class="navbar-brand" href="/">Site Name</a>
            </div>
        </nav>
    </header>
    
    <main class="container my-4">
        @RenderBody()
    </main>
    
    <footer class="bg-light py-4 mt-5">
        <div class="container text-center">
            <p>&copy; 2025 Site Name. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

### Responsive Master Layout
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@ViewBag.Title</title>
    @RenderSection("Schema", false)
    @RenderSection("Seo", false)  
    @RenderSection("Styles", false)
    <style>
        @@media (max-width: 768px) {
            .container { padding: 0 15px; }
            .navbar-brand { font-size: 1.2rem; }
        }
        @@media (min-width: 769px) {
            .container { max-width: 1200px; }
        }
    </style>
</head>
<body>
    @RenderBody()
</body>
@RenderSection("Scripts", false)
</html>
```

## 📄 Page Template Patterns (folderType: 1)

### Standard Page Template
```csharp
@model Mixcore.Domain.ViewModels.PageContentViewModel
<div class="page-content">
    <h1 class="page-title">@Model.Title</h1>
    <div class="page-body">
        @Html.Raw(Model.Content)
    </div>
</div>
```

### Page with Metadata
```csharp
@model Mixcore.Domain.ViewModels.PageContentViewModel
<article class="page">
    <header class="page-header">
        <h1>@Model.Title</h1>
        @if (!string.IsNullOrEmpty(Model.Excerpt))
        {
            <p class="page-excerpt">@Model.Excerpt</p>
        }
        <div class="page-meta">
            <time datetime="@Model.CreatedDateTime">@Model.CreatedDateTime.ToString("MMMM dd, yyyy")</time>
        </div>
    </header>
    <div class="page-content">
        @Html.Raw(Model.Content)
    </div>
</article>
```

## 🧩 Module Template Patterns (folderType: 2)

### Static Module Template
```csharp
@model Mixcore.Domain.ViewModels.ModuleContentViewModel
<section class="module">
    <h2 class="module-title">@Model.Title</h2>
    <div class="module-content">
        @Html.Raw(Model.Excerpt)
    </div>
</section>
```

### Database-Driven Module Template
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
        PageSize = 6,
        Queries = new List<MixQueryField>()
    };
    var products = await mixDbDataService.GetListByAsync(request);
}

<section class="products-module">
    <h2>Featured Products</h2>
    <div class="product-grid">
        @foreach (var product in products)
        {
            <div class="product-card">
                <img src="@(product.Value<string>("image"))" alt="@(product.Value<string>("name"))" class="product-image" />
                <h3 class="product-name">@(product.Value<string>("name"))</h3>
                <p class="product-description">@(product.Value<string>("description"))</p>
                <span class="product-price">$@(product.Value<decimal>("price"))</span>
            </div>
        }
    </div>
</section>
```

### Module with Filtering
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
        Queries = new List<MixQueryField>
        {
            new MixQueryField
            {
                FieldName = "category",
                Value = "electronics",
                Operator = "="
            }
        },
        SortBy = "price",
        Direction = "Ascending"
    };
    var products = await mixDbDataService.GetListByAsync(request);
}

<section class="filtered-products">
    <h2>Electronics</h2>
    @foreach (var product in products)
    {
        <div class="product-item">
            <h3>@(product.Value<string>("name"))</h3>
            <p>Price: $@(product.Value<decimal>("price"))</p>
        </div>
    }
</section>
```

## 📝 Post Template Patterns (folderType: 5)

### Blog Post Template
```csharp
@model Mixcore.Domain.ViewModels.PostContentViewModel
<article class="blog-post">
    <header class="post-header">
        <h1 class="post-title">@Model.Title</h1>
        <div class="post-meta">
            <time datetime="@Model.PublishedDateTime">@Model.PublishedDateTime?.ToString("MMMM dd, yyyy")</time>
            @if (!string.IsNullOrEmpty(Model.Tags))
            {
                <div class="post-tags">
                    @foreach (var tag in Model.Tags.Split(','))
                    {
                        <span class="tag">@tag.Trim()</span>
                    }
                </div>
            }
        </div>
    </header>
    
    @if (!string.IsNullOrEmpty(Model.Excerpt))
    {
        <div class="post-excerpt">
            <p>@Model.Excerpt</p>
        </div>
    }
    
    <div class="post-content">
        @Html.Raw(Model.Content)
    </div>
</article>
```

### Post with Featured Image
```csharp
@model Mixcore.Domain.ViewModels.PostContentViewModel
<article class="post-with-image">
    @if (!string.IsNullOrEmpty(Model.Image))
    {
        <div class="post-featured-image">
            <img src="@Model.Image" alt="@Model.Title" class="img-fluid" />
        </div>
    }
    
    <div class="post-body">
        <h1>@Model.Title</h1>
        <div class="post-meta">
            <span class="date">@Model.PublishedDateTime?.ToString("MMM dd, yyyy")</span>
        </div>
        <div class="content">
            @Html.Raw(Model.Content)
        </div>
    </div>
</article>
```

## 📋 Form Template Patterns (folderType: 3)

### Contact Form Template
```html
<section class="contact-form">
    <h2>Contact Us</h2>
    <form action="/submit-contact" method="post" class="form">
        <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required class="form-control">
        </div>
        
        <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required class="form-control">
        </div>
        
        <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="5" required class="form-control"></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
</section>
```

## 🎨 Widget Template Patterns (folderType: 6)

### Newsletter Signup Widget
```html
<div class="newsletter-widget">
    <h3>Subscribe to Newsletter</h3>
    <form action="/newsletter-signup" method="post" class="newsletter-form">
        <div class="input-group">
            <input type="email" name="email" placeholder="Enter your email" required class="form-control">
            <button type="submit" class="btn btn-primary">Subscribe</button>
        </div>
    </form>
</div>
```

### Social Media Widget
```html
<div class="social-widget">
    <h3>Follow Us</h3>
    <div class="social-links">
        <a href="https://facebook.com/yourpage" class="social-link facebook" target="_blank">
            <i class="fab fa-facebook-f"></i> Facebook
        </a>
        <a href="https://twitter.com/yourhandle" class="social-link twitter" target="_blank">
            <i class="fab fa-twitter"></i> Twitter
        </a>
        <a href="https://instagram.com/yourhandle" class="social-link instagram" target="_blank">
            <i class="fab fa-instagram"></i> Instagram
        </a>
    </div>
</div>
```

## 🔧 Essential Patterns

### Field Access Methods
```csharp
// String fields
@(item.Value<string>("fieldName"))

// Numeric fields  
@(item.Value<int>("quantity"))
@(item.Value<decimal>("price"))
@(item.Value<double>("rating"))

// Date fields
@(item.Value<DateTime>("createdDate"))

// Boolean fields
@(item.Value<bool>("isActive"))

// Safe access with null check
@(item.Value<string>("description") ?? "No description available")
```

### Conditional Rendering
```csharp
@if (!string.IsNullOrEmpty(item.Value<string>("image")))
{
    <img src="@(item.Value<string>("image"))" alt="@(item.Value<string>("name"))" />
}

@if (item.Value<decimal>("price") > 0)
{
    <span class="price">$@(item.Value<decimal>("price"))</span>
}
```

### Partial Template Inclusion
```csharp
// Include another template
@await Html.PartialAsync("../Modules/ProductCard.cshtml", product)

// Pattern for partial paths
$"../{template.FolderType.ToString()}/{template.FileName}.cshtml"
```

### CSS/JavaScript in Templates
```html
<style>
    /* Escape @ character in CSS */
    @@media (max-width: 600px) {
        .responsive-element {
            display: none;
        }
    }
    
    .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
    }
</style>

<script>
    // JavaScript can be included normally
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Template loaded');
    });
</script>
```

## 🎯 Vector Search Keywords

**Template Types**: master layouts, page templates, module templates, post templates, form templates, widget templates
**Development Patterns**: folderType enum, Razor views, field access, conditional rendering, partial inclusion
**Data Integration**: SearchMixDbRequestModel, Value<T> methods, database queries, dynamic models
**UI Components**: responsive design, Bootstrap integration, CSS escaping, JavaScript inclusion
**Content Models**: PageContentViewModel, ModuleContentViewModel, PostContentViewModel, dynamic models
