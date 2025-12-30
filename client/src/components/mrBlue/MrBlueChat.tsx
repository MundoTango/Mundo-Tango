import { useState, useEffect, useRef } from "react";
import { Send, Loader2, X, Brain, Zap, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar as ShadcnAvatar, AvatarFallback as ShadcnAvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useMrBlue } from "@/contexts/MrBlueContext";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'vibe';
  content: string;
  timestamp: Date;
  vibeType?: 'thought' | 'action' | 'observation' | 'phase' | 'complete' | 'error';
  vibePhase?: string;
}

// Detect if message is a VibeCoding task
function isVibecodingTask(message: string): boolean {
  const patterns = [
    /\b(fix|repair|patch|debug|solve)\b.*\b(rsvp|cache|bug|error|issue|problem)\b/i,
    /\b(update|change|modify|improve|enhance)\b.*\b(code|component|file|function)\b/i,
    /\b(implement|add|create|build)\b.*\b(feature|functionality|system)\b/i,
    /\b(make|ensure)\b.*\b(responsive|mobile|layout)\b/i,
    /^fix\s+/i,
    /^update\s+/i,
    /^implement\s+/i
  ];
  return patterns.some(pattern => pattern.test(message));
}

interface MrBlueChatProps {
  onClose?: () => void;
}

