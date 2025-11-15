/**
 * Visual Editor - Mr. Blue Autonomous Vibe Coding Agent
 * Cursor/Lovable/Bolt.new-style conversational code generation
 * 
 * Features:
 * - Live preview with real-time iframe updates
 * - Conversational iteration ("make it bigger" → instant change)
 * - Natural language element selection
 * - WebSocket real-time progress (no polling)
 * - Quick style mode for instant CSS changes
 * - Full autonomous workflow integration
 */

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutonomousProgress } from "@/hooks/useAutonomousProgress";
import { injectSelectionScript, applyInstantChange, undoLastChange } from "@/lib/iframeInjector";
import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  ShieldAlert, Crown, Bot, Cpu, Loader2, CheckCircle2, AlertCircle,
  Play, Eye, Code2, Palette, Undo2, Sparkles, Zap, FileCode
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type TaskStatus = 'pending' | 'decomposing' | 'generating' | 'validating' | 'awaiting_approval' | 'applying' | 'completed' | 'failed';

type AutonomousTask = {
  id: string;
  taskId: string;
  status: TaskStatus;
  prompt?: string;
  subtasks?: any[];
  generatedFiles?: any[];
  validationReport?: any;
  error?: string;
};

export default function VisualEditorPage() {
  // State
  const [prompt, setPrompt] = useState("");
  const [currentTask, setCurrentTask] = useState<AutonomousTask | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: authResponse, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
  });

  const user = authResponse?.user;
  const isGodLevel = user?.role === 'god';

  // WebSocket real-time progress
  const { isConnected: wsConnected, progress: wsProgress } = useAutonomousProgress({
    userId: user?.id || 0,
    taskId: currentTask?.taskId || undefined,
    autoConnect: !!user?.id && !!currentTask?.taskId
  });

  // Fallback polling if WebSocket disconnects
  const { data: taskData } = useQuery<{ success: boolean; task: AutonomousTask }>({
    queryKey: ['/api/autonomous/status', currentTask?.taskId],
    enabled: !!currentTask?.taskId && !wsConnected,
    refetchInterval: (query) => {
      if (!query?.state?.data?.task) return false;
      const activeStatuses = ['pending', 'decomposing', 'generating', 'validating', 'applying'];
      return activeStatuses.includes(query.state.data.task.status) ? 5000 : false;
    },
  });

  // Sync task data
  useEffect(() => {
    if (taskData?.task) {
      setCurrentTask(taskData.task);
      if (taskData.task.status === 'completed' || taskData.task.status === 'failed') {
        setIsExecuting(false);
      }
    }
  }, [taskData]);

  // Auto-inject generated files to iframe
  useEffect(() => {
    if (wsProgress?.files && viewMode === 'preview' && iframeRef.current) {
      console.log('[VisualEditor] Auto-injecting generated files:', wsProgress.files);
      // Files will be injected via iframe hot reload
      // For now, just trigger a reload
      const currentSrc = iframeRef.current.src;
      if (currentSrc) {
        iframeRef.current.src = currentSrc + '?t=' + Date.now();
      }
    }
  }, [wsProgress?.files, viewMode]);

  // Inject selection script when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('[VisualEditor] Iframe loaded, injecting selection script');
      injectSelectionScript(iframe);
    };

    iframe.addEventListener('load', handleLoad);
    
    // Listen for iframe messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'IFRAME_ELEMENT_SELECTED') {
        setSelectedElement(event.data.component);
        toast({
          title: "Element Selected",
          description: `<${event.data.component.tagName}> ${event.data.component.testId ? `[${event.data.component.testId}]` : ''}`,
        });
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      window.removeEventListener('message', handleMessage);
    };
  }, [toast]);

  // Execute full autonomous task
  const executeMutation = useMutation({
    mutationFn: async (taskPrompt: string) => {
      const response = await apiRequest('POST', '/api/autonomous/execute', {
        prompt: taskPrompt,
        autoApprove: false,
        selectedElement: selectedElement?.testId
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      setCurrentTask({
        id: data.taskId,
        taskId: data.taskId,
        status: 'pending',
        prompt: prompt.trim()
      });
      setIsExecuting(true);
      setConversationHistory(prev => [...prev, { role: 'user', content: prompt }, { role: 'assistant', content: 'Starting task...' }]);
      setPrompt("");
      toast({
        title: "Task Started",
        description: "Mr. Blue is analyzing your request...",
      });
    },
    onError: (error: any) => {
      setIsExecuting(false);
      toast({
        variant: "destructive",
        title: "Failed to Start Task",
        description: error.message || "An error occurred",
      });
    },
  });

  // Quick style mutation (instant CSS changes)
  const quickStyleMutation = useMutation({
    mutationFn: async (stylePrompt: string) => {
      const response = await apiRequest('POST', '/api/autonomous/quick-style', {
        prompt: stylePrompt,
        selectedElement: selectedElement?.testId
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      // Apply CSS to iframe immediately
      if (data.css && iframeRef.current) {
        applyInstantChange(iframeRef.current, {
          type: 'style',
          selector: data.selector,
          property: Object.keys(data.css)[0],
          value: Object.values(data.css)[0]
        });
      }
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: `Applied: ${JSON.stringify(data.css)}` }
      ]);
      setPrompt("");
      toast({
        title: "Style Applied",
        description: "CSS changed instantly!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Style Change Failed",
        description: error.message || "An error occurred",
      });
    },
  });

  // Handle submit (auto-detect if it's a style change or full task)
  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const trimmedPrompt = prompt.trim().toLowerCase();
    
    // Check if it's a simple style change
    const styleKeywords = ['make', 'change', 'color', 'size', 'bigger', 'smaller', 'blue', 'red', 'center', 'font'];
    const isStyleOnly = styleKeywords.some(kw => trimmedPrompt.includes(kw)) && trimmedPrompt.split(' ').length < 15;

    if (isStyleOnly && selectedElement) {
      // Fast path: instant CSS change
      quickStyleMutation.mutate(prompt.trim());
    } else {
      // Full path: autonomous code generation
      executeMutation.mutate(prompt.trim());
    }
  };

  // Approve generated code
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
        description: "Changes saved to codebase!",
      });
      setCurrentTask(prev => prev ? { ...prev, status: 'completed' } : null);
      setIsExecuting(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Apply Failed",
        description: error.message,
      });
    },
  });

  // Undo last change
  const handleUndo = () => {
    if (iframeRef.current) {
      undoLastChange(iframeRef.current);
      setConversationHistory(prev => prev.slice(0, -2)); // Remove last exchange
      toast({
        title: "Undone",
        description: "Last change reverted",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO 
          title="Visual Editor - Mundo Tango"
          description="AI-powered vibe coding with Mr. Blue"
        />
        <div className="h-screen w-full bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  Visual Editor requires God Level (Tier 8) access.
                  {user ? ` Your current role: ${user.role}` : ' Please log in.'}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Main Visual Editor UI
  return (
    <>
      <SEO 
        title="Visual Editor - Mr. Blue Vibe Coding"
        description="Natural language to code with live visual feedback"
      />
      
      <div className="h-screen w-full bg-background flex">
        {/* Left Sidebar: Conversation & Controls */}
        <div className="w-96 border-r flex flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Mr. Blue Vibe Coding</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">God Level Access</p>
          </div>

          {/* Conversation History */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {conversationHistory.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Tell me what you want to build or change!
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• "Make the header blue"</p>
                        <p>• "Add a hero section"</p>
                        <p>• "Center that button"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                conversationHistory.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Selected Element Info */}
          {selectedElement && (
            <div className="border-t p-3 bg-muted/50">
              <div className="text-xs font-medium mb-1">Selected Element</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  &lt;{selectedElement.tagName}&gt;
                </Badge>
                {selectedElement.testId && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedElement.testId}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Status & Progress */}
          {isExecuting && (
            <div className="border-t p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Status</span>
                <Badge variant="secondary" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  {wsProgress?.step || currentTask?.status}
                </Badge>
              </div>
              {wsProgress?.progress !== undefined && (
                <Progress value={wsProgress.progress * 100} className="h-1" />
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4 space-y-2">
            <Textarea
              data-testid="input-vibe-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={selectedElement 
                ? `Change this ${selectedElement.tagName}...` 
                : "Describe what you want..."
              }
              className="min-h-[80px] resize-none"
              disabled={isExecuting}
            />
            <div className="flex gap-2">
              <Button
                data-testid="button-vibe-submit"
                onClick={handleSubmit}
                disabled={!prompt.trim() || isExecuting}
                className="flex-1"
              >
                {isExecuting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Working...</>
                ) : (
                  <><Zap className="h-4 w-4 mr-2" /> Generate</>
                )}
              </Button>
              {conversationHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={isExecuting}
                  data-testid="button-undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Live Preview / Code View */}
        <div className="flex-1 flex flex-col">
          {/* View Mode Toggle */}
          <div className="border-b p-2 flex items-center justify-between">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="preview" data-testid="tab-preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Live Preview
                </TabsTrigger>
                <TabsTrigger value="code" data-testid="tab-code">
                  <Code2 className="h-4 w-4 mr-2" />
                  Generated Code
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {currentTask?.status === 'awaiting_approval' && (
              <Button
                onClick={() => approveMutation.mutate(currentTask.taskId)}
                disabled={approveMutation.isPending}
                data-testid="button-approve-code"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Apply to Codebase
              </Button>
            )}
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto bg-muted/20">
            {viewMode === 'preview' ? (
              <iframe
                ref={iframeRef}
                src="/"
                className="w-full h-full border-0"
                title="Live Preview"
                data-testid="iframe-preview"
              />
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {currentTask?.generatedFiles && currentTask.generatedFiles.length > 0 ? (
                    currentTask.generatedFiles.map((file: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-sm font-mono">{file.filePath}</CardTitle>
                          {file.explanation && (
                            <CardDescription className="text-xs">{file.explanation}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                            <code>{file.content || file.diff || 'No content'}</code>
                          </pre>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground">
                          <FileCode className="h-12 w-12 mx-auto mb-2" />
                          <p className="text-sm">No code generated yet</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
