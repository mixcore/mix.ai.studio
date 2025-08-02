<script lang="ts">
import { onMount, createEventDispatcher } from 'svelte';
import { Search, RefreshCw, Download, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, MoreHorizontal, Table, Database, Info, CheckCircle, XCircle, Lock, Key } from 'lucide-svelte';
import { createDataViewService, type TableSchema, type TableDataResult } from '$lib/services/dataView';

export let tableName: string = '';
export let initialPageSize: number = 20;

const dispatch = createEventDispatcher();
const dataViewService = createDataViewService();

// Component state
let loading = false;
let error: string | null = null;
let schema: TableSchema | null = null;
let tableData: TableDataResult | null = null;

// Filter and pagination state
let searchKeyword = '';
let searchColumns: string[] = [];
let currentPage = 0;
let pageSize = initialPageSize;
let sortBy = 'id';
let sortDirection: 'Asc' | 'Desc' = 'Desc';

// UI state
let showFilters = false;
let selectedRows: Set<string> = new Set();
let currentView: 'data' | 'schema' = 'data';

$: if (tableName) {
  loadTableData();
}

onMount(() => {
  if (tableName) {
    loadTableData();
  }
});

async function loadTableData() {
  if (!tableName) return;
  
  loading = true;
  error = null;
  
  try {
    console.log('Loading data for table:', tableName);
    
    // Load schema first
    schema = await dataViewService.getTableSchema(tableName);
    
    if (!schema) {
      // Try to get available tables to help with debugging
      const availableTables = await dataViewService.listTables();
      const availableTablesText = availableTables.length > 0 
        ? `\n\nAvailable tables: ${availableTables.join(', ')}` 
        : '\n\nNo tables found or unable to list tables.';
      
      error = `Table "${tableName}" not found. Please verify the table name exists in the database.${availableTablesText}`;
      return;
    }
    
    console.log('Schema loaded successfully:', schema);
    
    // Load table data
    tableData = await dataViewService.getPaginatedTableData(
      tableName,
      currentPage,
      pageSize,
      sortBy,
      sortDirection
    );
    
    if (!tableData.isSucceed) {
      error = tableData.message || `Failed to load data for table: ${tableName}`;
      return;
    }
    
    console.log('Table data loaded successfully:', tableData);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load table data';
    console.error('Error loading table data:', err);
  } finally {
    loading = false;
  }
}

