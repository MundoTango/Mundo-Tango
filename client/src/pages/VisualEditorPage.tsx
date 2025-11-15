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

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useAutonomousProgress } from "@/hooks/useAutonomousProgress";
import { injectSelectionScript, applyInstantChange, undoLastChange } from "@/lib/iframeInjector";
import { captureIframeScreenshot, saveScreenshot } from "@/lib/screenshotCapture";
import { ChangeTimeline } from "@/components/visual-editor/ChangeTimeline";
import { VoiceModeToggle } from "@/components/visual-editor/VoiceModeToggle";
import { VoiceCommandProcessor } from "@/components/visual-editor/VoiceCommandProcessor";
import { SmartSuggestions } from "@/components/visual-editor/SmartSuggestions";
import type { ChangeMetadata } from "@/components/visual-editor/VisualDiffViewer";
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
import { Separator } from "@/components/ui/separator";
import { 
  ShieldAlert, Crown, Bot, Cpu, Loader2, CheckCircle2, AlertCircle,
  Play, Eye, Code2, Palette, Undo2, Sparkles, Zap, FileCode, History, Mic, MicOff, Lightbulb
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
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'history'>('preview');
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeMetadata[]>([]);
  const [beforeScreenshot, setBeforeScreenshot] = useState<string | null>(null);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [currentIframeUrl, setCurrentIframeUrl] = useState<string>('/');
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const voiceCommandProcessorRef = useRef<VoiceCommandProcessor | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: authResponse, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
  });

  const user = authResponse?.user;
  const isGodLevel = user?.role === 'god';

  // Voice hooks setup
  const handleVoiceResult = useCallback((text: string) => {
    console.log('[Voice] Received transcript:', text);
    
    // First check if it's a voice command
    if (voiceCommandProcessorRef.current?.processCommand(text)) {
      return; // Command was executed
    }
    
    // If not a command, treat as regular prompt
    setPrompt(text);
    // Auto-submit after a short delay to allow user to see the transcript
    setTimeout(() => {
      handleSubmit();
    }, 500);
  }, []);

  const { isListening, isSupported: voiceSupported, transcript, startListening, stopListening, resetTranscript } = useVoiceInput({
    onResult: handleVoiceResult,
    continuous: voiceModeEnabled,
    interimResults: true
  });

  const { speak, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

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

  // Initialize voice command processor
  useEffect(() => {
    voiceCommandProcessorRef.current = new VoiceCommandProcessor({
      setViewMode,
      handleUndo,
      handleApprove: () => {
        if (currentTask?.taskId) {
          approveMutation.mutate(currentTask.taskId);
        }
      },
      handleStopListening: () => {
        setVoiceModeEnabled(false);
        stopListening();
      },
      setPrompt,
      handleSubmit
    });
  }, [currentTask]);

  // Update voice command processor context when dependencies change
  useEffect(() => {
    if (voiceCommandProcessorRef.current) {
      voiceCommandProcessorRef.current.updateContext({
        setViewMode,
        handleUndo,
        handleApprove: () => {
          if (currentTask?.taskId) {
            approveMutation.mutate(currentTask.taskId);
          }
        },
        handleStopListening: () => {
          setVoiceModeEnabled(false);
          stopListening();
        },
        setPrompt,
        handleSubmit
      });
    }
  }, [setViewMode, currentTask, stopListening]);

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
      } else if (event.data.type === 'IFRAME_NAVIGATE') {
        // Track navigation for smart suggestions
        const newUrl = event.data.url;
        console.log('[VisualEditor] Iframe navigated to:', newUrl);
        setCurrentIframeUrl(newUrl);
        
        // Navigate the iframe
        if (iframe && iframe.contentWindow) {
          iframe.src = newUrl;
        }
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
      
      // Voice response
      if (voiceModeEnabled && ttsSupported) {
        speak("I'm working on that now.");
      }
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
    onSuccess: async (data) => {
      // Apply CSS to iframe immediately
      if (data.css && iframeRef.current) {
        applyInstantChange(iframeRef.current, {
          type: 'style',
          selector: data.selector,
          property: Object.keys(data.css)[0],
          value: Object.values(data.css)[0]
        });

        // Wait a bit for DOM to update, then capture after screenshot
        setTimeout(async () => {
          await captureAfterScreenshot(beforeScreenshot, {
            prompt: prompt.trim(),
            css: data.css,
            changedElements: 1,
            files: []
          });
        }, 500);
      }
      const responseText = `Applied: ${JSON.stringify(data.css)}`;
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: responseText }
      ]);
      setPrompt("");
      toast({
        title: "Style Applied",
        description: "CSS changed instantly!",
      });
      
      // Voice response
      if (voiceModeEnabled && ttsSupported) {
        speak("I changed the style. Anything else?");
      }
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

    // Capture screenshot before change
    await captureBeforeScreenshot();

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
    onSuccess: async () => {
      toast({
        title: "Code Applied",
        description: "Changes saved to codebase!",
      });
      
      // Voice response
      if (voiceModeEnabled && ttsSupported) {
        speak("I applied the changes to the codebase. Should I make any other updates?");
      }
      
      // Capture after screenshot
      if (currentTask?.generatedFiles && iframeRef.current) {
        setTimeout(async () => {
          await captureAfterScreenshot(beforeScreenshot, {
            prompt: currentTask.prompt || '',
            files: currentTask.generatedFiles?.map((f: any) => ({
              path: f.filePath,
              before: '',
              after: f.content
            })) || [],
            changedElements: currentTask.generatedFiles?.length || 0
          });
        }, 1000);
      }

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

  // Commit changes to Git
  const commitMutation = useMutation({
    mutationFn: async () => {
      if (!currentTask?.generatedFiles || currentTask.generatedFiles.length === 0) {
        throw new Error("No files to commit");
      }

      const files = currentTask.generatedFiles.map((f: any) => f.filePath);
      const description = currentTask.prompt || "Autonomous code changes";

      const response = await apiRequest('POST', '/api/autonomous/commit', {
        files,
        description,
        autoPush: false
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Committed to Git",
        description: `✓ ${data.message}`,
      });
      
      // Voice response
      if (voiceModeEnabled && ttsSupported) {
        speak("Changes committed to Git. You're all set!");
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Commit Failed",
        description: error.message,
      });
    },
  });

  // Capture screenshot before change
  const captureBeforeScreenshot = async () => {
    if (!iframeRef.current) return null;
    try {
      const screenshot = await captureIframeScreenshot(iframeRef.current);
      const id = `before-${Date.now()}`;
      await saveScreenshot(id, screenshot, {
        id,
        type: 'before',
        timestamp: Date.now(),
        prompt: prompt.trim(),
        changeId: id
      });
      setBeforeScreenshot(id);
      return id;
    } catch (error) {
      console.error('[VisualEditor] Failed to capture before screenshot:', error);
      return null;
    }
  };

  // Capture screenshot after change and record in history
  const captureAfterScreenshot = async (beforeId: string | null, changeData: any) => {
    if (!iframeRef.current || !beforeId) return;
    try {
      const screenshot = await captureIframeScreenshot(iframeRef.current);
      const afterId = `after-${Date.now()}`;
      await saveScreenshot(afterId, screenshot, {
        id: afterId,
        type: 'after',
        timestamp: Date.now(),
        prompt: changeData.prompt || prompt.trim(),
        changeId: beforeId
      });

      // Create change metadata
      const change: ChangeMetadata = {
        id: beforeId,
        timestamp: Date.now(),
        prompt: changeData.prompt || prompt.trim(),
        beforeScreenshot: beforeId,
        afterScreenshot: afterId,
        files: changeData.files || [],
        css: changeData.css,
        changedElements: changeData.changedElements
      };

      setChangeHistory(prev => [change, ...prev]);
      setBeforeScreenshot(null);
    } catch (error) {
      console.error('[VisualEditor] Failed to capture after screenshot:', error);
    }
  };

  // Restore to a specific point in history
  const handleRestore = async (changeId: string) => {
    const changeIndex = changeHistory.findIndex(c => c.id === changeId);
    if (changeIndex === -1) return;

    // Remove all changes after this point
    setChangeHistory(prev => prev.slice(changeIndex));
    
    toast({
      title: "Restored",
      description: "Reverted to selected point in history",
    });

    // Reload iframe to apply changes
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = currentSrc + '?t=' + Date.now();
    }
  };

  // Delete a change from history
  const handleDeleteChange = (changeId: string) => {
    setChangeHistory(prev => prev.filter(c => c.id !== changeId));
    toast({
      title: "Deleted",
      description: "Change removed from history",
    });
  };

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
      
      <main className="h-screen w-full bg-background flex">
        {/* Left Sidebar: Conversation & Controls */}
        <section className="w-96 border-r flex flex-col" role="region" aria-label="Conversation panel">
          {/* Header */}
          <header className="border-b p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              <h1 className="text-lg font-semibold">Mr. Blue Visual Editor</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI-Powered Conversational Code Generation
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              God Level Access
            </Badge>
          </header>

          <Separator />

          {/* Conversation History */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-3 pb-2">
              <h2 className="text-sm font-semibold">Conversation History</h2>
              <p className="text-xs text-muted-foreground">Your chat with Mr. Blue</p>
            </div>
            
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {conversationHistory.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bot className="h-5 w-5" />
                        Getting Started
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Tell me what you want to build or change!
                        </p>
                        <Separator />
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold">Examples:</h3>
                          <div className="text-xs text-muted-foreground space-y-1 pl-2">
                            <p>• "Make the header blue"</p>
                            <p>• "Add a hero section"</p>
                            <p>• "Center that button"</p>
                          </div>
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
          </div>

          <Separator />

          {/* Selected Element Info */}
          {selectedElement && (
            <>
              <div className="p-3 bg-muted/50">
                <h3 className="text-xs font-semibold mb-2">Selected Element</h3>
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
              <Separator />
            </>
          )}

          {/* Status & Progress */}
          {isExecuting && (
            <>
              <div className="p-3 space-y-2">
                <h3 className="text-xs font-semibold">Task Progress</h3>
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
              <Separator />
            </>
          )}

          {/* Voice Mode Toggle */}
          {voiceSupported && (
            <>
              <div className="p-4">
                <h3 className="text-xs font-semibold mb-2">Voice Mode</h3>
                <VoiceModeToggle
                  isListening={isListening}
                  onToggle={(enabled) => {
                    setVoiceModeEnabled(enabled);
                    if (enabled) {
                      startListening();
                    } else {
                      stopListening();
                    }
                  }}
                  className="w-full"
                />
              </div>
              <Separator />
            </>
          )}

          {/* Input Area */}
          <Card className="m-4">
            <CardHeader>
              <CardTitle className="text-sm">Prompt Input</CardTitle>
              <CardDescription className="text-xs">
                Tell Mr. Blue what you want to build or change
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Textarea
                  data-testid="input-vibe-prompt"
                  value={prompt || transcript}
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
                  className="min-h-[80px] resize-none pr-12"
                  disabled={isExecuting}
                />
                
                {/* Recording indicator (pulsing red dot) */}
                {isListening && (
                  <div className="absolute top-3 right-3 flex items-center gap-2" data-testid="recording-indicator">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Recording...</span>
                  </div>
                )}
              </div>

              {/* Interactive Quick Actions */}
              <Accordion type="single" collapsible className="border rounded-md">
                <AccordionItem value="examples" className="border-0">
                  <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-3 w-3" />
                      <span>Quick Examples</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt("Make the header bigger")}
                        disabled={isExecuting}
                        className="text-xs justify-start"
                        data-testid="button-example-1"
                      >
                        Make header bigger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt("Add a hero section")}
                        disabled={isExecuting}
                        className="text-xs justify-start"
                        data-testid="button-example-2"
                      >
                        Add hero section
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt("Center that button")}
                        disabled={isExecuting}
                        className="text-xs justify-start"
                        data-testid="button-example-3"
                      >
                        Center button
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt("Change color to blue")}
                        disabled={isExecuting}
                        className="text-xs justify-start"
                        data-testid="button-example-4"
                      >
                        Change to blue
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

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

                {/* Microphone Button */}
                {voiceSupported && !voiceModeEnabled && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (isListening) {
                        stopListening();
                      } else {
                        startListening();
                      }
                    }}
                    disabled={isExecuting}
                    data-testid="button-microphone"
                    className={isListening ? 'bg-red-500/10 border-red-500' : ''}
                  >
                    {isListening ? (
                      <Mic className="h-4 w-4 text-red-500" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {conversationHistory.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleUndo}
                      disabled={isExecuting}
                      data-testid="button-undo"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConversationHistory([])}
                      disabled={isExecuting}
                      data-testid="button-clear-conversation"
                      className="text-xs"
                    >
                      Clear Chat
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Panel: Live Preview / Code View / History */}
        <section className="flex-1 flex flex-col" role="region" aria-label="Preview panel">
          {/* View Mode Toggle */}
          <header className="border-b p-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold mb-2">Visual Editor</h2>
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
                  <TabsTrigger value="history" data-testid="tab-history">
                    <History className="h-4 w-4 mr-2" />
                    History
                    {changeHistory.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {changeHistory.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex gap-2">
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
              
              {currentTask?.status === 'completed' && currentTask.generatedFiles && currentTask.generatedFiles.length > 0 && (
                <Button
                  onClick={() => commitMutation.mutate()}
                  disabled={commitMutation.isPending}
                  variant="default"
                  data-testid="button-save-to-git"
                >
                  {commitMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Committing...</>
                  ) : (
                    <><FileCode className="h-4 w-4 mr-2" /> Save to Git</>
                  )}
                </Button>
              )}
            </div>
          </header>

          <Separator />

          {/* Preview Content */}
          <div className="flex-1 overflow-auto bg-muted/20 relative">
            {viewMode === 'preview' ? (
              <>
                <iframe
                  ref={iframeRef}
                  src="/"
                  className="w-full h-full border-0"
                  title="Live Preview"
                  data-testid="iframe-preview"
                  aria-label="Live preview of your Mundo Tango application"
                />
                
                {/* Smart Suggestions Panel (only in preview mode) */}
                {isGodLevel && (
                  <SmartSuggestions
                    url={currentIframeUrl}
                    autoRefresh={true}
                    onApplyFix={(suggestion) => {
                      toast({
                        title: "Suggestion Applied",
                        description: suggestion.fix
                      });
                    }}
                  />
                )}
              </>
            ) : viewMode === 'history' ? (
              <div className="h-full p-4">
                <h3 className="text-base font-semibold mb-4">Change History</h3>
                <ChangeTimeline
                  changes={changeHistory}
                  onRestore={handleRestore}
                  onDelete={handleDeleteChange}
                />
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h3 className="text-base font-semibold mb-2">Generated Code</h3>
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
        </section>
      </main>
    </>
  );
}