export function MrBlueChat({ onClose }: MrBlueChatProps) {
  const { ctoWelcome, clearCTOWelcome, selfHealError, clearSelfHealError, openWalkthrough, walkthroughResult, setWalkthroughResult } = useMrBlue();
  
  // Generate welcome message based on context
  const getWelcomeMessage = () => {
    // Walkthrough result takes priority - show the test results
    if (walkthroughResult) {
      const successEmoji = walkthroughResult.success ? '✓' : '✗';
      const statusText = walkthroughResult.success ? 'PASSED' : 'FAILED';
      const durationSec = (walkthroughResult.duration / 1000).toFixed(1);
      
      let stepsReport = walkthroughResult.steps.map((s, i) => {
        const icon = s.status === 'success' ? '✓' : '✗';
        const time = s.duration ? ` (${s.duration}ms)` : '';
        return `${icon} Step ${i + 1}: ${s.description}${time}`;
      }).join('\n');
      
      if (walkthroughResult.success) {
        return `**${successEmoji} CTO Walkthrough: ${walkthroughResult.testName}**

Status: **${statusText}** in ${durationSec}s
Steps: ${walkthroughResult.completedSteps}/${walkthroughResult.totalSteps} passed

${stepsReport}

All systems operational! The self-healing infrastructure is functioning correctly.

Would you like to:
- Run another test scenario
- Review the platform health dashboard
- Ask me anything about the codebase`;
      } else {
        const failedStep = walkthroughResult.steps.find(s => s.status === 'failed');
        return `**${successEmoji} CTO Walkthrough: ${walkthroughResult.testName}**

Status: **${statusText}** at ${durationSec}s
Steps: ${walkthroughResult.completedSteps}/${walkthroughResult.totalSteps} passed

${stepsReport}

**Error detected:** ${failedStep?.error || 'Unknown error'}

I can help you analyze and fix this issue using **MB.MD Pattern 53**. Say "apply fix" to proceed.`;
      }
    }
    
    if (ctoWelcome) {
      return `Welcome back, ${ctoWelcome.userName}! I detected you're a ${ctoWelcome.userRole} user.

Ready to start the **Self-Healing System walkthrough**? Here's what we can do:

1. **Test Resume Parsing** - Upload a PDF at /volunteer to verify the CSRF fix
2. **Trigger Error Boundary** - Test the MB.MD Pattern 53 self-healing flow
3. **Review System Status** - Check platform health and recent deployments

Just say "start walkthrough" or ask me anything about the platform!`;
    }
    if (selfHealError) {
      return `I detected an error on the ${selfHealError.page} page. Let me help you fix it.

**Error:** ${selfHealError.errorMessage.substring(0, 200)}...

**MB.MD Analysis:**
- Pattern: ${selfHealError.mbmdAnalysis?.mbmdPattern || 'Unknown'}
- Root Cause: ${selfHealError.mbmdAnalysis?.rootCause || 'Analyzing...'}
- Recommended Fix: ${selfHealError.mbmdAnalysis?.recommendedFix || 'Let me investigate...'}

Would you like me to help apply the fix, or explain the issue in more detail?`;
    }
    return "Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?";
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Update welcome message when CTO, self-heal, or walkthrough result context changes
  useEffect(() => {
    if (ctoWelcome || selfHealError || walkthroughResult) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }]);
    }
  }, [ctoWelcome, selfHealError, walkthroughResult]);
  
  // MB.MD Pattern 80: Load recent conversations FIRST to get conversationId immediately
  const { data: recentConversations, isLoading: conversationsLoading } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations'],
    staleTime: 30000, // Cache for 30s to reduce re-fetches
  });
  
  // Set conversation ID immediately when conversations load
  useEffect(() => {
    if (recentConversations && recentConversations.length > 0 && !currentConversationId) {
      console.log('[MrBlueChat] Setting conversation ID from recent:', recentConversations[0].id);
      setCurrentConversationId(recentConversations[0].id);
    }
  }, [recentConversations, currentConversationId]);
  
  const { data: fetchedMessages, refetch: refetchMessages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/mrblue/conversations', currentConversationId, 'messages'],
    enabled: !!currentConversationId && currentConversationId > 0,
    retry: false,
    staleTime: 10000, // Cache for 10s
  });
  
  // Show loading state while fetching previous conversation
  useEffect(() => {
    if (conversationsLoading || (currentConversationId && messagesLoading)) {
      // Keep welcome message but user knows we're loading history
      console.log('[MrBlueChat] Loading conversation history...');
    }
  }, [conversationsLoading, messagesLoading, currentConversationId]);
  
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      // Use context-aware welcome message (CTO/self-heal) instead of generic one
      const welcomeMessage = {
        id: '1',
        role: 'assistant' as const,
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      // Fix: Convert API timestamps (strings) to Date objects
      const parsedMessages = fetchedMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));
      console.log('[MrBlueChat] Loaded', parsedMessages.length, 'messages from conversation', currentConversationId);
      setMessages([welcomeMessage, ...parsedMessages]);
    }
  }, [fetchedMessages, ctoWelcome, selfHealError]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Check if message is a CTO walkthrough trigger
  const isWalkthroughTrigger = (text: string): boolean => {
    const triggers = [
      'yes', 'start walkthrough', 'start the walkthrough', 'begin walkthrough',
      'run test', 'run the test', 'test resume', 'test resume parsing',
      'let\'s go', 'let\'s start', 'begin', 'ok', 'okay', 'sure', 'go ahead'
    ];
    const lowerText = text.toLowerCase().trim();
    return triggers.some(trigger => lowerText === trigger || lowerText.includes('start walkthrough'));
  };
  
  // Check if message is a fix approval trigger
  const isFixApprovalTrigger = (text: string): boolean => {
    const triggers = [
      'yes', 'apply fix', 'apply the fix', 'fix it', 'do it', 
      'go ahead', 'approve', 'ok', 'okay', 'sure'
    ];
    const lowerText = text.toLowerCase().trim();
    return triggers.some(trigger => lowerText === trigger);
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
    
    // Check for CTO walkthrough trigger when in CTO welcome context
    if (ctoWelcome && isWalkthroughTrigger(messageText)) {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Opening the walkthrough preview now. You'll see a live test of the resume upload flow on the waitlist page. I'll monitor for any issues and report back.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, responseMessage]);
      
      // Small delay then open walkthrough
      setTimeout(() => {
        openWalkthrough();
      }, 500);
      return;
    }
    
    // Check for fix approval when in self-heal context
    if (selfHealError && isFixApprovalTrigger(messageText)) {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/cto/walkthrough/apply-fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            errorType: selfHealError.mbmdAnalysis?.mbmdPattern || 'unknown',
            mbmdPattern: selfHealError.mbmdAnalysis?.mbmdPattern,
            recommendedFix: selfHealError.mbmdAnalysis?.recommendedFix
          })
        });
        
        const data = await response.json();
        
        const fixResultMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.success
            ? `Fix applied successfully!\n\n**Files Modified:**\n${data.filesModified?.join(', ') || 'None'}\n\n**Result:** ${data.message}\n\nWould you like me to re-run the walkthrough to verify the fix?`
            : `Fix could not be applied: ${data.error}\n\nWould you like me to try an alternative approach?`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fixResultMessage]);
        
        if (data.success) {
          clearSelfHealError();
        }
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I encountered an error while applying the fix. Let me try a different approach.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    // Check if this is a VibeCoding task and user might be god-level
    // Try streaming first, fall back to regular chat if not authorized
    if (isVibecodingTask(messageText)) {
      try {
        console.log('[MrBlueChat] VibeCoding task detected, attempting stream...');
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        // Call streaming endpoint
        const response = await fetch('/api/mrblue/vibestream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? 'Bearer ' + token : ''
          },
          body: JSON.stringify({
            message: messageText,
            context: {
              currentPage: location,
              pageTitle: document.title
            }
          })
        });
        
        // Check if streaming is available (god-level users)
        // Only add starting message AFTER confirming streaming works
        if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
          console.log('[MrBlueChat] Streaming response received');
          
          // Now add the starting message since we confirmed streaming
          const startMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'vibe',
            content: 'VibeCoding session started...',
            timestamp: new Date(),
            vibeType: 'phase',
            vibePhase: 'init'
          };
          setMessages(prev => [...prev, startMessage]);
          
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          
          if (reader) {
            let buffer = '';
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const eventData = JSON.parse(line.slice(6));
                      
                      // Add vibe event as a message
                      const vibeMessage: Message = {
                        id: (Date.now() + Math.random()).toString(),
                        role: 'vibe',
                        content: eventData.content,
                        timestamp: new Date(),
                        vibeType: eventData.type,
                        vibePhase: eventData.phase
                      };
                      
                      setMessages(prev => [...prev, vibeMessage]);
                    } catch {
                      // Ignore parse errors
                    }
                  }
                }
              }
            } catch (streamError) {
              console.error('[MrBlueChat] Stream read error:', streamError);
              const errorMessage: Message = {
                id: (Date.now() + Math.random()).toString(),
                role: 'vibe',
                content: 'VibeCoding stream interrupted. Please try again.',
                timestamp: new Date(),
                vibeType: 'error'
              };
              setMessages(prev => [...prev, errorMessage]);
            }
            
            setIsLoading(false);
            return;
          }
        }
        
        // If not streaming (403 for non-god users), fall through to regular chat silently
        console.log('[MrBlueChat] Streaming not available (status: ' + response.status + '), falling back to regular chat');
      } catch (error) {
        console.log('[MrBlueChat] Streaming failed, falling back to regular chat');
      }
    }

    try {
      // Use apiRequest to include JWT authentication for god-level VibeCoding tools
      // Pass current page context so Mr. Blue knows where the user is
      // apiRequest signature: (method, url, data) - returns Response
      const response = await apiRequest('POST', '/api/mrblue/chat', {
        message: messageText,
        conversationId: currentConversationId,
        context: {
          currentPage: location,
          pageTitle: document.title
        }
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.content || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation ID if returned from backend
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Mr. Blue. Please try again.",
        variant: "destructive",
      });
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

  return (
    <main className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
        <ShadcnAvatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
          <ShadcnAvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold">
            MB
          </ShadcnAvatarFallback>
        </ShadcnAvatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-foreground">Mr. Blue</h2>
          <p className="text-xs text-muted-foreground truncate">Your Tango AI Assistant</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-chat">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" data-testid="scrollarea-chat-messages">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message) => {
            // Vibe message rendering with distinct styles
            if (message.role === 'vibe') {
              const getVibeStyle = () => {
                switch (message.vibeType) {
                  case 'thought':
                    return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', icon: Brain, label: 'THOUGHT' };
                  case 'action':
                    return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', icon: Zap, label: 'ACTION' };
                  case 'observation':
                    return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300', icon: Eye, label: 'OBSERVATION' };
                  case 'phase':
                    return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300', icon: Loader2, label: message.vibePhase?.toUpperCase() || 'PHASE' };
                  case 'complete':
                    return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', icon: CheckCircle, label: 'COMPLETE' };
                  case 'error':
                    return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', icon: AlertTriangle, label: 'ERROR' };
                  default:
                    return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', icon: Brain, label: 'VIBE' };
                }
              };
              
              const style = getVibeStyle();
              const IconComponent = style.icon;
              
              return (
                <div
                  key={message.id}
                  data-testid={'message-vibe-' + message.id}
                  className="flex gap-2 justify-start"
                >
                  <div className={'flex items-start gap-2 max-w-[95%] rounded-lg px-3 py-2 text-xs font-mono border ' + style.bg + ' ' + style.border}>
                    <IconComponent className={'h-3 w-3 flex-shrink-0 mt-0.5 ' + style.text + (message.vibeType === 'phase' ? ' animate-spin' : '')} />
                    <div className="flex-1 min-w-0">
                      <span className={'text-[10px] font-bold uppercase tracking-wider ' + style.text}>{style.label}</span>
                      <p className="text-foreground/80 whitespace-pre-wrap break-words mt-0.5">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Regular message rendering
            return (
              <div
                key={message.id}
                data-testid={'message-' + message.role + '-' + message.id}
                className={'flex gap-3 ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'assistant' && (
                  <ShadcnAvatar className="h-8 w-8 border shadow-sm flex-shrink-0">
                    <ShadcnAvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-medium">
                      MB
                    </ShadcnAvatarFallback>
                  </ShadcnAvatar>
                )}
                
                <div className={'max-w-[80%] sm:max-w-[75%] ' + (message.role === 'user' ? 'order-first' : '')}>
                  <div className={'rounded-2xl px-4 py-3 text-sm shadow-sm ' + (
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-card border border-border/50 rounded-bl-md backdrop-blur-sm'
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <p className={'text-[10px] text-muted-foreground mt-1 ' + (message.role === 'user' ? 'text-right' : 'text-left')}>
                    {message.timestamp instanceof Date 
                      ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : message.timestamp 
                        ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                  </p>
                </div>

                {message.role === 'user' && (
                  <ShadcnAvatar className="h-8 w-8 border shadow-sm flex-shrink-0">
                    <ShadcnAvatarFallback className="bg-accent/10 text-accent text-xs font-medium">You</ShadcnAvatarFallback>
                  </ShadcnAvatar>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <ShadcnAvatar className="h-8 w-8 border shadow-sm flex-shrink-0">
                <ShadcnAvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-medium">
                  MB
                </ShadcnAvatarFallback>
              </ShadcnAvatar>
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Action Buttons */}
      <div className="px-4 py-2 border-t bg-muted/30">
        <div className="flex flex-wrap gap-2 max-w-2xl mx-auto justify-center">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setInput("Show me upcoming events near me")}
            data-testid="button-quick-events"
          >
            📅 Events
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setInput("What cities have the best tango scene?")}
            data-testid="button-quick-cities"
          >
            🌍 Cities
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setInput("How do I create an event?")}
            data-testid="button-quick-help"
          >
            ❓ Help
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => setInput("What are the platform features?")}
            data-testid="button-quick-features"
          >
            ✨ Features
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        {/* Smart Suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3 max-w-2xl mx-auto">
          <button
            onClick={() => { setInput("Find milongas this weekend"); }}
            className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            data-testid="suggestion-milongas"
          >
            Find milongas this weekend
          </button>
          <button
            onClick={() => { setInput("Recommend teachers near me"); }}
            className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            data-testid="suggestion-teachers"
          >
            Recommend teachers
          </button>
          <button
            onClick={() => { setInput("What's new on the platform?"); }}
            className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            data-testid="suggestion-whats-new"
          >
            What's new?
          </button>
        </div>

        <div className="relative flex items-end gap-2 max-w-2xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about events, cities, tango tips..."
            className="min-h-[48px] max-h-32 resize-none rounded-2xl pr-14 border-muted-foreground/20 focus:border-primary/50 transition-colors"
            disabled={isLoading}
            data-testid="input-chat-message"
          />
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 h-9 w-9 rounded-full shadow-sm"
            disabled={!input.trim() || isLoading}
            onClick={sendMessage}
            data-testid="button-send-message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mr. Blue has access to real platform data including events, cities, and community info
        </p>
      </div>
    </main>
  );
}
