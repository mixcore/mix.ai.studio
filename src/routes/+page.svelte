<script lang="ts">
	import Navigation from '$lib/components/navigation/Navigation.svelte';
	import ResizableLayout from '$lib/components/layout/ResizableLayout.svelte';
	import ChatPanel from '$lib/components/chat/ChatPanel.svelte';
	import PreviewPanel from '$lib/components/preview/PreviewPanel.svelte';
	import FloatingChatToggle from '$lib/components/navigation/FloatingChatToggle.svelte';
	import { onMount } from 'svelte';
	import { user, previewUrl } from '$lib/stores';

	onMount(() => {
		// Initialize mock user data
		user.set({
			id: '1',
			name: 'John Doe',
			email: 'john@example.com'
		});
		
		// Set demo preview URL
		previewUrl.set('/demo');
	});
</script>

<div class="h-screen flex flex-col">
	<!-- Navigation -->
	<Navigation projectName="My Awesome App" />
	
	<!-- Main Content -->
	<div class="flex-1 overflow-hidden">
		<ResizableLayout>
			<ChatPanel slot="left" />
			<PreviewPanel slot="right" />
		</ResizableLayout>
	</div>

	<!-- Floating Chat Toggle (appears when chat is hidden) -->
	<FloatingChatToggle />
</div>
