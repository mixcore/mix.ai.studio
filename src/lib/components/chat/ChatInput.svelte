<script lang="ts">
	import { Send, Image, Eye, MessageSquare } from 'lucide-svelte';
	import { chatInput, chatLoading, chatMessages } from '$lib/stores';
	import { cn } from '$lib/utils';

	let textArea: HTMLTextAreaElement;
	let fileInput: HTMLInputElement;

	function handleSubmit() {
		if (!$chatInput.trim() || $chatLoading) return;
		
		const message = {
			id: Date.now().toString(),
			content: $chatInput,
			role: 'user' as const,
			timestamp: new Date()
		};

		chatMessages.update(messages => [...messages, message]);
		chatInput.set('');
		
		// Simulate AI response
		chatLoading.set(true);
		setTimeout(() => {
			const response = {
				id: (Date.now() + 1).toString(),
				content: "I'll help you build that! Let me start by creating the necessary components and structure for your project.",
				role: 'assistant' as const,
				timestamp: new Date()
			};
			chatMessages.update(messages => [...messages, response]);
			chatLoading.set(false);
		}, 2000);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	}

	function handleImageUpload() {
		fileInput?.click();
	}

	function autoResize() {
		if (textArea) {
			textArea.style.height = 'auto';
			textArea.style.height = textArea.scrollHeight + 'px';
		}
	}

	$: if (textArea && $chatInput) {
		autoResize();
	}
</script>

<div class="space-y-3">
	<!-- Mode Toggle -->
	<div class="flex items-center gap-2 text-xs">
		<button class="flex items-center gap-1 px-2 py-1 bg-accent-primary text-white rounded-md">
			<MessageSquare class="w-3 h-3" />
			Default
		</button>
		<button class="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:bg-accent rounded-md transition-colors">
			<MessageSquare class="w-3 h-3" />
			Chat only
		</button>
		<button class="flex items-center gap-1 px-2 py-1 text-muted-foreground hover:bg-accent rounded-md transition-colors">
			<Eye class="w-3 h-3" />
			Visual editor
		</button>
	</div>

	<!-- Input Area -->
	<div class="relative">
		<textarea
			bind:this={textArea}
			bind:value={$chatInput}
			placeholder="Ask Lovable to build your app..."
			class={cn(
				"w-full min-h-[60px] max-h-[200px] p-3 pr-20 text-sm",
				"bg-white border border-gray-200 rounded-lg resize-none",
				"focus:outline-none focus:ring-2 focus:ring-blue-500",
				"placeholder:text-gray-500"
			)}
			on:keydown={handleKeyDown}
			on:input={autoResize}
			disabled={$chatLoading}
		></textarea>

		<!-- Input Controls -->
		<div class="absolute right-2 bottom-2 flex items-center gap-1">
			<button
				class="p-2 hover:bg-accent rounded-md transition-colors"
				on:click={handleImageUpload}
				title="Attach image"
			>
				<Image class="w-4 h-4" />
			</button>

			<button
				class={cn(
					"p-2 rounded-md transition-colors",
					$chatInput.trim() && !$chatLoading
						? "bg-accent-primary text-white hover:bg-blue-700"
						: "text-muted-foreground cursor-not-allowed"
				)}
				on:click={handleSubmit}
				disabled={!$chatInput.trim() || $chatLoading}
				title="Send message"
			>
				<Send class="w-4 h-4" />
			</button>
		</div>
	</div>
</div>

<!-- Hidden file input -->
<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	on:change={() => {}}
/>