<script lang="ts">
import { createEventDispatcher } from 'svelte';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-svelte';
import type { TableSchema, TableDataResult } from '$lib/services/dataView';

export let tableData: TableDataResult;
export let schema: TableSchema;
export let sortBy: string;
export let sortDirection: 'Asc' | 'Desc';
export let selectedRows: Set<string>;

const dispatch = createEventDispatcher();

function handleSort(columnName: string) {
  dispatch('sort', { columnName });
}

function handleRowSelect(rowId: string) {
  dispatch('rowSelect', { rowId });
}

function handleSelectAll() {
  dispatch('selectAll');
}

function handleViewRecord(record: any) {
  dispatch('viewRecord', { record });
}

function handleEditRecord(record: any) {
  dispatch('editRecord', { record });
}

function handleDeleteRecord(record: any) {
  dispatch('deleteRecord', { record });
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
</script>

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
            <button class="btn btn-ghost btn-sm btn-circle" tabindex="0">
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