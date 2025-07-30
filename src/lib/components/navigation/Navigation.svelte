<script lang="ts">
	import {
		Github,
		Database,
		Users,
		ExternalLink,
		RefreshCw,
		Globe,
		Monitor,
		Smartphone,
		Tablet,
		ChevronDown,
		FolderOpen,
		Settings,
		FileText,
		Share,
		Bot,
		MessageSquare,
		BrainCircuit,
		GitBranch,
		CodeXml
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import {
		showInviteModal,
		previewUrl,
		previewLoading,
		deviceMode,
		chatMode,
		projectActions,
		currentProject,
		isAuthenticated,
		availableModels,
		selectedModel,
		viewMode
	} from '$lib/stores';
	import UserMenu from './UserMenu.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import ChatToggle from './ChatToggle.svelte';
	import ProjectSettingsDialog from '../settings/ProjectSettingsDialog.svelte';
	import ConnectionStatus from '../status/ConnectionStatus.svelte';

	export let projectName = 'Untitled Project';

	let showProjectSettings = false;


	function refreshPreview() {
		previewLoading.set(true);
		// Simulate refresh
		setTimeout(() => {
			previewLoading.set(false);
		}, 1000);
	}

	function openInNewTab() {
		window.open($previewUrl, '_blank');
	}


	function setDeviceMode(mode: 'desktop' | 'tablet' | 'mobile') {
		deviceMode.set(mode);
	}

	function setChatMode(mode: 'default' | 'chat-only' | 'agent') {
		chatMode.set(mode);
	}

	async function handleCreateProject() {
		if (!$isAuthenticated) {
			alert('Please sign in to create projects');
			return;
		}
		
		const projectName = prompt('Enter project name:');
		if (projectName) {
			try {
				await projectActions.createProject({ 
					name: projectName,
					description: 'Created from Mix Portal Einstein'
				});
			} catch (error) {
				console.error('Failed to create project:', error);
				alert('Failed to create project. Please try again.');
			}
		}
	}

	async function handleOpenProject() {
		if (!$isAuthenticated) {
			alert('Please sign in to access projects');
			return;
		}
		
		try {
			const projectList = await projectActions.loadProjects();
			if (projectList.length === 0) {
				alert('No projects found. Create your first project!');
			} else {
				console.log('Loaded projects:', projectList);
			}
		} catch (error) {
			console.error('Failed to load projects:', error);
			alert('Failed to load projects. Please try again.');
		}
	}

	async function handleExportProject() {
		if (!$isAuthenticated) {
			alert('Please sign in to export projects');
			return;
		}
		
		if ($currentProject) {
			// Implement project export functionality
			console.log('Exporting project:', $currentProject.name);
			alert(`Exporting project: ${$currentProject.name}`);
		} else {
			alert('No project selected');
		}
	}
</script>

<nav class="navbar bg-base-100 border-b border-base-300 h-12 min-h-12 px-4">
	<!-- Left Section: Project Info -->
	<div class="navbar-start">
		<!-- Logo & Project Name with Dropdown -->
		<div class="dropdown dropdown-hover">
			<div tabindex="0" role="button" class="flex items-center gap-2 btn btn-ghost btn-sm">
				<div class="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded"></div>
				<span class="font-semibold text-sm">{$currentProject?.name || projectName}</span>
				<ChevronDown class="w-4 h-4" />
			</div>
			<ul class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300">
				<li class="menu-title">
					<span class="text-sm font-medium">Project</span>
				</li>
				<li>
					<button class="flex items-center gap-2" on:click={handleOpenProject}>
						<FolderOpen class="w-4 h-4" />
						Open Project
					</button>
				</li>
				<li>
					<button class="flex items-center gap-2" on:click={handleCreateProject}>
						<FileText class="w-4 h-4" />
						New Project
					</button>
				</li>
				<li>
					<button class="flex items-center gap-2" on:click={handleExportProject}>
						<Share class="w-4 h-4" />
						Export Project
					</button>
				</li>
				<div class="divider my-1"></div>
				<li>
					<button class="flex items-center gap-2" on:click={() => showProjectSettings = true}>
						<Settings class="w-4 h-4" />
						Project Settings
					</button>
				</li>
			</ul>
		</div>

		<!-- Chat Toggle -->
		<ChatToggle />
	</div>

	<!-- Center Section: View & Device Controls -->
	<div class="navbar-center">
		<div class="flex items-center gap-4">
			<!-- View Mode Selector -->
			<div class="flex items-center bg-base-200 rounded-md p-1">
				<button class="btn btn-sm btn-ghost" class:btn-active={$viewMode === 'preview'} on:click={() => viewMode.set('preview')} title="Preview"><Monitor class="w-4 h-4" /></button>
				<button class="btn btn-sm btn-ghost" class:btn-active={$viewMode === 'database'} on:click={() => viewMode.set('database')} title="Database"><Database class="w-4 h-4" /></button>
				<button class="btn btn-sm btn-ghost" class:btn-active={$viewMode === 'agent'} on:click={() => viewMode.set('agent')} title="Agent Flow"><GitBranch class="w-4 h-4" /></button>
				<button class="btn btn-sm btn-ghost" class:btn-active={$viewMode === 'vscode'} on:click={() => viewMode.set('vscode')} title="VSCode"><CodeXml class="w-4 h-4" /></button>
			</div>

			<!-- Device Mode Selector -->
			<div class="flex items-center bg-base-200 rounded-md p-1">
				<button class={cn("btn btn-sm btn-ghost", $deviceMode === 'desktop' ? "bg-base-100 shadow-sm" : "hover:bg-base-300")} on:click={() => setDeviceMode('desktop')} title="Desktop view"><Monitor class="w-4 h-4" /></button>
				<button class={cn("btn btn-sm btn-ghost", $deviceMode === 'tablet' ? "bg-base-100 shadow-sm" : "hover:bg-base-300")} on:click={() => setDeviceMode('tablet')} title="Tablet view"><Tablet class="w-4 h-4" /></button>
				<button class={cn("btn btn-sm btn-ghost", $deviceMode === 'mobile' ? "bg-base-100 shadow-sm" : "hover:bg-base-300")} on:click={() => setDeviceMode('mobile')} title="Mobile view"><Smartphone class="w-4 h-4" /></button>
			</div>
		</div>
	</div>

	<!-- Right Section: Collaboration & User -->
	<div class="navbar-end">
		<div class="flex items-center gap-2">
			<!-- AI Model Selector -->
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
					<BrainCircuit class="w-4 h-4" />
					<span class="hidden md:inline">{$selectedModel.name}</span>
					<ChevronDown class="w-3 h-3" />
				</div>
				<ul class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300">
					{#each availableModels as model}
						<li>
							<button class="flex justify-between w-full" class:active={$selectedModel.id === model.id} on:click={() => selectedModel.set(model)}>
								<span>{model.name}</span>
								<span class="badge badge-ghost badge-sm">{model.provider}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Collaboration Tools -->
			<button class="btn btn-ghost btn-sm" on:click={() => showInviteModal.set(true)}>
				<Users class="w-4 h-4" />
			</button>

			<!-- Theme Toggle -->
			<ThemeToggle />

			<!-- Connection Status -->
			<ConnectionStatus />

			<!-- User Menu -->
			<UserMenu />
		</div>
	</div>
</nav>

<!-- Project Settings Dialog -->
<ProjectSettingsDialog 
	bind:open={showProjectSettings}
	on:close={() => showProjectSettings = false}
/>