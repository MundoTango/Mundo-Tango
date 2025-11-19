import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function SelfHealingStatus() {
  const { data: status } = useQuery({
    queryKey: ['/api/self-healing/status'],
    refetchInterval: 5000 // Poll every 5 seconds
  });
  
  const [expanded, setExpanded] = useState(false);
  
  // Don't show if no agents active
  if (!status?.agentsActive || status.agentsActive.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg z-50 max-w-sm" data-testid="self-healing-status">
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-testid="status-indicator" />
            <span className="font-semibold text-sm">Self-Healing Active</span>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-status"
            className="h-6 w-6"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
        </div>
        
        {expanded && (
          <>
            <div className="text-sm space-y-1">
              <div data-testid="agents-active">
                <span className="text-muted-foreground">Agents:</span> {status.agentsActive.length}
              </div>
              <div data-testid="issues-found">
                <span className="text-muted-foreground">Issues Found:</span> {status.issuesFound || 0}
              </div>
              <div data-testid="fixes-applied">
                <span className="text-muted-foreground">Fixes Applied:</span> {status.fixesApplied || 0}
              </div>
            </div>
            
            {status.currentOperation && (
              <div className="mt-2 p-2 bg-muted rounded text-xs" data-testid="current-operation">
                <div className="font-medium">{status.currentOperation.phase}</div>
                <Progress value={status.currentOperation.progress} className="mt-1 h-1" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
