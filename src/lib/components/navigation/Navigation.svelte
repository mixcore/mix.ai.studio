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
		CodeXml,
		Fullscreen
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


function setDeviceMode(mode: 'desktop' | 'tablet' | 'mobile' | 'responsive') {
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

	function setViewMode(mode: 'preview' | 'database' | 'agent' | 'vscode') {
		viewMode.set(mode);
		console.log(`View mode set to: ${mode}`);
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
					<button class="flex items-center gap-2" onclick={handleOpenProject}>
						<FolderOpen class="w-4 h-4" />
						Open Project
					</button>
				</li>
				<li>
					<button class="flex items-center gap-2" onclick={handleCreateProject}>
						<FileText class="w-4 h-4" />
						New Project
					</button>
				</li>
				<li>
					<button class="flex items-center gap-2" onclick={handleExportProject}>
						<Share class="w-4 h-4" />
						Export Project
					</button>
				</li>
				<div class="divider my-1"></div>
				<li class="menu-title">
					<span class="text-sm font-medium">AI Assistant</span>
				</li>
				<li>
					<button 
						class="flex items-center gap-2"
						class:bg-primary={$chatMode === 'default'}
						class:text-primary-content={$chatMode === 'default'}
						onclick={() => setChatMode('default')}
					>
						<Bot class="w-4 h-4" />
						Default Mode
					</button>
				</li>
				<li>
					<button 
						class="flex items-center gap-2"
						class:bg-primary={$chatMode === 'chat-only'}
						class:text-primary-content={$chatMode === 'chat-only'}
						onclick={() => setChatMode('chat-only')}
					>
						<MessageSquare class="w-4 h-4" />
						Chat Only
					</button>
				</li>
				<li>
					<button 
						class="flex items-center gap-2"
						class:bg-primary={$chatMode === 'agent'}
						class:text-primary-content={$chatMode === 'agent'}
						onclick={() => setChatMode('agent')}
					>
						<Settings class="w-4 h-4" />
						Agent Mode
					</button>
				</li>
				<div class="divider my-1"></div>
				<li class="menu-title">
					<span class="flex items-center gap-2">
						<BrainCircuit class="w-4 h-4" />
						<span>Model</span>
					</span>
				</li>
				{#each availableModels as model}
					<li>
						<button
							class="flex justify-between w-full"
							class:active={$selectedModel.id === model.id}
							onclick={() => selectedModel.set(model)}
						>
							<span>{model.name}</span>
							<span class="badge badge-ghost badge-sm">{model.provider}</span>
						</button>
					</li>
				{/each}
				<div class="divider my-1"></div>
				<li>
					<button class="flex items-center gap-2" onclick={() => showProjectSettings = true}>
						<Settings class="w-4 h-4" />
						Project Settings
					</button>
				</li>
			</ul>
		</div>

		<!-- Chat Toggle -->
		<ChatToggle />
	</div>

	<!-- Center Section: Preview Controls -->
	<div class="navbar-center">
		<div class="flex items-center gap-2">
			{#if $viewMode === 'preview'}
				<!-- Device Mode Selector -->
				<div class="flex items-center bg-base-200 rounded-md p-1">
					<button
						class={cn(
							"btn btn-sm btn-ghost",
							$deviceMode === 'desktop' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
						)}
						onclick={() => setDeviceMode('desktop')}
						title="Desktop view"
					>
						<Monitor class="w-4 h-4" />
					</button>
					<button
						class={cn(
							"btn btn-sm btn-ghost",
							$deviceMode === 'tablet' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
						)}
						onclick={() => setDeviceMode('tablet')}
						title="Tablet view"
					>
						<Tablet class="w-4 h-4" />
					</button>
					<button
						class={cn(
							"btn btn-sm btn-ghost",
							$deviceMode === 'mobile' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
						)}
						onclick={() => setDeviceMode('mobile')}
						title="Mobile view"
					>
						<Smartphone class="w-4 h-4" />
					</button>
					<button
						class={cn(
							"btn btn-sm btn-ghost",
							$deviceMode === 'responsive' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
						)}
						onclick={() => setDeviceMode('responsive')}
						title="Responsive view"
					>
						<Fullscreen class="w-4 h-4 opacity-70" />
					</button>
				</div>

				<button 
					class="btn btn-ghost btn-sm"
					onclick={refreshPreview}
					title="Refresh preview"
				>
					<RefreshCw class="w-4 h-4" />
				</button>
				
				<button 
					class="btn btn-ghost btn-sm"
					onclick={openInNewTab}
					title="Open in new tab"
				>
					<ExternalLink class="w-4 h-4" />
				</button>

				<!-- URL Bar -->
				<div class="flex items-center gap-1 bg-base-200 rounded-md px-2 py-1 text-xs">
					<Globe class="w-4 h-4 text-base-content/60" />
					<span class="text-base-content/70">{$previewUrl}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Right Section: Collaboration & User -->
	<div class="navbar-end">
		<div class="flex items-center gap-2">
			<!-- Collaboration Tools -->
			<button 
	class="btn btn-ghost btn-sm"
				onclick={() => showInviteModal.set(true)}
			>
				<Users class="w-4 h-4" />
			
			</button>

			<button 
				class="btn btn-ghost btn-sm"
				class:btn-active={$viewMode === 'database'}
				onclick={() => setViewMode('database')}
				title="Mix Database"
			>
				<Database class="w-4 h-4" />
			</button>

			<button 
				class="btn btn-ghost btn-sm"
				class:btn-active={$viewMode === 'agent'}
				onclick={() => setViewMode('agent')}
				title="Agent Flow"
			>
				<GitBranch class="w-4 h-4" />
			</button>

			<button
	class="btn btn-ghost btn-sm"
				title="Refresh Data"
				aria-label="Refresh Data"
			>
				<Github class="w-4 h-4" />
				
			</button>

			<button 
				class="btn btn-ghost btn-sm"
				class:btn-active={$viewMode === 'vscode'}
				onclick={() => setViewMode('vscode')}
				title="VSCode"
			>
				<CodeXml class="w-4 h-4" />
			</button>

			<button 
				class="btn btn-ghost btn-sm"
				class:btn-active={$viewMode === 'preview'}
				onclick={() => setViewMode('preview')}
				title="Preview"
			>
				<Monitor class="w-4 h-4" />
			</button>


			<!-- Theme Toggle -->
			<ThemeToggle />

			<!-- Connection Status -->
			<ConnectionStatus />

			<!-- Publish Button -->
			<!-- <PublishButton /> -->

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