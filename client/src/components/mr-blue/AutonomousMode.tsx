/**
 * MR BLUE AUTONOMOUS MODE - SYSTEM 7
 * Frontend interface for autonomous coding engine
 * 
 * Features:
 * - Natural language input
 * - Task decomposition preview
 * - Real-time progress tracking
 * - File diff viewer
 * - Approve/Reject controls
 * - Cost tracking
 */

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Loader2,
  Sparkles,
  Code,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubTask {
  id: string;
  description: string;
  type: string;
  dependencies: string[];
  files: string[];
  estimatedMinutes: number;
  priority: string;
  riskLevel: string;
  requiresApproval: boolean;
}

interface TaskDecomposition {
  userRequest: string;
  subtasks: SubTask[];
  estimatedTotalTime: number;
  complexity: string;
  parallelizationPossible: boolean;
  warnings: string[];
  metadata: {
    confidenceScore: number;
    recommendedApproach: string;
    alternativeApproaches?: string[];
  };
}

interface SessionTask {
  id: number;
  sessionId: string;
  taskNumber: number;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';
  code?: any;
  validationResults?: any;
  attempts: number;
  cost: number;
  completedAt?: Date;
}

interface ProgressUpdate {
  sessionId: string;
  status: string;
  currentTask?: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  cost: number;
  estimatedTimeRemaining: number;
  tasks: SessionTask[];
}

