/**
 * Comprehensive Loading States for Visual Editor
 * Provides skeleton screens, progress bars, error states, and empty states
 * for all async operations in the Visual Editor
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, RefreshCw, AlertTriangle, AlertCircle, Info, 
  CheckCircle, Code, FileText, GitBranch, Sparkles, 
  Plus, FileCode, Inbox, Zap, MessageSquare
} from 'lucide-react';

// ==================== BASIC LOADING STATES ====================

export function IframeLoading() {
  return (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading preview...</p>
      </div>
    </div>
  );
}

export function EditorSidebarLoading() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// ==================== COMPREHENSIVE SKELETON SCREENS ====================

export function CodePreviewLoading() {
  return (
    <Card data-testid="code-preview-loading">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <Separator />
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export function ElementInspectorLoading() {
  return (
    <Card data-testid="element-inspector-loading">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Element Info Section */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        <Separator />

        {/* HTML Content Editor */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </div>

        <Separator />

        {/* CSS Controls */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function GitPanelLoading() {
  return (
    <div className="h-full flex flex-col bg-background" data-testid="git-panel-loading">
      {/* Tabs */}
      <div className="border-b px-4 py-2">
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SmartSuggestionsLoading() {
  return (
    <Card className="w-96 shadow-2xl max-h-[600px] flex flex-col" data-testid="suggestions-loading">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4 pt-0">
        {/* Page Score */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        <Separator />

        {/* Filters */}
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4 mt-1" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChangeHistoryLoading() {
  return (
    <Card className="p-4" data-testid="change-history-loading">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function ChatPaneLoading() {
  return (
    <div className="flex flex-col h-full p-4 space-y-4" data-testid="chat-pane-loading">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      <div className="flex-1 space-y-4">
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-20 w-2/3 ml-auto" />
        <Skeleton className="h-20 w-4/5" />
      </div>
      
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// ==================== PROGRESS BARS WITH STATUS ====================

interface ProgressWithStatusProps {
  progress: number;
  status: string;
  title?: string;
  icon?: React.ReactNode;
  estimatedTime?: string;
}

export function ProgressWithStatus({ 
  progress, 
  status, 
  title = "Processing",
  icon,
  estimatedTime 
}: ProgressWithStatusProps) {
  return (
    <div className="flex items-center justify-center h-full bg-muted/20" data-testid="progress-with-status">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            {icon || <Loader2 className="w-6 h-6 animate-spin text-primary" />}
            <div className="flex-1">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
            <Badge variant="secondary">{progress}%</Badge>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {estimatedTime && (
            <p className="text-xs text-muted-foreground text-center">
              Estimated time remaining: {estimatedTime}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AIGeneratingProgress({ progress }: { progress: number }) {
  const getStatus = () => {
    if (progress < 20) return "Analyzing page structure...";
    if (progress < 40) return "Processing component tree...";
    if (progress < 60) return "Generating code changes...";
    if (progress < 80) return "Optimizing output...";
    return "Finalizing code...";
  };

  return (
    <ProgressWithStatus
      progress={progress}
      status={getStatus()}
      title="AI Code Generation"
      icon={<Code className="w-6 h-6 text-primary animate-pulse" />}
      estimatedTime={progress < 50 ? "~30s" : "~10s"}
    />
  );
}

export function GitOperationProgress({ operation, progress }: { operation: string; progress: number }) {
  return (
    <ProgressWithStatus
      progress={progress}
      status={`${operation}...`}
      title="Git Operation"
      icon={<GitBranch className="w-6 h-6 text-primary" />}
    />
  );
}

export function VideoGenerationProgress({ progress }: { progress: number }) {
  const getStatus = () => {
    if (progress < 30) return "Preparing video generation...";
    if (progress < 70) return "Rendering frames...";
    return "Encoding video...";
  };

  return (
    <ProgressWithStatus
      progress={progress}
      status={getStatus()}
      title="Video Generation"
      icon={<Zap className="w-6 h-6 text-primary animate-pulse" />}
      estimatedTime={progress < 30 ? "~2min" : progress < 70 ? "~1min" : "~20s"}
    />
  );
}

// ==================== ERROR STATES ====================

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "destructive" | "warning" | "info";
  icon?: React.ReactNode;
}

export function ErrorState({ 
  title, 
  description, 
  onRetry,
  retryLabel = "Try Again",
  variant = "destructive",
  icon
}: ErrorStateProps) {
  const getIcon = () => {
    if (icon) return icon;
    if (variant === "destructive") return <AlertTriangle className="h-5 w-5" />;
    if (variant === "warning") return <AlertCircle className="h-5 w-5" />;
    return <Info className="h-5 w-5" />;
  };

  return (
    <div className="flex items-center justify-center h-full p-6" data-testid="error-state">
      <Alert variant={variant === "destructive" ? "destructive" : "default"} className="max-w-md">
        {getIcon()}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{description}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant={variant === "destructive" ? "destructive" : "default"}
              className="w-full"
              data-testid="button-retry"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function CodeGenerationError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Code Generation Failed"
      description="We couldn't generate the code for your changes. This might be due to a network issue or an invalid request. Please try again."
      onRetry={onRetry}
      icon={<Code className="h-5 w-5" />}
    />
  );
}

export function GitOperationError({ operation, onRetry }: { operation: string; onRetry?: () => void }) {
  return (
    <ErrorState
      title={`Git ${operation} Failed`}
      description={`The Git ${operation.toLowerCase()} operation encountered an error. Please check your repository status and try again.`}
      onRetry={onRetry}
      icon={<GitBranch className="h-5 w-5" />}
    />
  );
}

export function PageLoadError({ pagePath, onRetry }: { pagePath: string; onRetry?: () => void }) {
  return (
    <ErrorState
      title="Page Failed to Load"
      description={`Could not load page: ${pagePath}. The page might not exist or there's a navigation error.`}
      onRetry={onRetry}
      retryLabel="Reload Page"
      icon={<FileText className="h-5 w-5" />}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Network Error"
      description="We're having trouble connecting to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      variant="warning"
    />
  );
}

// ==================== EMPTY STATES ====================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full p-6" data-testid="empty-state">
      <div className="text-center space-y-4 max-w-md">
        {icon && (
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-muted">
              {icon}
            </div>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} data-testid="button-empty-action">
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function NoElementSelected({ onSelectHint }: { onSelectHint?: () => void }) {
  return (
    <EmptyState
      icon={<FileCode className="w-12 h-12 text-muted-foreground" />}
      title="No Element Selected"
      description="Click on any element in the preview to inspect and edit its properties."
      action={onSelectHint ? {
        label: "Show Me How",
        onClick: onSelectHint,
        icon: <Info className="w-4 h-4 mr-2" />
      } : undefined}
    />
  );
}

export function NoChangesYet({ onMakeChange }: { onMakeChange?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-12 h-12 text-muted-foreground" />}
      title="No Changes Yet"
      description="Start editing elements to see your change history here. All changes are tracked and can be undone."
      action={onMakeChange ? {
        label: "Start Editing",
        onClick: onMakeChange,
        icon: <Plus className="w-4 h-4 mr-2" />
      } : undefined}
    />
  );
}

export function NoCommits({ onMakeFirstCommit }: { onMakeFirstCommit?: () => void }) {
  return (
    <EmptyState
      icon={<GitBranch className="w-12 h-12 text-muted-foreground" />}
      title="No Commits Yet"
      description="Make some changes and save them to create your first commit. Your work will be safely version-controlled."
      action={onMakeFirstCommit ? {
        label: "Make Your First Edit",
        onClick: onMakeFirstCommit,
        icon: <Plus className="w-4 h-4 mr-2" />
      } : undefined}
    />
  );
}

export function NoSuggestions() {
  return (
    <EmptyState
      icon={<CheckCircle className="w-12 h-12 text-green-500" />}
      title="All Looks Great!"
      description="No suggestions at the moment. Your page is following best practices for accessibility, UX, and design."
    />
  );
}

export function NoChatMessages({ onStartChat }: { onStartChat?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="w-12 h-12 text-muted-foreground" />}
      title="Start a Conversation"
      description="Ask Mr. Blue anything about your page. He can help you make design changes, fix issues, or explain how things work."
      action={onStartChat ? {
        label: "Say Hello to Mr. Blue",
        onClick: onStartChat,
        icon: <Sparkles className="w-4 h-4 mr-2" />
      } : undefined}
    />
  );
}

// ==================== OPTIMISTIC UI STATES ====================

export function OptimisticChangeIndicator({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50" data-testid="optimistic-indicator">
      <Alert className="shadow-lg border-primary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Applying Change</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

export function ChangeAppliedIndicator({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4" data-testid="change-applied-indicator">
      <Alert className="shadow-lg border-green-500">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Change Applied</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}

export function SavingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="saving-indicator">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Saving changes...</span>
    </div>
  );
}

export function SavedIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-green-600" data-testid="saved-indicator">
      <CheckCircle className="w-4 h-4" />
      <span>All changes saved</span>
    </div>
  );
}
