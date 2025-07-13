<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<main class="h-screen">
	<slot />
</main>