<script lang="ts">
	import { 
		Table, 
		Database, 
		Plus, 
		Search, 
		Filter,
		MoreHorizontal,
		Edit,
		Trash2,
		RefreshCw,
		Eye,
		ArrowLeft,
		ChevronRight,
		Settings
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { 
		databaseService, 
		databaseTables, 
		databaseStats, 
		selectedTable, 
		databaseLoading 
	} from '$lib/stores';
	import type { TableInfo } from '$lib/services/database';

	let currentView: 'tables' | 'records' = 'tables';
	let searchQuery = '';
	let records: any[] = [];
	let recordsPage = 1;
	let recordsPageSize = 25;
	let recordsTotal = 0;

	// Load initial data
	onMount(async () => {
		await loadTables();
		await loadDatabaseStats();
	});

	async function loadTables() {
		databaseLoading.set(true);
		try {
			const tables = await databaseService.getTables();
			databaseTables.set(tables);
		} catch (error) {
			console.error('Failed to load tables:', error);
		} finally {
			databaseLoading.set(false);
		}
	}

	async function loadDatabaseStats() {
		try {
			const stats = await databaseService.getDatabaseStats();
			databaseStats.set(stats);
		} catch (error) {
			console.error('Failed to load database stats:', error);
		}
	}

	async function selectTableHandler(table: TableInfo) {
		selectedTable.set(table);
		currentView = 'records';
		await loadRecords(table.name);
	}

	async function loadRecords(tableName: string) {
		databaseLoading.set(true);
		try {
			const result = await databaseService.getRecords(tableName, {
				page: recordsPage,
				pageSize: recordsPageSize,
				search: searchQuery,
				searchColumns: ['title', 'name', 'email'] // Adjust based on table
			});
			
			records = result.data;
			recordsTotal = result.count;
		} catch (error) {
			console.error('Failed to load records:', error);
			records = [];
		} finally {
			databaseLoading.set(false);
		}
	}

	function goBackToTables() {
		currentView = 'tables';
		selectedTable.set(null);
		records = [];
	}

	async function handleRefresh() {
		if (currentView === 'tables') {
			await loadTables();
			await loadDatabaseStats();
		} else if ($selectedTable) {
			await loadRecords($selectedTable.name);
		}
	}

	async function handleSearch() {
		if (currentView === 'records' && $selectedTable) {
			recordsPage = 1; // Reset to first page
			await loadRecords($selectedTable.name);
		}
	}

	// Reactive statement to filter tables based on search
	$: filteredTables = $databaseTables.filter(table => 
		table.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
		table.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	function formatNumber(num: number): string {
		return new Intl.NumberFormat().format(num);
	}
</script>

<div class="h-full flex flex-col bg-base-100">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-base-200/60">
		<div class="flex items-center gap-3">
			{#if currentView === 'records'}
				<button class="btn btn-ghost btn-sm btn-circle" on:click={goBackToTables}>
					<ArrowLeft class="w-4 h-4" />
				</button>
			{/if}
			<div class="flex items-center gap-2">
				<Database class="w-5 h-5 text-primary" />
				<h2 class="text-lg font-semibold">
					{currentView === 'tables' ? 'Mix Database' : $selectedTable?.displayName}
				</h2>
			</div>
		</div>
		
		<div class="flex items-center gap-2">
			<button 
				class="btn btn-ghost btn-sm"
				on:click={handleRefresh}
				class:loading={$databaseLoading}
				title="Refresh data"
			>
				<RefreshCw class="w-4 h-4" />
			</button>
			
			{#if $databaseStats}
				<div class="text-sm text-base-content/60">
					{formatNumber($databaseStats.totalTables)} tables • {formatNumber($databaseStats.totalRecords)} records
				</div>
			{/if}
		</div>
	</div>

	{#if currentView === 'tables'}
		<!-- Tables View -->
		<div class="flex-1 flex flex-col">
			<!-- Search and Actions -->
			<div class="p-4 border-b border-base-200/40">
				<div class="flex items-center justify-between gap-4">
					<div class="flex-1 max-w-md">
						<div class="join w-full">
							<input 
								type="text" 
								placeholder="Search tables..." 
								class="input input-bordered join-item flex-1"
								bind:value={searchQuery}
								on:input={handleSearch}
							/>
							<button class="btn btn-outline join-item">
								<Search class="w-4 h-4" />
							</button>
						</div>
					</div>
					
					<div class="flex items-center gap-2">
						<button class="btn btn-outline btn-sm">
							<Filter class="w-4 h-4" />
							Filter
						</button>
						<button class="btn btn-primary btn-sm">
							<Plus class="w-4 h-4" />
							New Table
						</button>
					</div>
				</div>
			</div>

			<!-- Tables List -->
			<div class="flex-1 overflow-auto p-4">
				{#if $databaseLoading}
					<div class="flex items-center justify-center h-32">
						<span class="loading loading-spinner loading-lg"></span>
					</div>
				{:else}
					<div class="grid gap-3">
						{#each filteredTables as table}
							<div class="card bg-base-50 border border-base-200/60 hover:border-primary/30 transition-colors cursor-pointer">
								<div class="card-body p-4" on:click={() => selectTableHandler(table)} on:keydown role="button" tabindex="0">
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
											<div class="dropdown dropdown-end">
												<button class="btn btn-ghost btn-sm btn-circle" tabindex="0">
													<MoreHorizontal class="w-4 h-4" />
												</button>
												<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
													<li><button><Eye class="w-4 h-4" /> View Records</button></li>
													<li><button><Settings class="w-4 h-4" /> Table Settings</button></li>
													<li><button><Edit class="w-4 h-4" /> Edit Schema</button></li>
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
	{:else}
		<!-- Records View -->
		<div class="flex-1 flex flex-col">
			<!-- Search and Actions -->
			<div class="p-4 border-b border-base-200/40">
				<div class="flex items-center justify-between gap-4">
					<div class="flex-1 max-w-md">
						<div class="join w-full">
							<input 
								type="text" 
								placeholder="Search records..." 
								class="input input-bordered join-item flex-1"
								bind:value={searchQuery}
								on:input={handleSearch}
							/>
							<button class="btn btn-outline join-item" on:click={handleSearch}>
								<Search class="w-4 h-4" />
							</button>
						</div>
					</div>
					
					<div class="flex items-center gap-2">
						<button class="btn btn-outline btn-sm">
							<Filter class="w-4 h-4" />
							Filter
						</button>
						<button class="btn btn-primary btn-sm">
							<Plus class="w-4 h-4" />
							New Record
						</button>
					</div>
				</div>
			</div>

			<!-- Records Table -->
			<div class="flex-1 overflow-auto">
				{#if $databaseLoading}
					<div class="flex items-center justify-center h-32">
						<span class="loading loading-spinner loading-lg"></span>
					</div>
				{:else if records.length === 0}
					<div class="flex items-center justify-center h-32 text-base-content/60">
						No records found
					</div>
				{:else}
					<table class="table table-pin-rows">
						<thead>
							<tr class="bg-base-200/50">
								{#if $selectedTable}
									{#each $selectedTable.schema.columns.slice(0, 6) as column}
										<th class="capitalize">{column.name.replace('_', ' ')}</th>
									{/each}
								{/if}
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each records as record}
								<tr class="hover:bg-base-50">
									{#if $selectedTable}
										{#each $selectedTable.schema.columns.slice(0, 6) as column}
											<td class="font-mono text-sm">
												{#if column.type === 'timestamp'}
													{formatDate(record[column.name])}
												{:else if column.name === 'status'}
													<div class="badge {record[column.name] === 'published' ? 'badge-success' : 'badge-warning'} badge-sm">
														{record[column.name]}
													</div>
												{:else}
													{record[column.name] || '-'}
												{/if}
											</td>
										{/each}
									{/if}
									<td>
										<div class="dropdown dropdown-end">
											<button class="btn btn-ghost btn-sm btn-circle" tabindex="0">
												<MoreHorizontal class="w-4 h-4" />
											</button>
											<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
												<li><button><Eye class="w-4 h-4" /> View</button></li>
												<li><button><Edit class="w-4 h-4" /> Edit</button></li>
												<li><hr /></li>
												<li><button class="text-error"><Trash2 class="w-4 h-4" /> Delete</button></li>
											</ul>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>

			<!-- Pagination -->
			<div class="p-4 border-t border-base-200/40">
				<div class="flex items-center justify-between">
					<div class="text-sm text-base-content/60">
						Showing {Math.min((recordsPage - 1) * recordsPageSize + 1, recordsTotal)}-{Math.min(recordsPage * recordsPageSize, recordsTotal)} of {formatNumber(recordsTotal)} records
					</div>
					<div class="join">
						<button 
							class="join-item btn btn-sm" 
							disabled={recordsPage <= 1}
							on:click={() => { recordsPage = Math.max(1, recordsPage - 1); $selectedTable && loadRecords($selectedTable.name); }}
						>
							«
						</button>
						<button class="join-item btn btn-sm btn-active">{recordsPage}</button>
						<button 
							class="join-item btn btn-sm" 
							disabled={recordsPage * recordsPageSize >= recordsTotal}
							on:click={() => { recordsPage++; $selectedTable && loadRecords($selectedTable.name); }}
						>
							»
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>