<script lang="ts">
  import FileExplorer from './FileExplorer.svelte';
  import CodeEditor from './CodeEditor.svelte';
  import { writable, derived } from 'svelte/store';

  export let files = [];

  let openFiles = writable([]);
  let activeFile = writable(null);
  let searchTerm = writable('');

  const filteredFiles = derived(
    [searchTerm, writable(files)],
    ([$searchTerm, $files]) => {
      if (!$searchTerm) return $files;
      return $files.filter(file => file.path.toLowerCase().includes($searchTerm.toLowerCase()));
    }
  );

  function handleFileSelect(event) {
    const file = event.detail;
    if (!$openFiles.find(f => f.path === file.path)) {
      openFiles.update(currentFiles => [...currentFiles, file]);
    }
    activeFile.set(file);
  }

  function handleCloseFile(event) {
    const fileToClose = event.detail;
    let newActiveFile = null;

    openFiles.update(currentFiles => {
      const fileIndex = currentFiles.findIndex(f => f.path === fileToClose.path);
      const remainingFiles = currentFiles.filter(f => f.path !== fileToClose.path);
      
      if ($activeFile && $activeFile.path === fileToClose.path) {
        if (remainingFiles.length > 0) {
          newActiveFile = remainingFiles[Math.max(0, fileIndex - 1)];
        }
      } else {
        newActiveFile = $activeFile;
      }
      
      return remainingFiles;
    });

    activeFile.set(newActiveFile);
  }

  function handleSelectFile(event) {
    activeFile.set(event.detail);
  }
</script>

<div class="flex h-full bg-base-200">
  <div class="flex h-full w-64 flex-shrink-0 flex-grow-0 flex-col border-r border-base-300">
    <div class="p-2">
      <input 
        type="text"
        class="input input-bordered w-full"
        placeholder="Search files" 
        bind:value={$searchTerm}
      >
    </div>
    <FileExplorer files={$filteredFiles} on:select={handleFileSelect} />
  </div>
  <div class="flex flex-1 flex-col overflow-hidden bg-base-100 p-0">
    <CodeEditor 
      openFiles={$openFiles} 
      activeFile={$activeFile} 
      on:closeFile={handleCloseFile} 
      on:selectFile={handleSelectFile} 
    />
  </div>
</div>