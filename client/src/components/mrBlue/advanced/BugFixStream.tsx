/**
 * BUG FIX STREAM PANEL
 * MB.MD Pattern 67 - Real-time streaming of bug fix agent work
 * 
 * Displays ReAct protocol reasoning (Thought/Action/Observation)
 * as agents work on fixing bugs.
 */

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Square,
  Brain,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  FileCode,
  Bot,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface StreamEvent {
  type: string;
  timestamp: number;
  message?: string;
  phase?: string;
  content?: string;
  agent?: string;
  data?: unknown;
  success?: boolean;
  confidence?: number;
  action?: string;
  reasoning?: string;
  filesModified?: string[];
  errorType?: string;
  routing?: { primary: string; supporting: string[] };
  summary?: string;
}

interface BugFixStreamProps {
  feedbackId: number;
  diagnosticContext?: unknown;
  onComplete?: (result: StreamEvent) => void;
  onClose?: () => void;
}

const PHASE_LABELS: Record<string, { label: string; icon: typeof Brain }> = {
  analyzing: { label: "Analyzing", icon: Brain },
  planning: { label: "Planning", icon: FileCode },
  executing: { label: "Executing", icon: Zap },
  validating: { label: "Validating", icon: Eye },
};

export function BugFixStream({
  feedbackId,
  diagnosticContext,
  onComplete,
  onClose,
}: BugFixStreamProps) {
  const { t } = useTranslation("common");
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>("idle");
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startStream = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsRunning(true);
    setIsComplete(false);
    setError(null);
    setEvents([]);
    setProgress(0);
    setCurrentPhase("analyzing");

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch("/api/qa-platform/fix-stream/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedbackId, diagnosticContext }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to start bug fix stream");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));

              if (event.phase) {
                setCurrentPhase(event.phase);
                const phases = ["analyzing", "planning", "executing", "validating"];
                const phaseIndex = phases.indexOf(event.phase);
                setProgress(((phaseIndex + 1) / phases.length) * 100);
              }

              if (event.type === "complete") {
                setIsComplete(true);
                setIsRunning(false);
                setProgress(100);
                onComplete?.(event);
              } else if (event.type === "error") {
                setError(event.message || "Unknown error");
                setIsRunning(false);
              }

              setEvents((prev) => [...prev, event]);
            } catch {
              console.warn("[BugFixStream] Failed to parse event:", line);
            }
          }
        }
      }

      setIsRunning(false);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        console.log("[BugFixStream] Stream aborted by user");
      } else {
        setError(err instanceof Error ? err.message : "Stream failed");
      }
      setIsRunning(false);
    }
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
  };

  const getEventIcon = (event: StreamEvent) => {
    switch (event.type) {
      case "thought":
        return <Brain className="h-4 w-4 text-blue-500" />;
      case "action":
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case "observation":
        return <Eye className="h-4 w-4 text-green-500" />;
      case "agent-work":
        return <Bot className="h-4 w-4 text-purple-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Loader2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventLabel = (event: StreamEvent) => {
    switch (event.type) {
      case "thought":
        return t("bugFix.thought", "THOUGHT");
      case "action":
        return t("bugFix.action", "ACTION");
      case "observation":
        return t("bugFix.observation", "OBSERVATION");
      case "agent-work":
        return event.agent || t("bugFix.agent", "AGENT");
      case "phase":
        return t("bugFix.phase", "PHASE");
      case "analysis-complete":
        return t("bugFix.analysis", "ANALYSIS");
      case "validation":
        return t("bugFix.validation", "VALIDATION");
      case "complete":
        return t("bugFix.complete", "COMPLETE");
      case "error":
        return t("bugFix.error", "ERROR");
      default:
        return event.type.toUpperCase();
    }
  };

  const getEventContent = (event: StreamEvent): string => {
    if (event.content) return event.content;
    if (event.message) return event.message;
    if (event.summary) return event.summary;
    if (event.reasoning) return event.reasoning;
    return JSON.stringify(event.data || event);
  };

  return (
    <Card className="flex flex-col h-full bg-background/95 backdrop-blur" data-testid="bug-fix-stream">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-medium">{t("bugFix.title", "Bug Fix Stream")}</span>
          <Badge variant="outline" className="text-xs">
            #{feedbackId}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning && !isComplete && (
            <Button
              size="sm"
              onClick={startStream}
              data-testid="button-start-fix"
            >
              <Play className="h-4 w-4 mr-1" />
              {t("bugFix.startFix", "Start Fix")}
            </Button>
          )}
          {isRunning && (
            <Button
              size="sm"
              variant="destructive"
              onClick={stopStream}
              data-testid="button-stop-fix"
            >
              <Square className="h-4 w-4 mr-1" />
              {t("bugFix.stop", "Stop")}
            </Button>
          )}
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              {t("common.close", "Close")}
            </Button>
          )}
        </div>
      </div>

      <div className="px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {Object.entries(PHASE_LABELS).map(([phase, { label, icon: Icon }]) => (
              <Badge
                key={phase}
                variant={currentPhase === phase ? "default" : "outline"}
                className="text-xs"
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            ))}
          </div>
          {isComplete && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t("bugFix.complete", "Complete")}
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-2">
          {events.length === 0 && !isRunning && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t("bugFix.clickStart", "Click 'Start Fix' to begin agent-driven fix")}</p>
            </div>
          )}

          {events.map((event, idx) => (
            <div
              key={`${event.type}-${event.timestamp}-${idx}`}
              className="flex items-start gap-2 text-sm"
              data-testid={`stream-event-${event.type}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getEventIcon(event)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="secondary" className="text-xs">
                    {getEventLabel(event)}
                  </Badge>
                  {event.phase && (
                    <span className="text-xs text-muted-foreground">
                      {event.phase}
                    </span>
                  )}
                  {event.confidence !== undefined && (
                    <Badge
                      variant={event.confidence >= 85 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {event.confidence}%
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">
                  {getEventContent(event)}
                </p>
                {event.filesModified && event.filesModified.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {event.filesModified.map((file) => (
                      <Badge key={file} variant="outline" className="text-xs">
                        <FileCode className="h-3 w-3 mr-1" />
                        {file}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("bugFix.working", "Working...")}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

export default BugFixStream;
