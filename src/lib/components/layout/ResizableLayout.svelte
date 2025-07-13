<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils';

	let container: HTMLDivElement;
	let leftPanel: HTMLDivElement;
	let rightPanel: HTMLDivElement;
	let resizer: HTMLDivElement;
	
	let isResizing = false;
	let leftPanelWidth = 37.4; // Default width percentage

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
	class="flex h-full bg-background"
>
	<!-- Left Panel (Chat) -->
	<div 
		bind:this={leftPanel}
		class="flex flex-col border-r border-border"
		style="width: {leftPanelWidth}%"
	>
		<slot name="left" />
	</div>

	<!-- Resizer -->
	<div 
		bind:this={resizer}
		class={cn(
			"w-1 bg-border hover:bg-accent-primary cursor-col-resize transition-colors",
			isResizing && "bg-accent-primary"
		)}
		on:mousedown={startResize}
		role="separator"
		aria-label="Resize panels"
	></div>

	<!-- Right Panel (Preview) -->
	<div 
		bind:this={rightPanel}
		class="flex flex-col flex-1"
		style="width: {100 - leftPanelWidth}%"
	>
		<slot name="right" />
	</div>
</div>

<style>
	:global(body) {
		user-select: none;
	}
</style>