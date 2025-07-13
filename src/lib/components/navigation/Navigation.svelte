<script lang="ts">
	import { Github, Database, Users, ExternalLink, RefreshCw, Globe, Code, Monitor, Smartphone, Tablet } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { currentProject, showInviteModal, showPublishModal, previewUrl, previewLoading, showCodeView, deviceMode } from '$lib/stores';
	import UserMenu from './UserMenu.svelte';
	import PublishButton from './PublishButton.svelte';
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

	function toggleCodeView() {
		showCodeView.update(show => !show);
	}

	function setDeviceMode(mode: 'desktop' | 'tablet' | 'mobile') {
		deviceMode.set(mode);
	}
</script>

<nav class="navbar bg-base-100 border-b border-base-300 h-12 min-h-12 px-4">
	<!-- Left Section: Project Info -->
	<div class="navbar-start">
		<div class="flex items-center gap-4">
			<!-- Logo & Project Name -->
			<div class="flex items-center gap-2">
				<div class="w-6 h-6 bg-gradient-to-br from-accent-primary to-purple-600 rounded"></div>
				<span class="font-semibold text-sm">{projectName}</span>
			</div>

			<!-- Project Controls -->
			<div class="flex items-center gap-2">
				<!-- Chat Toggle -->
				<ChatToggle />

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

				<!-- View Toggle -->
				<button
					class={cn(
						"btn btn-sm btn-outline",
						$showCodeView ? "bg-primary text-primary-content" : "hover:bg-base-300"
					)}
					on:click={toggleCodeView}
				>
					<Code class="w-3 h-3" />
					Code
				</button>

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
	</div>

	<!-- Right Section: Collaboration & User -->
	<div class="navbar-end">
		<div class="flex items-center gap-2">
			<!-- Collaboration Tools -->
			<button 
				class="btn btn-sm btn-outline"
				on:click={() => showInviteModal.set(true)}
			>
				<Users class="w-3 h-3" />
				Invite
			</button>

			<button 
				class="btn btn-sm btn-outline"
				title="Connect GitHub"
			>
				<Github class="w-3 h-3" />
				GitHub
			</button>

			<button 
				class="btn btn-sm btn-outline"
				title="Connect Supabase"
			>
				<Database class="w-3 h-3" />
				Supabase
			</button>

			<!-- Theme Toggle -->
			<ThemeToggle />

			<!-- Publish Button -->
			<PublishButton />

			<!-- User Menu -->
			<UserMenu />
		</div>
	</div>
</nav>