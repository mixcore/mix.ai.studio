<script lang="ts">
	import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { ChatMessage } from '$lib/types';

	export let message: ChatMessage;

	function copyMessage() {
		navigator.clipboard.writeText(message.content);
	}

	function formatTimestamp(date: Date) {
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
			: 'bg-base-200'
	)}>
		<div class="prose prose-sm max-w-none">
			{message.content}
		</div>
		
		<div class={cn(
			"flex items-center gap-2 mt-2 text-xs",
			message.role === 'user' ? 'text-primary-content/70' : 'text-base-content/60'
		)}>
			<span>{formatTimestamp(message.timestamp)}</span>
			
			{#if message.role === 'assistant'}
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