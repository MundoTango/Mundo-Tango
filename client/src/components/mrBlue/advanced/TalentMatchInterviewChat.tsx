import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  CheckCircle, 
  FileText, 
  Briefcase,
  ArrowRight,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface InterviewMessage {
  id?: string;
  role: "user" | "assistant" | "ai";
  content: string;
  timestamp?: Date;
}

export interface PhaseConfig {
  name: string;
  label: string;
  current: number;
  total: number;
  isActive: boolean;
  isComplete: boolean;
}

export interface TalentMatchInterviewChatProps {
  messages: InterviewMessage[];
  isLoading: boolean;
  isComplete: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  progress: number;
  phases: PhaseConfig[];
  currentPhaseLabel: string;
  questionDescription: string;
  showTimestamps?: boolean;
  headerBanner?: React.ReactNode;
  completeCTA?: React.ReactNode;
  backButton?: React.ReactNode;
  containerClassName?: string;
  useScrollArea?: boolean;
  inputPlaceholder?: string;
  useTextarea?: boolean;
}

export function TalentMatchInterviewChat({
  messages,
  isLoading,
  isComplete,
  input,
  onInputChange,
  onSend,
  progress,
  phases,
  currentPhaseLabel,
  questionDescription,
  showTimestamps = false,
  headerBanner,
  completeCTA,
  backButton,
  containerClassName = "",
  useScrollArea = true,
  inputPlaceholder = "Type your answer...",
  useTextarea = false
}: TalentMatchInterviewChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    // Immediate scroll on message/loading change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading]);

  // Keep focus on input after sending or loading state change
  useEffect(() => {
    if (!isLoading && !isComplete) {
      inputRef.current?.focus();
    }
  }, [isLoading, isComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const normalizeRole = (role: string): "user" | "assistant" => {
    return role === "user" ? "user" : "assistant";
  };

  const getCurrentPhaseIcon = () => {
    const activePhase = phases.find(p => p.isActive);
    if (!activePhase) return <CheckCircle className="w-3 h-3 mr-1" />;
    if (activePhase.name === "resume" || activePhase.name === "background") {
      return <FileText className="w-3 h-3 mr-1" />;
    }
    return <Briefcase className="w-3 h-3 mr-1" />;
  };

  const MessagesContainer = useScrollArea ? ScrollArea : "div";
  const messagesContainerProps = useScrollArea 
    ? { className: "flex-1 p-4" }
    : { ref: scrollRef, className: "flex-1 overflow-y-auto p-4 space-y-4", "data-testid": "chat-messages" };

  return (
    <div className={`flex flex-col h-full ${containerClassName}`} data-testid="interview-chat-container">
      {/* Header */}
      <div className="border-b glass-topbar p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold" data-testid="heading-interview-title">Mr. Blue AI Interview</h1>
                <Badge 
                  variant={isComplete ? "default" : "secondary"}
                  data-testid="badge-phase"
                >
                  {getCurrentPhaseIcon()}
                  {currentPhaseLabel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-phase-description">
                {questionDescription}
              </p>
            </div>
            {!isComplete && (
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Interview Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-interview" />
            <div className="flex gap-4 text-xs flex-wrap">
              {phases.map((phase) => (
                <div key={phase.name} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    phase.isActive ? "bg-primary" : phase.isComplete ? "bg-green-500" : "bg-muted"
                  }`} />
                  <span className={phase.isActive ? "text-primary" : ""}>
                    {phase.label} ({phase.current}/{phase.total})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner (e.g., resume re-upload prompt) */}
      {headerBanner}

      {/* Messages */}
      <MessagesContainer {...messagesContainerProps}>
        <div className={`container mx-auto max-w-4xl ${useScrollArea ? "space-y-4" : ""}`}>
          <AnimatePresence>
            {messages.map((message, idx) => {
              const role = normalizeRole(message.role);
              return (
                <motion.div
                  key={message.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  <div className={`max-w-[75%] ${role === "user" ? "order-first" : ""}`}>
                    <Card className={role === "user" ? "bg-primary text-primary-foreground" : "glass-card"}>
                      <CardContent className="pt-4 pb-3">
                        <p className="text-sm whitespace-pre-wrap" data-testid={`message-${role}-${idx}`}>
                          {message.content}
                        </p>
                        {showTimestamps && message.timestamp && (
                          <p className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <Card className="glass-card">
                <CardContent className="pt-4 pb-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={useScrollArea ? scrollRef : undefined} />
        </div>
      </MessagesContainer>

      {/* Input Area */}
      <div className="border-t glass-card p-4">
        <div className="container mx-auto max-w-4xl">
          {!isComplete ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              {useTextarea ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  placeholder={inputPlaceholder}
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 min-h-[50px] p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  data-testid="input-interview-answer"
                />
              ) : (
                <Input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={inputPlaceholder}
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="input-interview-answer"
                />
              )}
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                data-testid="button-send-answer"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            completeCTA || (
              <div className="flex gap-3 justify-center">
                <Button className="gap-2" data-testid="button-view-dashboard">
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="gap-2" data-testid="button-go-home">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
            )
          )}
          {backButton && <div className="mt-2">{backButton}</div>}
        </div>
      </div>
    </div>
  );
}
