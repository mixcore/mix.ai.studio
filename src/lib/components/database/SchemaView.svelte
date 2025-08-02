<script lang="ts">
import { 
  Table, CheckCircle, XCircle, Key, Hash, Type, Calendar, FileText, Database, Code, Settings, Shield,
  Globe, Mail, Lock, Image, CreditCard, MapPin, Upload, Palette, Link, Video, QrCode, 
  BarChart3, Tags, Layers, Radio, Clock, Phone, User, Edit, Monitor
} from 'lucide-svelte';
import type { TableSchema } from '$lib/services/dataView';

export let schema: TableSchema;

function getColumnTypeIcon(dataType: string) {
  const type = dataType.toLowerCase();
  
  // Numeric types
  if (type === 'integer' || type === 'long' || type === 'double') return Hash;
  if (type === 'guid') return Key;
  
  // String and text types
  if (type === 'string') return FileText;
  if (type === 'text' || type === 'multilinetext') return Edit;
  if (type === 'html' || type === 'tuieditor') return Monitor;
  
  // Boolean
  if (type === 'boolean') return CheckCircle;
  
  // Date/Time types
  if (type === 'datetime' || type === 'datetimelocal') return Calendar;
  if (type === 'date') return Calendar;
  if (type === 'time' || type === 'duration') return Clock;
  
  // Contact/Communication
  if (type === 'emailaddress') return Mail;
  if (type === 'phonenumber') return Phone;
  if (type === 'url') return Globe;
  
  // Media and files
  if (type === 'imageurl') return Image;
  if (type === 'upload') return Upload;
  if (type === 'videoyoutube') return Video;
  
  // Security
  if (type === 'password') return Lock;
  
  // Financial
  if (type === 'creditcard') return CreditCard;
  
  // Location
  if (type === 'postalcode') return MapPin;
  
  // Visual/UI
  if (type === 'color') return Palette;
  if (type === 'icon') return User;
  
  // Codes and identifiers
  if (type === 'qrcode') return QrCode;
  if (type === 'barcode') return BarChart3;
  
  // Data structures
  if (type === 'json') return Code;
  if (type === 'array' || type === 'arraymedia') return Layers;
  if (type === 'arrayradio') return Radio;
  if (type === 'tag') return Tags;
  
  // Special types
  if (type === 'reference') return Link;
  if (type === 'custom') return Settings;
  
  // Default
  return Type;
}

