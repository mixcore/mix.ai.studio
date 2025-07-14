<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';
	import { showChatPanel } from '$lib/stores';

	let container: HTMLDivElement;
	let leftPanel: HTMLDivElement;
	let rightPanel: HTMLDivElement;
	let resizer: HTMLDivElement;
	
	let isResizing = false;
	let leftPanelWidth = 30; // Default width percentage

	function startResize(e: MouseEvent) {
		isResizing = true;
		document.addEventListener('mousemove', handleResize);
		document.addEventListener('mouseup', stopResize);
		e.preventDefault();
	}

	function handleResize(e: MouseEvent) {
		if (!isResizing || !container) return;
		
		const containerRect = container.getBoundingClientRect();
		const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
		
		// Constrain width between 25% and 65%
		leftPanelWidth = Math.max(25, Math.min(65, newWidth));
	}

	function stopResize() {
		isResizing = false;
		document.removeEventListener('mousemove', handleResize);
		document.removeEventListener('mouseup', stopResize);
	}

	onMount(() => {
		return () => {
			document.removeEventListener('mousemove', handleResize);
			document.removeEventListener('mouseup', stopResize);
		};
	});
</script>

<div 
	bind:this={container}
	class="flex h-full bg-base-100 w-full"
	class:select-none={isResizing}
>
	<!-- Left Panel (Chat) -->
	{#if $showChatPanel}
		<div 
			bind:this={leftPanel}
			class="flex flex-col border-r border-base-300 transition-all duration-300"
			style="width: {leftPanelWidth}%"
		>
			<slot name="left" />
		</div>

		<!-- Resizer -->
		<div 
			bind:this={resizer}
			class={cn(
				"w-1 bg-base-300 hover:bg-primary cursor-col-resize transition-colors",
				isResizing && "bg-primary"
			)}
			on:mousedown={startResize}
			role="separator"
			aria-label="Resize panels"
		></div>
	{/if}

	<!-- Right Panel (Preview) -->
	<div 
		bind:this={rightPanel}
		class="flex flex-col flex-1 transition-all duration-300 min-w-0"
	>
		<slot name="right" />
	</div>
</div>

