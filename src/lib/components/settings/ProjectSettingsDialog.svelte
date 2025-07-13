<script lang="ts">
	import { 
		Settings, 
		Globe, 
		BarChart, 
		Brain, 
		Users, 
		CreditCard, 
		User, 
		FlaskConical,
		Database,
		Github,
		X,
		ChevronDown,
		Eye,
		EyeOff
	} from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let open = false;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	let activeTab = 'project';
	let projectVisibility = 'workspace';
	let projectCategory = '';
	let hideBadge = false;

	const tabs = [
		{ id: 'project', label: 'Project Settings', icon: Settings, section: 'Project' },
		{ id: 'domains', label: 'Domains', icon: Globe, section: 'Project' },
		{ id: 'analytics', label: 'Analytics', icon: BarChart, section: 'Project' },
		{ id: 'knowledge', label: 'Knowledge', icon: Brain, section: 'Project' },
		{ id: 'workspace', label: 'My Mixcore', icon: null, section: 'Workspace', avatar: 'M' },
		{ id: 'people', label: 'People', icon: Users, section: 'Workspace' },
		{ id: 'billing', label: 'Plans & Billing', icon: CreditCard, section: 'Workspace' },
		{ id: 'account', label: 'Account Name', icon: User, section: 'Account' },
		{ id: 'labs', label: 'Labs', icon: FlaskConical, section: 'Account' },
		{ id: 'mixdb', label: 'Mix Database', icon: Database, section: 'Integrations' },
		{ id: 'github', label: 'GitHub', icon: Github, section: 'Integrations' }
	];

	const sections = ['Project', 'Workspace', 'Account', 'Integrations'];

	function closeDialog() {
		open = false;
		dispatch('close');
	}

	function selectTab(tabId: string) {
		activeTab = tabId;
	}

	// Mock project data
	const mockProject = {
		name: 'mixcore-ai-studio',
		owner: '@mixcore',
		createdAt: '2025-01-13 10:30:15',
		techStack: 'SvelteKit + TypeScript',
		messagesCount: 47,
		aiEditsCount: 23
	};
</script>

