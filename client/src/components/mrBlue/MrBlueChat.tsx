import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2, X, Check, Mic, ToggleLeft, ToggleRight, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { breadcrumbTracker } from "@/lib/mrBlue/breadcrumbTracker";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { MessageActions } from "./MessageActions";
import { CommandSuggestions } from "./CommandSuggestions";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useOpenAIRealtime } from "@/hooks/useOpenAIRealtime";
import { VibecodingRouter } from "@/lib/vibecodingRouter";
import { useToast } from "@/hooks/use-toast";
import type { MrBlueMode } from "./ModeSwitcher";
import { VibeCodingResult } from "./VibeCodingResult";
import { PageAwarenessIndicator } from "./PageAwarenessIndicator";
import { ActiveAgentsPanel } from "./ActiveAgentsPanel";
import { AuditResultsPanel } from "./AuditResultsPanel";
import { SelfHealingProgress } from "./SelfHealingProgress";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string | null;
  characterCount?: number;
  readAt?: Date | null;
  isEdited?: boolean;
  editedAt?: Date | null;
  deletedAt?: Date | null;
  reactions?: Array<{ emoji: string; count: number; users: number[] }>;
  vibecodingResult?: {
    sessionId: string;
    fileChanges: Array<{
      filePath: string;
      action: 'modify' | 'create';
      reason: string;
      oldContent?: string;
      newContent: string;
    }>;
  };
}

interface MrBlueChatProps {
  enableVoice?: boolean;
  enableVibecoding?: boolean;
  mode?: MrBlueMode;
}