function getColumnTypeColor(dataType: string) {
  const type = dataType.toLowerCase();
  
  // Numeric types - Blue family
  if (type === 'integer' || type === 'long' || type === 'double') return 'text-blue-600 bg-blue-50 border-blue-200';
  if (type === 'guid') return 'text-indigo-600 bg-indigo-50 border-indigo-200';
  
  // String and text types - Green family
  if (type === 'string') return 'text-green-600 bg-green-50 border-green-200';
  if (type === 'text' || type === 'multilinetext') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (type === 'html' || type === 'tuieditor') return 'text-teal-600 bg-teal-50 border-teal-200';
  
  // Boolean - Orange
  if (type === 'boolean') return 'text-orange-600 bg-orange-50 border-orange-200';
  
  // Date/Time types - Purple family
  if (type === 'datetime' || type === 'datetimelocal') return 'text-purple-600 bg-purple-50 border-purple-200';
  if (type === 'date') return 'text-violet-600 bg-violet-50 border-violet-200';
  if (type === 'time' || type === 'duration') return 'text-purple-500 bg-purple-50 border-purple-200';
  
  // Contact/Communication - Sky family
  if (type === 'emailaddress') return 'text-sky-600 bg-sky-50 border-sky-200';
  if (type === 'phonenumber') return 'text-cyan-600 bg-cyan-50 border-cyan-200';
  if (type === 'url') return 'text-blue-500 bg-blue-50 border-blue-200';
  
  // Media and files - Pink family
  if (type === 'imageurl') return 'text-pink-600 bg-pink-50 border-pink-200';
  if (type === 'upload') return 'text-rose-600 bg-rose-50 border-rose-200';
  if (type === 'videoyoutube') return 'text-red-600 bg-red-50 border-red-200';
  
  // Security - Red
  if (type === 'password') return 'text-red-700 bg-red-50 border-red-200';
  
  // Financial - Yellow
  if (type === 'creditcard') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  
  // Location - Amber
  if (type === 'postalcode') return 'text-amber-600 bg-amber-50 border-amber-200';
  
  // Visual/UI - Lime family
  if (type === 'color') return 'text-lime-600 bg-lime-50 border-lime-200';
  if (type === 'icon') return 'text-green-500 bg-green-50 border-green-200';
  
  // Codes and identifiers - Slate family
  if (type === 'qrcode') return 'text-slate-600 bg-slate-50 border-slate-200';
  if (type === 'barcode') return 'text-gray-600 bg-gray-50 border-gray-200';
  
  // Data structures - Fuchsia family
  if (type === 'json') return 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200';
  if (type === 'array' || type === 'arraymedia') return 'text-purple-600 bg-purple-50 border-purple-200';
  if (type === 'arrayradio') return 'text-violet-600 bg-violet-50 border-violet-200';
  if (type === 'tag') return 'text-indigo-500 bg-indigo-50 border-indigo-200';
  
  // Special types - Neutral
  if (type === 'reference') return 'text-zinc-600 bg-zinc-50 border-zinc-200';
  if (type === 'custom') return 'text-neutral-600 bg-neutral-50 border-neutral-200';
  
  // Default
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

function getColumnTypeBadgeColor(dataType: string) {
  const type = dataType.toLowerCase();
  
  // Numeric types
  if (type === 'integer' || type === 'long' || type === 'double') return 'badge-info';
  if (type === 'guid') return 'badge-primary';
  
  // String and text types
  if (type === 'string' || type === 'text' || type === 'multilinetext') return 'badge-success';
  if (type === 'html' || type === 'tuieditor') return 'badge-accent';
  
  // Boolean
  if (type === 'boolean') return 'badge-warning';
  
  // Date/Time types
  if (type === 'datetime' || type === 'datetimelocal' || type === 'date' || type === 'time' || type === 'duration') return 'badge-secondary';
  
  // Contact/Communication
  if (type === 'emailaddress' || type === 'phonenumber' || type === 'url') return 'badge-info';
  
  // Media and files
  if (type === 'imageurl' || type === 'upload' || type === 'videoyoutube') return 'badge-error';
  
  // Security
  if (type === 'password') return 'badge-error';
  
  // Financial
  if (type === 'creditcard') return 'badge-warning';
  
  // Location
  if (type === 'postalcode') return 'badge-warning';
  
  // Visual/UI
  if (type === 'color' || type === 'icon') return 'badge-success';
  
  // Codes and identifiers
  if (type === 'qrcode' || type === 'barcode') return 'badge-neutral';
  
  // Data structures
  if (type === 'json' || type === 'array' || type === 'arraymedia' || type === 'arrayradio' || type === 'tag') return 'badge-accent';
  
  // Special types
  if (type === 'reference') return 'badge-ghost';
  if (type === 'custom') return 'badge-neutral';
  
  return 'badge-neutral';
}

// Removed unused getConstraintIcon function

// Statistics calculations
$: totalColumns = schema.columns.length;
$: requiredColumns = schema.columns.filter(c => c.isRequired).length;
$: uniqueColumns = schema.columns.filter(c => c.isUnique).length;
$: columnTypes = [...new Set(schema.columns.map(c => c.dataType))];
</script>

<div class="p-6 max-w-full">
  <!-- Supabase-inspired Header with Breadcrumb -->
  <div class="flex flex-col gap-6 mb-8">
    <!-- Breadcrumb Navigation -->
    <div class="breadcrumbs text-sm">
      <ul>
        <li><a class="text-base-content/60 hover:text-base-content">Database</a></li>
        <li><a class="text-base-content/60 hover:text-base-content">Tables</a></li>
        <li class="text-base-content font-medium">{schema.displayName}</li>
      </ul>
    </div>

    <!-- Hero Section -->
    <div class="hero bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-base-200">
      <div class="hero-content w-full">
        <div class="flex w-full items-center justify-between">
          <div class="flex items-center gap-6">
            <div class="avatar">
              <div class="w-16 h-16 rounded-xl bg-primary text-primary-content flex items-center justify-center">
                <Database class="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 class="text-3xl font-bold">{schema.displayName}</h1>
              <p class="text-base-content/70 font-mono text-sm">{schema.systemName}</p>
              {#if schema.description}
                <p class="text-base-content/80 mt-2 max-w-md">{schema.description}</p>
              {/if}
            </div>
          </div>
          <div class="text-right">
            <div class="badge badge-lg {schema.status === 'Published' ? 'badge-success' : 'badge-warning'} mb-2">
              {schema.status}
            </div>
            <div class="text-sm text-base-content/60">
              <div class="flex items-center gap-1 justify-end">
                <Database class="w-3 h-3" />
                DB: {schema.mixDbDatabaseId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats with daisyUI Stats Component -->
    <div class="stats stats-horizontal shadow-sm bg-base-100 border border-base-200">
      <div class="stat">
        <div class="stat-figure text-primary">
          <Table class="w-8 h-8" />
        </div>
        <div class="stat-title">Total Columns</div>
        <div class="stat-value text-primary">{totalColumns}</div>
        <div class="stat-desc">Fields in this table</div>
      </div>
      
      <div class="stat">
        <div class="stat-figure text-error">
          <XCircle class="w-8 h-8" />
        </div>
        <div class="stat-title">Required</div>
        <div class="stat-value text-error">{requiredColumns}</div>
        <div class="stat-desc">{requiredColumns} mandatory fields</div>
      </div>
      
      <div class="stat">
        <div class="stat-figure text-warning">
          <Key class="w-8 h-8" />
        </div>
        <div class="stat-title">Unique</div>
        <div class="stat-value text-warning">{uniqueColumns}</div>
        <div class="stat-desc">{uniqueColumns} unique constraints</div>
      </div>
      
      <div class="stat">
        <div class="stat-figure text-info">
          <Type class="w-8 h-8" />
        </div>
        <div class="stat-title">Data Types</div>
        <div class="stat-value text-info">{columnTypes.length}</div>
        <div class="stat-desc">{columnTypes.length} different types</div>
      </div>
    </div>
  </div>

  <!-- Tabs for Different Views -->
  <div role="tablist" class="tabs tabs-boxed bg-base-200 mb-6 w-fit">
    <input type="radio" name="schema_tabs" role="tab" class="tab" aria-label="Overview" checked />
    <div role="tabpanel" class="tab-content"></div>
    
    <input type="radio" name="schema_tabs" role="tab" class="tab" aria-label="Quick Reference" />
    <div role="tabpanel" class="tab-content"></div>
  </div>

  <!-- Main Content Area -->
  <div class="grid gap-8">
    <!-- Type Legend -->
    <div class="alert alert-info border-info/20 bg-info/5">
      <div class="flex items-center gap-2">
        <Type class="w-5 h-5" />
        <div>
          <h4 class="font-semibold">Data Types in Use</h4>
          <div class="flex flex-wrap gap-2 mt-2">
            {#each columnTypes as type}
              <div class="badge {getColumnTypeBadgeColor(type)} badge-sm gap-1">
                <svelte:component this={getColumnTypeIcon(type)} class="w-3 h-3" />
                {type}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Quick Reference Table (Your Favorite!) -->
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body">
        <div class="flex items-center justify-between mb-6">
          <h2 class="card-title text-xl flex items-center gap-2">
            <Table class="w-6 h-6 text-primary" />
            Schema Reference
          </h2>
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
              <Settings class="w-4 h-4" />
              Options
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a>Export Schema</a></li>
              <li><a>Copy SQL</a></li>
              <li><a>View Relationships</a></li>
            </ul>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="table table-zebra table-pin-rows">
            <thead>
              <tr class="bg-base-200">
                <th class="text-left font-semibold">Column</th>
                <th class="text-center font-semibold">Type</th>
                <th class="text-center font-semibold">Nullable</th>
                <th class="text-center font-semibold">Unique</th>
                <th class="text-center font-semibold">Default</th>
                <th class="text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {#each schema.columns as column, index}
                <tr class="hover:bg-base-50 group">
                  <td class="font-medium">
                    <div class="flex items-center gap-3">
                      <div class="avatar placeholder">
                        <div class="w-8 h-8 rounded border {getColumnTypeColor(column.dataType)}">
                          <svelte:component this={getColumnTypeIcon(column.dataType)} class="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <div class="font-semibold text-sm">{column.displayName}</div>
                        <div class="text-xs font-mono text-base-content/60">{column.name}</div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="tooltip" data-tip="{column.dataType} data type">
                      <div class="badge {getColumnTypeBadgeColor(column.dataType)} badge-sm font-mono">
                        {column.dataType}
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    {#if column.isRequired}
                      <div class="tooltip" data-tip="Required field">
                        <div class="badge badge-error badge-sm gap-1">
                          <XCircle class="w-3 h-3" />
                          No
                        </div>
                      </div>
                    {:else}
                      <div class="tooltip" data-tip="Optional field">
                        <div class="badge badge-success badge-sm gap-1">
                          <CheckCircle class="w-3 h-3" />
                          Yes
                        </div>
                      </div>
                    {/if}
                  </td>
                  <td class="text-center">
                    {#if column.isUnique}
                      <div class="tooltip" data-tip="Unique constraint">
                        <div class="badge badge-warning badge-sm gap-1">
                          <Key class="w-3 h-3" />
                          Yes
                        </div>
                      </div>
                    {:else}
                      <span class="text-base-content/40">—</span>
                    {/if}
                  </td>
                  <td class="text-center">
                    {#if column.defaultValue}
                      <div class="tooltip" data-tip="Default: {column.defaultValue}">
                        <kbd class="kbd kbd-sm">{column.defaultValue}</kbd>
                      </div>
                    {:else}
                      <span class="text-base-content/40">—</span>
                    {/if}
                  </td>
                  <td>
                    {#if column.description}
                      <span class="text-sm">{column.description}</span>
                    {:else}
                      <span class="text-base-content/40 italic text-xs">No description</span>
                    {/if}
                    {#if column.maxLength}
                      <div class="badge badge-outline badge-xs ml-2">
                        Max: {column.maxLength}
                      </div>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Table Footer with Summary -->
        <div class="flex justify-between items-center mt-6 pt-4 border-t border-base-200">
          <div class="text-sm text-base-content/60">
            Showing {schema.columns.length} columns
          </div>
          <div class="flex gap-2">
            <div class="badge badge-outline badge-sm">
              {requiredColumns} required
            </div>
            <div class="badge badge-outline badge-sm">
              {uniqueColumns} unique
            </div>
            <div class="badge badge-outline badge-sm">
              {columnTypes.length} types
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Collapsible Sections for Additional Details -->
    <div class="join join-vertical w-full">
      <div class="collapse collapse-arrow join-item border border-base-300">
        <input type="radio" name="details-accordion" />
        <div class="collapse-title text-lg font-medium">
          <div class="flex items-center gap-2">
            <Settings class="w-5 h-5" />
            Column Details
          </div>
        </div>
        <div class="collapse-content">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {#each schema.columns as column}
              <div class="card card-compact bg-base-50 border border-base-200 hover:shadow-md transition-shadow">
                <div class="card-body">
                  <div class="flex items-center gap-2 mb-3">
                    <div class="p-2 rounded-lg border {getColumnTypeColor(column.dataType)}">
                      <svelte:component this={getColumnTypeIcon(column.dataType)} class="w-4 h-4" />
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-sm">{column.displayName}</h3>
                      <p class="text-xs font-mono text-base-content/60">{column.name}</p>
                    </div>
                    <div class="badge {getColumnTypeBadgeColor(column.dataType)} badge-xs">
                      {column.dataType}
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex flex-wrap gap-1">
                      <div class="badge {column.isRequired ? 'badge-error' : 'badge-success'} badge-xs">
                        {column.isRequired ? 'Required' : 'Optional'}
                      </div>
                      {#if column.isUnique}
                        <div class="badge badge-warning badge-xs">Unique</div>
                      {/if}
                      {#if column.maxLength}
                        <div class="badge badge-info badge-xs">Max: {column.maxLength}</div>
                      {/if}
                    </div>
                    
                    {#if column.description}
                      <p class="text-xs text-base-content/80">{column.description}</p>
                    {/if}
                    
                    {#if column.defaultValue}
                      <div class="text-xs">
                        <span class="text-base-content/60">Default:</span>
                        <kbd class="kbd kbd-xs ml-1">{column.defaultValue}</kbd>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>