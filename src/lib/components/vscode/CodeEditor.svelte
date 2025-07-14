<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let openFiles = [];
  export let activeFile = null;

  const dispatch = createEventDispatcher();

  function closeFile(file) {
    dispatch('closeFile', file);
  }

  function selectFile(file) {
    dispatch('selectFile', file);
  }
</script>

<div class="flex flex-col h-full">
  <div role="tablist" class="inline-flex items-center text-muted-foreground h-auto w-full justify-start overflow-x-auto rounded-none bg-background p-0 scrollbar-hide">
    {#each openFiles as file (file.path)}
      <button type="button" role="tab" class="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group relative rounded-none border-r px-2 pl-3 {activeFile && activeFile.path === file.path ? '!bg-muted-active text-foreground' : 'hover:bg-muted/50'}" on:click={() => selectFile(file)}>
        <span>{file.path}</span>
        <span role="button" class="ml-2 opacity-0 transition-opacity group-hover:opacity-100 {activeFile && activeFile.path === file.path ? 'opacity-100' : ''}" on:click|stopPropagation={() => closeFile(file)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" class="shrink-0 h-5 w-5 size-4" fill="currentColor"><path d="M480-438 270-228q-9 9-21 9t-21-9-9-21 9-21l210-210-210-210q-9-9-9-21t9-21 21-9 21 9l210 210 210-210q-9-9 21-9t21 9 9 21-9 21L522-480l210 210q9 9 9 21t-9 21-21 9-21-9z"></path></svg>
        </span>
      </button>
    {/each}
  </div>
  <div class="flex w-full flex-1 overflow-y-auto bg-muted">
    {#if activeFile}
      <textarea class="w-full h-full p-4" value={activeFile.content}></textarea>
    {:else}
      <div class="flex items-center justify-center w-full h-full">
        <p>Select a file to begin editing.</p>
      </div>
    {/if}
  </div>
</div>
