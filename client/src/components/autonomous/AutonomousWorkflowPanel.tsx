/**
 * Autonomous Workflow Panel
 * God Level (Tier 8) Interface for Mr. Blue Autonomous Development
 * 
 * Features:
 * - Prompt-based task execution
 * - Real-time status polling (every 2 seconds)
 * - Task decomposition tree view with MB.MD methodology
 * - Generated files preview with syntax highlighting
 * - Validation report display with color-coded errors/warnings
 * - Approval/Rollback controls with validation-based gating
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useAutonomousProgress } from "@/hooks/useAutonomousProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileCode,
  GitBranch,
  Undo2,
  Eye,
  DollarSign,
  Code2,
  AlertCircle
} from "lucide-react";

interface AutonomousTask {
  id: string;
  prompt: string;
  status: 'pending' | 'decomposing' | 'generating' | 'validating' | 'awaiting_approval' | 'applying' | 'completed' | 'failed';
  decomposition?: {
    subtasks: Array<{
      id: string;
      description: string;
      files?: string[];
      estimatedCost?: number;
      dependencies?: string[];
      type?: string;
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
      success?: boolean;
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

const STATUS_BADGE_STYLES: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  decomposing: 'bg-secondary text-secondary-foreground',
  generating: 'bg-primary text-primary-foreground',
  validating: 'bg-accent text-accent-foreground',
  awaiting_approval: 'border-2 border-primary bg-primary/10 text-primary',
  applying: 'bg-secondary text-secondary-foreground',
  completed: 'bg-green-600 text-white',
  failed: 'bg-destructive text-destructive-foreground',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Loader2 className="h-3 w-3 animate-spin" />,
  decomposing: <Loader2 className="h-3 w-3 animate-spin" />,
  generating: <Loader2 className="h-3 w-3 animate-spin" />,
  validating: <Loader2 className="h-3 w-3 animate-spin" />,
  awaiting_approval: <AlertCircle className="h-3 w-3" />,
  applying: <Loader2 className="h-3 w-3 animate-spin" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

export function AutonomousWorkflowPanel() {
  const [prompt, setPrompt] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // WebSocket-based real-time progress updates (replaces polling)
  const { isConnected: wsConnected, progress: wsProgress, error: wsError } = useAutonomousProgress({
    userId: user?.id || 0,
    taskId: currentTaskId || undefined,
    autoConnect: !!user?.id && !!currentTaskId
  });

  // Fallback polling if WebSocket disconnects (every 5 seconds instead of 2)
  const { data: taskData, isLoading: isLoadingTask } = useQuery<{ success: boolean; task: AutonomousTask }>({
    queryKey: ['/api/autonomous/status', currentTaskId],
    enabled: !!currentTaskId && !wsConnected, // Only poll if WebSocket is disconnected
    refetchInterval: (query) => {
      if (!query?.state?.data?.task) return false;
      const activeStatuses = ['pending', 'decomposing', 'generating', 'validating', 'applying'];
      return activeStatuses.includes(query.state.data.task.status) ? 5000 : false; // Reduced from 2s to 5s
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
      setPrompt(""); // Clear prompt after starting
      toast({
        title: "Task Started",
        description: "Mr. Blue is analyzing your request using MB.MD methodology...",
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
        title: "Code Applied Successfully",
        description: "Changes have been applied to the codebase. Check the files to verify.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/status', currentTaskId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Apply Code",
        description: error.message || "An error occurred during code application",
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
        description: "All changes have been reverted to the previous state.",
      });
      setCurrentTaskId(null); // Clear task after rollback
      queryClient.invalidateQueries({ queryKey: ['/api/autonomous/status', currentTaskId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Rollback Failed",
        description: error.message || "An error occurred during rollback",
      });
    },
  });

  const handleStartTask = () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt Required",
        description: "Please enter a detailed task description",
      });
      return;
    }
    executeMutation.mutate(prompt);
  };

  // Check if there are validation errors that should block approval
  const hasValidationErrors = (task?.validationReport?.lsp?.totalErrors ?? 0) > 0;
  const canApprove = task?.status === 'awaiting_approval' && !hasValidationErrors;

  return (
    <div className="h-full flex flex-col gap-6 p-6" data-testid="autonomous-workflow-panel">
      {/* Prompt Input Section */}
      <Card className="hover-elevate">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Autonomous Development Task
          </CardTitle>
          <CardDescription>
            Describe what you want Mr. Blue to build using the MB.MD methodology. Be specific about features, UI requirements, and functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Add a user profile page with avatar upload, bio editing, and social links. Use shadcn/ui components and MT Ocean theme colors..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[140px] resize-none font-mono text-sm"
            data-testid="input-autonomous-prompt"
            disabled={!!currentTaskId && task?.status !== 'completed' && task?.status !== 'failed'}
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-muted-foreground">
              {prompt.length} characters · Be detailed for better results
            </div>
            <Button
              onClick={handleStartTask}
              disabled={executeMutation.isPending || (!!currentTaskId && task?.status !== 'completed' && task?.status !== 'failed')}
              data-testid="button-start-autonomous"
              size="default"
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
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-xl">Task Progress</CardTitle>
                  <Badge 
                    className={`${STATUS_BADGE_STYLES[task.status]}`}
                    data-testid={`badge-status-${task.status}`}
                  >
                    <span className="mr-1.5">{STATUS_ICONS[task.status]}</span>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{task.prompt}</CardDescription>
              </div>
              
              {/* Cost Display */}
              {task.decomposition?.estimatedTotalCost !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md" data-testid="cost-display">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Estimated Cost</span>
                    <span className="font-semibold text-sm">${task.decomposition.estimatedTotalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time WebSocket Progress (replaces polling) */}
            {wsProgress && wsProgress.progress < 1 && wsProgress.status !== 'complete' && (
              <div className="mt-4 space-y-3 px-6 pb-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-medium text-foreground">{wsProgress.step}</span>
                    {wsConnected && (
                      <Badge variant="outline" className="text-xs">
                        Live
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(wsProgress.progress * 100)}%
                  </span>
                </div>
                <Progress 
                  value={wsProgress.progress * 100} 
                  className="h-2"
                  data-testid="progress-bar"
                />
                {wsProgress.message && (
                  <p className="text-xs text-muted-foreground">{wsProgress.message}</p>
                )}
              </div>
            )}

            {/* WebSocket connection status */}
            {!wsConnected && currentTaskId && task?.status && ['pending', 'decomposing', 'generating', 'validating', 'applying'].includes(task.status) && (
              <div className="mt-4 px-6 pb-2">
                <Badge variant="outline" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Fallback to polling (WebSocket disconnected)
                </Badge>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden pt-2">
            <Tabs defaultValue="decomposition" className="h-full flex flex-col">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="decomposition" data-testid="tab-decomposition">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Decomposition
                  {task.decomposition?.subtasks && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {task.decomposition.subtasks.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="files" data-testid="tab-files" disabled={!task?.generatedFiles?.length}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Generated Files
                  {task?.generatedFiles && task.generatedFiles.length > 0 && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {task.generatedFiles.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="validation" data-testid="tab-validation" disabled={!task.validationReport}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Validation
                  {task.validationReport && (
                    <Badge 
                      variant={task.validationReport.lsp.totalErrors > 0 ? "destructive" : "outline"}
                      className="ml-2 text-xs"
                    >
                      {task.validationReport.lsp.totalErrors > 0 
                        ? `${task.validationReport.lsp.totalErrors} errors`
                        : 'Passed'
                      }
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Decomposition Tab - Using Accordion for expandable tree */}
              <TabsContent value="decomposition" className="flex-1 m-0 mt-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {task.decomposition ? (
                    <div className="space-y-3" data-testid="decomposition-tree">
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Code2 className="h-4 w-4" />
                        <span>MB.MD Task Decomposition - {task.decomposition.subtasks.length} subtasks identified</span>
                      </div>
                      <Accordion type="multiple" className="space-y-2">
                        {task.decomposition.subtasks.map((subtask, idx) => (
                          <AccordionItem 
                            key={subtask.id} 
                            value={subtask.id}
                            className="border rounded-lg px-4 bg-card hover-elevate"
                          >
                            <AccordionTrigger 
                              className="hover:no-underline py-4"
                              data-testid={`button-toggle-subtask-${idx}`}
                            >
                              <div className="flex items-center gap-3 flex-1 text-left">
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {idx + 1}
                                </Badge>
                                <span className="font-medium text-sm">{subtask.description}</span>
                                {subtask.estimatedCost !== undefined && (
                                  <span className="text-xs text-muted-foreground ml-auto mr-2">
                                    ${subtask.estimatedCost.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-2 space-y-3">
                              {subtask.files && subtask.files.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-2">Files to Generate:</div>
                                  <div className="space-y-1">
                                    {subtask.files.map((file, fileIdx) => (
                                      <div key={fileIdx} className="flex items-center gap-2 text-xs font-mono bg-muted px-2 py-1 rounded">
                                        <FileCode className="h-3 w-3 text-primary" />
                                        {file}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {subtask.dependencies && subtask.dependencies.length > 0 && (
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-2">Dependencies:</div>
                                  <div className="text-xs text-muted-foreground">
                                    {subtask.dependencies.join(', ')}
                                  </div>
                                </div>
                              )}
                              {subtask.type && (
                                <div>
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Type:</div>
                                  <Badge variant="secondary" className="text-xs">
                                    {subtask.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      {task.status === 'decomposing' ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                          <p className="text-sm font-medium">Analyzing task with MB.MD methodology...</p>
                          <p className="text-xs mt-1">Breaking down into atomic subtasks</p>
                        </>
                      ) : (
                        <>
                          <GitBranch className="h-8 w-8 mb-3 text-muted-foreground/50" />
                          <p className="text-sm">Task decomposition will appear here</p>
                        </>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Generated Files Tab */}
              <TabsContent value="files" className="flex-1 m-0 mt-4 overflow-hidden">
                {task.generatedFiles && task.generatedFiles.length > 0 ? (
                  <div className="h-full flex gap-4">
                    {/* File List Sidebar */}
                    <div className="w-72 shrink-0 border-r pr-4">
                      <ScrollArea className="h-full">
                        <div className="space-y-1">
                          {task.generatedFiles.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedFileIndex(idx)}
                              className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                                selectedFileIndex === idx 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover-elevate'
                              }`}
                              data-testid={`button-file-${idx}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <FileCode className="h-4 w-4 shrink-0" />
                                <span className="truncate font-mono text-xs">{file.filePath.split('/').pop()}</span>
                              </div>
                              <div className="text-xs opacity-70 font-mono truncate">
                                {file.filePath}
                              </div>
                              <Badge variant="outline" className="text-xs mt-2">
                                {file.language}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* File Preview */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <ScrollArea className="h-full">
                        {task.generatedFiles[selectedFileIndex] && (
                          <div className="space-y-4 pr-4" data-testid="file-preview">
                            {/* File Header */}
                            <div className="bg-muted p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm font-mono">
                                  {task.generatedFiles[selectedFileIndex].filePath}
                                </h4>
                                <Badge>{task.generatedFiles[selectedFileIndex].language}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {task.generatedFiles[selectedFileIndex].explanation}
                              </p>
                            </div>
                            
                            {/* Code Preview with syntax highlighting */}
                            <div className="rounded-lg overflow-hidden border">
                              <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Generated Code</span>
                                <Badge variant="outline" className="text-xs">
                                  {task.generatedFiles[selectedFileIndex].content ? 'Full File' : 'Diff'}
                                </Badge>
                              </div>
                              <ScrollArea className="h-[500px]">
                                <pre className="bg-card p-4 text-xs font-mono overflow-x-auto">
                                  <code className="text-foreground">
                                    {task.generatedFiles[selectedFileIndex].content || 
                                     task.generatedFiles[selectedFileIndex].diff ||
                                     '// Code preview not available'}
                                  </code>
                                </pre>
                              </ScrollArea>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    {task.status === 'generating' ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                        <p className="text-sm font-medium">Generating code files...</p>
                        <p className="text-xs mt-1">Creating components, services, and utilities</p>
                      </>
                    ) : (
                      <>
                        <FileCode className="h-8 w-8 mb-3 text-muted-foreground/50" />
                        <p className="text-sm">Generated files will appear here</p>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Validation Tab */}
              <TabsContent value="validation" className="flex-1 m-0 mt-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {task.validationReport ? (
                    <div className="space-y-4" data-testid="validation-report">
                      {/* Summary Card */}
                      <Card className={hasValidationErrors ? 'border-destructive' : 'border-green-600'}>
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              {hasValidationErrors ? (
                                <>
                                  <XCircle className="h-5 w-5 text-destructive" />
                                  Validation Failed
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  Validation Passed
                                </>
                              )}
                            </CardTitle>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-destructive" />
                                <span className="text-sm font-semibold">{task.validationReport.lsp.totalErrors}</span>
                                <span className="text-xs text-muted-foreground">errors</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-semibold">{task.validationReport.lsp.totalWarnings}</span>
                                <span className="text-xs text-muted-foreground">warnings</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Error Message if validation failed */}
                      {hasValidationErrors && (
                        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-destructive">Cannot approve with validation errors</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Fix the errors below or rollback the changes to try again.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Per-File Errors */}
                      {task.validationReport.lsp.files && task.validationReport.lsp.files.length > 0 && (
                        <div className="space-y-3">
                          {task.validationReport.lsp.files.map((fileReport, idx) => (
                            <Card key={idx}>
                              <CardHeader className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="font-mono text-sm flex items-center gap-2">
                                    <FileCode className="h-4 w-4 text-muted-foreground" />
                                    {fileReport.file}
                                  </div>
                                  <Badge variant={fileReport.errorCount > 0 ? "destructive" : "outline"}>
                                    {fileReport.errorCount} {fileReport.errorCount === 1 ? 'issue' : 'issues'}
                                  </Badge>
                                </div>
                                {fileReport.errors.length > 0 && (
                                  <div className="space-y-2">
                                    {fileReport.errors.map((error, errIdx) => (
                                      <div 
                                        key={errIdx} 
                                        className={`text-xs p-3 rounded-md border ${
                                          error.severity === 'error' 
                                            ? 'bg-destructive/5 border-destructive/20' 
                                            : 'bg-yellow-500/5 border-yellow-500/20'
                                        }`}
                                      >
                                        <div className="flex items-start gap-2">
                                          {error.severity === 'error' ? (
                                            <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                          ) : (
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium mb-1">{error.message}</p>
                                            {error.line && (
                                              <p className="text-muted-foreground font-mono">
                                                Line {error.line}
                                              </p>
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

                      {/* No Issues Found */}
                      {!hasValidationErrors && task.validationReport.lsp.totalWarnings === 0 && (
                        <Card className="border-green-600/20 bg-green-600/5">
                          <CardContent className="p-6 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                            <p className="text-sm font-medium">All validation checks passed!</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              The generated code is ready to be applied to the codebase.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      {task.status === 'validating' ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                          <p className="text-sm font-medium">Running validation checks...</p>
                          <p className="text-xs mt-1">Checking LSP diagnostics and syntax</p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-8 w-8 mb-3 text-muted-foreground/50" />
                          <p className="text-sm">Validation results will appear here</p>
                        </>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>

          {/* Action Buttons - Only show when awaiting approval */}
          {task.status === 'awaiting_approval' && (
            <div className="border-t bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => currentTaskId && rollbackMutation.mutate(currentTaskId)}
                    disabled={rollbackMutation.isPending}
                    data-testid="button-rollback"
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback Changes'}
                  </Button>
                </div>
                <Button
                  onClick={() => currentTaskId && approveMutation.mutate(currentTaskId)}
                  disabled={approveMutation.isPending || !canApprove}
                  data-testid="button-approve-apply"
                  size="default"
                  className="min-w-[160px]"
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {hasValidationErrors ? 'Fix Errors First' : 'Approve & Apply'}
                    </>
                  )}
                </Button>
              </div>
              {hasValidationErrors && (
                <p className="text-xs text-destructive mt-3 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Cannot approve: {task.validationReport?.lsp.totalErrors} validation error(s) must be fixed first
                </p>
              )}
            </div>
          )}

          {/* Completed/Failed Status Footer */}
          {(task.status === 'completed' || task.status === 'failed') && (
            <div className={`border-t p-4 ${task.status === 'completed' ? 'bg-green-600/10' : 'bg-destructive/10'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Task completed successfully</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium">Task failed</span>
                      {task.error && (
                        <span className="text-xs text-muted-foreground">· {task.error}</span>
                      )}
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentTaskId(null)}
                  data-testid="button-new-task"
                >
                  Start New Task
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!task && !executeMutation.isPending && (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12">
            <GitBranch className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <CardTitle className="mb-2">No Active Task</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              Enter a detailed task description above and click "Start Autonomous Build" to begin.
              Mr. Blue will decompose your task using MB.MD methodology, generate code, validate it, and present it for approval.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
