// Flow execution engine for agent workflows

export interface FlowNode {
	id: string;
	type: 'input' | 'llm' | 'tool' | 'condition' | 'output';
	position: { x: number; y: number };
	data: {
		label: string;
		config?: any;
	};
}

export interface FlowConnection {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
}

export interface ExecutionContext {
	variables: Record<string, any>;
	currentNode: string;
	executionId: string;
	startTime: number;
}

export interface ExecutionResult {
	success: boolean;
	output?: any;
	error?: string;
	executionTime: number;
	nodesExecuted: string[];
}

export class FlowExecutionEngine {
	private nodes: FlowNode[];
	private connections: FlowConnection[];
	private context: ExecutionContext;

	constructor(nodes: FlowNode[], connections: FlowConnection[]) {
		this.nodes = nodes;
		this.connections = connections;
		this.context = {
			variables: {},
			currentNode: '',
			executionId: `exec_${Date.now()}`,
			startTime: Date.now()
		};
	}

	async execute(input?: any): Promise<ExecutionResult> {
		try {
			const startNode = this.findStartNode();
			if (!startNode) {
				throw new Error('No input node found');
			}

			// Initialize with input data
			if (input) {
				this.context.variables.input = input;
			}

			const nodesExecuted: string[] = [];
			let currentNodeId = startNode.id;

			while (currentNodeId) {
				const node = this.nodes.find(n => n.id === currentNodeId);
				if (!node) break;

				this.context.currentNode = currentNodeId;
				nodesExecuted.push(currentNodeId);

				// Execute the node
				const nodeResult = await this.executeNode(node);
				
				// Store node result in context
				this.context.variables[`node_${node.id}`] = nodeResult;

				// Find next node
				const nextNodeId = await this.getNextNode(node, nodeResult);
				if (nextNodeId === null) {
					break; // End of flow
				}
				currentNodeId = nextNodeId;
			}

			const executionTime = Date.now() - this.context.startTime;
			const outputNode = this.nodes.find(n => n.type === 'output');
			const finalOutput = outputNode ? this.context.variables[`node_${outputNode.id}`] : this.context.variables;

			return {
				success: true,
				output: finalOutput,
				executionTime,
				nodesExecuted
			};

		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				executionTime: Date.now() - this.context.startTime,
				nodesExecuted: []
			};
		}
	}

	private findStartNode(): FlowNode | undefined {
		return this.nodes.find(node => node.type === 'input');
	}

	private async executeNode(node: FlowNode): Promise<any> {
		switch (node.type) {
			case 'input':
				return this.executeInputNode(node);
			case 'llm':
				return this.executeLLMNode(node);
			case 'tool':
				return this.executeToolNode(node);
			case 'condition':
				return this.executeConditionNode(node);
			case 'output':
				return this.executeOutputNode(node);
			default:
				throw new Error(`Unknown node type: ${node.type}`);
		}
	}

	private executeInputNode(node: FlowNode): any {
		// Input node passes through the initial input or prompts for input
		return this.context.variables.input || node.data.label || 'User input';
	}

	private async executeLLMNode(node: FlowNode): Promise<any> {
		// Simulate LLM processing
		const input = this.context.variables.input || 'No input provided';
		
		// In a real implementation, this would call an actual LLM API
		await this.delay(1500); // Simulate processing time
		
		return {
			response: `LLM processed: "${input}" -> Generated response from ${node.data.label}`,
			model: node.data.config?.model || 'gpt-4',
			tokens: Math.floor(Math.random() * 1000) + 100
		};
	}

	private async executeToolNode(node: FlowNode): Promise<any> {
		// Simulate tool execution
		await this.delay(800);
		
		const toolName = node.data.config?.toolName || 'Generic Tool';
		const input = this.getPreviousNodeOutput();
		
		return {
			toolResult: `${toolName} executed with input: ${JSON.stringify(input)}`,
			success: true,
			data: { processedAt: new Date().toISOString() }
		};
	}

	private executeConditionNode(node: FlowNode): any {
		// Simple condition evaluation
		const input = this.getPreviousNodeOutput();
		const condition = node.data.config?.condition || 'true';
		
		// Basic condition evaluation (in real implementation, use a safe evaluator)
		let result = true;
		try {
			// Simple string-based conditions
			if (typeof input === 'string') {
				result = input.length > 0;
			} else if (typeof input === 'number') {
				result = input > 0;
			}
		} catch {
			result = false;
		}
		
		return {
			condition: condition,
			result: result,
			input: input
		};
	}

	private executeOutputNode(node: FlowNode): any {
		// Output node formats and returns the final result
		const previousOutput = this.getPreviousNodeOutput();
		
		return {
			finalOutput: previousOutput,
			formattedResponse: `Output from ${node.data.label}: ${JSON.stringify(previousOutput)}`,
			timestamp: new Date().toISOString()
		};
	}

	private getPreviousNodeOutput(): any {
		// Get the output from the previous node in the execution chain
		const currentNode = this.nodes.find(n => n.id === this.context.currentNode);
		if (!currentNode) return null;

		const incomingConnection = this.connections.find(c => c.target === currentNode.id);
		if (!incomingConnection) return this.context.variables.input;

		return this.context.variables[`node_${incomingConnection.source}`];
	}

	private async getNextNode(currentNode: FlowNode, nodeResult: any): Promise<string | null> {
		const outgoingConnections = this.connections.filter(c => c.source === currentNode.id);
		
		if (outgoingConnections.length === 0) {
			return null; // End of flow
		}

		if (outgoingConnections.length === 1) {
			return outgoingConnections[0].target;
		}

		// For condition nodes, choose path based on result
		if (currentNode.type === 'condition' && nodeResult.result !== undefined) {
			// In a real implementation, you'd have labeled connections (true/false paths)
			return outgoingConnections[nodeResult.result ? 0 : 1]?.target || outgoingConnections[0].target;
		}

		// Default to first connection
		return outgoingConnections[0].target;
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	// Public methods for monitoring execution
	getExecutionContext(): ExecutionContext {
		return { ...this.context };
	}

	updateVariable(key: string, value: any): void {
		this.context.variables[key] = value;
	}

	static validateFlow(nodes: FlowNode[], connections: FlowConnection[]): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		// Check for start node
		const inputNodes = nodes.filter(n => n.type === 'input');
		if (inputNodes.length === 0) {
			errors.push('Flow must have at least one input node');
		}
		if (inputNodes.length > 1) {
			errors.push('Flow can only have one input node');
		}

		// Check for end node
		const outputNodes = nodes.filter(n => n.type === 'output');
		if (outputNodes.length === 0) {
			errors.push('Flow must have at least one output node');
		}

		// Check for disconnected nodes
		nodes.forEach(node => {
			const hasIncoming = connections.some(c => c.target === node.id);
			const hasOutgoing = connections.some(c => c.source === node.id);
			
			if (node.type !== 'input' && !hasIncoming) {
				errors.push(`Node "${node.data.label}" has no incoming connections`);
			}
			if (node.type !== 'output' && !hasOutgoing) {
				errors.push(`Node "${node.data.label}" has no outgoing connections`);
			}
		});

		// Check for invalid connections
		connections.forEach(connection => {
			const sourceNode = nodes.find(n => n.id === connection.source);
			const targetNode = nodes.find(n => n.id === connection.target);
			
			if (!sourceNode) {
				errors.push(`Connection references non-existent source node: ${connection.source}`);
			}
			if (!targetNode) {
				errors.push(`Connection references non-existent target node: ${connection.target}`);
			}
		});

		return {
			valid: errors.length === 0,
			errors
		};
	}
}