async function handleSearch() {
  if (!tableName) return;
  
  loading = true;
  currentPage = 0; // Reset to first page
  
  try {
    if (searchKeyword.trim()) {
      tableData = await dataViewService.searchTableData(
        tableName,
        searchKeyword,
        searchColumns.length > 0 ? searchColumns : schema?.columns.map(c => c.name) || [],
        { pageIndex: currentPage, pageSize, sortBy, direction: sortDirection }
      );
    } else {
      tableData = await dataViewService.getPaginatedTableData(
        tableName,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Search failed';
  } finally {
    loading = false;
  }
}

async function handleSort(column: string) {
  if (sortBy === column) {
    sortDirection = sortDirection === 'Asc' ? 'Desc' : 'Asc';
  } else {
    sortBy = column;
    sortDirection = 'Desc';
  }
  
  currentPage = 0; // Reset to first page
  await loadTableData();
}

async function handlePageChange(newPage: number) {
  currentPage = newPage;
  await loadTableData();
}

async function handlePageSizeChange(newPageSize: number) {
  pageSize = newPageSize;
  currentPage = 0; // Reset to first page
  await loadTableData();
}

function handleRowSelect(rowId: string) {
  if (selectedRows.has(rowId)) {
    selectedRows.delete(rowId);
  } else {
    selectedRows.add(rowId);
  }
  selectedRows = selectedRows; // Trigger reactivity
}

function handleSelectAll() {
  if (tableData?.data.items) {
    if (selectedRows.size === tableData.data.items.length) {
      selectedRows.clear();
    } else {
      selectedRows = new Set(tableData.data.items.map((item, index) => index.toString()));
    }
  }
}

function handleViewRecord(record: any) {
  dispatch('viewRecord', { record, tableName });
}

function handleEditRecord(record: any) {
  dispatch('editRecord', { record, tableName });
}

function handleDeleteRecord(record: any) {
  dispatch('deleteRecord', { record, tableName });
}

function formatCellValue(value: any, column: string): string {
  if (value === null || value === undefined) return '';
  
  // Format dates
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(value).toLocaleString();
  }
  
  // Format objects/arrays
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value.toString();
}

function getDisplayColumns(): string[] {
  if (!schema?.columns) return [];
  
  // Show first 6 columns by default, prioritizing common fields
  const priorityColumns = ['id', 'name', 'title', 'displayName', 'email', 'status'];
  const columns = schema.columns.map(c => c.name);
  
  const displayCols = [
    ...columns.filter(col => priorityColumns.includes(col.toLowerCase())),
    ...columns.filter(col => !priorityColumns.includes(col.toLowerCase()))
  ].slice(0, 6);
  
  return displayCols;
}

function getColumnTypeIcon(dataType: string) {
  const type = dataType.toLowerCase();
  if (type.includes('int') || type.includes('number')) return '🔢';
  if (type.includes('string') || type.includes('text') || type.includes('varchar')) return '📝';
  if (type.includes('bool')) return '✅';
  if (type.includes('date') || type.includes('time')) return '📅';
  if (type.includes('json')) return '📋';
  if (type.includes('float') || type.includes('decimal')) return '🔢';
  return '📄';
}

function getColumnTypeColor(dataType: string) {
  const type = dataType.toLowerCase();
  if (type.includes('int') || type.includes('number')) return 'badge-info';
  if (type.includes('string') || type.includes('text') || type.includes('varchar')) return 'badge-success';
  if (type.includes('bool')) return 'badge-warning';
  if (type.includes('date') || type.includes('time')) return 'badge-secondary';
  if (type.includes('json')) return 'badge-accent';
  if (type.includes('float') || type.includes('decimal')) return 'badge-info';
  return 'badge-neutral';
}
</script>

<div class="flex flex-col h-full bg-base-100">
  <!-- Header with title and actions -->
  <div class="flex items-center justify-between p-4 border-b border-base-200">
    <div>
      <h2 class="text-lg font-semibold">{schema?.displayName || tableName}</h2>
      {#if schema?.description}
        <p class="text-sm text-base-content/60">{schema.description}</p>
      {/if}
    </div>
    
    <div class="flex items-center gap-2">
      <!-- View Toggle -->
      <div class="tabs tabs-boxed">
        <button 
          class="tab {currentView === 'data' ? 'tab-active' : ''}"
          on:click={() => currentView = 'data'}
        >
          <Database class="w-4 h-4 mr-1" />
          Data
        </button>
        <button 
          class="tab {currentView === 'schema' ? 'tab-active' : ''}"
          on:click={() => currentView = 'schema'}
        >
          <Table class="w-4 h-4 mr-1" />
          Schema
        </button>
      </div>
      
      {#if currentView === 'data'}
        <button 
          class="btn btn-ghost btn-sm"
          on:click={() => showFilters = !showFilters}
        >
          <Filter class="w-4 h-4" />
          Filters
        </button>
      {/if}
      
      <button 
        class="btn btn-ghost btn-sm" 
        on:click={loadTableData}
        disabled={loading}
      >
        <RefreshCw class={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
      
      <button class="btn btn-ghost btn-sm">
        <Download class="w-4 h-4" />
        Export
      </button>
    </div>
  </div>

  <!-- Search and filters (only for data view) -->
  {#if currentView === 'data'}
    <div class="p-4 space-y-4 border-b border-base-200">
      <!-- Search bar -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search records..."
            class="input input-bordered w-full pl-10"
            bind:value={searchKeyword}
            on:keydown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button class="btn btn-primary" on:click={handleSearch} disabled={loading}>
          Search
        </button>
      </div>
      
      <!-- Advanced filters (collapsible) -->
      {#if showFilters && schema}
        <div class="bg-base-50 p-4 rounded-lg space-y-3">
          <h4 class="font-medium">Search in columns:</h4>
          <div class="flex flex-wrap gap-2">
            {#each schema.columns as column}
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  bind:group={searchColumns}
                  value={column.name}
                />
                <span class="text-sm">{column.displayName || column.name}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Main content area -->
  <div class="flex-1 overflow-auto">
    {#if loading}
      <div class="flex items-center justify-center h-32">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-32">
        <div class="text-center">
          <p class="text-error mb-2">{error}</p>
          <button class="btn btn-sm btn-outline" on:click={loadTableData}>
            Try Again
          </button>
        </div>
      </div>
    {:else if currentView === 'schema' && schema}
      <!-- Schema View -->
      <div class="p-6 space-y-6">
        <!-- Table Info -->
        <div class="card bg-base-50 border border-base-200">
          <div class="card-body">
            <h3 class="card-title flex items-center gap-2">
              <Info class="w-5 h-5" />
              Table Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="text-sm font-medium text-base-content/70">System Name</label>
                <p class="font-mono text-sm bg-base-100 p-2 rounded">{schema.systemName}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-base-content/70">Display Name</label>
                <p class="text-sm bg-base-100 p-2 rounded">{schema.displayName}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-base-content/70">Database ID</label>
                <p class="font-mono text-sm bg-base-100 p-2 rounded">{schema.mixDbDatabaseId}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-base-content/70">Status</label>
                <span class="badge badge-success">{schema.status}</span>
              </div>
              {#if schema.description}
                <div class="md:col-span-2">
                  <label class="text-sm font-medium text-base-content/70">Description</label>
                  <p class="text-sm bg-base-100 p-2 rounded">{schema.description}</p>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Columns Schema -->
        <div class="card bg-base-50 border border-base-200">
          <div class="card-body">
            <h3 class="card-title flex items-center gap-2">
              <Table class="w-5 h-5" />
              Columns ({schema.columns.length})
            </h3>
            
            <div class="overflow-x-auto mt-4">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Constraints</th>
                    <th>Default Value</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {#each schema.columns as column}
                    <tr>
                      <td>
                        <div class="flex items-center gap-2">
                          <span class="text-lg">{getColumnTypeIcon(column.dataType)}</span>
                          <div>
                            <div class="font-medium">{column.displayName}</div>
                            <div class="text-xs text-base-content/60 font-mono">{column.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge {getColumnTypeColor(column.dataType)} badge-sm">
                          {column.dataType}
                        </span>
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-1">
                          {#if column.isRequired}
                            <span class="badge badge-error badge-xs">
                              <XCircle class="w-3 h-3 mr-1" />
                              Required
                            </span>
                          {:else}
                            <span class="badge badge-success badge-xs">
                              <CheckCircle class="w-3 h-3 mr-1" />
                              Optional
                            </span>
                          {/if}
                          {#if column.isUnique}
                            <span class="badge badge-warning badge-xs">
                              <Key class="w-3 h-3 mr-1" />
                              Unique
                            </span>
                          {/if}
                          {#if column.maxLength}
                            <span class="badge badge-info badge-xs">
                              Max: {column.maxLength}
                            </span>
                          {/if}
                        </div>
                      </td>
                      <td>
                        {#if column.defaultValue}
                          <code class="text-xs bg-base-200 px-2 py-1 rounded">
                            {column.defaultValue}
                          </code>
                        {:else}
                          <span class="text-base-content/40 text-xs">None</span>
                        {/if}
                      </td>
                      <td>
                        {#if column.description}
                          <span class="text-sm">{column.description}</span>
                        {:else}
                          <span class="text-base-content/40 text-xs">No description</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    {:else if currentView === 'data' && tableData?.data.items.length === 0}
      <div class="flex items-center justify-center h-32">
        <div class="text-center">
          <p class="text-base-content/60 mb-2">No records found in this table</p>
          <p class="text-sm text-base-content/40">The table "{tableName}" exists but contains no data</p>
          {#if tableName === 'mix_ai_agents'}
            <div class="mt-4">
              <p class="text-xs text-base-content/50 mb-2">Try testing with a table that has data:</p>
              <button 
                class="btn btn-sm btn-outline" 
                on:click={() => dispatch('switchTable', { tableName: 'mix_dish' })}
              >
                Test with mix_dish table
              </button>
            </div>
          {/if}
        </div>
      </div>
    {:else if currentView === 'data' && tableData?.data.items && schema}
      <!-- Data Table View -->
      <table class="table table-pin-rows table-pin-cols">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                class="checkbox"
                checked={selectedRows.size === tableData.data.items.length && tableData.data.items.length > 0}
                on:change={handleSelectAll}
              />
            </th>
            {#each getDisplayColumns() as columnName}
              {@const column = schema.columns.find(c => c.name === columnName)}
              <th>
                <button
                  class="flex items-center gap-1 hover:text-primary transition-colors"
                  on:click={() => handleSort(columnName)}
                >
                  {column?.displayName || columnName}
                  {#if sortBy === columnName}
                    <span class="text-xs">
                      {sortDirection === 'Asc' ? '↑' : '↓'}
                    </span>
                  {/if}
                </button>
              </th>
            {/each}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each tableData.data.items as record, index}
            <tr class="hover">
              <td>
                <input
                  type="checkbox"
                  class="checkbox"
                  checked={selectedRows.has(index.toString())}
                  on:change={() => handleRowSelect(index.toString())}
                />
              </td>
              {#each getDisplayColumns() as columnName}
                <td class="max-w-xs truncate">
                  {formatCellValue(record[columnName], columnName)}
                </td>
              {/each}
              <td>
                <div class="dropdown dropdown-end">
                  <button class="btn btn-ghost btn-sm btn-circle">
                    <MoreHorizontal class="w-4 h-4" />
                  </button>
                  <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button on:click={() => handleViewRecord(record)}>
                        <Eye class="w-4 h-4" />
                        View
                      </button>
                    </li>
                    <li>
                      <button on:click={() => handleEditRecord(record)}>
                        <Edit class="w-4 h-4" />
                        Edit
                      </button>
                    </li>
                    <li>
                      <button on:click={() => handleDeleteRecord(record)} class="text-error">
                        <Trash2 class="w-4 h-4" />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <!-- Pagination (only for data view) -->
  {#if currentView === 'data' && tableData?.data && tableData.data.totalCount > 0}
    <div class="flex items-center justify-between p-4 border-t border-base-200">
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-content/60">
          Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, tableData.data.totalCount)} of {tableData.data.totalCount} results
        </span>
        
        <select class="select select-sm" bind:value={pageSize} on:change={(e) => handlePageSizeChange(Number(e.target.value))}>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
      
      <div class="flex items-center gap-2">
        <button
          class="btn btn-sm btn-outline"
          disabled={currentPage === 0}
          on:click={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </button>
        
        <span class="text-sm">
          Page {currentPage + 1} of {tableData.data.totalPages}
        </span>
        
        <button
          class="btn btn-sm btn-outline"
          disabled={currentPage >= tableData.data.totalPages - 1}
          on:click={() => handlePageChange(currentPage + 1)}
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  {/if}
</div>