<script lang="ts">
	import { Github, Database, Users, ExternalLink, RefreshCw, Globe, Monitor, Smartphone, Tablet, ChevronDown, FolderOpen, Settings, FileText, Share, Bot, MessageSquare } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { showInviteModal, previewUrl, previewLoading, deviceMode, chatMode } from '$lib/stores';
	import UserMenu from './UserMenu.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import ChatToggle from './ChatToggle.svelte';

	export let projectName = 'Untitled Project';


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
</script>

<nav class="navbar bg-base-100 border-b border-base-300 h-12 min-h-12 px-4">
	<!-- Left Section: Project Info -->
	<div class="navbar-start">
		<!-- Logo & Project Name with Dropdown -->
		<div class="dropdown dropdown-hover">
			<div tabindex="0" role="button" class="flex items-center gap-2 btn btn-ghost btn-sm">
				<div class="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded"></div>
				<span class="font-semibold text-sm">{projectName}</span>
				<ChevronDown class="w-3 h-3" />
			</div>
			<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-64 border border-base-300">
				<li class="menu-title">
					<span class="text-sm font-medium">Project</span>
				</li>
				<li>
					<button class="flex items-center gap-2">
						<FolderOpen class="w-4 h-4" />
						Open Project
					</button>
				</li>
				<li>
					<button class="flex items-center gap-2">
						<FileText class="w-4 h-4" />
						New Project
					</button>
				</li>
				<li>
					<button class="flex items-center gap-2">
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
						on:click={() => setChatMode('default')}
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
						on:click={() => setChatMode('chat-only')}
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
						on:click={() => setChatMode('agent')}
					>
						<Settings class="w-4 h-4" />
						Agent Mode
					</button>
				</li>
				<div class="divider my-1"></div>
				<li>
					<button class="flex items-center gap-2">
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
			<!-- Device Mode Selector -->
			<div class="flex items-center bg-base-200 rounded-md p-1">
				<button
					class={cn(
						"btn btn-sm btn-ghost",
						$deviceMode === 'desktop' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
					)}
					on:click={() => setDeviceMode('desktop')}
					title="Desktop view"
				>
					<Monitor class="w-4 h-4" />
				</button>
				<button
					class={cn(
						"btn btn-sm btn-ghost",
						$deviceMode === 'tablet' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
					)}
					on:click={() => setDeviceMode('tablet')}
					title="Tablet view"
				>
					<Tablet class="w-4 h-4" />
				</button>
				<button
					class={cn(
						"btn btn-sm btn-ghost",
						$deviceMode === 'mobile' ? "bg-base-100 shadow-sm" : "hover:bg-base-300"
					)}
					on:click={() => setDeviceMode('mobile')}
					title="Mobile view"
				>
					<Smartphone class="w-4 h-4" />
				</button>
			</div>

			<button 
				class="btn btn-ghost btn-sm"
				on:click={refreshPreview}
				title="Refresh preview"
			>
				<RefreshCw class="w-4 h-4" />
			</button>
			
			<button 
				class="btn btn-ghost btn-sm"
				on:click={openInNewTab}
				title="Open in new tab"
			>
				<ExternalLink class="w-4 h-4" />
			</button>

			<!-- URL Bar -->
			<div class="flex items-center gap-1 bg-base-200 rounded-md px-2 py-1 text-xs">
				<Globe class="w-3 h-3 text-base-content/60" />
				<span class="text-base-content/70">{$previewUrl}</span>
			</div>
		</div>
	</div>

	<!-- Right Section: Collaboration & User -->
	<div class="navbar-end">
		<div class="flex items-center gap-2">
			<!-- Collaboration Tools -->
			<button 
	class="btn btn-ghost btn-sm"
				on:click={() => showInviteModal.set(true)}
			>
				<Users class="w-3 h-3" />
			
			</button>

			<button 
	class="btn btn-ghost btn-sm"
				title="Mix Database"
			>
				<Database class="w-3 h-3" />
				
			</button>

			<button
	class="btn btn-ghost btn-sm"
				title="Refresh Data"
				aria-label="Refresh Data"
			>
				<Github class="w-3 h-3" />
				
			</button>

			<!-- Theme Toggle -->
			<ThemeToggle />

			<!-- Publish Button -->
			<!-- <PublishButton /> -->

			<!-- User Menu -->
			<UserMenu />
		</div>
	</div>
</nav>