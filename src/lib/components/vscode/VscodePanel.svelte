<script lang="ts">
  import FileExplorer from './FileExplorer.svelte';
  import CodeEditor from './CodeEditor.svelte';
  import { files as mockFiles } from '../../vsc-mock/files';
  import { writable } from 'svelte/store';

  let openFiles = writable([]);
  let activeFile = writable(null);

  function handleFileSelect(event) {
    const file = event.detail;
    if (!$openFiles.find(f => f.path === file.path)) {
      openFiles.update(files => [...files, file]);
    }
    activeFile.set(file);
  }

  function handleCloseFile(event) {
    const fileToClose = event.detail;
    openFiles.update(files => files.filter(f => f.path !== fileToClose.path));
    if ($activeFile && $activeFile.path === fileToClose.path) {
      activeFile.set($openFiles[0] || null);
    }
  }
</script>

<div class="flex h-full bg-background">
  <div class="flex h-full w-64 flex-shrink-0 flex-grow-0 flex-col border-r border-border">
    <div class="p-2">
      <input class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" placeholder="Search files" value="">
    </div>
    <FileExplorer files={mockFiles} on:select={handleFileSelect} />
  </div>
  <div class="flex flex-1 flex-col overflow-hidden bg-muted p-0">
    <CodeEditor bind:openFiles={$openFiles} bind:activeFile={$activeFile} on:closeFile={handleCloseFile} on:selectFile={(e) => activeFile.set(e.detail)} />
  </div>
</div>
