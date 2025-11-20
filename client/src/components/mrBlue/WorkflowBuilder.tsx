import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import {
  Play,
  Save,
  FolderOpen,
  Plus,
  Trash2,
  GitBranch,
  Loader2,
  Bot,
  Zap,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AgentNodeData {
  agentId: string;
  agentName: string;
  description: string;
  capabilities: string[];
}

const initialNodes: Node<AgentNodeData>[] = [];
const initialEdges: Edge[] = [];

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const { data: agents, isLoading: agentsLoading } = useAgentRegistry();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddAgent = (agent: any) => {
    const newNode: Node<AgentNodeData> = {
      id: `agent-${Date.now()}`,
      type: 'default',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        agentId: agent.id,
        agentName: agent.name,
        description: agent.description || '',
        capabilities: agent.capabilities || [],
      },
      style: {
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '200px',
      },
    };

    setNodes((nds) => [...nds, newNode]);
    toast({
      title: 'Agent added',
      description: `${agent.name} has been added to the workflow`,
    });
  };

  const handleClearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    toast({
      title: 'Workflow cleared',
      description: 'All agents and connections have been removed',
    });
  };

  const handleSaveWorkflow = async () => {
    setIsSaving(true);
    try {
      const workflow = {
        name: workflowName,
        nodes: nodes.map(node => ({
          id: node.id,
          agentId: node.data.agentId,
          position: node.position,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
        })),
      };

      await apiRequest('/api/mrblue/workflows', {
        method: 'POST',
        body: JSON.stringify(workflow),
      });

      toast({
        title: 'Workflow saved',
        description: `"${workflowName}" has been saved successfully`,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save workflow. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: 'Empty workflow',
        description: 'Add at least one agent to execute the workflow',
        variant: 'destructive',
      });
      return;
    }

    setIsExecuting(true);
    try {
      const executionPlan = {
        workflowName,
        agents: nodes.map(node => ({
          id: node.id,
          agentId: node.data.agentId,
          name: node.data.agentName,
        })),
        connections: edges.map(edge => ({
          from: edge.source,
          to: edge.target,
        })),
      };

      const result = await apiRequest('/api/mrblue/orchestration/a2a/execute', {
        method: 'POST',
        body: JSON.stringify(executionPlan),
      });

      toast({
        title: 'Workflow executed',
        description: 'The workflow has been submitted for execution',
      });
    } catch (error) {
      toast({
        title: 'Execution failed',
        description: 'Failed to execute workflow. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-full flex gap-4" data-testid="container-workflow-builder">
      {/* Agent Palette Sidebar */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Available Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="p-4 space-y-2">
              {agentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : agents && agents.length > 0 ? (
                agents.map((agent: any) => (
                  <Card
                    key={agent.id}
                    className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                    onClick={() => handleAddAgent(agent)}
                    data-testid={`card-agent-${agent.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">
                            {agent.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {agent.description || 'No description'}
                          </p>
                          {agent.capabilities && agent.capabilities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {agent.capabilities.slice(0, 2).map((cap: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                              {agent.capabilities.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agent.capabilities.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No agents available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Workflow Canvas */}
      <Card className="flex-1 overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="font-semibold text-lg border-0 p-0 h-auto focus-visible:ring-0"
                placeholder="Workflow name..."
                data-testid="input-workflow-name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearWorkflow}
                disabled={nodes.length === 0}
                data-testid="button-clear"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveWorkflow}
                disabled={isSaving || nodes.length === 0}
                data-testid="button-save-workflow"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteWorkflow}
                disabled={isExecuting || nodes.length === 0}
                data-testid="button-execute-workflow"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Execute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100vh-12rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            data-testid="reactflow-canvas"
          >
            <Background variant={BackgroundVariant.Dots} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                return 'hsl(var(--primary))';
              }}
              maskColor="hsl(var(--muted) / 0.5)"
            />
            <Panel position="top-left">
              <Card className="shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {nodes.length} agent{nodes.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {edges.length} connection{edges.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </CardContent>
      </Card>
    </div>
  );
}
