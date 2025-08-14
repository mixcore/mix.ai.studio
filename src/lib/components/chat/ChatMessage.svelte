<script lang="ts">
	import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { ChatMessage } from '$lib/types';
import { Carta, Markdown } from 'carta-md';
	import { emoji } from '@cartamd/plugin-emoji';
	import { code } from '@cartamd/plugin-code';
	import { anchor } from '@cartamd/plugin-anchor';
	import { component } from '@cartamd/plugin-component';
	import { svelte, initializeComponents } from '@cartamd/plugin-component/svelte';
	import 'carta-md/default.css';
	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-code/default.css';
	import '@cartamd/plugin-anchor/default.css';

	export let message: ChatMessage;

	// Carta instance for rendering markdown with emoji, code, and anchor support
	const carta = new Carta({
		extensions: [emoji(), code(), anchor(), component([], initializeComponents)]
	});

	function copyMessage() {
		navigator.clipboard.writeText(message.content);
	}

	function formatTimestamp(timestamp: string | Date) {
		const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
		return new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<div class={cn(
	"flex gap-3",
	message.role === 'user' ? 'justify-end' : 'justify-start'
)}>
	{#if message.role === 'assistant'}
		<div class="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center flex-shrink-0">
			<Bot class="w-4 h-4" />
		</div>
	{/if}

	<div class={cn(
		"max-w-[80%] rounded-lg px-4 py-2",
		message.role === 'user' 
			? 'bg-primary text-primary-content' 
			: 'bg-base-200',
		message.isStreaming && 'animate-pulse'
	)}>
		   <div class="prose prose-sm max-w-none markdown-content">
			   {#key message.content.length}
				   <Markdown value={message.content} {carta} />
			   {/key}
		   </div>
		   <!-- {#if message.isStreaming}
			   <div class="text-xs text-warning mt-1">
				   [DEBUG] Streaming raw: {message.content}
			   </div>
		   {/if} -->
		<div class={cn(
			"flex items-center gap-2 mt-2 text-xs",
			message.role === 'user' ? 'text-primary-content/70' : 'text-base-content/60'
		)}>
			{#if message.isStreaming}
				<span class="flex items-center gap-1">
					<span class="w-1 h-1 bg-current rounded-full animate-bounce"></span>
					<span class="w-1 h-1 bg-current rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
					<span class="w-1 h-1 bg-current rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
					<span class="ml-1">Streaming...</span>
				</span>
			{:else}
				<span>{formatTimestamp(message.timestamp)}</span>
			{/if}
			{#if message.role === 'assistant' && !message.isStreaming}
				<div class="flex items-center gap-1 ml-auto">
					<button 
						class="btn btn-ghost btn-xs"
						on:click={copyMessage}
						title="Copy message"
					>
						<Copy class="w-3 h-3" />
					</button>
					<button 
						class="btn btn-ghost btn-xs"
						title="Good response"
					>
						<ThumbsUp class="w-3 h-3" />
					</button>
					<button 
						class="btn btn-ghost btn-xs"
						title="Bad response"
					>
						<ThumbsDown class="w-3 h-3" />
					</button>
				</div>
			{/if}
		</div>
	</div>

	{#if message.role === 'user'}
		<div class="w-8 h-8 bg-base-200 text-base-content rounded-full flex items-center justify-center flex-shrink-0">
			<User class="w-4 h-4" />
		</div>
	{/if}
</div>