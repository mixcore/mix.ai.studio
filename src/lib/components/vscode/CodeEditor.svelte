<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import loader from '@monaco-editor/loader';

  export let openFiles = [];
  export let activeFile = null;

  const dispatch = createEventDispatcher();

  let editorContainer: HTMLDivElement;
  let editor: any;
  let monaco: any;

  function closeFile(file) {
    dispatch('closeFile', file);
  }

  function selectFile(file) {
    dispatch('selectFile', file);
  }

  onMount(async () => {
    monaco = await loader.init();
    if (activeFile) {
      createEditor();
    }
  });

  function createEditor() {
    if (editorContainer && monaco && activeFile) {
      editor = monaco.editor.create(editorContainer, {
        value: activeFile.content,
        language: getLanguage(activeFile.path),
        theme: 'vs-dark',
        automaticLayout: true,
        readOnly: false,
        minimap: { enabled: false },
      });
    }
  }

  onDestroy(() => {
    if (editor) {
      editor.dispose();
    }
  });

  $: if (activeFile && monaco) {
    if (!editor) {
      createEditor();
    } else {
      editor.setValue(activeFile.content);
      monaco.editor.setModelLanguage(editor.getModel(), getLanguage(activeFile.path));
    }
  } else if (!activeFile && editor) {
    editor.dispose();
    editor = null;
  }

  function getLanguage(filePath: string): string {
    const extension = filePath.split('.').pop();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'json':
        return 'json';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'py':
        return 'python';
      case 'md':
        return 'markdown';
      case 'java':
        return 'java';
      case 'c':
      case 'cpp':
        return 'cpp';
      case 'cs':
        return 'csharp';
      case 'go':
        return 'go';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'rs':
        return 'rust';
      case 'sh':
        return 'shell';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'sql':
        return 'sql';
      case 'svelte':
        return 'html'; // Svelte files are essentially HTML with JS/CSS
      default:
        return 'plaintext';
    }
  }
</script>

<div class="flex flex-col h-full">
  {#if openFiles.length > 0}
    <div role="tablist" class="tabs tabs-lifted">
      {#each openFiles as file (file.path)}
        <a role="tab" 
           class="tab {activeFile && activeFile.path === file.path ? 'tab-active' : ''}" 
           on:click={() => selectFile(file)}>
          {file.path}
          <span role="button" class="ml-2" on:click|stopPropagation={() => closeFile(file)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </span>
        </a>
      {/each}
      <a role="tab" class="tab tab-lifted"></a>
    </div>
  {/if}
  
  <div class="flex w-full flex-1 overflow-hidden bg-base-100">
    {#if activeFile}
      <div class="w-full h-full" bind:this={editorContainer}></div>
    {:else}
      <div class="flex items-center justify-center w-full h-full text-base-content/50">
        <div class="text-center">
          <p class="text-lg mb-2">No file selected</p>
          <p class="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    {/if}
  </div>
</div>