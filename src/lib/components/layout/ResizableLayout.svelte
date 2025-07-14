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
	let startX = 0;
	let startWidth = 0;
	let containerWidth = 0;
	let animationFrameId = 0;

	function startResize(e: MouseEvent) {
		if (!container) return;
		
		isResizing = true;
		startX = e.clientX;
		startWidth = leftPanelWidth;
		containerWidth = container.getBoundingClientRect().width;
		
		document.addEventListener('mousemove', handleResize, { passive: true });
		document.addEventListener('mouseup', stopResize);
		e.preventDefault();
	}

	function handleResize(e: MouseEvent) {
		if (!isResizing) return;
		
		// Cancel previous animation frame
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		
		// Use requestAnimationFrame to throttle updates
		animationFrameId = requestAnimationFrame(() => {
			// Calculate width based on mouse movement delta instead of getBoundingClientRect
			const deltaX = e.clientX - startX;
			const deltaPercent = (deltaX / containerWidth) * 100;
			const newWidth = startWidth + deltaPercent;
			
			// Constrain width between 25% and 65%
			leftPanelWidth = Math.max(25, Math.min(65, newWidth));
		});
	}

	function stopResize() {
		isResizing = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = 0;
		}
		document.removeEventListener('mousemove', handleResize);
		document.removeEventListener('mouseup', stopResize);
	}

	onMount(() => {
		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
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
			class={cn(
				"flex flex-col border-r border-base-300",
				!isResizing && "transition-all duration-300"
			)}
			style="width: {leftPanelWidth}%"
		>
			<slot name="left" />
		</div>

		<!-- Resizer -->
		<button
			bind:this={resizer}
			class={cn(
				"w-1 bg-base-300 hover:bg-primary cursor-col-resize transition-colors border-0 p-0",
				isResizing && "bg-primary"
			)}
			on:mousedown={startResize}
			role="separator"
			aria-label="Resize panels"
		></button>
	{/if}

	<!-- Right Panel (Preview) -->
	<div 
		bind:this={rightPanel}
		class={cn(
			"flex flex-col flex-1 min-w-0",
			!isResizing && "transition-all duration-300"
		)}
	>
		<slot name="right" />
	</div>
</div>

