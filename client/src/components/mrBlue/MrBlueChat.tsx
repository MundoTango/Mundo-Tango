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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function MrBlueChat() {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const { toast } = useToast();
  
  const { data: fetchedMessages, refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: [`/api/mrblue/conversations/${currentConversationId}/messages`],
    enabled: !!currentConversationId,
  });
  
  const { data: recentConversations } = useQuery<any[]>({
    queryKey: ['/api/mrblue/conversations'],
  });
  
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      const welcomeMessage = {
        id: '1',
        role: 'assistant' as const,
        content: "Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage, ...fetchedMessages]);
    }
  }, [fetchedMessages]);
  
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
