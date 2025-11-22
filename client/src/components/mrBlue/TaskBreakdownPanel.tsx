import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ListTodo, Play, PlayCircle, Clock, AlertTriangle, CheckCircle2, Network, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Subtask {
  id: string;
  description: string;
  type: 'setup' | 'implementation' | 'testing' | 'documentation';
  dependencies: string[];
  estimatedMinutes: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

interface TaskDecomposition {
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedTotalTime: number;
  subtasks: Subtask[];
  risks: string[];
  suggestions: string[];
}

export function TaskBreakdownPanel() {
  const { toast } = useToast();
  const [taskDescription, setTaskDescription] = useState('');
  const [decomposition, setDecomposition] = useState<TaskDecomposition | null>(null);

  // Mutation: Decompose task
  const decomposeMutation = useMutation({
    mutationFn: async (description: string) => {
      return await apiRequest('/api/mrblue/task-planner/decompose', {
        method: 'POST',
        body: { taskDescription: description }
      });
    },
    onSuccess: (data) => {
      setDecomposition(data);
      toast({
        title: 'Task Breakdown Complete',
        description: `Generated ${data.subtasks.length} subtasks.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Breakdown Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation: Execute subtask
  const executeMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      return await apiRequest('/api/mrblue/task-planner/execute', {
        method: 'POST',
        body: { subtaskId }
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Subtask Executed',
        description: data.message || 'Subtask completed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Execution Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleDecompose = () => {
    if (!taskDescription.trim()) {
      toast({
        title: 'Empty Task',
        description: 'Please describe the task you want to break down.',
        variant: 'destructive',
      });
      return;
    }
    decomposeMutation.mutate(taskDescription);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'complex': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'setup': return '⚙️';
      case 'implementation': return '💻';
      case 'testing': return '🧪';
      case 'documentation': return '📝';
      default: return '📋';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="panel-task-breakdown">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ListTodo className="h-6 w-6" />
              AI Task Planner
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Break down complex tasks into actionable subtasks
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Describe Your Task</CardTitle>
              <CardDescription>
                Enter a detailed description of what you want to accomplish
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Task Description</Label>
                <Textarea
                  placeholder="e.g., Create a user authentication system with email/password and OAuth support..."
                  className="min-h-32"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  data-testid="textarea-task-description"
                />
              </div>
              <Button
                onClick={handleDecompose}
                disabled={decomposeMutation.isPending}
                data-testid="button-decompose"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {decomposeMutation.isPending ? 'Breaking Down...' : 'AI Break Down Task'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {decomposition && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Complexity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getComplexityColor(decomposition.complexity)}>
                      {decomposition.complexity.toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Estimated Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      {decomposition.estimatedTotalTime} min
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Subtasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{decomposition.subtasks.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Risks & Suggestions */}
              {(decomposition.risks.length > 0 || decomposition.suggestions.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {decomposition.risks.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Potential Risks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {decomposition.risks.map((risk, i) => (
                            <li key={i}>• {risk}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                  {decomposition.suggestions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {decomposition.suggestions.map((suggestion, i) => (
                            <li key={i}>• {suggestion}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Subtasks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Subtasks ({decomposition.subtasks.length})</CardTitle>
                      <CardDescription>
                        Execute tasks one by one or all at once
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid="button-execute-sequential">
                        <Play className="h-4 w-4 mr-2" />
                        Execute One by One
                      </Button>
                      <Button size="sm" data-testid="button-execute-all">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Execute All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {decomposition.subtasks.map((subtask, index) => (
                        <div key={subtask.id}>
                          {index > 0 && <Separator className="my-2" />}
                          <Card className="hover-elevate" data-testid={`subtask-${subtask.id}`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getTypeIcon(subtask.type)}</span>
                                    <p className="font-medium">{subtask.description}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <Badge variant="secondary">{subtask.type}</Badge>
                                    <Badge className={getRiskColor(subtask.riskLevel)}>
                                      {subtask.riskLevel} risk
                                    </Badge>
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {subtask.estimatedMinutes} min
                                    </span>
                                    {subtask.requiresApproval && (
                                      <Badge variant="outline">Requires approval</Badge>
                                    )}
                                    {subtask.dependencies.length > 0 && (
                                      <Badge variant="outline">
                                        <Network className="h-3 w-3 mr-1" />
                                        {subtask.dependencies.length} dependencies
                                      </Badge>
                                    )}
                                  </div>
                                  {subtask.dependencies.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      Depends on: {subtask.dependencies.join(', ')}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => executeMutation.mutate(subtask.id)}
                                  disabled={executeMutation.isPending}
                                  data-testid={`button-execute-${subtask.id}`}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Execute
                                </Button>
                              </div>
                            </CardHeader>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
