/**
 * VisualEditorSkeleton - Loading state for Visual Editor
 * Shown while heavy components lazy load
 * MB.MD v9.5.1: Playwright-compatible loading UI
 */

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function VisualEditorSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel Skeleton */}
      <div className="w-80 border-r p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading Mr. Blue AI...</span>
        </div>
        
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Middle Panel Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-full w-full" />
      </div>

      {/* Right Panel Skeleton */}
      <div className="w-96 border-l p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
