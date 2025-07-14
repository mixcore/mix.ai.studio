<script lang="ts">
	import { 
		Play, 
		Square, 
		Save, 
		Trash2,
		Upload,
		Zap,
		MessageSquare,
		Database,
		GitBranch,
		Target,
		X
	} from 'lucide-svelte';
	import { FlowExecutionEngine } from '$lib/agent/flowEngine';
	import type { FlowNode, FlowConnection, ExecutionResult } from '$lib/agent/flowEngine';

	// Execution state
	let executionResult: ExecutionResult | null = null;

	// State
	let nodes: FlowNode[] = [
		{
			id: 'start',
			type: 'input',
			position: { x: 100, y: 200 },
			data: { label: 'User Input' }
		},
		{
			id: 'llm1',
			type: 'llm',
			position: { x: 300, y: 200 },
			data: { label: 'LLM Processing' }
		},
		{
			id: 'end',
			type: 'output',
			position: { x: 500, y: 200 },
			data: { label: 'Response' }
		}
	];

	let connections: FlowConnection[] = [
		{ id: 'e1-2', source: 'start', target: 'llm1' },
		{ id: 'e2-3', source: 'llm1', target: 'end' }
	];

	let selectedNode: string | null = null;
	let selectedNodeLabel = '';
	let isExecuting = false;
	let draggedNode: string | null = null;
	let dragOffset = { x: 0, y: 0 };

	// Reactive statements for two-way binding
	$: {
		if (selectedNode) {
			const node = nodes.find(n => n.id === selectedNode);
			if (node && selectedNodeLabel !== node.data.label) {
				selectedNodeLabel = node.data.label;
			}
		}
	}

	// Function to update node label (called from input)
	function updateSelectedNodeLabel(newLabel: string) {
		if (selectedNode) {
			const nodeIndex = nodes.findIndex(n => n.id === selectedNode);
			if (nodeIndex !== -1) {
				nodes[nodeIndex].data.label = newLabel;
				nodes = [...nodes]; // Trigger reactivity
				selectedNodeLabel = newLabel;
			}
		}
	}

	// Node type configurations
	const nodeTypes = [
		{ type: 'input', label: 'Input', icon: MessageSquare, color: 'bg-blue-500' },
		{ type: 'llm', label: 'LLM', icon: Zap, color: 'bg-purple-500' },
		{ type: 'tool', label: 'Tool', icon: Database, color: 'bg-green-500' },
		{ type: 'condition', label: 'Condition', icon: GitBranch, color: 'bg-yellow-500' },
		{ type: 'output', label: 'Output', icon: Target, color: 'bg-red-500' }
	];

	// Functions
	function getNodeTypeConfig(type: string) {
		return nodeTypes.find(nt => nt.type === type) || nodeTypes[0];
	}

	function handleNodeClick(nodeId: string) {
		selectedNode = selectedNode === nodeId ? null : nodeId;
	}

	function handleNodeDragStart(event: MouseEvent, nodeId: string) {
		draggedNode = nodeId;
		const node = nodes.find(n => n.id === nodeId);
		if (node) {
			dragOffset = {
				x: event.clientX - node.position.x,
				y: event.clientY - node.position.y
			};
		}
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent) {
		if (draggedNode) {
			const nodeIndex = nodes.findIndex(n => n.id === draggedNode);
			if (nodeIndex !== -1) {
				nodes[nodeIndex].position = {
					x: event.clientX - dragOffset.x,
					y: event.clientY - dragOffset.y
				};
				nodes = [...nodes]; // Trigger reactivity
			}
		}
	}

	function handleMouseUp() {
		draggedNode = null;
	}

	function addNode(type: string) {
		const newNode: FlowNode = {
			id: `node_${Date.now()}`,
			type: type as any,
			position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 200 },
			data: { label: getNodeTypeConfig(type).label }
		};
		nodes = [...nodes, newNode];
	}

	function deleteNode(nodeId: string) {
		nodes = nodes.filter(n => n.id !== nodeId);
		connections = connections.filter(c => c.source !== nodeId && c.target !== nodeId);
		selectedNode = null;
	}

	async function executeFlow() {
		isExecuting = true;
		executionResult = null;
		
		try {
			// Validate flow before execution
			const validation = FlowExecutionEngine.validateFlow(nodes, connections);
			if (!validation.valid) {
				console.error('Flow validation failed:', validation.errors);
				executionResult = {
					success: false,
					error: `Validation failed: ${validation.errors.join(', ')}`,
					executionTime: 0,
					nodesExecuted: []
				};
				return;
			}

			// Create and execute flow
			const engine = new FlowExecutionEngine(nodes, connections);
			const userInput = prompt('Enter input for the flow:') || 'Hello from user';
			
			executionResult = await engine.execute(userInput);
			console.log('Flow execution result:', executionResult);
			
		} catch (error) {
			console.error('Flow execution error:', error);
			executionResult = {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				executionTime: 0,
				nodesExecuted: []
			};
		} finally {
			isExecuting = false;
		}
	}

	function saveFlow() {
		const flowData = { nodes, connections };
		console.log('Saving flow:', flowData);
		// Implement save functionality
	}

	function loadFlow() {
		// Implement load functionality
		console.log('Loading flow...');
	}

	// SVG path calculation for connections
	function getConnectionPath(connection: FlowConnection) {
		const sourceNode = nodes.find(n => n.id === connection.source);
		const targetNode = nodes.find(n => n.id === connection.target);
		
		if (!sourceNode || !targetNode) return '';
		
		const x1 = sourceNode.position.x + 100; // Node width
		const y1 = sourceNode.position.y + 40; // Node height / 2
		const x2 = targetNode.position.x;
		const y2 = targetNode.position.y + 40;
		
		const dx = x2 - x1;
		const mx = x1 + dx / 2;
		
		return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div class="h-full flex flex-col bg-base-100">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 border-b border-base-200/60">
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<GitBranch class="w-5 h-5 text-primary" />
				<h2 class="text-lg font-semibold">Agent Flow</h2>
			</div>
		</div>
		
		<div class="flex items-center gap-2">
			<button 
				class="btn btn-ghost btn-sm"
				on:click={loadFlow}
				title="Load flow"
			>
				<Upload class="w-4 h-4" />
			</button>
			
			<button 
				class="btn btn-ghost btn-sm"
				on:click={saveFlow}
				title="Save flow"
			>
				<Save class="w-4 h-4" />
			</button>
			
			<button 
				class="btn btn-primary btn-sm"
				on:click={executeFlow}
				class:loading={isExecuting}
				title="Execute flow"
			>
				{#if isExecuting}
					<Square class="w-4 h-4" />
					Stop
				{:else}
					<Play class="w-4 h-4" />
					Run
				{/if}
			</button>
		</div>
	</div>

	<div class="flex-1 flex">
		<!-- Node Palette -->
		<div class="w-64 bg-base-50 border-r border-base-200/60 p-4">
			<h3 class="font-medium mb-4">Node Types</h3>
			<div class="space-y-2">
				{#each nodeTypes as nodeType}
					<button
						class="w-full p-3 text-left rounded-lg border border-base-300 hover:border-primary/30 transition-colors"
						on:click={() => addNode(nodeType.type)}
					>
						<div class="flex items-center gap-3">
							<div class="w-8 h-8 {nodeType.color} rounded-md flex items-center justify-center text-white">
								<svelte:component this={nodeType.icon} class="w-4 h-4" />
							</div>
							<div>
								<div class="font-medium text-sm">{nodeType.label}</div>
								<div class="text-xs text-base-content/60">
									{nodeType.type === 'input' ? 'Start point' :
									 nodeType.type === 'llm' ? 'AI processing' :
									 nodeType.type === 'tool' ? 'External tool' :
									 nodeType.type === 'condition' ? 'Logic branch' : 'End point'}
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>

			{#if selectedNode}
				<div class="mt-6">
					<h3 class="font-medium mb-4">Node Settings</h3>
					<div class="space-y-3">
						<div>
							<label class="label" for="node-label-input">
								<span class="label-text">Label</span>
							</label>
							<input 
								id="node-label-input"
								type="text" 
								class="input input-bordered input-sm w-full"
								value={selectedNodeLabel}
								on:input={(e) => updateSelectedNodeLabel((e.target as HTMLInputElement).value)}
							/>
						</div>
						<button 
							class="btn btn-error btn-sm w-full"
							on:click={() => selectedNode && deleteNode(selectedNode)}
						>
							<Trash2 class="w-4 h-4" />
							Delete Node
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Flow Canvas -->
		<div class="flex-1 relative overflow-hidden bg-base-50">
			<svg class="absolute inset-0 w-full h-full">
				<!-- Grid pattern -->
				<defs>
					<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--bc))" stroke-width="0.5" opacity="0.1"/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid)" />
				
				<!-- Connections -->
				{#each connections as connection}
					<path
						d={getConnectionPath(connection)}
						stroke="hsl(var(--p))"
						stroke-width="2"
						fill="none"
						opacity="0.6"
					/>
				{/each}
			</svg>

			<!-- Nodes -->
			{#each nodes as node}
				<div
					class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move"
					style="left: {node.position.x}px; top: {node.position.y}px"
					on:mousedown={(e) => handleNodeDragStart(e, node.id)}
					on:click={() => handleNodeClick(node.id)}
					on:keydown={(e) => e.key === 'Enter' && handleNodeClick(node.id)}
					role="button"
					tabindex="0"
				>
					<div
						class="bg-base-100 border-2 rounded-lg p-3 min-w-[120px] shadow-lg transition-all
							{selectedNode === node.id ? 'border-primary' : 'border-base-300'}
							{draggedNode === node.id ? 'opacity-50' : 'hover:border-primary/50'}"
					>
						<div class="flex items-center gap-2 mb-2">
							<div class="{getNodeTypeConfig(node.type).color} w-6 h-6 rounded flex items-center justify-center text-white">
								<svelte:component this={getNodeTypeConfig(node.type).icon} class="w-3 h-3" />
							</div>
							<span class="font-medium text-sm">{node.data.label}</span>
						</div>
						<div class="text-xs text-base-content/60">{node.type}</div>
						
						<!-- Connection points -->
						{#if node.type !== 'input'}
							<div class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-base-100"></div>
						{/if}
						{#if node.type !== 'output'}
							<div class="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-base-100"></div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Execution Results Panel -->
		{#if executionResult}
			<div class="absolute bottom-4 right-4 max-w-md">
				<div class="bg-base-100 border border-base-300 rounded-lg p-4 shadow-lg">
					<div class="flex items-center justify-between mb-3">
						<h3 class="font-semibold flex items-center gap-2">
							{#if executionResult.success}
								<div class="w-3 h-3 bg-success rounded-full"></div>
								Execution Complete
							{:else}
								<div class="w-3 h-3 bg-error rounded-full"></div>
								Execution Failed
							{/if}
						</h3>
						<button 
							class="btn btn-ghost btn-xs"
							on:click={() => executionResult = null}
						>
							<X class="w-3 h-3" />
						</button>
					</div>
					
					<div class="space-y-2 text-sm">
						<div>
							<span class="font-medium">Time:</span> 
							{executionResult.executionTime}ms
						</div>
						<div>
							<span class="font-medium">Nodes:</span> 
							{executionResult.nodesExecuted.length}
						</div>
						
						{#if executionResult.success && executionResult.output}
							<div>
								<span class="font-medium">Output:</span>
								<div class="bg-base-200 rounded p-2 mt-1 text-xs max-h-32 overflow-y-auto">
									<pre>{JSON.stringify(executionResult.output, null, 2)}</pre>
								</div>
							</div>
						{/if}
						
						{#if !executionResult.success && executionResult.error}
							<div>
								<span class="font-medium text-error">Error:</span>
								<div class="bg-error/10 border border-error/20 rounded p-2 mt-1 text-xs">
									{executionResult.error}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>