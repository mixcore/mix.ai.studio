<script lang="ts">
	import { Github, Database, Users, ExternalLink, RefreshCw, Globe } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { currentProject, showInviteModal, showPublishModal } from '$lib/stores';
	import UserMenu from './UserMenu.svelte';
	import PublishButton from './PublishButton.svelte';

	export let projectName = 'Untitled Project';
	export let previewUrl = 'http://localhost:5173';
</script>

<nav class="h-12 bg-background border-b border-border flex items-center justify-between px-4">
	<!-- Left Section: Project Info -->
	<div class="flex items-center gap-4">
		<!-- Logo & Project Name -->
		<div class="flex items-center gap-2">
			<div class="w-6 h-6 bg-gradient-to-br from-accent-primary to-purple-600 rounded"></div>
			<span class="font-semibold text-sm">{projectName}</span>
		</div>

		<!-- Project Controls -->
		<div class="flex items-center gap-2">
			<button 
				class="p-1.5 hover:bg-accent rounded-md transition-colors"
				title="Refresh preview"
			>
				<RefreshCw class="w-4 h-4" />
			</button>
			
			<button 
				class="p-1.5 hover:bg-accent rounded-md transition-colors"
				title="Open in new tab"
			>
				<ExternalLink class="w-4 h-4" />
			</button>

			<!-- URL Bar -->
			<div class="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs">
				<Globe class="w-3 h-3 text-muted-foreground" />
				<span class="text-muted-foreground">{previewUrl}</span>
			</div>
		</div>
	</div>

	<!-- Right Section: Collaboration & User -->
	<div class="flex items-center gap-3">
		<!-- Collaboration Tools -->
		<div class="flex items-center gap-2">
			<button 
				class="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-muted hover:bg-accent rounded-md transition-colors"
				on:click={() => showInviteModal.set(true)}
			>
				<Users class="w-3 h-3" />
				Invite
			</button>

			<button 
				class="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-muted hover:bg-accent rounded-md transition-colors"
				title="Connect GitHub"
			>
				<Github class="w-3 h-3" />
				GitHub
			</button>

			<button 
				class="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-muted hover:bg-accent rounded-md transition-colors"
				title="Connect Supabase"
			>
				<Database class="w-3 h-3" />
				Supabase
			</button>
		</div>

		<!-- Publish Button -->
		<PublishButton />

		<!-- User Menu -->
		<UserMenu />
	</div>
</nav>