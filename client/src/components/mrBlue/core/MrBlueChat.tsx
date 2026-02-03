import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import {
  Send,
  Loader2,
  X,
  Brain, Code,
  Zap,
  Eye,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Bug,
  MessageSquare,
  Paperclip,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar as ShadcnAvatar,
  AvatarFallback as ShadcnAvatarFallback,
} from "@/components/ui/avatar";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useMrBlue } from "@/contexts/MrBlueContext";
import { useJourneyTracker } from "@/hooks/useJourneyTracker";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant" | "vibe";
  content: string;
  timestamp: Date;
  vibeType?:
    | "thought"
    | "action"
    | "observation"
    | "phase"
    | "complete"
    | "error";
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
    /^implement\s+/i,
  ];
  return patterns.some((pattern) => pattern.test(message));
}

interface MrBlueChatProps {
  onClose?: () => void;
}

export function MrBlueChat({ onClose }: MrBlueChatProps) {
  const {
    ctoWelcome,
    clearCTOWelcome,
    selfHealError,
    clearSelfHealError,
    openWalkthrough,
    walkthroughResult,
    setWalkthroughResult,
  } = useMrBlue();
  const { user } = useAuth();
  const { getSnapshot, trackStep, sessionId, captureScreenshot } = useJourneyTracker(user?.id);
  const { t } = useTranslation("common");

  // QA Mode state - tracks if user is in help/feature request mode
  const [qaMode, setQaMode] = useState<"none" | "help" | "features" | "bug">(
    "none",
  );

  // VibeCoding Mode state - toggle between chat and vibecoding
  const [mode, setMode] = useState<'chat' | 'vibecoding'>('chat');

  // Generate welcome message based on context
  const getWelcomeMessage = () => {
    // Walkthrough result takes priority - show the test results
    if (walkthroughResult) {
      const successEmoji = walkthroughResult.success ? "✓" : "✗";
      const statusText = walkthroughResult.success ? "PASSED" : "FAILED";
      const durationSec = (walkthroughResult.duration / 1000).toFixed(1);

      let stepsReport = walkthroughResult.steps
        .map((s, i) => {
          const icon = s.status === "success" ? "✓" : "✗";
          const time = s.duration ? ` (${s.duration}ms)` : "";
          return `${icon} Step ${i + 1}: ${s.description}${time}`;
        })
        .join("\n");

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
        const failedStep = walkthroughResult.steps.find(
          (s) => s.status === "failed",
        );
        return `**${successEmoji} CTO Walkthrough: ${walkthroughResult.testName}**

Status: **${statusText}** at ${durationSec}s
Steps: ${walkthroughResult.completedSteps}/${walkthroughResult.totalSteps} passed

${stepsReport}

**Error detected:** ${failedStep?.error || "Unknown error"}

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
- Pattern: ${selfHealError.mbmdAnalysis?.mbmdPattern || "Unknown"}
- Root Cause: ${selfHealError.mbmdAnalysis?.rootCause || "Analyzing..."}
- Recommended Fix: ${selfHealError.mbmdAnalysis?.recommendedFix || "Let me investigate..."}

Would you like me to help apply the fix, or explain the issue in more detail?`;
    }
    return "Hi! I'm Mr. Blue, your AI companion. I can help you navigate the platform, answer questions, and provide personalized recommendations. What can I help you with today?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: getWelcomeMessage(),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    number | null
  >(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const { toast } = useToast();

  // UX-001 FIX: Track last fetched message ID to avoid overwriting optimistic updates
  const lastFetchedIdRef = useRef<string | null>(null);
  // UX-004 FIX: Track context key to avoid wiping history on context changes
  const lastContextKeyRef = useRef<string | null>(null);

  // UX-004 FIX: Update welcome message when CTO, self-heal, or walkthrough result context changes
  // PREPEND context message instead of replacing entire history
  useEffect(() => {
    const contextKey = `${ctoWelcome ? "cto" : ""}${selfHealError ? "heal" : ""}${walkthroughResult ? "walk" : ""}`;

    if (
      (ctoWelcome || selfHealError || walkthroughResult) &&
      lastContextKeyRef.current !== contextKey
    ) {
      lastContextKeyRef.current = contextKey;
      const contextMessage: Message = {
        id: `context-${Date.now()}`,
        role: "assistant",
        content: getWelcomeMessage(),
        timestamp: new Date(),
      };
      // PREPEND context message, keep existing history (excluding old welcome)
      setMessages((prev) => [
        contextMessage,
        ...prev.filter((m) => m.id !== "1" && !m.id.startsWith("context-")),
      ]);
    }
  }, [ctoWelcome, selfHealError, walkthroughResult]);

  // MB.MD Pattern 80: Load recent conversations FIRST to get conversationId immediately
  const { data: recentConversations, isLoading: conversationsLoading } =
    useQuery<any[]>({
      queryKey: ["/api/mrblue/conversations"],
      staleTime: 30000, // Cache for 30s to reduce re-fetches
    });

  // Set conversation ID immediately when conversations load
  useEffect(() => {
    if (
      recentConversations &&
      recentConversations.length > 0 &&
      !currentConversationId
    ) {
      console.log(
        "[MrBlueChat] Setting conversation ID from recent:",
        recentConversations[0].id,
      );
      setCurrentConversationId(recentConversations[0].id);
    }
  }, [recentConversations, currentConversationId]);

  const {
    data: fetchedMessages,
    refetch: refetchMessages,
    isLoading: messagesLoading,
  } = useQuery<Message[]>({
    queryKey: ["/api/mrblue/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId && currentConversationId > 0,
    retry: false,
    staleTime: 10000, // Cache for 10s
  });

  // Show loading state while fetching previous conversation
  useEffect(() => {
    if (conversationsLoading || (currentConversationId && messagesLoading)) {
      // Keep welcome message but user knows we're loading history
      console.log("[MrBlueChat] Loading conversation history...");
    }
  }, [conversationsLoading, messagesLoading, currentConversationId]);

  // UX-001 FIX: Smart merge instead of full replace
  // Only update if we have genuinely NEW server data, preserve optimistic/local messages
  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      const lastFetchedId =
        fetchedMessages[fetchedMessages.length - 1]?.id?.toString();

      // Only process if this is new data we haven't seen
      if (lastFetchedId && lastFetchedId !== lastFetchedIdRef.current) {
        lastFetchedIdRef.current = lastFetchedId;

        const welcomeMessage: Message = {
          id: "1",
          role: "assistant",
          content: getWelcomeMessage(),
          timestamp: new Date(),
        };

        // Fix: Convert API timestamps (strings) to Date objects
        const parsedMessages = fetchedMessages.map((msg) => ({
          ...msg,
          id: msg.id?.toString() || `server-${Date.now()}`,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp
              : new Date(msg.timestamp),
        }));

        console.log(
          "[MrBlueChat] Merging",
          parsedMessages.length,
          "messages from conversation",
          currentConversationId,
        );

        // Merge: Keep local optimistic messages that aren't in server response
        setMessages((prev) => {
          const serverIds = new Set(parsedMessages.map((m) => m.id));
          // Keep messages that are local-only (temp IDs, context messages, or not in server response)
          const localOnlyMessages = prev.filter(
            (m) =>
              m.id.startsWith("temp-") ||
              m.id.startsWith("context-") ||
              (!serverIds.has(m.id) && m.id !== "1"),
          );
          return [welcomeMessage, ...parsedMessages, ...localOnlyMessages];
        });
      }
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
      "yes",
      "start walkthrough",
      "start the walkthrough",
      "begin walkthrough",
      "run test",
      "run the test",
      "test resume",
      "test resume parsing",
      "let's go",
      "let's start",
      "begin",
      "ok",
      "okay",
      "sure",
      "go ahead",
    ];
    const lowerText = text.toLowerCase().trim();
    return triggers.some(
      (trigger) =>
        lowerText === trigger || lowerText.includes("start walkthrough"),
    );
  };

  // Check if message is a fix approval trigger
  const isFixApprovalTrigger = (text: string): boolean => {
    const triggers = [
      "yes",
      "apply fix",
      "apply the fix",
      "fix it",
      "do it",
      "go ahead",
      "approve",
      "ok",
      "okay",
      "sure",
    ];
    const lowerText = text.toLowerCase().trim();
    return triggers.some((trigger) => lowerText === trigger);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input;
    const userMessage: Message = {
      id: `temp-${Date.now()}`, // UX-001 FIX: Use temp- prefix for optimistic messages
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Check for CTO walkthrough trigger when in CTO welcome context
    if (ctoWelcome && isWalkthroughTrigger(messageText)) {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Opening the walkthrough preview now. You'll see a live test of the resume upload flow on the waitlist page. I'll monitor for any issues and report back.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, responseMessage]);

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
        const response = await fetch("/api/cto/walkthrough/apply-fix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            errorType: selfHealError.mbmdAnalysis?.mbmdPattern || "unknown",
            mbmdPattern: selfHealError.mbmdAnalysis?.mbmdPattern,
            recommendedFix: selfHealError.mbmdAnalysis?.recommendedFix,
          }),
        });

        const data = await response.json();

        const fixResultMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.success
            ? `Fix applied successfully!\n\n**Files Modified:**\n${data.filesModified?.join(", ") || "None"}\n\n**Result:** ${data.message}\n\nWould you like me to re-run the walkthrough to verify the fix?`
            : `Fix could not be applied: ${data.error}\n\nWould you like me to try an alternative approach?`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, fixResultMessage]);

        if (data.success) {
          clearSelfHealError();
        }
      } catch (error) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error while applying the fix. Let me try a different approach.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    // QA System: Handle specialized submissions
    if (qaMode !== "none") {
      try {
        const snapshot = getSnapshot();
        // Use the common submit logic
        await submitQaRequest(messageText);
        return; // Early return to prevent regular chat
      } catch (error) {
        console.error("[MrBlueChat] QA submission failed:", error);
        // Fall back to regular chat if submission fails
      }
    }

    // Check if this is a VibeCoding task and user might be god-level
    // Try streaming first, fall back to regular chat if not authorized
    if (isVibecodingTask(messageText)) {
      try {
        console.log(
          "[MrBlueChat] VibeCoding task detected, attempting stream...",
        );

        // Get auth token from localStorage
        const token = localStorage.getItem("token");

        // Call streaming endpoint
        const response = await fetch("/api/mrblue/vibecoding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? "Bearer " + token : "",
          },
          body: JSON.stringify({
            message: messageText,
            context: {
              currentPage: location,
              pageTitle: document.title,
            },
          }),
        });

        // Check if streaming is available (god-level users)
        // Only add starting message AFTER confirming streaming works
        if (
          response.ok &&
          response.headers.get("content-type")?.includes("text/event-stream")
        ) {
          console.log("[MrBlueChat] Streaming response received");

          // Now add the starting message since we confirmed streaming
          const startMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "vibe",
            content: "VibeCoding session started...",
            timestamp: new Date(),
            vibeType: "phase",
            vibePhase: "init",
          };
          setMessages((prev) => [...prev, startMessage]);

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            let buffer = "";

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    try {
                      const eventData = JSON.parse(line.slice(6));

                      // Add vibe event as a message
                      const vibeMessage: Message = {
                        id: (Date.now() + Math.random()).toString(),
                        role: "vibe",
                        content: eventData.content,
                        timestamp: new Date(),
                        vibeType: eventData.type,
                        vibePhase: eventData.phase,
                      };

                      setMessages((prev) => [...prev, vibeMessage]);
                    } catch {
                      // Ignore parse errors
                    }
                  }
                }
              }
            } catch (streamError) {
              console.error("[MrBlueChat] Stream read error:", streamError);
              const errorMessage: Message = {
                id: (Date.now() + Math.random()).toString(),
                role: "vibe",
                content: "VibeCoding stream interrupted. Please try again.",
                timestamp: new Date(),
                vibeType: "error",
              };
              setMessages((prev) => [...prev, errorMessage]);
            }

            setIsLoading(false);
            return;
          }
        }

        // If not streaming (403 for non-god users), fall through to regular chat silently
        console.log(
          "[MrBlueChat] Streaming not available (status: " +
            response.status +
            "), falling back to regular chat",
        );
      } catch (error) {
        console.log(
          "[MrBlueChat] Streaming failed, falling back to regular chat",
        );
      }
    }

    try {
      // Use apiRequest to include JWT authentication for god-level VibeCoding tools
      // Pass current page context so Mr. Blue knows where the user is
      // apiRequest signature: (method, url, data) - returns Response
      const response = await apiRequest("POST", "/api/mrblue/chat", {
        message: messageText,
        conversationId: currentConversationId,
        context: {
          currentPage: location,
          pageTitle: document.title,
        },
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.response ||
          data.content ||
          "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // In QA mode (help/features/bug), submit to QA system instead of chat
      if (qaMode !== "none") {
        submitQaRequest();
      } else {
        sendMessage();
      }
    }
  };

  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [bugScreenshot, setBugScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QA System: Submission logic
  const submitQaRequest = useCallback(async (finalMessage?: string) => {
    const messageText = finalMessage || input;
    if (!messageText.trim() && attachments.length === 0) return;

    setIsLoading(true);
    try {
      const snapshot = getSnapshot();
      
      // Handle media attachments like PostCreator
      const processedAttachments = await Promise.all(attachments.map(async (file) => {
        if (file.type.startsWith('image/')) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ name: file.name, type: file.type, data: reader.result });
            reader.readAsDataURL(file);
          });
        }
        return { name: file.name, type: file.type };
      }));

      // Add auto-captured screenshot for bug reports
      if (qaMode === "bug" && bugScreenshot) {
        processedAttachments.push({
          name: 'auto-screenshot.jpg',
          type: 'image/jpeg',
          data: bugScreenshot,
          isAutoCapture: true
        });
      }

      const response = await apiRequest("POST", "/api/qa-platform/feedback", {
        feedbackType: qaMode === "bug" ? "bug" : qaMode === "features" ? "feature" : "support",
        title: messageText.substring(0, 50) + (messageText.length > 50 ? "..." : ""),
        description: messageText,
        currentPage: location,
        sessionSnapshot: snapshot,
        priority: qaMode === "bug" ? "high" : "medium",
        sessionId,
        attachments: processedAttachments
      });

      if (response.ok) {
        const successMessage: Message = {
          id: `qa-success-${Date.now()}`,
          role: "assistant",
          content: qaMode === "bug" 
            ? t("mrBlue.qa.bugReportSubmitted", "Bug report submitted successfully!")
            : "Request recorded! This has been passed through @mb.md for architectural review and is now pending admin approval for build.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
        setQaMode("none");
        setAttachments([]);
        setAttachmentPreviews([]);
        setBugScreenshot(null);
        setInput("");
      }
    } catch (error) {
      console.error("[MrBlueChat] QA submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [qaMode, input, attachments, location, getSnapshot, sessionId, bugScreenshot]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setAttachments(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setAttachmentPreviews(prev => [...prev, ...previews]);
  };

  const removeAttachment = (index: number) => {
    URL.revokeObjectURL(attachmentPreviews[index]);
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleHelpRequest = useCallback(() => {
    const snapshot = getSnapshot();
    trackStep({ path: location, action: "qa_help_opened" });
    setQaMode("help");

    // Add system message with journey context
    const helpMessage: Message = {
      id: `qa-help-${Date.now()}`,
      role: "assistant",
      content: `**Need Help?** I'm here to assist you!

I can see you've been browsing: **${snapshot.currentPath}**
Session: ${snapshot.journey.length} pages visited

**Quick Options:**
- Describe what you're trying to do and I'll guide you
- Report something that's not working (I'll capture your context)
- Ask about any platform feature

What would you like help with?`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, helpMessage]);
  }, [getSnapshot, trackStep, location]);

  // QA System Handler: Features Button - Opens feature discovery/request flow
  const handleFeaturesRequest = useCallback(() => {
    const snapshot = getSnapshot();
    trackStep({ path: location, action: "qa_features_opened" });
    setQaMode("features");

    const featuresMessage: Message = {
      id: `qa-features-${Date.now()}`,
      role: "assistant",
      content: `**Platform Features & Requests**

Based on your current page (**${snapshot.currentPath}**), here are relevant features:

**Available Features:**
- Events discovery and RSVP
- City tango scenes and communities
- Messaging and connections
- Profile and preferences
- Teacher/organizer tools

**Want something new?** Tell me about a feature you'd like to see and I'll:
1. Check if it already exists
2. Record your request for the development team
3. Suggest similar existing features

What interests you?`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, featuresMessage]);
  }, [getSnapshot, trackStep, location]);

  // QA System Handler: Bug Report - Captures full context with screenshot
  const handleBugReport = useCallback(async () => {
    const snapshot = getSnapshot();
    trackStep({ path: location, action: "qa_bug_report" });
    setQaMode("bug");

    // Capture screenshot immediately when entering bug mode
    const screenshot = await captureScreenshot();
    if (screenshot) {
      setBugScreenshot(screenshot);
    }

    const recentJourney = snapshot.journey
      .slice(-5)
      .map(
        (s) => `- ${s.action}: ${s.path}${s.element ? ` (${s.element})` : ""}`,
      )
      .join("\n");

    // Enhanced context from journey tracker
    const openDialogs = (snapshot as any).openDialogs || [];
    const consoleErrors = (snapshot as any).consoleErrors || [];
    const networkFailures = (snapshot as any).networkFailures || [];
    const rageClicks = (snapshot as any).rageClicks || [];
    const theme = (snapshot as any).browserInfo?.theme || 'unknown';
    const locale = (snapshot as any).browserInfo?.locale || navigator.language;
    const scrollPos = (snapshot as any).browserInfo?.scrollPosition || { x: 0, y: 0 };

    // Build enhanced context sections
    const dialogSection = openDialogs.length > 0 
      ? `\n**Open Dialogs:** ${openDialogs.join(', ')}` 
      : '';
    
    const errorSection = consoleErrors.length > 0
      ? `\n**Recent Errors:** ${consoleErrors.slice(-3).map((e: any) => e.message.substring(0, 80)).join('; ')}`
      : '';
    
    const networkSection = networkFailures.length > 0
      ? `\n**Failed API Calls:** ${networkFailures.slice(-3).map((n: any) => `${n.method} ${n.url} (${n.status})`).join('; ')}`
      : '';
    
    const rageSection = rageClicks.length > 0
      ? `\n**Frustration Detected:** ${rageClicks.length} rage click events`
      : '';

    const screenshotNote = screenshot ? '\n**Screenshot:** Captured automatically' : '';

    const bugMessage: Message = {
      id: `qa-bug-${Date.now()}`,
      role: "assistant",
      content: `**${t("mrBlue.qa.bugReportMode", "Bug Report Mode - Context Captured")}**

**${t("mrBlue.qa.session", "Session")}:** ${sessionId}
**${t("mrBlue.qa.currentPage", "Current Page")}:** ${snapshot.currentPath}
**${t("mrBlue.qa.browser", "Browser")}:** ${snapshot.browserInfo.platform}
**${t("mrBlue.qa.viewport", "Viewport")}:** ${snapshot.browserInfo.viewport.width}x${snapshot.browserInfo.viewport.height}
**${t("mrBlue.qa.theme", "Theme")}:** ${theme} | **${t("mrBlue.qa.locale", "Locale")}:** ${locale}
**${t("mrBlue.qa.scroll", "Scroll")}:** ${scrollPos.x}, ${scrollPos.y}${dialogSection}${errorSection}${networkSection}${rageSection}${screenshotNote}

**${t("mrBlue.qa.recentActivity", "Recent Activity (Last 5 Steps)")}:**
${recentJourney}

**${t("mrBlue.qa.describeIssue", "Describe your issue")}:**
- ${t("mrBlue.qa.whatTrying", "What were you trying to do?")}
- ${t("mrBlue.qa.whatHappened", "What happened instead?")}
- ${t("mrBlue.qa.anyErrors", "Any error messages you saw?")}

${t("mrBlue.qa.submitToDevelopers", "Type your description and click Submit to send to developers.")}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, bugMessage]);
  }, [getSnapshot, trackStep, location, sessionId, captureScreenshot]);

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
          <p className="text-xs text-muted-foreground truncate">
            Your Tango AI Assistant
          </p>
        </div>

        {/* Mode Toggle & Close Button */}
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'chat' | 'vibecoding')} className="w-auto">
            <TabsList className="grid w-32 grid-cols-2">
              <TabsTrigger value="chat" className="p-1">
                <Brain className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="vibecoding" className="p-1">
                <Code className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {onClose && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              data-testid="button-close-chat"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 px-4 py-4"
        data-testid="scrollarea-chat-messages"
      >
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message) => {
            // Vibe message rendering with distinct styles
            if (message.role === "vibe") {
              const getVibeStyle = () => {
                switch (message.vibeType) {
                  case "thought":
                    return {
                      bg: "bg-purple-500/10",
                      border: "border-purple-500/30",
                      text: "text-purple-300",
                      icon: Brain,
                      label: "THOUGHT",
                    };
                  case "action":
                    return {
                      bg: "bg-blue-500/10",
                      border: "border-blue-500/30",
                      text: "text-blue-300",
                      icon: Zap,
                      label: "ACTION",
                    };
                  case "observation":
                    return {
                      bg: "bg-green-500/10",
                      border: "border-green-500/30",
                      text: "text-green-300",
                      icon: Eye,
                      label: "OBSERVATION",
                    };
                  case "phase":
                    return {
                      bg: "bg-yellow-500/10",
                      border: "border-yellow-500/30",
                      text: "text-yellow-300",
                      icon: Loader2,
                      label: message.vibePhase?.toUpperCase() || "PHASE",
                    };
                  case "complete":
                    return {
                      bg: "bg-emerald-500/10",
                      border: "border-emerald-500/30",
                      text: "text-emerald-300",
                      icon: CheckCircle,
                      label: "COMPLETE",
                    };
                  case "error":
                    return {
                      bg: "bg-red-500/10",
                      border: "border-red-500/30",
                      text: "text-red-300",
                      icon: AlertTriangle,
                      label: "ERROR",
                    };
                  default:
                    return {
                      bg: "bg-muted",
                      border: "border-border",
                      text: "text-muted-foreground",
                      icon: Brain,
                      label: "VIBE",
                    };
                }
              };

              const style = getVibeStyle();
              const IconComponent = style.icon;

              return (
                <div
                  key={message.id}
                  data-testid={"message-vibe-" + message.id}
                  className="flex gap-2 justify-start"
                >
                  <div
                    className={
                      "flex items-start gap-2 max-w-[95%] rounded-lg px-3 py-2 text-xs font-mono border " +
                      style.bg +
                      " " +
                      style.border
                    }
                  >
                    <IconComponent
                      className={
                        "h-3 w-3 flex-shrink-0 mt-0.5 " +
                        style.text +
                        (message.vibeType === "phase" ? " animate-spin" : "")
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <span
                        className={
                          "text-[10px] font-bold uppercase tracking-wider " +
                          style.text
                        }
                      >
                        {style.label}
                      </span>
                      <p className="text-foreground/80 whitespace-pre-wrap break-words mt-0.5">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Regular message rendering
            return (
              <div
                key={message.id}
                data-testid={"message-" + message.role + "-" + message.id}
                className={
                  "flex gap-3 " +
                  (message.role === "user" ? "justify-end" : "justify-start")
                }
              >
                {message.role === "assistant" && (
                  <ShadcnAvatar className="h-8 w-8 border shadow-sm flex-shrink-0">
                    <ShadcnAvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-medium">
                      MB
                    </ShadcnAvatarFallback>
                  </ShadcnAvatar>
                )}

                <div
                  className={
                    "max-w-[80%] sm:max-w-[75%] " +
                    (message.role === "user" ? "order-first" : "")
                  }
                >
                  <div
                    className={
                      "rounded-2xl px-4 py-3 text-sm shadow-sm " +
                      (message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border/50 rounded-bl-md backdrop-blur-sm")
                    }
                  >
                    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <p
                    className={
                      "text-[10px] text-muted-foreground mt-1 " +
                      (message.role === "user" ? "text-right" : "text-left")
                    }
                  >
                    {message.timestamp instanceof Date
                      ? message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                  </p>
                </div>

                {message.role === "user" && (
                  <ShadcnAvatar className="h-8 w-8 border shadow-sm flex-shrink-0">
                    <ShadcnAvatarFallback className="bg-accent/10 text-accent text-xs font-medium">
                      You
                    </ShadcnAvatarFallback>
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
                  <span className="text-xs text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* QA System Quick Action Buttons */}
      <div className="px-4 py-2 border-t bg-muted/30">
        <div className="flex flex-wrap gap-2 max-w-2xl mx-auto justify-center">
          <Button
            size="sm"
            variant={qaMode === "help" ? "default" : "outline"}
            className="gap-1.5 text-xs"
            onClick={handleHelpRequest}
            data-testid="button-qa-help"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Help
          </Button>
          <Button
            size="sm"
            variant={qaMode === "features" ? "default" : "outline"}
            className="gap-1.5 text-xs"
            onClick={handleFeaturesRequest}
            data-testid="button-qa-features"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("mrBlue.qa.features", "Features")}
          </Button>
          <Button
            size="sm"
            variant={qaMode === "bug" ? "default" : "outline"}
            className="gap-1.5 text-xs"
            onClick={handleBugReport}
            data-testid="button-qa-bug"
          >
            <Bug className="h-3.5 w-3.5" />
            {t("mrBlue.qa.reportBug", "Report Bug")}
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        {/* Smart Suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-3 max-w-2xl mx-auto">
          <button
            onClick={() => {
              setInput("Find milongas this weekend");
            }}
            className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            data-testid="suggestion-milongas"
          >
            Find milongas this weekend
          </button>
          <button
            onClick={() => {
              setInput("Recommend teachers near me");
            }}
            className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            data-testid="suggestion-teachers"
          >
            Recommend teachers
          </button>
          <button
            onClick={() => {
              setInput("What's new on the platform?");
            }}
            className="px-2.5 py-1 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
            data-testid="suggestion-whats-new"
          >
            What's new?
          </button>
        </div>

        <div className="relative flex items-end gap-2 max-w-2xl mx-auto">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.doc,.docx"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1 flex flex-col gap-2">
            {attachmentPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachmentPreviews.map((preview, i) => (
                  <div key={i} className="relative group h-12 w-12 rounded-md border overflow-hidden bg-muted">
                    {attachments[i].type.startsWith('image/') ? (
                      <img src={preview} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute top-0 right-0 bg-background/80 p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={qaMode !== "none" ? "Describe your request..." : "Ask about events, cities, tango tips..."}
              className="min-h-[48px] max-h-32 resize-none rounded-2xl pr-14 border-muted-foreground/20 focus:border-primary/50 transition-colors"
              disabled={isLoading}
              data-testid="input-chat-message"
            />
          </div>

          <div className="flex flex-col gap-2">
            {qaMode !== "none" ? (
              <Button
                size="sm"
                className="h-9 px-3 rounded-full bg-primary hover:bg-primary/90 shadow-sm"
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                onClick={() => submitQaRequest()}
                data-testid="button-submit-qa"
              >
                Submit
              </Button>
            ) : (
              <Button
                size="icon"
                className="h-9 w-9 rounded-full shadow-sm"
                disabled={!input.trim() || isLoading}
                onClick={sendMessage}
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mr. Blue has access to real platform data including events, cities,
          and community info
        </p>
      </div>
    </main>
  );
}
