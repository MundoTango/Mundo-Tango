import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Avatar, AvatarFallback } from "lucide-react";
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
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function MrBlueChat() {
  const { ctoWelcome, clearCTOWelcome, selfHealError, clearSelfHealError, openWalkthrough } = useMrBlue();
  
  // Generate welcome message based on context
  const getWelcomeMessage = () => {
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
  
  // Update welcome message when CTO or self-heal context changes
  useEffect(() => {
    if (ctoWelcome || selfHealError) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }]);
    }
  }, [ctoWelcome, selfHealError]);
  
  const { data: fetchedMessages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/mrblue/conversations/${currentConversationId}/messages`],
    enabled: !!currentConversationId,
  });
  
  const { data: recentConversations } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations'],
  });
  
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      // Use context-aware welcome message (CTO/self-heal) instead of generic one
      const welcomeMessage = {
        id: '1',
        role: 'assistant' as const,
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage, ...fetchedMessages]);
    }
  }, [fetchedMessages, ctoWelcome, selfHealError]);
  
  useEffect(() => {
    if (recentConversations && recentConversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(recentConversations[0].id);
    }
  }, [recentConversations, currentConversationId]);

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

    try {
      const response = await fetch('/api/mrblue/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationId: currentConversationId,
          userId: 1
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.content || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      await refetchMessages();
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
    <main className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <ShadcnAvatar className="h-8 w-8 border">
                  <ShadcnAvatarFallback className="bg-primary/10 text-primary">MB</ShadcnAvatarFallback>
                </ShadcnAvatar>
              )}
              
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>

              {message.role === 'user' && (
                <ShadcnAvatar className="h-8 w-8 border">
                  <ShadcnAvatarFallback className="bg-accent/10 text-accent">U</ShadcnAvatarFallback>
                </ShadcnAvatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <ShadcnAvatar className="h-8 w-8 border">
                <ShadcnAvatarFallback className="bg-primary/10 text-primary">MB</ShadcnAvatarFallback>
              </ShadcnAvatar>
              <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <div className="relative flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Mr. Blue anything..."
            className="min-h-[44px] max-h-32 resize-none rounded-2xl pr-12"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-full"
            disabled={!input.trim() || isLoading}
            onClick={sendMessage}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </main>
  );
}
