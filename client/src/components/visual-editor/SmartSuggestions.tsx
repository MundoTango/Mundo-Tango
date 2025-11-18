/**
 * Smart Suggestions Panel
 * Displays AI-powered design and accessibility suggestions
 * 
 * Features:
 * - Floating badge with suggestion count
 * - Expandable panel with suggestions list
 * - "Apply Fix" buttons for automated suggestions
 * - Auto-refresh every 30 seconds
 * - Color-coded by severity
 * 
 * Phase 5: AI-Powered Smart Context System
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, ChevronDown, ChevronUp, AlertTriangle, 
  AlertCircle, Info, Lightbulb, Zap, RefreshCw, Filter 
} from "lucide-react";

// ==================== TYPES ====================

interface DesignSuggestion {
  id: string;
  category: 'accessibility' | 'ux' | 'design' | 'performance' | 'responsive';
  severity: 'critical' | 'warning' | 'suggestion' | 'info';
  title: string;
  message: string;
  fix: string;
  selector?: string;
  automated: boolean;
  changes?: Record<string, string>;
}

interface SuggestionsReport {
  suggestions: DesignSuggestion[];
  summary: {
    total: number;
    critical: number;
    warnings: number;
    suggestions: number;
    automated: number;
  };
  pageScore: number;
  generatedAt: number;
  model?: string;
  analysisSpeed?: {
    latencyMs: number;
    tokensPerSecond: number;
  };
}

// ==================== COMPONENT ====================

interface SmartSuggestionsProps {
  pageHtml?: string; // Current page HTML
  selectedElement?: any; // Currently selected element
  currentStyles?: Record<string, string>; // Current element styles
  pagePath?: string; // Page path
  autoRefresh?: boolean; // Auto-analyze every 30s
  onApplyFix?: (suggestion: DesignSuggestion) => void;
}

export function SmartSuggestions({ 
  pageHtml,
  selectedElement,
  currentStyles,
  pagePath,
  autoRefresh = false, // Disabled by default (expensive AI calls)
  onApplyFix 
}: SmartSuggestionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suggestions
  const { 
    data: response, 
    isLoading, 
    refetch,
    isFetching 
  } = useQuery<{ success: boolean; report: SuggestionsReport }>({
    queryKey: ['/api/visual-editor/suggestions', pageHtml, selectedElement?.id, pagePath],
    queryFn: async () => {
      const res = await apiRequest('POST', '/api/visual-editor/suggestions', {
        pageHtml,
        selectedElement,
        currentStyles,
        pagePath
      });
      return await res.json();
    },
    enabled: !!pageHtml,
    refetchInterval: autoRefresh ? 60000 : false, // 60s auto-refresh if enabled
    staleTime: 55000
  });

  const report = response?.report;
  const suggestions = report?.suggestions || [];
  const summary = report?.summary;
  const pageScore = report?.pageScore || 0;

  // Filter suggestions
  const filteredSuggestions = suggestions.filter((s) => {
    if (filterCategory !== "all" && s.category !== filterCategory) return false;
    if (filterSeverity !== "all" && s.severity !== filterSeverity) return false;
    return true;
  });

  // Auto-expand if critical issues found
  useEffect(() => {
    if (summary && summary.critical > 0 && !isExpanded) {
      setIsExpanded(true);
      toast({
        title: "Critical Issues Detected",
        description: `${summary.critical} critical issue(s) found on this page`,
        variant: "destructive"
      });
    }
  }, [summary, isExpanded, toast]);

  // Manual refresh
  const handleRefresh = useCallback(() => {
    refetch();
    toast({
      title: "Analyzing Page",
      description: "Mr. Blue is analyzing the current page..."
    });
  }, [refetch, toast]);

  // Apply automated fix
  const applyFixMutation = useMutation({
    mutationFn: async (suggestion: DesignSuggestion) => {
      // Call parent handler if provided
      if (onApplyFix) {
        onApplyFix(suggestion);
        return { success: true };
      }

      // Otherwise, send to backend for automated fix
      const response = await apiRequest('POST', '/api/autonomous/apply-fix', {
        suggestion
      });
      return await response.json();
    },
    onSuccess: (_, suggestion) => {
      toast({
        title: "Fix Applied",
        description: suggestion.message,
      });
      
      // Refresh suggestions after fix
      setTimeout(() => refetch(), 1000);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Apply Fix",
        description: error.message || "An error occurred"
      });
    }
  });

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'suggestion':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accessibility':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'ux':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'design':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'performance':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'responsive':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          variant="default"
          className="rounded-full shadow-lg"
          disabled
          data-testid="button-suggestions-loading"
        >
          <RefreshCw className="w-5 h-5 animate-spin" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed: Floating Badge */}
      {!isExpanded && (
        <Button
          size="icon"
          variant="default"
          className="rounded-full shadow-lg hover-elevate active-elevate-2"
          onClick={() => setIsExpanded(true)}
          data-testid="button-suggestions-open"
        >
          <Sparkles className="w-5 h-5" />
          {summary && summary.total > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
              {summary.total}
            </span>
          )}
        </Button>
      )}

      {/* Expanded: Suggestions Panel */}
      {isExpanded && (
        <Card className="w-96 shadow-2xl max-h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Smart Suggestions</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isFetching}
                data-testid="button-suggestions-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                data-testid="button-suggestions-close"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 pt-0">
            {/* Page Score */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium">Page Quality Score</span>
              <Badge 
                variant={pageScore >= 80 ? 'default' : pageScore >= 60 ? 'secondary' : 'destructive'}
                className="text-lg px-3"
              >
                {pageScore}/100
              </Badge>
            </div>

            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{summary.critical}</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{summary.warnings}</div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{summary.suggestions}</div>
                  <div className="text-xs text-muted-foreground">Suggestions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{summary.automated}</div>
                  <div className="text-xs text-muted-foreground">Auto-Fix</div>
                </div>
              </div>
            )}

            <Separator />

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="flex-1" data-testid="select-filter-category">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="ux">UX</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="responsive">Responsive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="flex-1" data-testid="select-filter-severity">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Suggestions List */}
            <ScrollArea className="flex-1">
              {filteredSuggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {suggestions.length === 0 
                      ? "No suggestions yet. Great job!"
                      : "No suggestions match your filters."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pr-3">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-3 rounded-lg border bg-card hover-elevate"
                      data-testid={`suggestion-${suggestion.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getSeverityIcon(suggestion.severity)}
                        </div>

                        <div className="flex-1 space-y-2">
                          {/* Title & Severity */}
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-tight">
                              {suggestion.title}
                            </p>
                            <Badge 
                              variant={getSeverityColor(suggestion.severity) as any}
                              className="text-xs shrink-0"
                            >
                              {suggestion.severity}
                            </Badge>
                          </div>

                          {/* Category Badge */}
                          <Badge 
                            className={`text-xs ${getCategoryColor(suggestion.category)}`}
                          >
                            {suggestion.category}
                          </Badge>

                          {/* Message/Description */}
                          <p className="text-xs text-foreground">
                            {suggestion.message}
                          </p>

                          {/* Fix Description */}
                          <p className="text-xs text-muted-foreground italic">
                            {suggestion.fix}
                          </p>

                          {/* Selector (if any) */}
                          {suggestion.selector && (
                            <code className="text-xs bg-muted px-2 py-1 rounded block">
                              {suggestion.selector}
                            </code>
                          )}

                          {/* Apply Fix Button */}
                          {suggestion.automated && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => applyFixMutation.mutate(suggestion)}
                              disabled={applyFixMutation.isPending}
                              data-testid={`button-apply-fix-${suggestion.id}`}
                            >
                              <Zap className="w-3 h-3 mr-2" />
                              Apply Fix
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
