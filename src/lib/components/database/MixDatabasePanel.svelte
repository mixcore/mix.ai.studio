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

	let currentView: 'tables' | 'records' = 'tables';
	let selectedTable: string | null = null;
	let searchQuery = '';
	let loading = false;

	// Mock data - replace with real Mixcore API calls
	const mockTables = [
		{ id: 'users', name: 'Users', recordCount: 125, lastModified: '2025-01-13 10:30' },
		{ id: 'posts', name: 'Posts', recordCount: 1847, lastModified: '2025-01-13 09:15' },
		{ id: 'categories', name: 'Categories', recordCount: 23, lastModified: '2025-01-12 16:45' },
		{ id: 'comments', name: 'Comments', recordCount: 4521, lastModified: '2025-01-13 11:20' },
		{ id: 'pages', name: 'Pages', recordCount: 87, lastModified: '2025-01-11 14:30' }
	];

	const mockRecords = [
		{ id: 1, title: 'Welcome to Mixcore', author: 'Admin', status: 'Published', created: '2025-01-10' },
		{ id: 2, title: 'Getting Started Guide', author: 'Editor', status: 'Draft', created: '2025-01-11' },
		{ id: 3, title: 'API Documentation', author: 'Developer', status: 'Published', created: '2025-01-12' },
		{ id: 4, title: 'Feature Updates', author: 'Admin', status: 'Published', created: '2025-01-13' }
	];

	function selectTable(tableId: string, tableName: string) {
		selectedTable = tableName;
		currentView = 'records';
	}

	function goBackToTables() {
		currentView = 'tables';
		selectedTable = null;
	}

	function handleRefresh() {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 1000);
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
					{currentView === 'tables' ? 'Mix Database' : selectedTable}
				</h2>
			</div>
		</div>
		
		<div class="flex items-center gap-2">
			<button 
				class="btn btn-ghost btn-sm"
				on:click={handleRefresh}
				class:loading
				title="Refresh data"
			>
				<RefreshCw class="w-4 h-4" />
			</button>
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
				<div class="grid gap-3">
					{#each mockTables as table}
						<div class="card bg-base-50 border border-base-200/60 hover:border-primary/30 transition-colors cursor-pointer">
							<div class="card-body p-4" on:click={() => selectTable(table.id, table.name)} on:keydown role="button" tabindex="0">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="avatar placeholder">
											<div class="bg-primary/10 text-primary rounded w-10 h-10">
												<Table class="w-5 h-5" />
											</div>
										</div>
										<div>
											<h3 class="font-semibold text-base">{table.name}</h3>
											<p class="text-sm text-base-content/60">
												{table.recordCount} records • Updated {table.lastModified}
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
							New Record
						</button>
					</div>
				</div>
			</div>

			<!-- Records Table -->
			<div class="flex-1 overflow-auto">
				<table class="table table-pin-rows">
					<thead>
						<tr class="bg-base-200/50">
							<th>ID</th>
							<th>Title</th>
							<th>Author</th>
							<th>Status</th>
							<th>Created</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each mockRecords as record}
							<tr class="hover:bg-base-50">
								<td class="font-mono text-sm">{record.id}</td>
								<td class="font-medium">{record.title}</td>
								<td>{record.author}</td>
								<td>
									<div class="badge {record.status === 'Published' ? 'badge-success' : 'badge-warning'} badge-sm">
										{record.status}
									</div>
								</td>
								<td class="text-sm text-base-content/70">{record.created}</td>
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
			</div>

			<!-- Pagination -->
			<div class="p-4 border-t border-base-200/40">
				<div class="flex items-center justify-between">
					<div class="text-sm text-base-content/60">
						Showing 1-4 of 4 records
					</div>
					<div class="join">
						<button class="join-item btn btn-sm">«</button>
						<button class="join-item btn btn-sm btn-active">1</button>
						<button class="join-item btn btn-sm">»</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>