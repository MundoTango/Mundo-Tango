import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Bot,
  User,
  X,
  Brain,
  Code,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMrBlue } from "@/contexts/MrBlueContext";
import { AutomationTaskMessage } from "./AutomationTaskMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "THOUGHT" | "ACTION" | "OBSERVATION" | "RESULT" | "ERROR";
  automationType?: string;
  automationStatus?: string;
  taskId?: string;
  pollUrl?: string;
}

export function ChatSidePanel() {
  const { isChatOpen, closeChat } = useMrBlue();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [mode, setMode] = useState<"chat" | "vibecoding">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Mr. Blue, your AI assistant for Mundo Tango. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVibeCoding, setIsVibeCoding] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isVibeCoding) return;

    if (mode === "vibecoding") {
      await handleVibeCoding();
    } else {
      await handleChat();
    }
  };

  const handleChat = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mrblue/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: input,
          conversationHistory: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
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
        pollUrl: data.pollUrl,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVibeCoding = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsVibeCoding(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/mrblue/vibecoding/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal: input }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              const message: Message = {
                id: Date.now().toString() + Math.random(),
                role: "assistant",
                type: parsed.type || "RESULT",
                content: parsed.content || parsed.message || parsed.text || "",
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, message]);
            } catch (e) {
              console.warn("Failed to parse SSE data:", data);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("VibeCoding request aborted");
      } else {
        console.error("VibeCoding execution error:", error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          type: "ERROR",
          content: `❌ Error: ${error.message}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);

        toast({
          title: "VibeCoding Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsVibeCoding(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsVibeCoding(false);
    }
  };

  const getMessageIcon = (type?: Message["type"]) => {
    switch (type) {
      case "THOUGHT":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "ACTION":
        return <Code className="h-4 w-4 text-blue-500" />;
      case "OBSERVATION":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bot className="h-5 w-5 text-primary" />;
    }
  };

  const getMessageBgColor = (type?: Message["type"]) => {
    switch (type) {
      case "THOUGHT":
        return "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800";
      case "ACTION":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "OBSERVATION":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "ERROR":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
      default:
        return "";
    }
  };

  // Use portal to render at document.body level above all overlays
  const panelContent = (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 h-screen w-full md:w-[400px] lg:w-[480px] z-[9999] bg-background border-l shadow-2xl flex flex-col"
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
                <p className="text-xs text-muted-foreground">
                  Your AI Assistant
                </p>
              </div>

              {/* Mode Toggle */}
              <Tabs
                value={mode}
                onValueChange={(value) =>
                  setMode(value as "chat" | "vibecoding")
                }
                className="w-full px-4 pb-2"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="vibecoding"
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    VibeCoding
                  </TabsTrigger>
                </TabsList>
              </Tabs>
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

          {/* Mode Toggle */}
          <div className="px-4 pt-3 pb-2 border-b">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "chat" | "vibecoding")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="vibecoding">VibeCoding</TabsTrigger>
              </TabsList>
            </Tabs>
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
                      {message.type ? (
                        getMessageIcon(message.type)
                      ) : (
                        <Bot className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] ${message.role === "user" ? "order-first" : ""}`}
                  >
                    {message.automationType && message.taskId ? (
                      <AutomationTaskMessage
                        taskId={message.taskId}
                        automationType={message.automationType}
                        initialStatus={message.automationStatus}
                        pollUrl={message.pollUrl}
                      />
                    ) : (
                      <Card
                        className={`${message.role === "user" ? "bg-primary text-primary-foreground" : getMessageBgColor(message.type)} ${message.type ? "border" : ""}`}
                      >
                        <CardContent className="p-3">
                          {message.type && mode === "vibecoding" && (
                            <p className="text-xs font-semibold mb-1 opacity-75">
                              {message.type}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
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

              {(isLoading || isVibeCoding) && (
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
                        <div
                          className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
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
                placeholder={
                  mode === "vibecoding"
                    ? "Describe your coding task..."
                    : "Ask Mr. Blue anything..."
                }
                disabled={isLoading || isVibeCoding}
                className="flex-1"
                data-testid="input-chat-message"
              />
              {isVibeCoding ? (
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading || isVibeCoding}
                  size="icon"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render via portal at document.body level for z-index isolation
  return createPortal(panelContent, document.body);
}
