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
import { VoiceModeToggle } from "@/components/visual-editor/VoiceModeToggle";
import { VoiceCommandProcessor } from "@/components/visual-editor/VoiceCommandProcessor";
import { SmartSuggestions } from "@/components/visual-editor/SmartSuggestions";
import { StreamingStatusPanel } from "@/components/visual-editor/StreamingStatusPanel";
import { IframeAddressBar } from "@/components/visual-editor/IframeAddressBar";
import { ElementHighlighter } from "@/components/visual-editor/ElementHighlighter";
import { useSelfHealing } from "@/hooks/useSelfHealing";
import type { ChangeMetadata } from "@/components/visual-editor/VisualDiffViewer";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorAnalysisPanel } from "@/components/mr-blue/ErrorAnalysisPanel";
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
  Play, Eye, Code2, Palette, Undo2, Sparkles, Zap, FileCode, History, Mic, MicOff, Lightbulb, RefreshCw
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
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [currentIframeUrl, setCurrentIframeUrl] = useState<string>('/landing');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(-1);
  const [currentPageHtml, setCurrentPageHtml] = useState<string>("");
  const [selectedElementStyles, setSelectedElementStyles] = useState<Record<string, string>>({});
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  
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

  // ✅ FIX: Sync fetched messages with local conversation history
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      console.log('[VisualEditor] Loaded conversation history:', fetchedMessages.length, 'messages');
      const formattedMessages = fetchedMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));
      setConversationHistory(formattedMessages);
    }
  }, [fetchedMessages]);

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
    },
    onError: (error: any) => {
      console.error('[VisualEditor] Failed to save message:', error);
    },
  });

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

  // Self-healing orchestration (MB.MD v9.0)
  const { isRunning: isSelfHealingRunning, result: selfHealingResult } = useSelfHealing(
    '/', 
    !!user && isGodLevel // Only run for god-level users
  );

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
      setIframeLoading(false);
      setIframeError(false);
      injectSelectionScript(iframe);
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

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);
    
    // Extract page HTML for Smart Suggestions
    const extractPageHtml = () => {
      try {
        if (iframe?.contentDocument?.documentElement) {
          const html = iframe.contentDocument.documentElement.outerHTML;
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
      } else if (event.data.type === 'IFRAME_NAVIGATE') {
        // Track navigation for smart suggestions
        const newUrl = event.data.url;
        console.log('[VisualEditor] Iframe navigated to:', newUrl);
        setCurrentIframeUrl(newUrl);
        
        // Navigate the iframe
        if (iframe && iframe.contentWindow) {
          iframe.src = newUrl;
        }
        
        // Extract HTML after navigation completes
        setTimeout(extractPageHtml, 1000);
      } else if (event.data.type === 'IFRAME_LOADED') {
        // Extract HTML when page finishes loading
        extractPageHtml();
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
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

  // ✅ STREAMING HANDLER - Replace chatMutation with streaming approach
  const handleStreamingChat = useCallback(async (message: string) => {
    try {
      const userMessage = message;
      
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
      
      // Send streaming request
      await sendStreamingMessage(userMessage, {
        page: currentIframeUrl,
        selectedElement: selectedElement,
        viewMode,
        editsCount: changeHistory.length,
        conversationHistory: conversationHistory.slice(-6)
      }, 'chat');
      
      // Extract final response from stream messages
      const completionMsg = streamMessages.find(m => m.type === 'completion');
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
        
        // Voice response
        if (voiceModeEnabled && ttsSupported) {
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
  }, [currentIframeUrl, selectedElement, viewMode, changeHistory, conversationHistory, currentConversationId, sendStreamingMessage, streamMessages, saveMessageMutation, voiceModeEnabled, ttsSupported, speak, toast]);
  
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
      
      // Voice response
      if (voiceModeEnabled && ttsSupported) {
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

  // Handle submit (auto-detect if it's a chat message, style change, or full build task)
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
                      enableContinuousMode();
                      startListening();
                    } else {
                      disableContinuousMode();
                      stopListening();
                    }
                  }}
                  className="w-full"
                />
                {/* Show continuous mode status */}
                {voiceModeEnabled && isContinuousMode && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <Badge variant="default" className="text-xs">
                      <Mic className="h-3 w-3 mr-1" />
                      Continuous Mode Active
                    </Badge>
                    <p className="mt-1">Just start speaking - no wake word needed!</p>
                  </div>
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
                <Button
                  data-testid="button-send"
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

        {/* Middle Panel: Error Analysis */}
        <section className="w-96 border-r flex flex-col" role="region" aria-label="Error analysis panel">
          <ErrorAnalysisPanel />
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
                    ref={iframeRef}
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
                
                {/* Self-Healing Status */}
                {isSelfHealingRunning && (
                  <div className="absolute top-16 right-4 bg-background/95 border rounded-lg p-4 shadow-lg max-w-sm" data-testid="self-healing-status">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">Self-Healing System Active...</span>
                    </div>
                  </div>
                )}
                
                {selfHealingResult && !isSelfHealingRunning && (
                  <div className="absolute top-16 right-4 bg-background/95 border rounded-lg p-4 shadow-lg max-w-sm" data-testid="self-healing-result">
                    <h3 className="text-sm font-medium mb-2">Self-Healing Complete ✅</h3>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>Agents: {selfHealingResult.agentsActivated} ({selfHealingResult.activationTime}ms)</div>
                      <div>Issues Fixed: {selfHealingResult.issuesFixed || 0}</div>
                      <div>Total Time: {selfHealingResult.totalTime}ms</div>
                      <div>UX Validation: {selfHealingResult.uxValidationPassed ? '✅ PASS' : '❌ FAIL'}</div>
                    </div>
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
    </>
  );
}

export default function VisualEditorPage() {
  return <VisualEditorPageContent />;
}
