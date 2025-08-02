<script lang="ts">
import type { TableInfo } from '$lib/services/database';
import { ChevronRight, MoreHorizontal, Table, Eye, Settings, Edit, Trash2, Download, Upload } from 'lucide-svelte';
import { createEventDispatcher } from 'svelte';

export let tables: TableInfo[] = [];
export let loading: boolean = false;
export let filteredTables: TableInfo[] = [];
export let searchQuery: string = '';
export let formatDate: (date: string) => string;
export let formatNumber: (num: number) => string;

const dispatch = createEventDispatcher();

function handleSelect(table: TableInfo) {
	dispatch('select', { table });
}
function handleExport(table: TableInfo) {
	dispatch('export', { table });
}
function handleImport(table: TableInfo) {
	dispatch('import', { table });
}
function handleSettings(table: TableInfo) {
	dispatch('settings', { table });
}
function handleView(table: TableInfo) {
	dispatch('view', { table });
}
function handleEdit(table: TableInfo) {
	dispatch('edit', { table });
}
function handleDelete(table: TableInfo) {
	dispatch('delete', { table });
}
</script>

<div class="flex-1 flex flex-col">
	<!-- Search and Actions (slot for parent to provide) -->
	<slot name="actions" />

	<!-- Tables List -->
	<div class="flex-1 overflow-auto p-4">
		{#if loading}
			<div class="flex items-center justify-center h-32">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else}
			<div class="grid gap-3">
				{#each filteredTables as table}
					<div class="card bg-base-50 border border-base-200/60 hover:border-primary/30 transition-colors cursor-pointer">
						<div class="card-body p-4" on:click={() => handleSelect(table)} on:keydown role="button" tabindex="0">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="avatar placeholder">
										<div class="bg-primary/10 text-primary rounded w-10 h-10">
											<Table class="w-5 h-5" />
										</div>
									</div>
									<div>
										<h3 class="font-semibold text-base">{table.displayName}</h3>
										<p class="text-sm text-base-content/60">
											{formatNumber(table.recordCount)} records • Updated {formatDate(table.lastModified)}
										</p>
										{#if table.description}
											<p class="text-xs text-base-content/50 mt-1">{table.description}</p>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-2">
									<ChevronRight class="w-4 h-4 text-base-content/40" />
									<div class="dropdown dropdown-end" on:click|stopPropagation>
										<button class="btn btn-ghost btn-sm btn-circle" tabindex="0">
											<MoreHorizontal class="w-4 h-4" />
										</button>
										<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
											<li><button><Eye class="w-4 h-4" /> View Records</button></li>
											<li><button><Settings class="w-4 h-4" /> Table Settings</button></li>
											<li><button><Edit class="w-4 h-4" /> Edit Schema</button></li>
											<li><hr /></li>
											<li><button on:click={() => handleExport(table)}><Download class="w-4 h-4" /> Export Data</button></li>
											<li><button on:click={() => handleImport(table)}><Upload class="w-4 h-4" /> Import Data</button></li>
											<li><hr /></li>
											<li><button class="text-error"><Trash2 class="w-4 h-4" /> Delete Table</button></li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