<dialog class="modal" class:modal-open={open}>
	<div class="modal-box w-full max-w-6xl h-[80vh] p-0 flex overflow-hidden">
		<!-- Mobile header -->
		<div class="md:hidden absolute top-0 left-0 right-0 bg-base-100 border-b border-base-200/60 p-4 flex items-center justify-between z-10">
			<h2 class="text-lg font-semibold">Settings</h2>
			<button 
				class="btn btn-ghost btn-sm btn-circle"
				on:click={closeDialog}
				aria-label="Close settings"
			>
				<X class="w-4 h-4" />
			</button>
		</div>

		<!-- Sidebar -->
		<div class="hidden md:flex w-60 border-r border-base-200 bg-base-50/30 flex-col">
			<div class="p-4 border-b border-base-200/60">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold">Settings</h2>
					<button 
						class="btn btn-ghost btn-sm btn-circle"
						on:click={closeDialog}
						aria-label="Close settings"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
			</div>
			
			<div class="flex-1 overflow-y-auto p-4" role="group" aria-label="Settings navigation">
				{#each sections as section}
					<div class="mb-6 first:mt-0">
						<div class="mb-2 px-3 text-xs font-medium text-base-content/50 uppercase tracking-wide">
							{section}
						</div>
						
						{#each tabs.filter(tab => tab.section === section) as tab}
							<button
								class="btn btn-ghost w-full justify-start gap-3 h-auto min-h-10 py-2 px-3
									{activeTab === tab.id ? 'bg-base-200/70 text-base-content' : 'text-base-content/70 hover:bg-base-200/40'}"
								on:click={() => selectTab(tab.id)}
								aria-pressed={activeTab === tab.id}
								aria-describedby="settings-content"
							>
								{#if tab.avatar}
									<div class="avatar placeholder">
										<div class="bg-primary text-primary-content rounded-md w-5 h-5 text-xs">
											<span>{tab.avatar}</span>
										</div>
									</div>
								{:else if tab.icon}
									<svelte:component this={tab.icon} class="w-5 h-5" />
								{/if}
								<span class="text-sm">{tab.label}</span>
							</button>
						{/each}
					</div>
				{/each}
			</div>
		</div>

		<!-- Main content -->
		<div class="flex-1 flex flex-col">
			<!-- Content area -->
			<div class="flex-1 overflow-y-auto p-6 md:p-10 pt-20 md:pt-6" id="settings-content" role="tabpanel">
					{#if activeTab === 'project'}
						<!-- Project Settings Content -->
						<div class="max-w-4xl">
							<div class="hidden md:block mb-6">
								<h3 class="text-lg font-medium mb-2">Project Settings</h3>
								<p class="text-sm text-base-content/60">
									Manage your project details, visibility, and preferences.
								</p>
							</div>

							<div class="space-y-6">
								<!-- Overview Section -->
								<div class="grid grid-cols-2 gap-6">
									<div class="col-span-2 text-base font-medium mb-2">Overview</div>
									
									<div class="space-y-1">
										<div class="text-sm font-medium">Project name</div>
										<div class="text-sm text-base-content/60">{mockProject.name}</div>
									</div>
									
									<div class="space-y-1">
										<div class="text-sm font-medium">Owner</div>
										<div class="text-sm text-base-content/60">{mockProject.owner}</div>
									</div>
									
									<div class="space-y-1">
										<div class="text-sm font-medium">Created at</div>
										<div class="text-sm text-base-content/60">{mockProject.createdAt}</div>
									</div>
									
									<div class="space-y-1">
										<div class="text-sm font-medium">Tech stack</div>
										<div class="text-sm text-base-content/60">{mockProject.techStack}</div>
									</div>
									
									<div class="space-y-1">
										<div class="text-sm font-medium">Messages count</div>
										<div class="text-sm text-base-content/60">{mockProject.messagesCount}</div>
									</div>
									
									<div class="space-y-1">
										<div class="text-sm font-medium">AI Edits count</div>
										<div class="text-sm text-base-content/60">{mockProject.aiEditsCount}</div>
									</div>
								</div>

								<div class="divider opacity-30"></div>

								<!-- Project Visibility -->
								<div class="form-control">
									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-base-200/40">
										<div class="space-y-1">
											<div class="label-text font-medium flex items-center gap-2">
												Project Visibility
												<div class="badge badge-primary badge-sm">PRO</div>
											</div>
											<div class="label-text-alt text-base-content/60">
												Keep your project hidden and prevent others from remixing it.
											</div>
										</div>
										<div class="dropdown dropdown-end">
											<div role="button" class="btn btn-outline btn-sm w-44">
												<div class="flex items-center gap-2">
													{#if projectVisibility === 'workspace'}
														<Eye class="w-4 h-4" />
														<span>Workspace</span>
													{:else if projectVisibility === 'private'}
														<EyeOff class="w-4 h-4" />
														<span>Private</span>
													{:else}
														<Globe class="w-4 h-4" />
														<span>Public</span>
													{/if}
												</div>
												<ChevronDown class="w-4 h-4 opacity-50" />
											</div>
											<ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
												<li><button on:click={() => projectVisibility = 'workspace'}>
													<Eye class="w-4 h-4" /> Workspace
												</button></li>
												<li><button on:click={() => projectVisibility = 'private'}>
													<EyeOff class="w-4 h-4" /> Private
												</button></li>
												<li><button on:click={() => projectVisibility = 'public'}>
													<Globe class="w-4 h-4" /> Public
												</button></li>
											</ul>
										</div>
									</div>
								</div>

								<!-- Project Category -->
								<div class="form-control">
									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-base-200/40">
										<div class="space-y-1">
											<div class="label-text font-medium">Project Category</div>
											<div class="label-text-alt text-base-content/60">
												Categorize your project to help others find it.
											</div>
										</div>
										<select class="select select-bordered select-sm w-44" bind:value={projectCategory} aria-label="Project category">
											<option value="">Select category</option>
											<option value="web-app">Web App</option>
											<option value="mobile-app">Mobile App</option>
											<option value="dashboard">Dashboard</option>
											<option value="landing-page">Landing Page</option>
											<option value="e-commerce">E-commerce</option>
											<option value="portfolio">Portfolio</option>
											<option value="blog">Blog</option>
											<option value="other">Other</option>
										</select>
									</div>
								</div>

								<!-- Hide Badge -->
								<div class="form-control">
									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-base-200/40">
										<div class="space-y-1">
											<div class="label-text font-medium flex items-center gap-2">
												Hide "Mixcore" Badge
												<div class="badge badge-primary badge-sm">PRO</div>
											</div>
											<div class="label-text-alt text-base-content/60">
												Remove the "Built with Mixcore" badge from your published work.
											</div>
										</div>
										<input 
											type="checkbox" 
											class="toggle toggle-primary" 
											bind:checked={hideBadge}
											aria-label="Hide Mixcore badge"
										/>
									</div>
								</div>

								<!-- Actions -->
								<div class="space-y-4">
									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-base-200/40">
										<div class="space-y-1">
											<div class="font-medium">Rename Project</div>
											<div class="text-sm text-base-content/60">
												Update your project's title.
											</div>
										</div>
										<button class="btn btn-primary btn-sm">Rename</button>
									</div>

									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-base-200/40">
										<div class="space-y-1">
											<div class="font-medium">Remix Project</div>
											<div class="text-sm text-base-content/60">
												Duplicate this app in a new project.
											</div>
										</div>
										<button class="btn btn-primary btn-sm">Remix</button>
									</div>

									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-base-200/40">
										<div class="space-y-1">
											<div class="font-medium">Delete Project</div>
											<div class="text-sm text-base-content/60">
												Permanently delete this project.
											</div>
										</div>
										<button class="btn btn-error btn-sm">Delete</button>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<!-- Placeholder for other tabs -->
						<div class="max-w-4xl">
							<div class="text-center py-20">
								<div class="text-6xl mb-4">🚧</div>
								<h3 class="text-lg font-medium mb-2">Coming Soon</h3>
								<p class="text-base-content/60">
									This section is under development.
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	
	<form method="dialog" class="modal-backdrop">
		<button on:click={closeDialog}>close</button>
	</form>
</dialog>