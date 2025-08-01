<script lang="ts">
import type { TableInfo } from '$lib/services/database';
import { ChevronRight, MoreHorizontal, Database, Eye, Settings, Edit, Trash2 } from 'lucide-svelte';
import { createEventDispatcher } from 'svelte';

export let databases: TableInfo[] = [];
export let loading: boolean = false;
export let filteredTables: TableInfo[] = [];
export let searchQuery: string = '';
export let formatDate: (date: string) => string;
export let formatNumber: (num: number) => string;

const dispatch = createEventDispatcher();

function handleSelect(database: TableInfo) {
  dispatch('select', { database });
}
</script>

<div class="flex-1 flex flex-col">
	<!-- Search and Actions (slot for parent to provide) -->
	<slot name="actions" />

	<!-- Databases List -->
	<div class="flex-1 overflow-auto p-4">
		{#if loading}
			<div class="flex items-center justify-center h-32">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else}
			<div class="grid gap-3">
				{#each filteredTables as database}
					<div class="card bg-base-50 border border-base-200/60 hover:border-primary/30 transition-colors cursor-pointer">
						<div class="card-body p-4" on:click={() => handleSelect(database)} on:keydown role="button" tabindex="0">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="avatar placeholder">
										<div class="bg-primary/10 text-primary rounded w-10 h-10">
											<Database class="w-5 h-5" />
										</div>
									</div>
									<div>
										<h3 class="font-semibold text-base">{database.displayName}</h3>
										<p class="text-sm text-base-content/60">
											{database.description || 'Database'} • Updated {formatDate(database.lastModified)}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-2">
									<ChevronRight class="w-4 h-4 text-base-content/40" />
									<div class="dropdown dropdown-end">
										<button class="btn btn-ghost btn-sm btn-circle" tabindex="0">
											<MoreHorizontal class="w-4 h-4" />
										</button>
										<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
											<li><button><Eye class="w-4 h-4" /> View Tables</button></li>
											<li><button><Settings class="w-4 h-4" /> Database Settings</button></li>
											<li><button><Edit class="w-4 h-4" /> Edit Schema</button></li>
											<li><hr /></li>
											<li><button class="text-error"><Trash2 class="w-4 h-4" /> Delete Database</button></li>
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
