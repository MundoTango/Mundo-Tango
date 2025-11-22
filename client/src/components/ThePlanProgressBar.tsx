import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { useState } from 'react';

export function ThePlanProgressBar() {
  const { data: progress } = useQuery({
    queryKey: ['/api/the-plan/progress'],
    refetchInterval: 5000 // Poll every 5 seconds (REDUCED from 2s - QuickFixAgent Nov 22)
  });
  
  const [minimized, setMinimized] = useState(false);
  
  // Don't show if The Plan is not active
  if (!progress?.active) return null;
  
  const percentComplete = (progress.pagesCompleted / progress.totalPages) * 100;
  
  if (minimized) {
    return (
      <div className="fixed bottom-4 left-4 bg-card border rounded-lg shadow-lg z-50" data-testid="the-plan-minimized">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMinimized(false)}
          data-testid="button-expand-plan"
        >
          📋 The Plan: {progress.pagesCompleted}/{progress.totalPages} ({Math.round(percentComplete)}%)
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50" data-testid="the-plan-progress-bar">
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h3 className="font-semibold">The Plan: Platform Validation</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground" data-testid="progress-text">
              {progress.pagesCompleted} / {progress.totalPages} pages tested ({Math.round(percentComplete)}%)
            </div>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setMinimized(true)}
              data-testid="button-minimize-plan"
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <Progress value={percentComplete} className="mb-2" data-testid="progress-bar" />
        
        {progress.currentPage && (
          <div className="text-sm">
            <div className="font-medium" data-testid="current-page-name">
              Now Testing: {progress.currentPage.name}
            </div>
            {progress.currentPage.checklist && progress.currentPage.checklist.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {progress.currentPage.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2" data-testid={`checklist-item-${i}`}>
                    <span>
                      {item.status === 'pass' ? '✓' : item.status === 'fail' ? '⚠️' : '○'}
                    </span>
                    <span className={item.status === 'fail' ? 'text-destructive' : ''}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
