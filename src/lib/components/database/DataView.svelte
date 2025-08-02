<script lang="ts">
import { onMount, createEventDispatcher } from 'svelte';
import { Search, RefreshCw, Download, ChevronLeft, ChevronRight, Table, Database } from 'lucide-svelte';
import { createDataViewService, type TableSchema, type TableDataResult } from '$lib/services/dataView';
import SchemaView from './SchemaView.svelte';
import DataTableView from './DataTableView.svelte';

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

async function handleSort(event: CustomEvent) {
  const { columnName } = event.detail;
  if (sortBy === columnName) {
    sortDirection = sortDirection === 'Asc' ? 'Desc' : 'Asc';
  } else {
    sortBy = columnName;
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

function handleRowSelect(event: CustomEvent) {
  const { rowId } = event.detail;
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
      selectedRows = new Set(tableData.data.items.map((_, index) => index.toString()));
    }
  }
}

function handleViewRecord(event: CustomEvent) {
  const { record } = event.detail;
  dispatch('viewRecord', { record, tableName });
}

function handleEditRecord(event: CustomEvent) {
  const { record } = event.detail;
  dispatch('editRecord', { record, tableName });
}

function handleDeleteRecord(event: CustomEvent) {
  const { record } = event.detail;
  dispatch('deleteRecord', { record, tableName });
}

// Data table functions moved to DataTableView component
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
          <Search class="w-4 h-4" />
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
      <!-- Schema View Component -->
      <SchemaView {schema} />
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
      <!-- Data Table View Component -->
      <DataTableView
        {tableData}
        {schema}
        {sortBy}
        {sortDirection}
        {selectedRows}
        on:sort={handleSort}
        on:rowSelect={handleRowSelect}
        on:selectAll={handleSelectAll}
        on:viewRecord={handleViewRecord}
        on:editRecord={handleEditRecord}
        on:deleteRecord={handleDeleteRecord}
      />
    {/if}
  </div>

  <!-- Pagination (only for data view) -->
  {#if currentView === 'data' && tableData?.data && tableData.data.totalCount > 0}
    <div class="flex items-center justify-between p-4 border-t border-base-200">
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-content/60">
          Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, tableData.data.totalCount)} of {tableData.data.totalCount} results
        </span>
        
        <select class="select select-sm" bind:value={pageSize} on:change={(e) => handlePageSizeChange(Number((e.target as HTMLSelectElement)?.value || pageSize))}>
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