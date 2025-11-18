import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, X, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMrBlue } from "@/contexts/MrBlueContext";
import { AutomationTaskMessage } from "./AutomationTaskMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  automationType?: string;
  automationStatus?: string;
  taskId?: string;
  pollUrl?: string;
}

export function ChatSidePanel() {
  const { isChatOpen, closeChat } = useMrBlue();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Mr. Blue, your AI assistant for Mundo Tango. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try{
      const response = await fetch("/api/mrblue/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for CSRF token
        body: JSON.stringify({
          message: input,
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
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.content,
        timestamp: new Date(),
        automationType: data.automationType,
        automationStatus: data.automationStatus,
        taskId: data.taskId,
        pollUrl: data.pollUrl
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
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
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-screen w-full md:w-[400px] lg:w-[480px] z-50 bg-background border-l shadow-2xl flex flex-col"
          data-testid="chat-side-panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Mr. Blue</h2>
                <p className="text-xs text-muted-foreground">Your AI Assistant</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={closeChat}
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] ${message.role === "user" ? "order-first" : ""}`}>
                    {message.automationType && message.taskId ? (
                      // Show automation task card
                      <AutomationTaskMessage
                        taskId={message.taskId}
                        automationType={message.automationType}
                        initialStatus={message.automationStatus}
                        pollUrl={message.pollUrl}
                      />
                    ) : (
                      // Show regular message
                      <Card className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                        <CardContent className="p-3">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Mr. Blue anything..."
                disabled={isLoading}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
