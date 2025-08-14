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

<style>
.markdown-content ul, .markdown-content ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}
.markdown-content li {
  margin-bottom: 0.25em;
}
.markdown-content code {
  background: #23272f;
  color: #facc15;
  border-radius: 0.3em;
  padding: 0.15em 0.4em;
  font-size: 0.98em;
  font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', 'monospace';
}
.markdown-content pre {
  background: #23272f;
  color: #f1f5f9;
  border-radius: 0.5em;
  padding: 1em 1.2em;
  margin: 1.2em 0;
  font-size: 0.98em;
  font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', 'monospace';
  overflow-x: auto;
  border: 1px solid #1e293b;
}
.markdown-content pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
}
.markdown-content a {
  color: #2563eb;
  text-decoration: underline;
  transition: color 0.2s;
}
.markdown-content a:hover {
  color: #1e40af;
}
.markdown-content blockquote {
  border-left: 4px solid #818cf8;
  background: #f1f5f9;
  color: #334155;
  margin: 1em 0;
  padding: 0.7em 1em;
  border-radius: 0.5em;
  font-style: italic;
}
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
.markdown-content th, .markdown-content td {
  border: 1px solid #e2e8f0;
  padding: 0.5em 0.8em;
}
.markdown-content th {
  background: #f1f5f9;
  font-weight: 600;
}
.markdown-content hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2em 0;
}
.markdown-content {
  /* ...existing code... */
}
.markdown-content p,
.markdown-content ul,
.markdown-content ol,
.markdown-content pre,
.markdown-content blockquote,
.markdown-content table,
.markdown-content hr {
  margin-top: 1.1em;
  margin-bottom: 1.1em;
}
.markdown-content > *:first-child {
  margin-top: 0;
}
.markdown-content > *:last-child {
  margin-bottom: 0;
}
</style>

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