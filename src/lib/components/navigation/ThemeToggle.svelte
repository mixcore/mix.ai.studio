
<script lang="ts">
import { Sun, Moon } from 'lucide-svelte';
import { onMount } from 'svelte';

let isDark = false;
let currentTheme = 'light';

function setTheme(theme: 'light' | 'dark') {
	const html = document.documentElement;
	html.setAttribute('data-theme', theme);
	currentTheme = theme;
	isDark = theme === 'dark';
	localStorage.setItem('preferred-theme', theme);
}

function toggleTheme() {
	setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

onMount(() => {
	const storedTheme = localStorage.getItem('preferred-theme');
	if (storedTheme === 'dark' || storedTheme === 'light') {
		setTheme(storedTheme);
	} else {
		setTheme('light');
	}
});
</script>

<button
	class="btn btn-ghost btn-sm"
	on:click={toggleTheme}
	title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if isDark}
		<Sun class="w-4 h-4" />
	{:else}
		<Moon class="w-4 h-4" />
	{/if}
</button>