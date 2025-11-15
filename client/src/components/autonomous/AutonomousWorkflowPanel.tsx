/**
 * Autonomous Workflow Panel
 * God Level (Tier 8) Interface for Mr. Blue Autonomous Development
 * 
 * Features:
 * - Prompt-based task execution
 * - Real-time status polling
 * - Task decomposition tree view
 * - Generated files preview with syntax highlighting
 * - Validation report display
 * - Approval/Rollback controls
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileCode,
  GitBranch,
  Undo2,
  Eye,
  DollarSign
} from "lucide-react";

interface AutonomousTask {
  id: string;
  prompt: string;
  status: 'pending' | 'decomposing' | 'generating' | 'validating' | 'awaiting_approval' | 'applying' | 'completed' | 'failed';
  decomposition?: {
    subtasks: Array<{
      id: string;
      description: string;
      estimatedCost?: number;
      dependencies?: string[];
    }>;
    estimatedTotalCost?: number;
  };
  generatedFiles?: Array<{
    filePath: string;
    language: string;
    explanation: string;
    diff?: string;
    content?: string;
  }>;
  validationReport?: {
    lsp: {
      totalErrors: number;
      totalWarnings: number;
      files?: Array<{
        file: string;
        errorCount: number;
        errors: Array<{
          message: string;
          severity: string;
          line?: number;
        }>;
      }>;
    };
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  decomposing: 'bg-blue-500',
  generating: 'bg-purple-500',
  validating: 'bg-yellow-500',
  awaiting_approval: 'bg-orange-500',
  applying: 'bg-indigo-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Loader2 className="h-3 w-3 animate-spin" />,
  decomposing: <Loader2 className="h-3 w-3 animate-spin" />,
  generating: <Loader2 className="h-3 w-3 animate-spin" />,
  validating: <Loader2 className="h-3 w-3 animate-spin" />,
  awaiting_approval: <AlertTriangle className="h-3 w-3" />,
  applying: <Loader2 className="h-3 w-3 animate-spin" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

export function AutonomousWorkflowPanel() {
  const [prompt, setPrompt] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Poll for task status every 2 seconds when task is active
  const { data: taskData, isLoading: isLoadingTask } = useQuery<{ success: boolean; task: AutonomousTask }>({
    queryKey: ['/api/autonomous/status', currentTaskId],
    enabled: !!currentTaskId,
    refetchInterval: (data) => {
      if (!data?.task) return false;
      const activeStatuses = ['pending', 'decomposing', 'generating', 'validating', 'applying'];
      return activeStatuses.includes(data.task.status) ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const task = taskData?.task;

  // Execute task mutation
  const executeMutation = useMutation({
    mutationFn: async (taskPrompt: string) => {
      const response = await apiRequest('POST', '/api/autonomous/execute', {
        prompt: taskPrompt,
        autoApprove: false
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      setCurrentTaskId(data.taskId);
      toast({
        title: "Task Started",
        description: "Mr. Blue is analyzing your request...",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Start Task",
        description: error.message || "An error occurred",
      });
    },
  });

  // Approve task mutation
  const approveMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest('POST', `/api/autonomous/approve/${taskId}`, {});
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Code Applied",
        description: "Changes have been successfully applied to the codebase.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/status', currentTaskId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Apply Code",
        description: error.message || "An error occurred",
      });
    },
  });

  // Rollback task mutation
  const rollbackMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest('POST', `/api/autonomous/rollback/${taskId}`, {});
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Changes Rolled Back",
        description: "All changes have been reverted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/status', currentTaskId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Rollback Failed",
        description: error.message || "An error occurred",
      });
    },
  });

  const handleStartTask = () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt Required",
        description: "Please enter a task description",
      });
      return;
    }
    executeMutation.mutate(prompt);
  };

  const toggleSubtask = (subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const next = new Set(prev);
      if (next.has(subtaskId)) {
        next.delete(subtaskId);
      } else {
        next.add(subtaskId);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4" data-testid="autonomous-workflow-panel">
      {/* Prompt Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Autonomous Development Task</CardTitle>
          <CardDescription>
            Describe what you want Mr. Blue to build. Be specific about features, UI requirements, and functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Add a user profile page with avatar upload, bio editing, and social links..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
            data-testid="input-autonomous-prompt"
            disabled={!!currentTaskId && task?.status !== 'completed' && task?.status !== 'failed'}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {prompt.length} characters
            </div>
            <Button
              onClick={handleStartTask}
              disabled={executeMutation.isPending || (!!currentTaskId && task?.status !== 'completed' && task?.status !== 'failed')}
              data-testid="button-start-autonomous"
            >
              {executeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Autonomous Build
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task Status & Details */}
      {task && (
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  Task Progress
                  <Badge 
                    className={`${STATUS_COLORS[task.status]} text-white`}
                    data-testid={`badge-status-${task.status}`}
                  >
                    <span className="mr-1">{STATUS_ICONS[task.status]}</span>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
                <CardDescription className="line-clamp-1">{task.prompt}</CardDescription>
              </div>
              
              {/* Cost Display */}
              {task.decomposition?.estimatedTotalCost && (
                <div className="flex items-center gap-2 text-sm" data-testid="cost-display">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Estimated:</span>
                  <span className="font-semibold">${task.decomposition.estimatedTotalCost.toFixed(2)}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            <Tabs defaultValue="decomposition" className="h-full flex flex-col">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="decomposition" data-testid="tab-decomposition">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Decomposition
                </TabsTrigger>
                <TabsTrigger value="files" data-testid="tab-files" disabled={!task.generatedFiles?.length}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Files ({task.generatedFiles?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="validation" data-testid="tab-validation" disabled={!task.validationReport}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Validation
                </TabsTrigger>
              </TabsList>

              {/* Decomposition Tab */}
              <TabsContent value="decomposition" className="flex-1 m-0 mt-4">
                <ScrollArea className="h-full">
                  {task.decomposition ? (
                    <div className="space-y-2" data-testid="decomposition-tree">
                      {task.decomposition.subtasks.map((subtask, idx) => (
                        <Card key={subtask.id} className="hover-elevate">
                          <CardHeader className="p-4">
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleSubtask(subtask.id)}
                                className="mt-0.5"
                                data-testid={`button-toggle-subtask-${idx}`}
                              >
                                {expandedSubtasks.has(subtask.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    Task {idx + 1}
                                  </Badge>
                                  {subtask.estimatedCost && (
                                    <span className="text-xs text-muted-foreground">
                                      ${subtask.estimatedCost.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm mt-1">{subtask.description}</p>
                                {expandedSubtasks.has(subtask.id) && subtask.dependencies && subtask.dependencies.length > 0 && (
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Dependencies:</span>{' '}
                                    {subtask.dependencies.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      {task.status === 'decomposing' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Analyzing task and breaking it down into subtasks...
                        </>
                      ) : (
                        'Task decomposition will appear here'
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Generated Files Tab */}
              <TabsContent value="files" className="flex-1 m-0 mt-4">
                {task.generatedFiles && task.generatedFiles.length > 0 ? (
                  <div className="h-full flex gap-4">
                    {/* File List */}
                    <div className="w-64 shrink-0">
                      <ScrollArea className="h-full">
                        <div className="space-y-1">
                          {task.generatedFiles.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedFileIndex(idx)}
                              className={`w-full text-left p-3 rounded-md text-sm hover-elevate ${
                                selectedFileIndex === idx ? 'bg-accent text-accent-foreground' : ''
                              }`}
                              data-testid={`button-file-${idx}`}
                            >
                              <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 shrink-0" />
                                <span className="truncate">{file.filePath}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {file.language}
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* File Preview */}
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        {task.generatedFiles[selectedFileIndex] && (
                          <div className="space-y-3" data-testid="file-preview">
                            <div>
                              <h4 className="font-semibold text-sm mb-1">
                                {task.generatedFiles[selectedFileIndex].filePath}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {task.generatedFiles[selectedFileIndex].explanation}
                              </p>
                            </div>
                            
                            {/* Code Preview with basic syntax highlighting */}
                            <div className="bg-black text-green-400 rounded-md p-4 overflow-x-auto">
                              <pre className="text-xs font-mono whitespace-pre">
                                {task.generatedFiles[selectedFileIndex].content || 
                                 task.generatedFiles[selectedFileIndex].diff ||
                                 '// Code preview not available'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    {task.status === 'generating' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Generating code files...
                      </>
                    ) : (
                      'Generated files will appear here'
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Validation Tab */}
              <TabsContent value="validation" className="flex-1 m-0 mt-4">
                <ScrollArea className="h-full">
                  {task.validationReport ? (
                    <div className="space-y-4" data-testid="validation-report">
                      {/* Summary */}
                      <Card>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Validation Summary</CardTitle>
                            <div className="flex gap-3">
                              <div className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-destructive" />
                                <span className="text-sm font-semibold">{task.validationReport.lsp.totalErrors}</span>
                                <span className="text-xs text-muted-foreground">errors</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-semibold">{task.validationReport.lsp.totalWarnings}</span>
                                <span className="text-xs text-muted-foreground">warnings</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Per-File Errors */}
                      {task.validationReport.lsp.files && task.validationReport.lsp.files.length > 0 && (
                        <div className="space-y-2">
                          {task.validationReport.lsp.files.map((fileReport, idx) => (
                            <Card key={idx}>
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="font-mono text-sm">{fileReport.file}</div>
                                  <Badge variant="outline">
                                    {fileReport.errorCount} issues
                                  </Badge>
                                </div>
                                {fileReport.errors.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {fileReport.errors.map((error, errIdx) => (
                                      <div key={errIdx} className="text-xs p-2 bg-muted rounded">
                                        <div className="flex items-start gap-2">
                                          {error.severity === 'error' ? (
                                            <XCircle className="h-3 w-3 text-destructive mt-0.5" />
                                          ) : (
                                            <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5" />
                                          )}
                                          <div className="flex-1">
                                            <p>{error.message}</p>
                                            {error.line && (
                                              <p className="text-muted-foreground mt-1">Line {error.line}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      {task.status === 'validating' ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Running validation checks...
                        </>
                      ) : (
                        'Validation results will appear here'
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>

          {/* Action Buttons */}
          {task.status === 'awaiting_approval' && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('#', '_blank')}
                    data-testid="button-view-full-diff"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Diff
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => currentTaskId && rollbackMutation.mutate(currentTaskId)}
                    disabled={rollbackMutation.isPending}
                    data-testid="button-rollback"
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Rollback
                  </Button>
                </div>
                <Button
                  onClick={() => currentTaskId && approveMutation.mutate(currentTaskId)}
                  disabled={approveMutation.isPending}
                  data-testid="button-approve-apply"
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve & Apply
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {task.status === 'failed' && task.error && (
            <div className="border-t border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-destructive mb-1">Task Failed</h4>
                  <p className="text-sm text-destructive/90">{task.error}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!task && !executeMutation.isPending && (
        <Card className="flex-1">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Start Autonomous Development</h3>
              <p className="text-sm text-muted-foreground">
                Enter a task description above and Mr. Blue will autonomously analyze, plan, generate code, 
                validate, and present it for your approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
