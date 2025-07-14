<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let files;
  export let level = 0;

  const dispatch = createEventDispatcher();

  function selectFile(file, path) {
    if (file.content) {
      dispatch('select', { ...file, path });
    }
  }
</script>

<ul>
  {#each Object.entries(files) as [name, file] (name)}
    <li>
      <button class="group flex cursor-pointer items-center px-2 py-1 text-sm hover:bg-primary/25 w-full text-left" on:click={() => selectFile(file, name)}>
        <div class="mr-1 flex-shrink-0" style="margin-left: {level * 16}px;">
          {#if !file.content}
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" class="shrink-0 h-5 w-5 transition-transform duration-200 rotate-90" fill="currentColor"><path d="M530-481 353-658q-9-9-8.5-21t9.5-21 21.5-9 21.5 9l198 198q5 5 7 10t2 11-2 11-7 10L396-261q-9 9-21 8.5t-21-9.5-9-21.5 9-21.5z"></path></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 -960 960 960" class="shrink-0 h-4 w-4" fill="currentColor"><path d="M350-460h260q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H350q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5m0 120h260q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H350q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5m0 120h140q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H350q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5M220-80q-24 0-42-18t-18-42v-680q0-24 18-42t42-18h336q12.44 0 23.72 5T599-862l183 183q8 8 13 19.28t5 23.72v496q0 24-18 42t-42 18zm520-554H596q-18.75 0-31.87-13.13Q551-660.25 551-679v-141H220v680h520zM220-820v186zv680z"></path></svg>
          {/if}
        </div>
        <span class="flex-1 truncate">{name}</span>
      </button>
      {#if !file.content}
        <svelte:self files={file} level={level + 1} on:select={(e) => dispatch('select', e.detail)} />
      {/if}
    </li>
  {/each}
</ul>
