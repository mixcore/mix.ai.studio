
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
  Settings,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  X
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
import DatabaseListView from './DatabaseListView.svelte';
import TablesListView from './TablesListView.svelte';

	let currentView: 'databases' | 'tables' | 'records' = 'databases';
	let selectedDatabase: TableInfo | null = null;
	let searchQuery = '';
	let records: any[] = [];
	let recordsPage = 1;
	let recordsPageSize = 25;
	let recordsTotal = 0;
	
	// Import/Export state
	let showImportModal = false;
	let showExportModal = false;
	let importFile: File | null = null;
	let exportFormat: 'csv' | 'json' | 'xlsx' = 'csv';
	let importProgress = 0;
	let exportProgress = 0;
	let operationMessage = '';
	let operationError = '';
	
	// File input reference
	let fileInput: HTMLInputElement;

	// Load initial data
	onMount(async () => {
		await loadDatabases();
		await loadDatabaseStats();
	});

	async function loadDatabases() {
		databaseLoading.set(true);
		try {
			const databases = await databaseService.getTables(); // This now returns databases
			databaseTables.set(databases);
		} catch (error) {
			console.error('Failed to load databases:', error);
		} finally {
			databaseLoading.set(false);
		}
	}
	
	async function loadTablesForDatabase(database: TableInfo) {
		databaseLoading.set(true);
		try {
			const tables = await databaseService.getTablesForDatabase(database.id);
			databaseTables.set(tables);
			selectedDatabase = database;
		} catch (error) {
			console.error('Failed to load tables for database:', error);
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

	async function selectDatabaseHandler(database: TableInfo) {
		currentView = 'tables';
		await loadTablesForDatabase(database);
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
		if (currentView === 'records') {
			currentView = 'tables';
			selectedTable.set(null);
			records = [];
		} else if (currentView === 'tables') {
			currentView = 'databases';
			selectedDatabase = null;
			loadDatabases();
		}
	}

	async function handleRefresh() {
		if (currentView === 'databases') {
			await loadDatabases();
			await loadDatabaseStats();
		} else if (currentView === 'tables' && selectedDatabase) {
			await loadTablesForDatabase(selectedDatabase);
		} else if (currentView === 'records' && $selectedTable) {
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
	
	// Import/Export functions
	async function handleExport(tableId: string, format: 'csv' | 'json' | 'xlsx' = 'csv') {
		try {
			exportProgress = 0;
			operationError = '';
			operationMessage = `Exporting ${tableId} as ${format.toUpperCase()}...`;
			
			const blob = await databaseService.exportTable(tableId, format);
			exportProgress = 100;
			
			// Download the file
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${tableId}.${format}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			
			operationMessage = `Successfully exported ${tableId}`;
			setTimeout(() => {
				showExportModal = false;
				operationMessage = '';
				exportProgress = 0;
			}, 2000);
		} catch (error) {
			console.error('Export failed:', error);
			operationError = error instanceof Error ? error.message : 'Export failed';
			exportProgress = 0;
		}
	}
	
	async function handleImport(tableId: string, file: File) {
		if (!file || !tableId) return;
		
		try {
			importProgress = 0;
			operationError = '';
			operationMessage = `Importing data to ${tableId}...`;
			
			const importedCount = await databaseService.importTable(tableId, file);
			importProgress = 100;
			
			operationMessage = `Successfully imported ${importedCount} records to ${tableId}`;
			
			// Refresh the records if we're currently viewing this table
			if ($selectedTable?.id === tableId) {
				await loadRecords(tableId);
			}
			
			setTimeout(() => {
				showImportModal = false;
				operationMessage = '';
				importProgress = 0;
				importFile = null;
			}, 2000);
		} catch (error) {
			console.error('Import failed:', error);
			operationError = error instanceof Error ? error.message : 'Import failed';
			importProgress = 0;
		}
	}
	
	function selectFile() {
		fileInput?.click();
	}
	
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			importFile = file;
		}
	}
	
	function resetImportModal() {
		showImportModal = false;
		importFile = null;
		operationMessage = '';
		operationError = '';
		importProgress = 0;
	}
	
	function resetExportModal() {
		showExportModal = false;
		exportFormat = 'csv';
		operationMessage = '';
		operationError = '';
		exportProgress = 0;
	}
</script>

<div class="h-full flex flex-col bg-base-100">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-base-200/60">
		<div class="flex items-center gap-3">
			{#if currentView === 'tables' || currentView === 'records'}
				<button class="btn btn-ghost btn-sm btn-circle" on:click={goBackToTables}>
					<ArrowLeft class="w-4 h-4" />
				</button>
			{/if}
			<div class="flex items-center gap-2">
				<Database class="w-5 h-5 text-primary" />
				<h2 class="text-lg font-semibold">
					{#if currentView === 'databases'}
						Mix Databases
					{:else if currentView === 'tables'}
						{selectedDatabase?.displayName} Tables
					{:else}
						{$selectedTable?.displayName}
					{/if}
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

  {#if currentView === 'databases'}
	<DatabaseListView
	  {filteredTables}
	  loading={$databaseLoading}
	  {searchQuery}
	  {formatDate}
	  {formatNumber}
	  on:select={(e) => selectDatabaseHandler(e.detail.database)}
	>
	  <div slot="actions" class="p-4 border-b border-base-200/40">
		<div class="flex items-center justify-between gap-4">
		  <div class="flex-1 max-w-md">
			<div class="join w-full">
			  <input 
				type="text" 
				placeholder="Search databases..." 
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
			  New Database
			</button>
		  </div>
		</div>
	  </div>
	</DatabaseListView>
  {:else if currentView === 'tables'}
	<TablesListView
	  {filteredTables}
	  loading={$databaseLoading}
	  {searchQuery}
	  {formatDate}
	  {formatNumber}
	  on:select={(e) => selectTableHandler(e.detail.table)}
	  on:export={(e) => { selectedTable.set(e.detail.table); showExportModal = true; }}
	  on:import={(e) => { selectedTable.set(e.detail.table); showImportModal = true; }}
	>
	  <div slot="actions" class="p-4 border-b border-base-200/40">
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
			<button class="btn btn-outline btn-sm" on:click={() => showImportModal = true}>
			  <Upload class="w-4 h-4" />
			  Import
			</button>
			<button class="btn btn-primary btn-sm">
			  <Plus class="w-4 h-4" />
			  New Table
			</button>
		  </div>
		</div>
	  </div>
	</TablesListView>
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
						<button class="btn btn-outline btn-sm" on:click={() => showExportModal = true}>
							<Download class="w-4 h-4" />
							Export
						</button>
						<button class="btn btn-outline btn-sm" on:click={() => showImportModal = true}>
							<Upload class="w-4 h-4" />
							Import
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

<!-- Import Modal -->
{#if showImportModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-lg flex items-center gap-2">
					<Upload class="w-5 h-5" />
					Import Data
				</h3>
				<button class="btn btn-ghost btn-sm btn-circle" on:click={resetImportModal}>
					<X class="w-4 h-4" />
				</button>
			</div>

			{#if $selectedTable}
				<div class="mb-4">
					<div class="alert alert-info">
						<AlertCircle class="w-4 h-4" />
						<span>Importing data to table: <strong>{$selectedTable.displayName}</strong></span>
					</div>
				</div>
			{/if}

			<!-- File Selection -->
			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">Select file to import</span>
				</label>
				<div class="flex gap-2">
					<input 
						type="file" 
						accept=".csv,.json"
						class="hidden"
						bind:this={fileInput}
						on:change={handleFileSelect}
					/>
					<button class="btn btn-outline flex-1" on:click={selectFile}>
						{importFile ? importFile.name : 'Choose file...'}
					</button>
				</div>
				<div class="label">
					<span class="label-text-alt">Supported formats: CSV, JSON</span>
				</div>
			</div>

			<!-- Progress -->
			{#if importProgress > 0}
				<div class="mb-4">
					<div class="flex items-center gap-2 mb-2">
						<Loader class="w-4 h-4 animate-spin" />
						<span class="text-sm">{operationMessage}</span>
					</div>
					<progress class="progress progress-primary w-full" value={importProgress} max="100"></progress>
				</div>
			{/if}

			<!-- Success/Error Messages -->
			{#if operationMessage && importProgress === 100}
				<div class="alert alert-success mb-4">
					<CheckCircle class="w-4 h-4" />
					<span>{operationMessage}</span>
				</div>
			{/if}

			{#if operationError}
				<div class="alert alert-error mb-4">
					<AlertCircle class="w-4 h-4" />
					<span>{operationError}</span>
				</div>
			{/if}

			<!-- Actions -->
			<div class="modal-action">
				<button class="btn" on:click={resetImportModal}>Cancel</button>
				<button 
					class="btn btn-primary" 
					disabled={!importFile || !$selectedTable || importProgress > 0}
					on:click={() => $selectedTable && importFile && handleImport($selectedTable.id, importFile)}
				>
					{importProgress > 0 ? 'Importing...' : 'Import'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Export Modal -->
{#if showExportModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<div class="flex items-center justify-between mb-4">
				<h3 class="font-bold text-lg flex items-center gap-2">
					<Download class="w-5 h-5" />
					Export Data
				</h3>
				<button class="btn btn-ghost btn-sm btn-circle" on:click={resetExportModal}>
					<X class="w-4 h-4" />
				</button>
			</div>

			{#if $selectedTable}
				<div class="mb-4">
					<div class="alert alert-info">
						<AlertCircle class="w-4 h-4" />
						<span>Exporting data from table: <strong>{$selectedTable.displayName}</strong></span>
					</div>
				</div>
			{/if}

			<!-- Format Selection -->
			<div class="form-control mb-4">
				<label class="label">
					<span class="label-text">Export format</span>
				</label>
				<div class="flex gap-2">
					<label class="label cursor-pointer flex items-center gap-2 flex-1">
						<input type="radio" name="exportFormat" class="radio radio-primary" bind:group={exportFormat} value="csv" />
						<FileSpreadsheet class="w-4 h-4" />
						<span>CSV</span>
					</label>
					<label class="label cursor-pointer flex items-center gap-2 flex-1">
						<input type="radio" name="exportFormat" class="radio radio-primary" bind:group={exportFormat} value="json" />
						<FileText class="w-4 h-4" />
						<span>JSON</span>
					</label>
					<label class="label cursor-pointer flex items-center gap-2 flex-1">
						<input type="radio" name="exportFormat" class="radio radio-primary" bind:group={exportFormat} value="xlsx" />
						<FileSpreadsheet class="w-4 h-4" />
						<span>XLSX</span>
					</label>
				</div>
			</div>

			<!-- Progress -->
			{#if exportProgress > 0}
				<div class="mb-4">
					<div class="flex items-center gap-2 mb-2">
						<Loader class="w-4 h-4 animate-spin" />
						<span class="text-sm">{operationMessage}</span>
					</div>
					<progress class="progress progress-primary w-full" value={exportProgress} max="100"></progress>
				</div>
			{/if}

			<!-- Success/Error Messages -->
			{#if operationMessage && exportProgress === 100}
				<div class="alert alert-success mb-4">
					<CheckCircle class="w-4 h-4" />
					<span>{operationMessage}</span>
				</div>
			{/if}

			{#if operationError}
				<div class="alert alert-error mb-4">
					<AlertCircle class="w-4 h-4" />
					<span>{operationError}</span>
				</div>
			{/if}

			<!-- Actions -->
			<div class="modal-action">
				<button class="btn" on:click={resetExportModal}>Cancel</button>
				<button 
					class="btn btn-primary" 
					disabled={!$selectedTable || exportProgress > 0}
					on:click={() => $selectedTable && handleExport($selectedTable.id, exportFormat)}
				>
					{exportProgress > 0 ? 'Exporting...' : 'Export'}
				</button>
			</div>
		</div>
	</div>
{/if}