import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

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

export function ChangeHistoryLoading() {
  return (
    <Card className="p-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function CodePreviewLoading() {
  return (
    <Card className="p-4">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-64 w-full" />
    </Card>
  );
}

export function ChatPaneLoading() {
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
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
