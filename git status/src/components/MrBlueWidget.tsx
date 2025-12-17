import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minimize2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function MrBlueWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm Mr Blue, your personal tango assistant. I can help you find events, connect with dancers, get dance tips, and much more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mrblue/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for CSRF token
        body: JSON.stringify({
          message: message,
          conversationHistory: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Mr Blue error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to reach Mr Blue. Please try again.",
        variant: "destructive"
      });
      
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Mr Blue Button - Fixed Bottom Right */}
      {!isExpanded && (
        <div 
          className="fixed bottom-6 right-6 z-50"
          data-testid="mr-blue-widget-collapsed"
        >
          <Button
            size="lg"
            className="h-14 px-6 rounded-full shadow-2xl bg-gradient-to-r from-primary to-secondary hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
            onClick={() => setIsExpanded(true)}
            data-testid="button-open-mr-blue"
            aria-label="Open Mr. Blue AI assistant"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Ask Mr Blue
          </Button>
        </div>
      )}

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <Card 
          className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] flex flex-col shadow-2xl"
          data-testid="mr-blue-widget-expanded"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-secondary">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarFallback className="bg-white text-primary font-bold">
                  MB
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">Mr Blue AI</h3>
                <p className="text-xs text-white/80">Your Tango Assistant</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsExpanded(false)}
                data-testid="button-minimize-mr-blue"
                aria-label="Minimize Mr. Blue assistant"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsExpanded(false)}
                data-testid="button-close-mr-blue"
                aria-label="Close Mr. Blue assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4" data-testid="mr-blue-chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <Card className={msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}>
                      <div className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Card>
                  </div>

                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                        U
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary text-white text-xs">
                      <Bot className="h-4 w-4 animate-pulse" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="bg-muted">
                    <div className="p-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask Mr Blue anything..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none min-h-[44px] max-h-[120px]"
                disabled={isLoading}
                data-testid="input-mr-blue-message"
                aria-label="Type your message to Mr. Blue"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                data-testid="button-send-mr-blue"
                className="h-11 w-11"
                aria-label="Send message to Mr. Blue"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
