import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked with custom renderer
const renderer = new marked.Renderer();

// Custom code block renderer with syntax highlighting
renderer.code = function(code: string, language?: string) {
  const validLanguage = language && hljs.getLanguage(language) ? language : 'plaintext';
  const highlighted = hljs.highlight(code, { language: validLanguage });
  
  return `
    <div class="mockup-code bg-base-300 my-4 overflow-x-auto">
      <div class="flex items-center justify-between px-4 py-2 bg-base-200 text-xs">
        <span class="text-base-content/60">${validLanguage}</span>
        <button 
          class="btn btn-ghost btn-xs copy-code-btn" 
          data-code="${encodeURIComponent(code)}"
          title="Copy code"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
        </button>
      </div>
      <pre class="px-4 pb-4"><code class="language-${validLanguage}">${highlighted.value}</code></pre>
    </div>
  `;
};

// Custom inline code renderer
renderer.codespan = function(code: string) {
  return `<code class="px-1.5 py-0.5 bg-base-300 text-base-content rounded text-sm font-mono">${code}</code>`;
};

// Custom blockquote renderer
renderer.blockquote = function(quote: string) {
  return `<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 bg-base-200/50 italic text-base-content/80">${quote}</blockquote>`;
};

// Custom table renderer
renderer.table = function(header: string, body: string) {
  return `
    <div class="overflow-x-auto my-4">
      <table class="table table-compact w-full">
        <thead>${header}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
};

// Custom list renderer
renderer.list = function(body: string, ordered?: boolean) {
  const tag = ordered ? 'ol' : 'ul';
  const className = ordered ? 'list-decimal list-inside' : 'list-disc list-inside';
  return `<${tag} class="${className} my-2 ml-4 space-y-1">${body}</${tag}>`;
};

// Custom list item renderer
renderer.listitem = function(text: string) {
  return `<li class="text-base-content">${text}</li>`;
};

// Custom heading renderer
renderer.heading = function(text: string, level: number) {
  const sizes = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-bold', 
    3: 'text-lg font-semibold',
    4: 'text-base font-semibold',
    5: 'text-sm font-semibold',
    6: 'text-xs font-semibold'
  };
  
  const className = sizes[level as keyof typeof sizes] || sizes[4];
  return `<h${level} class="${className} text-base-content mt-4 mb-2">${text}</h${level}>`;
};

// Custom link renderer
renderer.link = function(href: string, title: string | null, text: string) {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}" class="link link-primary underline" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
};

// Custom strong renderer
renderer.strong = function(text: string) {
  return `<strong class="font-bold text-base-content">${text}</strong>`;
};

// Custom em renderer
renderer.em = function(text: string) {
  return `<em class="italic text-base-content">${text}</em>`;
};

// Configure marked options
marked.setOptions({
  renderer,
  highlight: function(code: string, lang?: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {
        console.warn('Syntax highlighting failed:', err);
      }
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true, // Convert \n to <br>
  gfm: true,    // GitHub Flavored Markdown
});

/**
 * Convert MCP protocol and agent note messages to alert components
 */
function processMCPMessages(text: string): string {
  // Match MCP protocol messages in format: *[MCP Protocol Active: ...]*
  const mcpPattern = /\*\[MCP Protocol[^:]*:\s*([^\]]+)\]\*/g;
  
  // Match agent note messages in format: *(Agent Note: ...)*
  const agentNotePattern = /\*\(Agent Note:\s*([^)]+)\)\*/g;
  
  let result = text;
  
  // Process MCP Protocol messages
  result = result.replace(mcpPattern, (match, content) => {
    return `<div role="alert" class="alert alert-info alert-soft my-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity">
        <path d="m22 12-4-4v3a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9v3l4-4"/>
      </svg>
      <span><strong>MCP Protocol:</strong> ${content.trim()}</span>
    </div>`;
  });
  
  // Process Agent Note messages
  result = result.replace(agentNotePattern, (match, content) => {
    return `<div role="alert" class="alert alert-warning alert-soft my-3">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-check">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <polyline points="16,11 18,13 22,9"/>
      </svg>
      <span><strong>Agent Note:</strong> ${content.trim()}</span>
    </div>`;
  });
  
  return result;
}

/**
 * Convert markdown text to HTML with syntax highlighting
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  try {
    // First process MCP protocol messages
    const processedText = processMCPMessages(markdown);
    return marked.parse(processedText);
  } catch (error) {
    console.error('Markdown parsing error:', error);
    // Fallback to escaped plain text with MCP processing
    const escaped = markdown
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    return processMCPMessages(escaped);
  }
}

/**
 * Extract and clean text content from markdown (for previews, search, etc.)
 */
export function markdownToText(markdown: string): string {
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  // Remove markdown syntax
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
    .replace(/\n{2,}/g, '\n') // Normalize line breaks
    .trim();
}

/**
 * Setup copy code functionality for dynamically added code blocks
 */
export function setupCopyCodeHandlers(container: HTMLElement) {
  const copyButtons = container.querySelectorAll('.copy-code-btn');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const codeData = (e.currentTarget as HTMLElement).getAttribute('data-code');
      if (codeData) {
        const code = decodeURIComponent(codeData);
        navigator.clipboard.writeText(code).then(() => {
          // Visual feedback
          const originalText = (e.currentTarget as HTMLElement).innerHTML;
          (e.currentTarget as HTMLElement).innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          `;
          
          setTimeout(() => {
            (e.currentTarget as HTMLElement).innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy code:', err);
        });
      }
    });
  });
}