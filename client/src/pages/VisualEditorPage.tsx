/**
 * Visual Editor - Replit-style Development Environment
 * Full Backend Integration: Autonomous Agent with Real-time Status Polling
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Crown, Bot, Cpu, GitBranch, Key, Rocket, Database, Terminal, Bug, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type TaskStatus = 'pending' | 'decomposing' | 'generating' | 'validating' | 'awaiting_approval' | 'completed' | 'failed';

type AutonomousTask = {
  taskId: string;
  status: TaskStatus;
  prompt?: string;
  subtasks?: any[];
  generatedFiles?: any[];
  validationReport?: any;
  error?: string;
};

export default function VisualEditorPage() {
  const [activeTab, setActiveTab] = useState("autonomous");
  const [prompt, setPrompt] = useState("");
  const [currentTask, setCurrentTask] = useState<AutonomousTask | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch current user
  const { data: authResponse, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
  });

  const user = authResponse?.user;
  const isGodLevel = user?.role === 'god';

  // Real-time status polling (Phase 2)
  useEffect(() => {
    if (!currentTask?.taskId || currentTask.status === 'completed' || currentTask.status === 'failed') {
      return;
    }

    const pollStatus = async () => {
      try {
        // Use same auth pattern as apiRequest (Authorization header from localStorage)
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = {};
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/autonomous/status/${currentTask.taskId}`, {
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error(`Status poll failed: ${response.status} ${response.statusText}`);
          return;
        }
        
        const data = await response.json();
        
        setCurrentTask(prev => ({
          ...prev!,
          status: data.status,
          subtasks: data.subtasks,
          generatedFiles: data.generatedFiles,
          validationReport: data.validationReport,
          error: data.error
        }));

        if (data.status === 'completed' || data.status === 'failed') {
          setIsExecuting(false);
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    pollStatus(); // Initial poll

    return () => clearInterval(interval);
  }, [currentTask?.taskId, currentTask?.status]);

  // Execute autonomous task (Phase 1)
  const handleExecuteTask = async () => {
    if (!prompt.trim()) return;

    setIsExecuting(true);
    
    try {
      const response = await apiRequest('POST', '/api/autonomous/execute', {
        prompt: prompt.trim(),
        autoApprove: false
      });

      const data = await response.json();
      
      setCurrentTask({
        taskId: data.taskId,
        status: 'pending',
        prompt: prompt.trim()
      });
    } catch (error: any) {
      setCurrentTask({
        taskId: 'error',
        status: 'failed',
        error: error.message || 'Failed to start task'
      });
      setIsExecuting(false);
    }
  };

  // Approve task (Phase 3)
  const handleApproveTask = async () => {
    if (!currentTask?.taskId) return;

    try {
      await apiRequest('POST', `/api/autonomous/approve/${currentTask.taskId}`);
      
      setCurrentTask(prev => ({
        ...prev!,
        status: 'completed'
      }));
      setIsExecuting(false);
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO 
          title="Visual Editor - Mundo Tango"
          description="Replit-style development environment with AI assistance"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Loading Visual Editor...
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Access denied for non-God Level users
  if (!isGodLevel) {
    return (
      <>
        <SEO 
          title="Access Denied - Visual Editor"
          description="God Level access required"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  The Visual Editor requires God Level (Tier 8) access.
                  {user ? ` Your current role: ${user.role}` : ' Please log in.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Render status badge (Phase 4)
  const renderStatusBadge = () => {
    if (!currentTask) return null;

    const statusConfig: Record<TaskStatus, { label: string; variant: any; icon: any }> = {
      pending: { label: 'Pending', variant: 'secondary', icon: Loader2 },
      decomposing: { label: 'Decomposing', variant: 'default', icon: Loader2 },
      generating: { label: 'Generating', variant: 'default', icon: Loader2 },
      validating: { label: 'Validating', variant: 'default', icon: Loader2 },
      awaiting_approval: { label: 'Awaiting Approval', variant: 'default', icon: AlertCircle },
      completed: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
      failed: { label: 'Failed', variant: 'destructive', icon: AlertCircle }
    };

    const config = statusConfig[currentTask.status];
    const Icon = config.icon;

    return (
      <Badge 
        variant={config.variant}
        data-testid={`badge-status-${currentTask.status}`}
        className="flex items-center gap-1"
      >
        <Icon className={`h-3 w-3 ${currentTask.status !== 'completed' && currentTask.status !== 'failed' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    );
  };

  // God Level access confirmed - Full Visual Editor
  return (
    <>
      <SEO 
        title="Visual Editor - Mundo Tango"
        description="Replit-style development environment with AI assistance"
      />
      
      <div className="h-screen w-full bg-background flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">Visual Editor</h1>
            </div>
            <div className="flex items-center gap-3">
              {renderStatusBadge()}
              <div className="text-sm text-muted-foreground">
                {user.name} (God Level)
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="mr-blue" 
              data-testid="tab-mr-blue"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Bot className="h-4 w-4 mr-2" />
              Mr. Blue
            </TabsTrigger>
            <TabsTrigger 
              value="autonomous" 
              data-testid="tab-autonomous"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Cpu className="h-4 w-4 mr-2" />
              Autonomous
            </TabsTrigger>
            <TabsTrigger 
              value="git" 
              data-testid="tab-git"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Git
            </TabsTrigger>
            <TabsTrigger 
              value="secrets" 
              data-testid="tab-secrets"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Key className="h-4 w-4 mr-2" />
              Secrets
            </TabsTrigger>
            <TabsTrigger 
              value="deploy" 
              data-testid="tab-deploy"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              data-testid="tab-database"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger 
              value="console" 
              data-testid="tab-console"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Console
            </TabsTrigger>
            <TabsTrigger 
              value="debug" 
              data-testid="tab-debug"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Bug className="h-4 w-4 mr-2" />
              Debug
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            <TabsContent value="mr-blue" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🤖 Mr. Blue AI Assistant - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* AUTONOMOUS TAB - Full Integration */}
            <TabsContent value="autonomous" className="h-full m-0 p-4">
              <div data-testid="autonomous-workflow-panel" className="h-full flex flex-col gap-4">
                
                {/* Task Input */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Autonomous Task Execution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label htmlFor="autonomous-prompt" className="text-sm font-medium mb-2 block">
                        Describe what you want Mr. Blue to build:
                      </label>
                      <textarea
                        id="autonomous-prompt"
                        data-testid="input-autonomous-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isExecuting}
                        placeholder="Example: Add a file upload component with image preview thumbnails..."
                        className="w-full min-h-[120px] p-3 border rounded-md resize-y disabled:opacity-50"
                      />
                    </div>
                    <Button
                      data-testid="button-start-autonomous"
                      onClick={handleExecuteTask}
                      disabled={isExecuting || !prompt.trim()}
                      className="w-full"
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        'Execute Autonomous Task'
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Task Status & Progress */}
                {currentTask && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Task Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status:</span>
                          {renderStatusBadge()}
                        </div>
                        
                        {currentTask.prompt && (
                          <div className="text-sm">
                            <span className="font-medium">Prompt:</span>
                            <p className="text-muted-foreground mt-1">{currentTask.prompt}</p>
                          </div>
                        )}

                        {currentTask.error && (
                          <Alert variant="destructive">
                            <AlertDescription>{currentTask.error}</AlertDescription>
                          </Alert>
                        )}

                        <Alert>
                          <AlertDescription className="text-sm">
                            🎯 God Level: Unlimited operations, no rate limits, no cost caps
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>

                    {/* Validation Report (Phase 3) */}
                    {currentTask.validationReport && (
                      <Card data-testid="validation-report">
                        <CardHeader>
                          <CardTitle className="text-sm">Validation Report</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">LSP Diagnostics:</span>
                              <Badge variant={currentTask.validationReport.lspErrors?.length > 0 ? 'destructive' : 'default'}>
                                {currentTask.validationReport.lspErrors?.length || 0} errors
                              </Badge>
                            </div>
                            {currentTask.validationReport.summary && (
                              <p className="text-muted-foreground">{currentTask.validationReport.summary}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* File Diffs (Phase 3) */}
                    {currentTask.generatedFiles && currentTask.generatedFiles.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Generated Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="files" data-testid="tab-files">
                            <TabsList>
                              <TabsTrigger value="files">Files ({currentTask.generatedFiles.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="files" className="space-y-2 mt-4">
                              {currentTask.generatedFiles.map((file: any, idx: number) => (
                                <div key={idx} className="p-3 border rounded-md">
                                  <div className="font-mono text-sm font-medium">{file.path}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {file.operation || 'modified'}
                                  </div>
                                </div>
                              ))}
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    )}

                    {/* Approval Buttons (Phase 3) */}
                    {currentTask.status === 'awaiting_approval' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Review & Approve</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Alert>
                            <AlertDescription>
                              Review the validation report and generated files above. 
                              Click "Approve & Apply" to merge the changes into your codebase.
                            </AlertDescription>
                          </Alert>
                          <div className="flex gap-2">
                            <Button
                              data-testid="button-approve-apply"
                              onClick={handleApproveTask}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Approve & Apply
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCurrentTask(null);
                                setIsExecuting(false);
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Completion Message */}
                    {currentTask.status === 'completed' && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Task completed successfully! All changes have been applied to your codebase.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="git" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🌿 Git Integration - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="secrets" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🔐 Secrets Management - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="deploy" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🚀 Deployment Controls - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="database" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  💾 Database Operations - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="console" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  💻 Shell Console - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="debug" className="h-full m-0 p-4">
              <Alert>
                <AlertDescription>
                  🐛 Debug Tools - Coming Soon
                </AlertDescription>
              </Alert>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
