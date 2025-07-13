<script lang="ts">
	import { MessageSquare, Bot, Image, MoreHorizontal } from 'lucide-svelte';
	import { chatMessages, chatLoading, chatInput, chatMode } from '$lib/stores';
	import ChatMessage from './ChatMessage.svelte';
	import ChatInput from './ChatInput.svelte';
	import ModeSelector from './ModeSelector.svelte';

	let chatContainer: HTMLDivElement;

	$: if (chatContainer && $chatMessages.length) {
		setTimeout(() => {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}, 100);
	}
</script>

<div class="flex flex-col h-full bg-background">
	<!-- Chat Header -->
	<div class="flex items-center justify-between p-4 border-b border-border">
		<div class="flex items-center gap-2">
			<Bot class="w-5 h-5 text-accent-primary" />
			<span class="font-medium text-sm">AI Assistant</span>
		</div>
		<ModeSelector />
	</div>

	<!-- Chat Messages -->
	<div 
		bind:this={chatContainer}
		class="flex-1 overflow-y-auto p-4 space-y-4"
	>
		{#if $chatMessages.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-center">
				<Bot class="w-12 h-12 text-muted-foreground mb-4" />
				<h3 class="text-lg font-medium mb-2">Welcome to your AI assistant</h3>
				<p class="text-sm text-muted-foreground max-w-sm">
					Describe what you want to build and I'll help you create it step by step.
				</p>
			</div>
		{:else}
			{#each $chatMessages as message (message.id)}
				<ChatMessage {message} />
			{/each}
		{/if}
		
		{#if $chatLoading}
			<div class="flex items-center gap-2 text-muted-foreground">
				<div class="flex space-x-1">
					<div class="w-2 h-2 bg-accent-primary rounded-full animate-bounce"></div>
					<div class="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
					<div class="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
				</div>
				<span class="text-sm">AI is thinking...</span>
			</div>
		{/if}
	</div>

	<!-- Chat Input -->
	<div class="p-4 border-t border-border">
		<ChatInput />
	</div>
</div>