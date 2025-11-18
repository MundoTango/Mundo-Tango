/**
 * Error Analysis Panel - PHASE 4
 * Displays AI-analyzed error patterns with Apply Fix and Escalate actions
 * 
 * Features:
 * - Fetches top 10 error patterns from database
 * - Shows error type, message, frequency, confidence
 * - "Apply Fix" button for high-confidence fixes (>= 50%)
 * - "Escalate to Senior Agent" button
 * - Real-time WebSocket updates
 * - Toast notifications for all actions
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowUpCircle,
  Wrench,
  Clock,
  TrendingUp,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

type ErrorPattern = {
  id: number;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  frequency: number;
  lastSeen: string;
  firstSeen: string;
  status: 'pending' | 'analyzed' | 'auto_fixed' | 'manually_fixed' | 'escalated';
  aiAnalysis?: {
    explanation: string;
    files: string[];
    generatedAt: string;
  };
  suggestedFix?: string;
  fixConfidence?: string;
  similarErrors?: number[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
};

type ApplyFixRequest = {
  errorPatternId: number;
};

type EscalateErrorRequest = {
  errorPatternId: number;
  reason?: string;
};

type FixFeedbackRequest = {
  errorPatternId: number;
  success: boolean;
  feedbackMessage?: string;
  wasHelpful?: boolean;
};

export function ErrorAnalysisPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedError, setExpandedError] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<number>>(new Set());

  // Fetch error patterns
  const { data: patternsData, isLoading, error } = useQuery<{
    success: boolean;
    patterns: ErrorPattern[];
    count: number;
  }>({
    queryKey: ['/api/mrblue/error-patterns', { status: 'analyzed', limit: '10' }],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const patterns = patternsData?.patterns || [];

  // Apply fix mutation
  const applyFixMutation = useMutation({
    mutationFn: async (request: ApplyFixRequest) => {
      return apiRequest<{ success: boolean; filesModified: string[]; gitCommitId?: string }>(
        'POST',
        '/api/mrblue/apply-fix',
        request
      );
    },
    onSuccess: (data, variables) => {
      toast({
        title: "✅ Fix Applied Successfully",
        description: `Modified ${data.filesModified?.length || 0} file(s). Commit: ${data.gitCommitId?.substring(0, 7) || 'N/A'}`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/error-patterns'] });
    },
    onError: (error: any, variables) => {
      toast({
        title: "❌ Failed to Apply Fix",
        description: error.message || "An error occurred while applying the fix",
        variant: "destructive",
      });
    },
  });

  // Escalate error mutation
  const escalateMutation = useMutation({
    mutationFn: async (request: EscalateErrorRequest) => {
      return apiRequest<{ success: boolean; taskId: number }>(
        'POST',
        '/api/mrblue/escalate-error',
        request
      );
    },
    onSuccess: (data, variables) => {
      toast({
        title: "⬆️ Error Escalated",
        description: `Escalation task created (ID: ${data.taskId}). Intelligence Division Chief will review.`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/error-patterns'] });
    },
    onError: (error: any, variables) => {
      toast({
        title: "❌ Failed to Escalate",
        description: error.message || "An error occurred while escalating",
        variant: "destructive",
      });
    },
  });

  // PHASE 5: Fix feedback mutation (Learning Retention)
  const feedbackMutation = useMutation({
    mutationFn: async (request: FixFeedbackRequest) => {
      return apiRequest<{
        success: boolean;
        confidence: { previous: number; new: number };
        learningStats: { successCount: number; failureCount: number };
      }>(
        'POST',
        '/api/mrblue/fix-feedback',
        request
      );
    },
    onSuccess: (data, variables) => {
      const change = data.confidence.new - data.confidence.previous;
      const direction = change > 0 ? '↑' : '↓';
      
      toast({
        title: "🧠 Learning Update",
        description: `Confidence ${direction} ${Math.abs(change).toFixed(2)} → ${data.confidence.new.toFixed(2)}. Success rate: ${data.learningStats.successCount}/${data.learningStats.successCount + data.learningStats.failureCount}`,
        variant: "default",
      });
      
      // Mark feedback as given
      setFeedbackGiven(prev => new Set(prev).add(variables.errorPatternId));
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/error-patterns'] });
    },
    onError: (error: any, variables) => {
      toast({
        title: "❌ Failed to Record Feedback",
        description: error.message || "An error occurred while recording feedback",
        variant: "destructive",
      });
    },
  });

  // Handle apply fix click
  const handleApplyFix = (errorId: number) => {
    applyFixMutation.mutate({ errorPatternId: errorId });
  };

  // Handle escalate click
  const handleEscalate = (errorId: number) => {
    escalateMutation.mutate({
      errorPatternId: errorId,
      reason: "User requested manual escalation from Error Analysis Panel",
    });
  };

  // PHASE 5: Handle feedback click
  const handleFeedback = (errorId: number, success: boolean) => {
    feedbackMutation.mutate({
      errorPatternId: errorId,
      success,
      wasHelpful: success,
      feedbackMessage: success ? "Fix worked as expected" : "Fix did not resolve the issue",
    });
  };

  // Get confidence as number
  const getConfidence = (pattern: ErrorPattern): number => {
    if (!pattern.fixConfidence) return 0;
    return parseFloat(pattern.fixConfidence);
  };

  // Get confidence badge color
  const getConfidenceBadgeVariant = (confidence: number): "default" | "secondary" | "destructive" => {
    if (confidence >= 0.7) return "default";
    if (confidence >= 0.5) return "secondary";
    return "destructive";
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'auto_fixed':
      case 'manually_fixed':
        return "default";
      case 'escalated':
        return "secondary";
      case 'pending':
      case 'analyzed':
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="h-full flex flex-col" data-testid="card-error-analysis">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-destructive" />
            <CardTitle className="text-lg">Error Analysis</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {patterns.length} patterns
          </Badge>
        </div>
        <CardDescription className="text-sm">
          AI-analyzed error patterns with suggested fixes
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12" data-testid="status-loading">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading error patterns...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load error patterns. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && patterns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="status-empty">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No error patterns found</p>
              <p className="text-xs text-muted-foreground mt-1">
                All systems running smoothly!
              </p>
            </div>
          )}

          {!isLoading && !error && patterns.length > 0 && (
            <div className="space-y-4" data-testid="list-error-patterns">
              {patterns.map((pattern, index) => {
                const confidence = getConfidence(pattern);
                const canApplyFix = confidence >= 0.5 && pattern.suggestedFix && pattern.status !== 'manually_fixed' && pattern.status !== 'auto_fixed';
                const isExpanded = expandedError === pattern.id;

                return (
                  <Card
                    key={pattern.id}
                    className="border hover-elevate active-elevate-2 cursor-pointer"
                    onClick={() => setExpandedError(isExpanded ? null : pattern.id)}
                    data-testid={`card-error-pattern-${pattern.id}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                            <span className="text-sm font-medium truncate" data-testid={`text-error-type-${pattern.id}`}>
                              {pattern.errorType || 'Unknown Error'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-error-message-${pattern.id}`}>
                            {pattern.errorMessage}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge variant={getStatusBadgeVariant(pattern.status)} className="text-xs" data-testid={`badge-status-${pattern.id}`}>
                            {pattern.status.replace('_', ' ')}
                          </Badge>
                          {confidence > 0 && (
                            <Badge variant={getConfidenceBadgeVariant(confidence)} className="text-xs" data-testid={`badge-confidence-${pattern.id}`}>
                              {Math.round(confidence * 100)}% confident
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span data-testid={`text-frequency-${pattern.id}`}>{pattern.frequency}x</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span data-testid={`text-last-seen-${pattern.id}`}>
                            {new Date(pattern.lastSeen).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && pattern.aiAnalysis && (
                        <div className="pt-3 border-t space-y-3">
                          <div>
                            <p className="text-xs font-medium mb-1">AI Analysis:</p>
                            <p className="text-xs text-muted-foreground">
                              {pattern.aiAnalysis.explanation}
                            </p>
                          </div>

                          {pattern.aiAnalysis.files && pattern.aiAnalysis.files.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">Affected Files:</p>
                              <div className="flex flex-wrap gap-1">
                                {pattern.aiAnalysis.files.map((file, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {file}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {pattern.suggestedFix && (
                            <div>
                              <p className="text-xs font-medium mb-1">Suggested Fix:</p>
                              <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                {pattern.suggestedFix.substring(0, 200)}
                                {pattern.suggestedFix.length > 200 && '...'}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {(canApplyFix || pattern.status !== 'escalated') && (
                        <div className="flex gap-2 pt-2">
                          {canApplyFix && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyFix(pattern.id);
                              }}
                              disabled={applyFixMutation.isPending}
                              data-testid={`button-apply-fix-${pattern.id}`}
                            >
                              {applyFixMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <Wrench className="w-3 h-3 mr-1" />
                                  Apply Fix
                                </>
                              )}
                            </Button>
                          )}

                          {pattern.status !== 'escalated' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEscalate(pattern.id);
                              }}
                              disabled={escalateMutation.isPending}
                              data-testid={`button-escalate-${pattern.id}`}
                            >
                              {escalateMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Escalating...
                                </>
                              ) : (
                                <>
                                  <ArrowUpCircle className="w-3 h-3 mr-1" />
                                  Escalate to Senior Agent
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}

                      {/* PHASE 5: Learning Feedback Buttons */}
                      {(pattern.status === 'manually_fixed' || pattern.status === 'auto_fixed') && !feedbackGiven.has(pattern.id) && (
                        <div className="flex gap-2 pt-2 items-center">
                          <span className="text-xs text-muted-foreground">Did this fix work?</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedback(pattern.id, true);
                            }}
                            disabled={feedbackMutation.isPending}
                            data-testid={`button-feedback-yes-${pattern.id}`}
                            className="text-green-600 hover:bg-green-50"
                          >
                            {feedbackMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Yes
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeedback(pattern.id, false);
                            }}
                            disabled={feedbackMutation.isPending}
                            data-testid={`button-feedback-no-${pattern.id}`}
                            className="text-red-600 hover:bg-red-50"
                          >
                            {feedbackMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <ThumbsDown className="w-3 h-3 mr-1" />
                                No
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Feedback Given Indicator */}
                      {feedbackGiven.has(pattern.id) && (
                        <div className="pt-2">
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Feedback recorded
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