export default function AutonomousMode() {
  const [userRequest, setUserRequest] = useState('');
  const [decomposition, setDecomposition] = useState<TaskDecomposition | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Decompose task mutation
  const decomposeMutation = useMutation({
    mutationFn: async (request: string) => {
      const response = await apiRequest('POST', '/api/mrblue/autonomous/decompose', {
        userRequest: request,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setDecomposition(data.decomposition);
      toast({
        title: 'Task Decomposed',
        description: `Broken down into ${data.decomposition.subtasks.length} subtasks`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Decomposition Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Start autonomous session mutation
  const startMutation = useMutation({
    mutationFn: async (request: string) => {
      const response = await apiRequest('POST', '/api/mrblue/autonomous/start', {
        userRequest: request,
        maxCost: 5.0,
        runTests: false,
        autoApprove: false,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsRunning(true);
      toast({
        title: 'Autonomous Session Started',
        description: `Working on your request...`,
      });
    },
    onError: (error: any) {
      toast({
        title: 'Failed to Start',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get session history
  const { data: history } = useQuery({
    queryKey: ['/api/mrblue/autonomous/history'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/mrblue/autonomous/history');
      return response.json();
    },
    refetchInterval: false,
  });

  // Handle decompose
  const handleDecompose = () => {
    if (!userRequest.trim()) {
      toast({
        title: 'Empty Request',
        description: 'Please enter a feature request',
        variant: 'destructive',
      });
      return;
    }

    decomposeMutation.mutate(userRequest);
  };

  // Handle start autonomous session
  const handleStart = () => {
    if (!userRequest.trim()) {
      toast({
        title: 'Empty Request',
        description: 'Please enter a feature request',
        variant: 'destructive',
      });
      return;
    }

    startMutation.mutate(userRequest);
  };

  // Render task status badge
  const renderTaskStatus = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      executing: { variant: 'default', icon: Loader2, label: 'Running' },
      completed: { variant: 'default', icon: CheckCircle2, label: 'Completed' },
      failed: { variant: 'destructive', icon: XCircle, label: 'Failed' },
      skipped: { variant: 'outline', icon: XCircle, label: 'Skipped' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`w-3 h-3 ${status === 'executing' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  // Render risk badge
  const renderRiskBadge = (riskLevel: string) => {
    const riskConfig: Record<string, { variant: any; label: string }> = {
      safe: { variant: 'default', label: 'Safe' },
      moderate: { variant: 'secondary', label: 'Moderate' },
      risky: { variant: 'destructive', label: 'Risky' },
    };

    const config = riskConfig[riskLevel] || riskConfig.safe;

    return (
      <Badge variant={config.variant} className="gap-1">
        {riskLevel === 'risky' && <AlertTriangle className="w-3 h-3" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6" data-testid="autonomous-mode">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Autonomous Mode
          </h1>
          <p className="text-muted-foreground mt-2">
            Tell Mr Blue what feature you want, and I'll build it end-to-end
          </p>
        </div>
      </div>

      {/* Input Section */}
      <Card data-testid="card-request-input">
        <CardHeader>
          <CardTitle>Feature Request</CardTitle>
          <CardDescription>
            Describe the feature you want in natural language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            data-testid="input-feature-request"
            placeholder="Example: Build a chat feature with real-time messaging, user authentication, and message history"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            className="min-h-32 resize-none"
            disabled={isRunning}
          />
          
          <div className="flex gap-2">
            <Button
              data-testid="button-decompose"
              onClick={handleDecompose}
              disabled={decomposeMutation.isPending || isRunning || !userRequest.trim()}
              variant="outline"
              className="gap-2"
            >
              {decomposeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decomposing...
                </>
              ) : (
                <>
                  <Code className="w-4 h-4" />
                  Preview Tasks
                </>
              )}
            </Button>

            <Button
              data-testid="button-start"
              onClick={handleStart}
              disabled={startMutation.isPending || isRunning || !userRequest.trim()}
              className="gap-2"
            >
              {startMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Autonomous Build
                </>
              )}
            </Button>

            {isRunning && (
              <Button
                data-testid="button-stop"
                onClick={() => setIsRunning(false)}
                variant="destructive"
                className="gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            )}
          </div>

          {/* Warnings */}
          {decomposition && decomposition.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Warnings:</div>
                <ul className="list-disc list-inside space-y-1">
                  {decomposition.warnings.map((warning, i) => (
                    <li key={i} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Decomposition Preview */}
      {decomposition && (
        <Card data-testid="card-decomposition">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Task Breakdown</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  ~{decomposition.estimatedTotalTime} min
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <DollarSign className="w-3 h-3" />
                  ~${(decomposition.subtasks.length * 0.05).toFixed(2)}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Complexity: {decomposition.complexity} | 
              Confidence: {(decomposition.metadata.confidenceScore * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {decomposition.subtasks.map((task, index) => (
                  <Card key={task.id} data-testid={`task-${task.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                              {index + 1}
                            </span>
                            {task.description}
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          {renderRiskBadge(task.riskLevel)}
                          <Badge variant="outline">{task.type}</Badge>
                          <Badge variant="outline">{task.priority}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        ~{task.estimatedMinutes} minutes
                      </div>
                      
                      {task.files.length > 0 && (
                        <div className="text-sm">
                          <div className="font-semibold mb-1">Files:</div>
                          <div className="flex flex-wrap gap-1">
                            {task.files.map((file, i) => (
                              <Badge key={i} variant="secondary" className="font-mono text-xs">
                                {file}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.dependencies.length > 0 && (
                        <div className="text-sm">
                          <div className="font-semibold mb-1">Dependencies:</div>
                          <div className="flex flex-wrap gap-1">
                            {task.dependencies.map((dep, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.requiresApproval && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            This task requires manual approval before execution
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="font-semibold">Recommended Approach:</div>
              <p className="text-sm text-muted-foreground">
                {decomposition.metadata.recommendedApproach}
              </p>

              {decomposition.metadata.alternativeApproaches && 
               decomposition.metadata.alternativeApproaches.length > 0 && (
                <>
                  <div className="font-semibold mt-4">Alternative Approaches:</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {decomposition.metadata.alternativeApproaches.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      {history && history.sessions && history.sessions.length > 0 && (
        <Card data-testid="card-history">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Your past autonomous coding sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {history.sessions.map((session: any) => (
                  <Card key={session.id} data-testid={`session-${session.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold">{session.userRequest}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(session.startedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {renderTaskStatus(session.status)}
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${session.cost.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress 
                          value={(session.completedTasks / session.totalTasks) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {session.completedTasks} / {session.totalTasks} tasks completed
                          {session.failedTasks > 0 && ` (${session.failedTasks} failed)`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
