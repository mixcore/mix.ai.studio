<script lang="ts">
	import { 
		Settings, 
		Globe, 
		BarChart3, 
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
	import { currentProject, user } from '$lib/stores';

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
		{ id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'Project' },
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

{#if open}
	<div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
		<div class="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex overflow-hidden">
			<!-- Mobile header -->
			<div class="md:hidden absolute top-0 left-0 right-0 bg-base-100 border-b p-4 flex items-center justify-between z-10">
				<h2 class="text-lg font-semibold">Settings</h2>
				<button 
					class="btn btn-ghost btn-sm btn-circle"
					on:click={closeDialog}
				>
					<X class="w-4 h-4" />
				</button>
			</div>

			<!-- Sidebar -->
			<div class="hidden md:flex w-60 border-r bg-base-50 flex-col">
				<div class="p-4 border-b">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold">Settings</h2>
						<button 
							class="btn btn-ghost btn-sm btn-circle"
							on:click={closeDialog}
						>
							<X class="w-4 h-4" />
						</button>
					</div>
				</div>
				
				<div class="flex-1 overflow-y-auto p-4">
					{#each sections as section}
						<div class="mb-6 first:mt-0">
							<div class="mb-2 px-3 text-xs font-medium text-base-content/60 uppercase tracking-wide">
								{section}
							</div>
							
							{#each tabs.filter(tab => tab.section === section) as tab}
								<button
									class="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors
										{activeTab === tab.id ? 'bg-base-200' : 'hover:bg-base-100'}"
									on:click={() => selectTab(tab.id)}
								>
									{#if tab.avatar}
										<div class="w-5 h-5 bg-primary text-primary-content rounded-md flex items-center justify-center text-xs font-medium">
											{tab.avatar}
										</div>
									{:else if tab.icon}
										<svelte:component this={tab.icon} class="w-5 h-5" />
									{/if}
									<span>{tab.label}</span>
								</button>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			<!-- Main content -->
			<div class="flex-1 flex flex-col">
				<!-- Content area -->
				<div class="flex-1 overflow-y-auto p-6 md:p-10 pt-20 md:pt-6">
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

								<div class="divider"></div>

								<!-- Project Visibility -->
								<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
									<div class="space-y-1">
										<div class="flex items-center gap-2">
											<span class="font-medium">Project Visibility</span>
											<div class="badge badge-primary badge-sm">PRO</div>
										</div>
										<div class="text-sm text-base-content/60">
											Keep your project hidden and prevent others from remixing it.
										</div>
									</div>
									<div class="dropdown dropdown-end">
										<label tabindex="0" class="btn btn-outline btn-sm w-44">
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
										</label>
										<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
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

								<!-- Project Category -->
								<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
									<div class="space-y-1">
										<div class="font-medium">Project Category</div>
										<div class="text-sm text-base-content/60">
											Categorize your project to help others find it.
										</div>
									</div>
									<select class="select select-bordered select-sm w-44" bind:value={projectCategory}>
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

								<!-- Hide Badge -->
								<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
									<div class="space-y-1">
										<div class="flex items-center gap-2">
											<span class="font-medium">Hide "Mixcore" Badge</span>
											<div class="badge badge-primary badge-sm">PRO</div>
										</div>
										<div class="text-sm text-base-content/60">
											Remove the "Built with Mixcore" badge from your published work.
										</div>
									</div>
									<input 
										type="checkbox" 
										class="toggle toggle-primary" 
										bind:checked={hideBadge}
									/>
								</div>

								<!-- Actions -->
								<div class="space-y-4">
									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
										<div class="space-y-1">
											<div class="font-medium">Rename Project</div>
											<div class="text-sm text-base-content/60">
												Update your project's title.
											</div>
										</div>
										<button class="btn btn-primary btn-sm">Rename</button>
									</div>

									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
										<div class="space-y-1">
											<div class="font-medium">Remix Project</div>
											<div class="text-sm text-base-content/60">
												Duplicate this app in a new project.
											</div>
										</div>
										<button class="btn btn-primary btn-sm">Remix</button>
									</div>

									<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
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
	</div>
{/if}