export function MrBlueChat({ enableVoice = false, enableVibecoding = false, mode = 'text' }: MrBlueChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'vad' | 'realtime'>('vad');
  const [selectedVoice, setSelectedVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>('alloy');
  const [elevenLabsVoiceEnabled, setElevenLabsVoiceEnabled] = useState(false);
  const [selectedElevenLabsVoice, setSelectedElevenLabsVoice] = useState('21m00Tcm4TlvDq8ikWAM'); // Rachel
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [location, navigate] = useLocation();
  const messageCountRef = useRef(0);
  const vibeRouterRef = useRef<VibecodingRouter | null>(null);
  const { toast } = useToast();
  
  // ✅ FIX: Fetch conversation history from API (was missing!)
  const { data: fetchedMessages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/mrblue/conversations/${currentConversationId}/messages`],
    enabled: !!currentConversationId,
  });
  
  // ✅ FIX: Load most recent conversation on mount
  const { data: recentConversations } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations'],
  });
  
  // ✅ FIX: Sync fetched messages with local state
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      console.log('[MrBlue] Loaded conversation history:', fetchedMessages.length, 'messages');
      // Replace all messages with fetched ones (keeping welcome message first)
      const welcomeMessage = {
        id: '1',
        role: 'assistant' as const,
        content: "Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage, ...fetchedMessages]);
    }
  }, [fetchedMessages]);
  
  // ✅ FIX: Auto-load most recent conversation on mount
  useEffect(() => {
    if (recentConversations && recentConversations.length > 0 && !currentConversationId) {
      const mostRecent = recentConversations[0];
      console.log('[MrBlue] Loading most recent conversation:', mostRecent.id);
      setCurrentConversationId(mostRecent.id);
    }
  }, [recentConversations, currentConversationId]);
  
  // Show mode-specific UI
  const showVoiceControls = enableVoice || mode === 'voice';
  const showVibecodingFeatures = enableVibecoding || mode === 'vibecoding';

  // Handle voice input result
  const handleVoiceResult = (text: string) => {
    console.log('[Voice] Received transcript:', text);
    setInput(text);
    // Auto-send after voice input
    setTimeout(() => {
      if (text.trim()) {
        sendMessage();
      }
    }, 100);
  };

  // Initialize voice input with continuous mode support and audio quality monitoring
  const { 
    continuousMode, 
    isListening,
    audioMetrics,
    noiseThreshold,
    isInitializing,
    enableContinuousMode, 
    disableContinuousMode,
    setNoiseThreshold 
  } = useVoiceInput({
    onResult: handleVoiceResult,
  });

  // Build context-aware instructions for OpenAI Realtime
  const realtimeInstructions = `You are Mr. Blue, the Mundo Tango AI assistant.

CURRENT CONTEXT:
- Page: ${location}
- Page Title: ${typeof document !== 'undefined' ? document.title : 'Mundo Tango'}
- User Journey: ${breadcrumbTracker.getRecentActions(5).map(b => b.page).join(' → ')}

MB.MD Methodology: Work Simultaneously, Recursively, Critically.

Provide natural, conversational assistance based on where the user is in the platform. Be concise and helpful.`;

  // Initialize OpenAI Realtime hook for ChatGPT-style voice conversations
  const {
    isConnected: isRealtimeConnected,
    isRecording: isRealtimeRecording,
    messages: realtimeMessages,
    error: realtimeError,
    connect: connectRealtime,
    disconnect: disconnectRealtime,
    sendMessage: sendRealtimeMessage,
  } = useOpenAIRealtime({
    instructions: realtimeInstructions,
    voice: selectedVoice,
    turnDetection: {
      type: 'server_vad',
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: 500, // AI waits 500ms of silence before responding
    },
  });

  // Show realtime error toast
  useEffect(() => {
    if (realtimeError) {
      toast({
        title: 'Realtime Voice Error',
        description: realtimeError,
        variant: 'destructive',
      });
    }
  }, [realtimeError, toast]);

  // Sync realtime messages to main messages state
  useEffect(() => {
    if (voiceMode === 'realtime' && realtimeMessages.length > 0) {
      // Convert realtime messages to main messages format
      const convertedMessages: Message[] = realtimeMessages.map((msg, idx) => ({
        id: `realtime-${msg.timestamp}-${idx}`,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));
      
      // Only update if different from current messages (avoid infinite loop)
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        const lastRealtimeMessage = convertedMessages[convertedMessages.length - 1];
        
        if (!lastMessage || !lastRealtimeMessage || lastMessage.id !== lastRealtimeMessage.id) {
          return [...prev.slice(0, 1), ...convertedMessages]; // Keep welcome message
        }
        return prev;
      });
    }
  }, [realtimeMessages, voiceMode]);

  // Don't auto-enable continuous mode - let user trigger it manually
  // This prevents permission errors and follows browser best practices
  useEffect(() => {
    if (enableVoice && mode === 'voice') {
      console.log('[MrBlue] Voice mode active - use toggle button to start listening');
    }
  }, [enableVoice, mode]);
  
  // Auto-enable vibecoding router for vibecoding mode
  useEffect(() => {
    if (enableVibecoding) {
      vibeRouterRef.current = new VibecodingRouter({
        navigate: (path: string) => {
          navigate(path);
        },
        setViewMode: (mode: 'preview' | 'code' | 'history') => {
          console.log('[MrBlue] View mode changed:', mode);
        },
        handleUndo: () => {
          console.log('[MrBlue] Undo action');
        },
        handleRedo: () => {
          console.log('[MrBlue] Redo action');
        },
      });
      
      console.log('[MrBlue] Vibecoding router initialized');
    }
  }, [enableVibecoding, navigate]);

  // Track page context
  useEffect(() => {
    breadcrumbTracker.track({
      userId: 0, // Will be set from auth context
      action: 'view',
      page: location,
      pageTitle: document.title,
      success: true
    });
  }, [location]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-save conversation every 10 messages
  useEffect(() => {
    const saveConversation = async () => {
      if (messages.length > 1 && messages.length % 10 === 0 && messages.length !== messageCountRef.current) {
        messageCountRef.current = messages.length;
        
        try {
          const title = messages[1]?.content.slice(0, 50) + (messages[1]?.content.length > 50 ? '...' : '');
          
          if (currentConversationId) {
            // Update existing conversation
            await apiRequest(`/api/mrblue/conversations/${currentConversationId}`, {
              method: 'PUT',
              body: JSON.stringify({ title, lastMessageAt: new Date() }),
            });
          } else {
            // Create new conversation
            const response = await apiRequest('/api/mrblue/conversations', {
              method: 'POST',
              body: JSON.stringify({ title }),
            });
            
            if (response && typeof response === 'object' && 'id' in response) {
              setCurrentConversationId(response.id as number);
            }
          }

          // Save messages
          for (const msg of messages.slice(-10)) {
            if (msg.id !== '1') { // Skip welcome message
              await apiRequest('/api/mrblue/messages', {
                method: 'POST',
                body: JSON.stringify({
                  conversationId: currentConversationId,
                  role: msg.role,
                  content: msg.content,
                }),
              });
            }
          }
        } catch (error) {
          console.error('[MrBlueChat] Failed to save conversation:', error);
        }
      }
    };

    saveConversation();
  }, [messages.length, currentConversationId]);

  // Infer user intent from recent breadcrumbs
  const inferUserIntent = (breadcrumbs: any[]): string => {
    if (breadcrumbs.length === 0) return 'general inquiry';
    
    const recentPages = breadcrumbs.slice(-5).map(b => b.page);
    const recentActions = breadcrumbs.slice(-5).map(b => b.action);
    
    // Detect patterns in user behavior
    if (recentPages.some(p => p.includes('/events'))) {
      if (recentActions.includes('click')) return 'exploring events';
      return 'viewing events';
    }
    
    if (recentPages.some(p => p.includes('/profile'))) {
      if (recentActions.includes('input')) return 'editing profile';
      return 'viewing profile';
    }
    
    if (recentPages.some(p => p.includes('/messages'))) {
      return 'messaging';
    }
    
    if (recentPages.some(p => p.includes('/groups'))) {
      return 'exploring groups';
    }
    
    if (recentPages.some(p => p.includes('/housing'))) {
      return 'searching for housing';
    }
    
    if (recentPages.some(p => p.includes('/marketplace'))) {
      return 'browsing marketplace';
    }
    
    // Check for repeated actions indicating specific intent
    if (recentActions.filter(a => a === 'click').length >= 3) {
      return 'exploring the platform';
    }
    
    if (recentActions.filter(a => a === 'input').length >= 2) {
      return 'entering information';
    }
    
    return 'general navigation';
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Track interaction
    breadcrumbTracker.track({
      userId: 0,
      action: 'input',
      page: location,
      target: 'mr-blue-chat',
      value: { messageLength: messageText.length },
      success: true
    });

    // First, route the message through vibecoding router
    if (vibeRouterRef.current) {
      try {
        const routeResult = await vibeRouterRef.current.route(messageText);
        console.log('[MrBlue] Route result:', routeResult);
        
        // If routing was successful and doesn't require AI
        if (routeResult.success && !routeResult.requiresAI) {
          // Show success toast
          toast({
            title: 'Success',
            description: routeResult.message,
          });
          
          // Add assistant confirmation message
          const confirmMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: routeResult.message,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
          
          return; // Don't send to AI
        }
        
        // If routing failed or requires AI, continue to AI processing
        if (!routeResult.success && !routeResult.requiresAI) {
          // Show info that we're sending to AI
          console.log('[MrBlue] Routing failed, sending to AI:', routeResult.message);
        }
      } catch (error) {
        console.error('[MrBlue] Routing error:', error);
        // Continue to AI if routing fails
      }
    }

    // Send to AI for processing
    setIsLoading(true);

    try {
      // Gather comprehensive context + DOM snapshot for vibe coding
      const breadcrumbs = breadcrumbTracker.getRecentActions(10);
      const currentPage = window.location.pathname;
      const pageTitle = document.title;
      const userIntent = inferUserIntent(breadcrumbs);
      
      // MB.MD v9.0: Capture DOM snapshot for vibe coding
      const domSnapshot = {
        inputs: Array.from(document.querySelectorAll('input')).slice(0, 20).map(el => ({
          testId: el.getAttribute('data-testid'),
          placeholder: el.getAttribute('placeholder'),
          name: el.getAttribute('name'),
          type: el.getAttribute('type'),
          id: el.id,
          value: el.value ? '***' : '', // Don't send actual values (privacy)
        })),
        buttons: Array.from(document.querySelectorAll('button')).slice(0, 20).map(el => ({
          testId: el.getAttribute('data-testid'),
          text: el.textContent?.trim().substring(0, 50),
          type: el.getAttribute('type'),
          disabled: el.hasAttribute('disabled'),
        })),
        selects: Array.from(document.querySelectorAll('select')).slice(0, 10).map(el => ({
          testId: el.getAttribute('data-testid'),
          name: el.getAttribute('name'),
          id: el.id,
        })),
        errors: Array.from(document.querySelectorAll('[role="alert"], .error, .text-destructive')).slice(0, 5).map(el => ({
          text: el.textContent?.trim().substring(0, 100),
        })),
      };

      const response = await fetch('/api/mrblue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context: {
            breadcrumbs,
            currentPage,
            pageTitle,
            userIntent,
            domSnapshot, // Send DOM snapshot
          },
          conversationId: currentConversationId, // ✅ FIX: Include conversation ID for persistence
          userId: 1, // ✅ FIX: Include user ID (TODO: Get from auth context)
          voiceEnabled: elevenLabsVoiceEnabled,
          selectedVoiceId: selectedElevenLabsVoice
        })
      });

      const data = await response.json();
      
      // MB.MD v9.0: Handle vibe coding response
      if (data.mode === 'vibecoding' && data.vibecodingResult) {
        const vibeResult = data.vibecodingResult;
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || 'Code changes generated successfully',
          timestamp: new Date(),
          vibecodingResult: vibeResult,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // ✅ FIX: Refetch to update conversation history
        await refetchMessages();
        
        toast({
          title: '✅ Vibe Coding Complete!',
          description: `Generated changes for ${vibeResult.fileChanges.length} file(s). Review and apply below.`,
          duration: 5000,
        });
        
        console.log('[MrBlue] Vibe coding session:', vibeResult.sessionId);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.content || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
        audioUrl: data.audioUrl || null,
        characterCount: data.characterCount
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // ✅ FIX: Refetch to update conversation history
      await refetchMessages();

      // Auto-play audio if available
      if (data.audioUrl && audioRef.current) {
        try {
          audioRef.current.src = data.audioUrl;
          await audioRef.current.play();
          console.log('[MrBlue] Playing TTS audio');
        } catch (error) {
          console.error('[MrBlue] Audio playback error:', error);
        }
      }
    } catch (error) {
      console.error('[MrBlueChat] Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const saveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      await apiRequest(`/api/mrblue/messages/${editingMessageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editContent }),
      });

      setMessages(prev => prev.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, content: editContent, isEdited: true, editedAt: new Date() }
          : msg
      ));

      setEditingMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error('[MrBlueChat] Edit error:', error);
    }
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const refreshReactions = async (messageId: string) => {
    try {
      const reactions = await apiRequest(`/api/mrblue/messages/${messageId}/reactions`);
      
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, reactions: reactions as any }
          : msg
      ));
    } catch (error) {
      console.error('[MrBlueChat] Refresh reactions error:', error);
    }
  };

  return (
    <main role="main" className="flex flex-col h-full">
      {/* Page Awareness & Active Agents - MB.MD v9.2 */}
      <PageAwarenessIndicator />
      <ActiveAgentsPanel />
      
      {/* ElevenLabs TTS Controls - ALWAYS visible for human voice */}
      <div className="p-4 border-b bg-muted/20 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap font-semibold">🎙️ Human Voice (ElevenLabs):</Label>
            <Button
              size="sm"
              variant={elevenLabsVoiceEnabled ? "default" : "outline"}
              onClick={() => setElevenLabsVoiceEnabled(!elevenLabsVoiceEnabled)}
              data-testid="button-toggle-elevenlabs-voice"
            >
              {elevenLabsVoiceEnabled ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
              {elevenLabsVoiceEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          {elevenLabsVoiceEnabled && (
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Select Voice:</Label>
              <Select value={selectedElevenLabsVoice} onValueChange={setSelectedElevenLabsVoice} data-testid="select-elevenlabs-voice">
                <SelectTrigger className="w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="21m00Tcm4TlvDq8ikWAM">Rachel (Professional Female)</SelectItem>
                  <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi (Strong Male)</SelectItem>
                  <SelectItem value="EXAVITQu4vr4xnSDxMaL">Bella (Soft Female)</SelectItem>
                  <SelectItem value="ErXwobaYiN019PkySvjV">Antoni (Well-Rounded Male)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {elevenLabsVoiceEnabled && (
          <div className="text-sm text-muted-foreground">
            ✨ Responses will play with natural human voice (ElevenLabs TTS)
          </div>
        )}
      </div>

      {/* Voice controls (only in voice/vibecoding modes) */}
      {showVoiceControls && (
        <div className="p-4 border-b bg-muted/20 space-y-4">
          {/* Voice Mode Selection */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Voice Mode:</Label>
              <Select value={voiceMode} onValueChange={(v) => setVoiceMode(v as 'vad' | 'realtime')} data-testid="select-voice-mode">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vad">VAD (Manual Send)</SelectItem>
                  <SelectItem value="realtime">Realtime (Continuous)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Voice Selection (only in Realtime mode) */}
            {voiceMode === 'realtime' && (
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Voice:</Label>
                <Select value={selectedVoice} onValueChange={(v) => setSelectedVoice(v as any)} data-testid="select-voice">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                    <SelectItem value="echo">Echo (Masculine)</SelectItem>
                    <SelectItem value="fable">Fable (British)</SelectItem>
                    <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                    <SelectItem value="nova">Nova (Energetic)</SelectItem>
                    <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {/* Realtime Mode UI */}
          {voiceMode === 'realtime' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isRealtimeConnected ? (
                  <Button
                    onClick={connectRealtime}
                    variant="default"
                    size="sm"
                    data-testid="button-start-realtime-chat"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Start Realtime Voice Chat
                  </Button>
                ) : (
                  <>
                    <Badge variant="default">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5" />
                      Live Voice Chat - Speak Naturally
                    </Badge>
                    <Button
                      onClick={disconnectRealtime}
                      variant="destructive"
                      size="sm"
                      data-testid="button-end-realtime-chat"
                    >
                      <PhoneOff className="w-4 h-4 mr-2" />
                      End Voice Chat
                    </Button>
                  </>
                )}
              </div>
              
              {/* Show recording indicator */}
              {isRealtimeRecording && (
                <Badge variant="outline">
                  <div className="flex gap-1 mr-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full"
                        style={{ 
                          height: `${Math.random() * 12 + 6}px`,
                          animation: `pulse ${Math.random() * 0.5 + 0.5}s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s` 
                        }}
                      />
                    ))}
                  </div>
                  Recording...
                </Badge>
              )}
            </div>
          ) : (
            /* VAD Mode UI */
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={continuousMode ? "default" : "outline"}
                    onClick={continuousMode ? disableContinuousMode : enableContinuousMode}
                    disabled={isInitializing}
                    data-testid="button-toggle-continuous-voice"
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        {continuousMode ? <ToggleRight className="w-4 h-4 mr-2" /> : <ToggleLeft className="w-4 h-4 mr-2" />}
                        Continuous Voice
                      </>
                    )}
                  </Button>
                  
                  {continuousMode && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant={isListening ? "default" : "secondary"}>
                        {isListening ? "Listening..." : "Waiting"}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Audio quality metrics */}
                {continuousMode && (
                  <div className="flex gap-2">
                    <Badge variant="outline" data-testid="metric-snr">SNR: {audioMetrics.snr.toFixed(1)} dB</Badge>
                    <Badge variant="outline" data-testid="metric-thd">THD: {audioMetrics.thd.toFixed(2)}%</Badge>
                  </div>
                )}
              </div>
              
              {/* Noise threshold slider */}
              {continuousMode && (
                <div className="mt-4">
                  <Label>Noise Threshold: {noiseThreshold} dB</Label>
                  <Slider
                    value={[noiseThreshold]}
                    onValueChange={([value]) => setNoiseThreshold(value)}
                    min={-60}
                    max={-20}
                    step={1}
                    className="mt-2"
                    data-testid="slider-noise-threshold"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Voice commands help (in vibecoding mode) */}
      {showVibecodingFeatures && (
        <div className="p-4 border-b">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCommands(!showCommands)}
            data-testid="button-toggle-commands"
          >
            {showCommands ? 'Hide' : 'Show'} Voice Commands
          </Button>
          
          {showCommands && (
            <div className="mt-4">
              <CommandSuggestions />
            </div>
          )}
        </div>
      )}
      
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div 
          className="space-y-4"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat conversation with Mr. Blue"
        >
          {messages.map(message => {
            if (message.deletedAt) {
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-deleted-${message.id}`}
                >
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted/50 opacity-50">
                    <p className="text-sm italic text-muted-foreground">Message deleted</p>
                  </div>
                </div>
              );
            }

            const isEditing = editingMessageId === message.id;

            return (
              <div
                key={message.id}
                className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.role}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className="flex items-start gap-2">
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="resize-none min-w-[300px]"
                            rows={3}
                            data-testid="input-edit-message"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={saveEdit}
                              data-testid="button-save-edit"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={cancelEdit}
                              data-testid="button-cancel-edit"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Vibe Coding Result */}
                          {message.vibecodingResult && (
                            <div className="mt-3">
                              <VibeCodingResult
                                sessionId={message.vibecodingResult.sessionId}
                                fileChanges={message.vibecodingResult.fileChanges}
                                onApplySuccess={() => {
                                  toast({
                                    title: "🎉 Changes Applied!",
                                    description: "Your code has been updated. Check the files for changes.",
                                  });
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Audio playback for assistant messages with TTS */}
                          {message.role === 'assistant' && message.audioUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                🎙️ Voice ({message.characterCount} chars)
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.isEdited && (
                              <Badge variant="secondary" className="text-xs py-0 h-4">
                                edited
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && message.id !== '1' && (
                      <MessageActions
                        messageId={message.id}
                        isOwnMessage={message.role === 'user'}
                        onEdit={() => handleEditMessage(message.id, message.content)}
                        onDelete={() => handleDeleteMessage(message.id)}
                        onReactionAdded={() => refreshReactions(message.id)}
                      />
                    )}
                  </div>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {message.reactions.map((reaction) => (
                        <Badge
                          key={reaction.emoji}
                          variant="secondary"
                          className="text-sm cursor-pointer hover-elevate"
                          data-testid={`reaction-${reaction.emoji}`}
                        >
                          {reaction.emoji} {reaction.count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start" data-testid="typing-indicator">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                  </div>
                  <span className="text-sm text-muted-foreground">Mr. Blue is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t">
        {voiceMode === 'realtime' && isRealtimeConnected ? (
          /* In Realtime mode, show text input option but no send button (voice-first) */
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Or type a message while in voice chat..."
              className="resize-none"
              rows={2}
              data-testid="input-mr-blue-message"
              aria-label="Type your message to Mr. Blue"
            />
            <Button
              onClick={() => {
                if (input.trim()) {
                  sendRealtimeMessage(input);
                  setInput("");
                }
              }}
              disabled={!input.trim()}
              size="icon"
              data-testid="button-send-text-realtime"
              aria-label="Send text message during voice chat"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* VAD mode or Realtime not connected - standard input */
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                mode === 'voice' 
                  ? "Speak or type your message..."
                  : mode === 'vibecoding'
                  ? "Try: make it blue, create a button, go to home..."
                  : "Ask me anything..."
              }
              className="resize-none"
              rows={2}
              data-testid="input-mr-blue-message"
              aria-label="Type your message to Mr. Blue"
            />
            
            {showVoiceControls && voiceMode === 'vad' && (
              <Button
                size="icon"
                variant={continuousMode ? "default" : "outline"}
                onClick={continuousMode ? disableContinuousMode : enableContinuousMode}
                disabled={isInitializing}
                data-testid="button-voice-input"
                aria-label="Toggle voice input"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              data-testid="button-send-message"
              aria-label="Send message to Mr. Blue"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </main>
  );
}
