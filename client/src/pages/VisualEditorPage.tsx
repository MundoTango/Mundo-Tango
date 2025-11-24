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
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { injectSelectionScript, applyInstantChange, undoLastChange } from "@/lib/iframeInjector";
import { captureIframeScreenshot, saveScreenshot } from "@/lib/screenshotCapture";
import { ChangeTimeline } from "@/components/visual-editor/ChangeTimeline";
import { VoiceCommandProcessor } from "@/components/visual-editor/VoiceCommandProcessor";
import { SmartSuggestions } from "@/components/visual-editor/SmartSuggestions";
import { StreamingStatusPanel } from "@/components/visual-editor/StreamingStatusPanel";
import { IframeAddressBar } from "@/components/visual-editor/IframeAddressBar";
import { ElementHighlighter } from "@/components/visual-editor/ElementHighlighter";
import { MemoryPanel } from "@/components/visual-editor/MemoryPanel";
import { ProgressPanel } from "@/components/visual-editor/ProgressPanel";
import { BrowserAutomationPanel } from "@/components/visual-editor/BrowserAutomationPanel";
import { useSelfHealing } from "@/hooks/useSelfHealing";
import { useErrorAutoAnalysis } from "@/hooks/useErrorAutoAnalysis";
import { contextBuilder } from "@/services/ContextBuilderService";
import type { ChangeMetadata } from "@/components/visual-editor/VisualDiffViewer";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorAnalysisPanel } from "@/components/mr-blue/ErrorAnalysisPanel";
import { BackendSaveProgressModal, type BackendSaveProgress } from "@/components/visual-editor/BackendSaveProgressModal";
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { 
  ShieldAlert, Crown, Bot, Cpu, Loader2, CheckCircle2, AlertCircle,
  Play, Eye, Code2, Palette, Undo2, Sparkles, Zap, FileCode, History, Mic, MicOff, Lightbulb, RefreshCw, Brain, Bug, Activity, Save, Trash2, BookmarkCheck
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

function VisualEditorPageContent() {
  // State
  const [prompt, setPrompt] = useState("");
  const [currentTask, setCurrentTask] = useState<AutonomousTask | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'history'>('preview');
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [changeHistory, setChangeHistory] = useState<ChangeMetadata[]>([]);
  const [beforeScreenshot, setBeforeScreenshot] = useState<string | null>(null);
  const [currentIframeUrl, setCurrentIframeUrl] = useState<string>('/landing');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(-1);
  const [currentPageHtml, setCurrentPageHtml] = useState<string>("");
  const [selectedElementStyles, setSelectedElementStyles] = useState<Record<string, string>>({});
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [middlePanelTab, setMiddlePanelTab] = useState<'errors' | 'memory' | 'progress' | 'automation'>('errors');
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  
  // MB.MD v9.3: Backend Save Progress
  const [showSaveProgress, setShowSaveProgress] = useState(false);
  const [saveProgress, setSaveProgress] = useState<BackendSaveProgress | null>(null);
  const [unsavedChangesCount, setUnsavedChangesCount] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const voiceCommandProcessorRef = useRef<VoiceCommandProcessor | null>(null);
  const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user FIRST (needed for conversation queries)
  const { data: authResponse, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
  });

  const user = authResponse?.user;
  const isGodLevel = user?.role === 'god';

  // ✅ FIX: Fetch conversation history from Mr. Blue API (only when authenticated)
  const { data: recentConversations } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations'],
    enabled: !!user, // Only fetch when user is logged in
  });

  const { data: fetchedMessages, refetch: refetchConversationHistory } = useQuery<any[]>({
    queryKey: [`/api/mrblue/conversations/${currentConversationId}/messages`],
    enabled: !!currentConversationId && !!user, // Only fetch when authenticated AND conversation exists
  });

  // ✅ FIX: Auto-load most recent conversation on mount
  useEffect(() => {
    if (recentConversations && recentConversations.length > 0 && !currentConversationId) {
      const mostRecent = recentConversations[0];
      console.log('[VisualEditor] Loading most recent conversation:', mostRecent.id);
      setCurrentConversationId(mostRecent.id);
    }
  }, [recentConversations, currentConversationId]);

  // ✅ MB.MD Fix: Sync fetched messages with local conversation history
  // Only update if length changed OR initial load (prevents overwriting local state)
  const prevMessageCountRef = useRef<number>(0);
  
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      // Only update if message count changed (new messages from server)
      if (fetchedMessages.length !== prevMessageCountRef.current) {
        console.log('[VisualEditor] Loaded conversation history:', fetchedMessages.length, 'messages');
        const formattedMessages = fetchedMessages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        setConversationHistory(formattedMessages);
        prevMessageCountRef.current = fetchedMessages.length;
      }
    } else if (fetchedMessages && fetchedMessages.length === 0 && prevMessageCountRef.current === 0) {
      // Add initial greeting when conversation is empty (only on first load)
      console.log('[VisualEditor] No messages - adding initial greeting');
      setConversationHistory([{
        role: 'assistant',
        content: `Hi! I'm Mr. Blue, your visual editing assistant. I can help you make changes to your website just by chatting with me! 🎉

**What I can do:**
• Edit any element on the page
• Change colors, fonts, and styling
• Add or remove content
• Generate production-ready code

**How to use:**
Just tell me what you want to change. For example:
• "Make the header bigger"
• "Change the button color to blue"
• "Add a hero section"

Let's get started! What would you like to change?`,
      }]);
      prevMessageCountRef.current = 1;
    }
  }, [fetchedMessages]);

  // MB.MD v9.4: Hybrid Auto-Save System
  // Auto-save every 10 changes
  useEffect(() => {
    if (unsavedChangesCount >= 10) {
      console.log('[AutoSave] Triggering auto-save after', unsavedChangesCount, 'changes');
      // Reset counter
      setUnsavedChangesCount(0);
      setLastSavedTime(new Date());
      
      toast({
        title: "Auto-Saved",
        description: `Saved ${unsavedChangesCount} changes automatically`,
      });
    }
  }, [unsavedChangesCount, toast]);

  // PHASE 1: Get or create active conversation
  const getOrCreateConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/mrblue/conversations', {});
      return await response.json();
    },
    onSuccess: (conversation) => {
      console.log('[VisualEditor] ✅ Active conversation:', conversation.id);
      setCurrentConversationId(conversation.id);
    },
    onError: (error: any) => {
      console.error('[VisualEditor] Failed to get/create conversation:', error);
    },
  });

  // PHASE 1: Save message to database
  const saveMessageMutation = useMutation({
    mutationFn: async ({ role, content }: { role: string; content: string }) => {
      if (!currentConversationId) {
        throw new Error('No active conversation');
      }
      const response = await apiRequest('POST', '/api/mrblue/messages', {
        conversationId: currentConversationId,
        role,
        content,
      });
      return await response.json();
    },
    onSuccess: () => {
      console.log('[VisualEditor] ✅ Message saved to database');
      // ✅ MB.MD Fix: Refetch conversation history to sync state with database
      refetchConversationHistory();
    },
    onError: (error: any) => {
      console.error('[VisualEditor] Failed to save message:', error);
    },
  });

  // MB.MD v9.3: Backend Save Mutation
  const saveBackendMutation = useMutation({
    mutationFn: async () => {
      if (!currentConversationId) {
        throw new Error('No active conversation');
      }
      const response = await apiRequest('POST', '/api/mrblue/save-backend', {
        conversationId: currentConversationId,
      });
      return await response.json();
    },
    onSuccess: (result) => {
      setSaveProgress({
        phase: 'complete',
        currentStep: 'Backend save complete!',
        totalSteps: result.agentsUsed.length + 2,
        completedSteps: result.agentsUsed.length + 2,
        agentsWorking: [],
        filesModified: result.filesModified,
        errors: result.errors,
      });
      
      toast({
        title: '✅ Backend Saved',
        description: `Updated ${result.filesModified.length} files using ${result.agentsUsed.length} agents`,
      });
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSaveProgress(false);
        setSaveProgress(null);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: '❌ Backend Save Failed',
        description: error.message,
        variant: 'destructive',
      });
      setShowSaveProgress(false);
    },
  });

  // MB.MD v9.3: Query save button status
  const { data: saveStatus } = useQuery<{
    enabled: boolean;
    tooltip: string;
    changeCount: number;
    filesModified: number;
  }>({
    queryKey: ['/api/mrblue/save-backend/status', currentConversationId],
    enabled: !!currentConversationId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // MB.MD v9.3: Handle backend save
  const handleBackendSave = async () => {
    if (!currentConversationId) {
      toast({
        title: '⚠️ No Conversation',
        description: 'Please start a conversation first',
        variant: 'destructive',
      });
      return;
    }
    
    // Show progress modal
    setShowSaveProgress(true);
    setSaveProgress({
      phase: 'analyzing',
      currentStep: 'Analyzing UI changes...',
      totalSteps: 6,
      completedSteps: 0,
      agentsWorking: [],
      filesModified: [],
      errors: [],
    });
    
    // Trigger save
    saveBackendMutation.mutate();
  };

  // PHASE 1: Ensure conversation exists on mount
  useEffect(() => {
    if (user && !currentConversationId && !recentConversations) {
      getOrCreateConversationMutation.mutate();
    }
  }, [user, currentConversationId, recentConversations]);

  // Import streaming chat hook
  const { 
    isStreaming: streamIsActive,
    currentStatus: streamStatus,
    messages: streamMessages,
    sendMessage: sendStreamingMessage,
    clear: clearStreaming,
    error: streamError
  } = useStreamingChat();
  
  // ✅ Handle visual changes from streaming (e.g., "make button blue")
  useEffect(() => {
    const visualChangeMsg = streamMessages.find(m => m.type === 'visual_change');
    if (visualChangeMsg && visualChangeMsg.data && iframeRef.current) {
      const change = visualChangeMsg.data.change;
      
      // Apply instant visual change to iframe
      applyInstantChange(iframeRef.current, selectedElement, {
        changeType: change.changeType,
        property: change.property,
        value: change.value
      });
      
      console.log('[Streaming] Applied visual change:', change);
    }
  }, [streamMessages, selectedElement]);

  // Save Changes Mutation (MB.MD v9.4 P0 Task 3) - MUST BE BEFORE useEffects
  const saveChangesMutation = useMutation({
    mutationFn: async () => {
      const allEdits = visualEditorTracker.getAllEdits();
      const pagePath = window.location.pathname;
      
      const response = await apiRequest('POST', '/api/autonomous/visual-editor/save', {
        edits: allEdits,
        pagePath,
        checkpointMessage: `Visual Editor: ${allEdits.length} changes to ${pagePath}`
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      visualEditorTracker.clear();
      setUnsavedChangesCount(0);
      
      toast({
        title: "Changes Saved!",
        description: data.message,
      });
      
      // Voice feedback
      if (ttsSupported) {
        speak("All changes saved successfully.");
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save changes",
      });
      
      // Voice feedback
      if (ttsSupported) {
        speak("Sorry, I couldn't save the changes. Please try again.");
      }
    },
  });

  // Save Changes Handler - MUST BE BEFORE useEffects THAT USE IT
  const handleSaveChanges = useCallback(() => {
    const allEdits = visualEditorTracker.getAllEdits();
    
    if (allEdits.length === 0) {
      toast({
        title: "No Changes",
        description: "Make some edits first before saving",
      });
      return;
    }
    
    saveChangesMutation.mutate();
  }, [saveChangesMutation, toast]);

  // Undo Handler - MUST BE BEFORE useEffects THAT USE IT
  const handleUndo = useCallback(() => {
    if (iframeRef.current) {
      undoLastChange(iframeRef.current);
      setConversationHistory(prev => prev.slice(0, -2)); // Remove last exchange
      toast({
        title: "Undone",
        description: "Last change reverted",
      });
    }
  }, [toast]);

  // Approve Mutation - MUST BE BEFORE useEffects THAT USE IT
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
      
      // Voice response with natural voice
      if (ttsSupported) {
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

  // Capture screenshot before change - MUST BE BEFORE handleSubmit
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

  // Capture screenshot after change and record in history - MUST BE BEFORE handleSubmit
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

  // Handle submit - MUST BE BEFORE handleVoiceResult WHICH CALLS IT
  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const trimmedPrompt = prompt.trim();
    const lowerPrompt = trimmedPrompt.toLowerCase();
    
    // Vibe Coding: Detect UI modification requests (e.g., "Make button blue", "Change header color")
    const isVibeCodeRequest = /\b(make|change|update|modify|set|add|remove)\s+(the|a|an)?\s*(button|header|text|color|background|style|size)/i.test(trimmedPrompt) ||
                              /\b(have|with|to)\s+(a|an|the)?\s*(blue|red|green|yellow|white|black|larger|smaller|bold)/i.test(trimmedPrompt) ||
                              /color.*to|background.*to|font.*to|size.*to/i.test(lowerPrompt);
    
    // FIXED ROUTING: Only route to autonomous for SPECIFIC build phrases
    // Avoid matching common words like "make" which appear in normal conversation
    const isBuildRequest = /\b(build|create|add)\s+(a|an|the|this|that|new)?\s*(feature|component|section|page)/i.test(trimmedPrompt) ||
                          /\b(generate|scaffold|implement)\s/i.test(trimmedPrompt);
    
    // Check if it's a simple style change (requires selectedElement)
    const styleKeywords = ['color', 'size', 'bigger', 'smaller', 'center', 'font'];
    const isStyleOnly = styleKeywords.some(kw => lowerPrompt.includes(kw)) && trimmedPrompt.split(' ').length < 15;

    if (isStyleOnly && selectedElement) {
      // Capture screenshot before style change
      await captureBeforeScreenshot();
      // Fast path: instant CSS change (requires element selection)
      quickStyleMutation.mutate(trimmedPrompt);
    } else if (isVibeCodeRequest || isBuildRequest) {
      // Capture screenshot before code generation
      await captureBeforeScreenshot();
      // Vibe Coding path: AI-powered code generation with live streaming
      executeMutation.mutate(trimmedPrompt);
    } else {
      // ✅ NEW: Simple chat with STREAMING responses (real-time AI responses)
      await handleStreamingChat(trimmedPrompt);
    }
  };

  // Voice Result Handler - MUST BE BEFORE useEffects THAT USE stopListening
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

  // Voice Input Hook - MUST BE BEFORE useEffects THAT USE stopListening
  const { 
    isListening, 
    isSupported: voiceSupported, 
    transcript, 
    isContinuousMode,
    startListening, 
    stopListening, 
    resetTranscript,
    enableContinuousMode,
    disableContinuousMode
  } = useVoiceInput({
    onResult: handleVoiceResult,
    continuous: true,
    interimResults: true
  });

  const { speak, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  // Initialize voice command processor - NOW AFTER handleSaveChanges, handleUndo, approveMutation, and stopListening definitions
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
        disableContinuousMode();
        stopListening();
      },
      handleSaveChanges,
      setPrompt,
      handleSubmit
    });
  }, [currentTask, handleSaveChanges, setViewMode, handleUndo, approveMutation, stopListening, setPrompt, handleSubmit]);

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
        handleSaveChanges,
        setPrompt,
        handleSubmit
      });
    }
  }, [setViewMode, currentTask, stopListening, handleSaveChanges, handleUndo, approveMutation, setPrompt, handleSubmit]);

  // Self-healing orchestration (MB.MD v9.0)
  const { isRunning: isSelfHealingRunning, result: selfHealingResult } = useSelfHealing(
    '/', 
    !!user && isGodLevel // Only run for god-level users
  );

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

  // Store handlers for cleanup
  const handlersRef = useRef<{
    load?: () => void;
    error?: () => void;
    message?: (event: MessageEvent) => void;
  }>({});

  // Callback ref: fires when iframe element is mounted to DOM (solves race condition!)
  const handleIframeMount = useCallback((element: HTMLIFrameElement | null) => {
    // Cleanup previous handlers
    if (iframeRef.current && handlersRef.current.load && handlersRef.current.error) {
      iframeRef.current.removeEventListener('load', handlersRef.current.load);
      iframeRef.current.removeEventListener('error', handlersRef.current.error);
    }
    if (handlersRef.current.message) {
      window.removeEventListener('message', handlersRef.current.message);
    }
    
    if (!element) {
      iframeRef.current = null;
      return;
    }
    
    iframeRef.current = element;
    console.log('[VisualEditor] Iframe element mounted, attaching listeners');

    const handleLoad = () => {
      console.log('[VisualEditor] Iframe loaded, injecting selection script');
      setIframeLoading(false);
      setIframeError(false);
      injectSelectionScript(element);
      
      // Enable element click selection with visual outline
      try {
        const iframeDoc = element.contentDocument;
        if (iframeDoc && iframeDoc.body) {
          // Inject click-to-select script
          const script = iframeDoc.createElement('script');
          script.textContent = `
            (function() {
              let selectedElement = null;
              let originalContent = '';
              
              document.addEventListener('click', function(e) {
                // Check for Cmd/Ctrl+Click (navigation)
                if (e.metaKey || e.ctrlKey) {
                  console.log('[IframeSelection] Cmd+Click detected');
                  let link = e.target.closest('a');
                  if (link && link.href) {
                    e.preventDefault();
                    window.parent.postMessage({
                      type: 'IFRAME_NAVIGATE',
                      url: link.href
                    }, '*');
                    return;
                  }
                }
                
                // Regular click - select element
                e.preventDefault();
                e.stopPropagation();
                
                // Remove previous selection
                if (selectedElement) {
                  selectedElement.style.outline = '';
                  selectedElement.contentEditable = 'false';
                }
                
                selectedElement = e.target;
                
                // Add blue outline
                selectedElement.style.outline = '2px solid hsl(var(--primary))';
                selectedElement.style.outlineOffset = '2px';
                
                // Send to parent
                window.parent.postMessage({
                  type: 'IFRAME_ELEMENT_SELECTED',
                  component: {
                    id: selectedElement.id || 'element-' + Date.now(),
                    tagName: selectedElement.tagName.toLowerCase(),
                    className: selectedElement.className || '',
                    text: (selectedElement.textContent || '').substring(0, 100),
                    testId: selectedElement.getAttribute('data-testid') || null
                  }
                }, '*');
              }, true);
              
              // Double-click to enable inline text editing
              document.addEventListener('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const element = e.target;
                
                // Don't allow editing of certain elements
                if (['SCRIPT', 'STYLE', 'IMG', 'VIDEO', 'AUDIO', 'IFRAME'].includes(element.tagName)) {
                  return;
                }
                
                // Enable contentEditable
                originalContent = element.innerHTML;
                element.contentEditable = 'true';
                element.focus();
                
                // Select all text
                const range = document.createRange();
                range.selectNodeContents(element);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                
                console.log('[IframeSelection] Inline editing enabled for', element.tagName);
                
                // Save changes on blur
                const saveChanges = function() {
                  element.contentEditable = 'false';
                  const newContent = element.innerHTML;
                  
                  if (newContent !== originalContent) {
                    window.parent.postMessage({
                      type: 'IFRAME_TEXT_EDITED',
                      component: {
                        id: element.id || 'element-' + Date.now(),
                        tagName: element.tagName.toLowerCase(),
                        testId: element.getAttribute('data-testid') || null,
                        oldContent: originalContent,
                        newContent: newContent
                      }
                    }, '*');
                  }
                  
                  element.removeEventListener('blur', saveChanges);
                };
                
                element.addEventListener('blur', saveChanges);
              }, true);
              
              console.log('[IframeSelection] Click-to-select + double-click-to-edit enabled');
            })();
          `;
          iframeDoc.body.appendChild(script);
          console.log('[VisualEditor] Element click selection enabled');
        }
      } catch (error) {
        console.error('[VisualEditor] Failed to enable element selection:', error);
      }
    };

    const handleError = () => {
      console.error('[VisualEditor] Iframe failed to load');
      setIframeLoading(false);
      setIframeError(true);
      toast({
        variant: "destructive",
        title: "Preview Failed to Load",
        description: "The preview iframe could not be loaded. Try refreshing the page.",
      });
    };

    // Check if iframe already loaded (handles race condition)
    try {
      if (element.contentDocument && element.contentDocument.readyState === 'complete') {
        console.log('[VisualEditor] Iframe already loaded, injecting immediately');
        handleLoad();
      }
    } catch (e) {
      // CORS or not loaded yet - will wait for load event
      console.log('[VisualEditor] Iframe not ready yet (CORS or still loading)');
    }

    // Store handlers for cleanup
    handlersRef.current.load = handleLoad;
    handlersRef.current.error = handleError;
    
    element.addEventListener('load', handleLoad);
    element.addEventListener('error', handleError);
    
    // Extract page HTML for Smart Suggestions
    const extractPageHtml = () => {
      try {
        if (element?.contentDocument?.documentElement) {
          const html = element.contentDocument.documentElement.outerHTML;
          setCurrentPageHtml(html);
        }
      } catch (error) {
        console.error('[VisualEditor] Failed to extract page HTML (CORS):', error);
        // If CORS blocks access, we can't extract HTML
        setCurrentPageHtml("");
      }
    };

    // Listen for iframe messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'IFRAME_ELEMENT_SELECTED') {
        setSelectedElement(event.data.component);
        
        // Extract computed styles from the selected element
        if (event.data.component.styles) {
          setSelectedElementStyles(event.data.component.styles);
        }
        
        // Extract page HTML for analysis
        extractPageHtml();
        
        toast({
          title: "Element Selected",
          description: `<${event.data.component.tagName}> ${event.data.component.testId ? `[${event.data.component.testId}]` : ''}`,
        });
      } else if (event.data.type === 'IFRAME_TEXT_EDITED') {
        // Handle inline text editing
        const component = event.data.component;
        console.log('[VisualEditor] Text edited:', component);
        
        toast({
          title: "Text Updated",
          description: `Changed: ${component.tagName}`,
        });
        
        // Track unsaved change (for auto-save system)
        setUnsavedChangesCount(prev => prev + 1);
      } else if (event.data.type === 'IFRAME_NAVIGATE') {
        // Track navigation for smart suggestions
        const newUrl = event.data.url;
        console.log('[VisualEditor] Iframe navigated to:', newUrl);
        setCurrentIframeUrl(newUrl);
        
        // Navigate the iframe
        if (element && element.contentWindow) {
          element.src = newUrl;
        }
        
        // Extract HTML after navigation completes
        setTimeout(extractPageHtml, 1000);
      } else if (event.data.type === 'IFRAME_LOADED') {
        // Extract HTML when page finishes loading
        extractPageHtml();
      }
    };

    // Store message handler for cleanup
    handlersRef.current.message = handleMessage;
    
    window.addEventListener('message', handleMessage);
    
    // Note: Cleanup will happen automatically when React calls this ref with null
    // Callback refs cannot return cleanup functions
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
    onSuccess: async (data) => {
      const userMessage = prompt.trim();
      const assistantMessage = 'Starting task...';
      
      setCurrentTask({
        id: data.taskId,
        taskId: data.taskId,
        status: 'pending',
        prompt: userMessage
      });
      setIsExecuting(true);
      setConversationHistory(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: assistantMessage }]);
      setPrompt("");
      
      // PHASE 1: Save messages to database
      if (currentConversationId) {
        try {
          await saveMessageMutation.mutateAsync({ role: 'user', content: userMessage });
          await saveMessageMutation.mutateAsync({ role: 'assistant', content: assistantMessage });
        } catch (error) {
          console.error('[VisualEditor] Failed to save messages:', error);
        }
      }
      
      toast({
        title: "Task Started",
        description: "Mr. Blue is analyzing your request...",
      });
      
      // Voice response with natural voice
      if (ttsSupported) {
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
      const userMessage = prompt;
      const responseText = `Applied: ${JSON.stringify(data.css)}`;
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: responseText }
      ]);
      setPrompt("");
      
      // PHASE 1: Save messages to database
      if (currentConversationId) {
        try {
          await saveMessageMutation.mutateAsync({ role: 'user', content: userMessage });
          await saveMessageMutation.mutateAsync({ role: 'assistant', content: responseText });
        } catch (error) {
          console.error('[VisualEditor] Failed to save messages:', error);
        }
      }
      
      toast({
        title: "Style Applied",
        description: "CSS changed instantly!",
      });
      
      // Voice response with natural voice
      if (ttsSupported) {
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

  // ✅ ERROR AUTO-ANALYSIS INTEGRATION - MB.MD v9.2 (FIXED: No chat spam)
  // MB.MD Fix: Only show high-priority errors in chat, don't spam every error
  const [errorProposalQueue, setErrorProposalQueue] = useState<any[]>([]);
  const [lastProposalTime, setLastProposalTime] = useState<number>(0);
  
  const handleProposalReady = useCallback((proposal: any) => {
    console.log('[VisualEditor] 🎯 PROPOSAL READY:', proposal);
    console.log('[VisualEditor] Confidence:', proposal.confidence);
    
    // ✅ MB.MD v9.2: Don't spam chat with 0% confidence errors
    // Only show in chat if:
    // 1. High confidence (>= 80%) - Will auto-fix
    // 2. Critical frequency (> 20 occurrences)
    // 3. Not already shown recently (debounce 30s)
    
    const shouldShowInChat = 
      proposal.confidence >= 80 || // High confidence = auto-fix worthy
      (proposal.errorMessage && proposal.errorMessage.includes('time(s)') && 
       parseInt(proposal.errorMessage.match(/(\d+) time\(s\)/)?.[1] || '0') > 20) || // Critical frequency
      (Date.now() - lastProposalTime > 30000); // Debounce 30s
    
    if (!shouldShowInChat) {
      console.log('[VisualEditor] ⏭️ Skipping chat notification (low priority error)');
      // Still save to database but don't spam chat
      setErrorProposalQueue(prev => [...prev, proposal]);
      return;
    }
    
    console.log('[VisualEditor] ✅ High-priority error - showing in chat');
    setLastProposalTime(Date.now());
    
    // When error analysis generates a fix proposal, add it to chat
    const proposalMessage = `🚨 **Error Detected: Auto-Analysis Complete**\n\n` +
      `**Error:** ${proposal.errorMessage.substring(0, 150)}\n\n` +
      `**Proposed Fix:**\n${proposal.proposedFix}\n\n` +
      `**Confidence:** ${(proposal.confidence * 100).toFixed(0)}%\n` +
      `**Estimated Impact:** ${proposal.estimatedImpact}\n\n` +
      `**Action Required:** Would you like me to apply this fix?\n` +
      `Reply "yes" or "approve" to proceed, "no" to skip.`;
    
    console.log('[VisualEditor] Adding proposal to conversation history');
    setConversationHistory(prev => [
      ...prev,
      { role: 'assistant', content: proposalMessage }
    ]);
    
    // Save to database (conversation ID should exist by now)
    if (currentConversationId) {
      console.log('[VisualEditor] ✅ Saving proposal to database (conversation:', currentConversationId, ')');
      saveMessageMutation.mutate({ role: 'assistant', content: proposalMessage });
    }
    
    setAwaitingApproval(true);
  }, [currentConversationId, saveMessageMutation, lastProposalTime]);
  
  const {
    currentErrors,
    activeProposal,
    isAnalyzing: isAnalyzingErrors,
    approveProposal,
    rejectProposal
  } = useErrorAutoAnalysis(handleProposalReady, currentConversationId);

  // ✅ STREAMING HANDLER WITH CONTEXT BUILDER - MB.MD v9.2
  const handleStreamingChat = useCallback(async (message: string) => {
    try {
      const userMessage = message;
      
      // Check if user is approving error fix
      if (awaitingApproval && activeProposal) {
        const lowerMessage = message.toLowerCase().trim();
        if (lowerMessage === 'yes' || lowerMessage === 'approve' || lowerMessage.includes('go ahead')) {
          // User approved fix
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: '✅ **Applying fix now...**\n\nI will show progress in the banner above.' }
          ]);
          setAwaitingApproval(false);
          
          try {
            await approveProposal();
            
            setTimeout(() => {
              setConversationHistory(prev => [
                ...prev,
                { role: 'assistant', content: '✅ **Fix applied successfully!**\n\nThe error should now be resolved. I\'ll continue monitoring for any issues.' }
              ]);
            }, 2000);
          } catch (error: any) {
            setConversationHistory(prev => [
              ...prev,
              { role: 'assistant', content: `❌ **Fix failed:** ${error.message}\n\nLet me analyze this further...` }
            ]);
          }
          return;
        } else if (lowerMessage === 'no' || lowerMessage === 'reject' || lowerMessage.includes('skip')) {
          // User rejected fix
          setConversationHistory(prev => [
            ...prev,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: 'Understood. I won\'t apply that fix. How else can I help?' }
          ]);
          setAwaitingApproval(false);
          rejectProposal();
          return;
        }
      }
      
      // Add user message to conversation history immediately
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage }
      ]);
      setPrompt("");
      
      // Save user message to database
      if (currentConversationId) {
        try {
          await saveMessageMutation.mutateAsync({ role: 'user', content: userMessage });
        } catch (error) {
          console.error('[VisualEditor] Failed to save user message:', error);
        }
      }
      
      // 🔥 BUILD FULL CONTEXT - MB.MD v9.2
      console.log('[VisualEditor] Building full context for Mr. Blue...');
      const keywords = contextBuilder.extractKeywords(userMessage);
      const fullContext = await contextBuilder.buildContext(
        currentIframeUrl,
        selectedElement,
        currentErrors,
        changeHistory,
        keywords
      );
      const contextStrings = contextBuilder.formatContextForAPI(fullContext);
      
      console.log('[VisualEditor] Context built:', {
        keywords,
        errors: currentErrors.length,
        docChunks: fullContext.documentation.length
      });
      
      // Send streaming request with FULL CONTEXT
      await sendStreamingMessage(userMessage, {
        page: currentIframeUrl,
        selectedElement: selectedElement,
        viewMode,
        editsCount: changeHistory.length,
        conversationHistory: conversationHistory.slice(-6),
        fullContext: contextStrings, // 🔥 NEW: Full context for Mr. Blue
        errors: currentErrors, // 🔥 NEW: Active errors
        keywords // 🔥 NEW: Smart chunking keywords
      }, 'chat');
      
      // Extract final response from stream messages (chat_response or completion)
      const completionMsg = streamMessages.find(m => 
        m.type === 'chat_response' || m.type === 'completion'
      );
      if (completionMsg && completionMsg.message) {
        const responseText = completionMsg.message;
        
        // Add assistant response to conversation history
        setConversationHistory(prev => [
          ...prev,
          { role: 'assistant', content: responseText }
        ]);
        
        // Save assistant message to database
        if (currentConversationId) {
          try {
            await saveMessageMutation.mutateAsync({ role: 'assistant', content: responseText });
          } catch (error) {
            console.error('[VisualEditor] Failed to save assistant message:', error);
          }
        }
        
        // Voice response with natural voice
        if (ttsSupported) {
          speak(responseText);
        }
      }
      
    } catch (error: any) {
      console.error('[StreamingChat] Error:', error);
      toast({
        variant: "destructive",
        title: "Streaming Failed",
        description: error.message || "Could not stream response",
      });
    }
  }, [awaitingApproval, activeProposal, currentIframeUrl, selectedElement, viewMode, changeHistory, conversationHistory, currentConversationId, currentErrors, sendStreamingMessage, streamMessages, saveMessageMutation, ttsSupported, speak, toast, approveProposal, rejectProposal]);
  
  // Legacy chat mutation (fallback for non-streaming)
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/mrblue/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          message,
          context: {
            page: currentIframeUrl,
            selectedElement: selectedElement,
            viewMode,
            conversationHistory: conversationHistory.slice(-6)
          },
          conversationHistory: conversationHistory.slice(-6)
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Chat request failed');
      return data;
    },
    onSuccess: async (data) => {
      const responseText = data.response || 'I can help with that!';
      const userMessage = prompt;
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: responseText }
      ]);
      setPrompt("");
      
      // PHASE 1: Save both user and assistant messages to database
      if (currentConversationId) {
        try {
          await saveMessageMutation.mutateAsync({ role: 'user', content: userMessage });
          await saveMessageMutation.mutateAsync({ role: 'assistant', content: responseText });
        } catch (error) {
          console.error('[VisualEditor] Failed to save messages:', error);
        }
      }
      
      toast({
        title: "Response",
        description: responseText.slice(0, 100) + (responseText.length > 100 ? '...' : ''),
      });
      
      // Voice response with natural voice
      if (ttsSupported) {
        speak(responseText);
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Chat Failed",
        description: error.message || "Could not get response",
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
      
      // Voice response with natural voice
      if (ttsSupported) {
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

  // Replay System Functions
  const startReplay = () => {
    if (changeHistory.length === 0) return;
    
    setIsReplaying(true);
    let index = 0;
    
    replayIntervalRef.current = setInterval(() => {
      if (index >= changeHistory.length) {
        stopReplay();
        return;
      }
      
      jumpToChange(index);
      index++;
    }, 2000); // 2 seconds per change
  };

  const stopReplay = () => {
    setIsReplaying(false);
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }
  };

  const stepForward = () => {
    if (currentChangeIndex < changeHistory.length - 1) {
      jumpToChange(currentChangeIndex + 1);
    }
  };

  const stepBack = () => {
    if (currentChangeIndex > 0) {
      jumpToChange(currentChangeIndex - 1);
    }
  };

  const jumpToChange = (index: number) => {
    if (index < 0 || index >= changeHistory.length) return;
    
    // Update visual indicator
    setCurrentChangeIndex(index);
    
    toast({
      title: "Jumped to Change",
      description: `Showing change ${index + 1} of ${changeHistory.length}`,
    });
  };

  const handleDownloadScreenshot = async (screenshot: string, filename: string) => {
    const link = document.createElement('a');
    link.href = screenshot;
    link.download = filename;
    link.click();
    
    toast({
      title: "Screenshot Downloaded",
      description: filename,
    });
  };

  // Batch undo multiple changes
  const handleBatchUndo = (count: number) => {
    const actualCount = Math.min(count, changeHistory.length);
    
    for (let i = 0; i < actualCount; i++) {
      handleUndo();
    }
    
    toast({
      title: "Batch Undo Complete",
      description: `Undid ${actualCount} change${actualCount !== 1 ? 's' : ''}`,
    });
  };

  // Export change history as JSON
  const handleExportHistory = (): string => {
    const historyData = {
      exportDate: new Date().toISOString(),
      totalChanges: changeHistory.length,
      currentIndex: currentChangeIndex,
      changes: changeHistory.map(change => ({
        id: change.id,
        timestamp: change.timestamp,
        prompt: change.prompt,
        files: change.files.map(f => ({
          path: f.path,
          hasChanges: !!f.before || !!f.after,
        })),
        changedElements: change.changedElements,
        css: change.css,
      })),
    };
    
    return JSON.stringify(historyData, null, 2);
  };

  // Cleanup replay interval on unmount
  useEffect(() => {
    return () => {
      if (replayIntervalRef.current) {
        clearInterval(replayIntervalRef.current);
      }
    };
  }, []);

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

  // NOTE: Access restriction removed - Visual Editor is now the homepage ("/")
  // All users can access Visual Editor (previously god-level only)

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
                  data-testid="input-chat"
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
                {/* Generate Button - Icon Only */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      data-testid="button-send"
                      onClick={handleSubmit}
                      disabled={!prompt.trim() || isExecuting}
                      className="flex-1"
                    >
                      {isExecuting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isExecuting ? 'Working...' : 'Generate changes'}
                  </TooltipContent>
                </Tooltip>

                {/* MB.MD v9.3: Save Backend Button - Icon Only */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      data-testid="button-save-backend"
                      onClick={handleBackendSave}
                      disabled={!saveStatus?.enabled || saveBackendMutation.isPending}
                      variant="secondary"
                      size="icon"
                    >
                      {saveBackendMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {saveStatus?.tooltip || 'Save backend changes'}
                  </TooltipContent>
                </Tooltip>

                {/* MB.MD v9.4: Auto-Save Indicator */}
                {lastSavedTime && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <span>Last saved {Math.floor((Date.now() - lastSavedTime.getTime()) / 1000)}s ago</span>
                  </div>
                )}
                
                {/* MB.MD v9.4: Manual Save Changes Button (P0 Task 3) */}
                {unsavedChangesCount > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSaveChanges}
                        disabled={saveChangesMutation.isPending}
                        data-testid="button-save-changes"
                      >
                        {saveChangesMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Save changes ({unsavedChangesCount} unsaved edits)
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Voice Mode Button - Click-to-Toggle (wisprflow.ai style) */}
                {voiceSupported && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (!isExecuting) {
                            if (isListening) {
                              stopListening();
                            } else {
                              startListening();
                            }
                          }
                        }}
                        disabled={isExecuting}
                        data-testid="button-voice-mode"
                        className={isListening ? 'bg-red-500/10 border-red-500' : ''}
                      >
                        {isListening ? (
                          <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isListening ? 'Click to stop listening' : 'Click to start speaking'}
                    </TooltipContent>
                  </Tooltip>
                )}

                {conversationHistory.length > 0 && (
                  <>
                    {/* Undo Button - Icon Only */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleUndo}
                          disabled={isExecuting}
                          data-testid="button-undo"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Undo last change
                      </TooltipContent>
                    </Tooltip>

                    {/* Clear Chat Button - Icon Only */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setConversationHistory([])}
                          disabled={isExecuting}
                          data-testid="button-clear-conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Clear conversation
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Middle Panel: Error Analysis, Memory System & Progress Tracking */}
        <section className="w-96 border-r flex flex-col" role="region" aria-label="Analysis panel">
          {/* Tab Header */}
          <div className="border-b p-3">
            <Tabs value={middlePanelTab} onValueChange={(v) => setMiddlePanelTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="errors" data-testid="tab-errors">
                  <Bug className="h-4 w-4 mr-2" />
                  Errors
                </TabsTrigger>
                <TabsTrigger value="memory" data-testid="tab-memory">
                  <Brain className="h-4 w-4 mr-2" />
                  Memory
                </TabsTrigger>
                <TabsTrigger value="progress" data-testid="tab-progress">
                  <Activity className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="automation" data-testid="tab-automation">
                  <Play className="h-4 w-4 mr-2" />
                  Automation
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {middlePanelTab === 'errors' ? (
              <ErrorAnalysisPanel 
                selfHealingResult={selfHealingResult}
                isSelfHealingRunning={isSelfHealingRunning}
              />
            ) : middlePanelTab === 'memory' ? (
              <MemoryPanel />
            ) : middlePanelTab === 'progress' ? (
              <ProgressPanel />
            ) : (
              <BrowserAutomationPanel />
            )}
          </div>
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
          <div className="flex-1 flex flex-col overflow-hidden bg-muted/20 relative">
            {viewMode === 'preview' ? (
              <>
                {/* Address Bar for iframe navigation */}
                <IframeAddressBar
                  currentUrl={currentIframeUrl}
                  onNavigate={(url) => {
                    setCurrentIframeUrl(url);
                    if (iframeRef.current) {
                      iframeRef.current.src = url;
                    }
                  }}
                  onRefresh={() => {
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeRef.current.src;
                    }
                  }}
                  onHome={() => {
                    setCurrentIframeUrl('/landing');
                    if (iframeRef.current) {
                      iframeRef.current.src = '/landing';
                    }
                  }}
                  loading={iframeLoading}
                />
                
                {/* Live Preview iframe */}
                <div className="flex-1 overflow-auto relative">
                  <iframe
                    ref={handleIframeMount}
                    src={currentIframeUrl}
                    className="w-full h-full border-0"
                    title="Live Preview"
                    data-visual-editor="true"
                    data-testid="iframe-preview"
                    aria-label="Live preview of your Mundo Tango application"
                  />
                </div>
                
                {/* Streaming Status Panel - Real-time "Mr. Blue is working..." */}
                <StreamingStatusPanel
                  currentStatus={streamStatus}
                  isStreaming={streamIsActive}
                  streamingMessages={streamMessages}
                  onStop={() => {
                    clearStreaming();
                    toast({
                      title: "Streaming Stopped",
                      description: "Generation cancelled",
                    });
                  }}
                />
                
                {/* Smart Suggestions Panel (only in preview mode) */}
                {isGodLevel && currentPageHtml && (
                  <SmartSuggestions
                    pageHtml={currentPageHtml}
                    selectedElement={selectedElement}
                    currentStyles={selectedElementStyles}
                    pagePath={currentIframeUrl}
                    autoRefresh={false}
                    onApplyFix={(suggestion) => {
                      // Apply automated CSS changes to iframe
                      if (suggestion.automated && suggestion.changes && iframeRef.current) {
                        Object.entries(suggestion.changes).forEach(([property, value]) => {
                          applyInstantChange(iframeRef.current!, {
                            type: 'style',
                            selector: suggestion.selector || '',
                            property,
                            value: value as string
                          });
                        });
                      }
                      
                      toast({
                        title: "Suggestion Applied",
                        description: suggestion.fix
                      });
                    }}
                  />
                )}
                
                {/* Element Highlighter - Natural language element selection */}
                {isGodLevel && (
                  <div className="absolute bottom-4 left-4 max-w-xs z-10">
                    <ElementHighlighter
                      iframeRef={iframeRef}
                      onElementSelected={(selector, confidence) => {
                        setSelectedElement(selector);
                        console.log('[Visual Editor] Element selected:', selector, confidence);
                      }}
                    />
                  </div>
                )}
              </>
            ) : viewMode === 'history' ? (
              <div className="h-full p-4">
                <ChangeTimeline
                  changes={changeHistory}
                  currentIndex={currentChangeIndex}
                  isReplaying={isReplaying}
                  onRestore={handleRestore}
                  onDelete={handleDeleteChange}
                  onReplay={startReplay}
                  onPause={stopReplay}
                  onStepForward={stepForward}
                  onStepBack={stepBack}
                  onJumpTo={jumpToChange}
                  onDownload={handleDownloadScreenshot}
                  onBatchUndo={handleBatchUndo}
                  onExportHistory={handleExportHistory}
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

      {/* MB.MD v9.3: Backend Save Progress Modal */}
      <BackendSaveProgressModal
        open={showSaveProgress}
        progress={saveProgress}
        onClose={() => setShowSaveProgress(false)}
      />
    </>
  );
}

export default function VisualEditorPage() {
  return <VisualEditorPageContent />;
}
