



<script lang="ts">
import { previewIframeUrl } from '$lib/stores/previewIframeUrl';
let url = '';
$: url = $previewIframeUrl;
function onInput(e: Event) {
  previewIframeUrl.set((e.target as HTMLInputElement).value);
}
</script>

<div class="flex items-center gap-1 bg-base-200 rounded-md px-2 py-1 text-xs w-full">
  <input
	class="bg-transparent outline-none w-full text-base-content/70"
	type="text"
	bind:value={url}
	on:input={onInput}
	spellcheck={false}
	autocomplete="off"
  />
</div>
