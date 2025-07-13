<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let isDark = true;
	let currentTheme = 'black';

	function toggleTheme() {
		const html = document.documentElement;
		const newTheme = currentTheme === 'light' ? 'black' : 'light';
		
		console.log('Toggling theme from', currentTheme, 'to', newTheme);
		
		// Force remove any existing theme attribute first
		html.removeAttribute('data-theme');
		
		// Add the new theme
		html.setAttribute('data-theme', newTheme);
		currentTheme = newTheme;
		isDark = newTheme === 'black';
		
		// Store preference
		localStorage.setItem('preferred-theme', newTheme);
		
		console.log('Theme set to:', html.getAttribute('data-theme'));
		console.log('isDark:', isDark);
	}

	onMount(() => {
		// Check for stored preference or default to black
		const storedTheme = localStorage.getItem('preferred-theme');
		const html = document.documentElement;
		
		if (storedTheme && (storedTheme === 'black' || storedTheme === 'light')) {
			currentTheme = storedTheme;
			html.setAttribute('data-theme', storedTheme);
			isDark = storedTheme === 'black';
		} else {
			currentTheme = 'black';
			html.setAttribute('data-theme', 'black');
			isDark = true;
			localStorage.setItem('preferred-theme', 'black');
		}
	});
</script>

<button
	class="btn btn-ghost btn-sm"
	on:click={toggleTheme}
	title="Toggle theme"
	aria-label="Toggle dark/light mode"
>
	{#if isDark}
		<Sun class="w-4 h-4" />
	{:else}
		<Moon class="w-4 h-4" />
	{/if}
</button>