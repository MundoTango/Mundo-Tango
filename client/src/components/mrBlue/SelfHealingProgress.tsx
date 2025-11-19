import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FixOperation {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

interface SelfHealingProgressProps {
  isHealing: boolean;
  onComplete?: () => void;
}

export function SelfHealingProgress({ isHealing, onComplete }: SelfHealingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [operations, setOperations] = useState<FixOperation[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!isHealing) {
      return;
    }
    
    // Initialize healing session
    setStartTime(Date.now());
    setProgress(0);
    
    // Mock healing operations (in real impl, stream from backend via SSE)
    const mockOperations: FixOperation[] = [
      { id: '1', description: 'Analyzing button overlap issue', status: 'pending' },
      { id: '2', description: 'Fixing text size (increasing to 14px)', status: 'pending' },
      { id: '3', description: 'Optimizing image compression', status: 'pending' },
      { id: '4', description: 'Improving color contrast ratio', status: 'pending' },
      { id: '5', description: 'Adding ARIA labels', status: 'pending' },
    ];
    
    setOperations(mockOperations);
    
    // Simulate healing progress
    let currentOp = 0;
    const interval = setInterval(() => {
      if (currentOp >= mockOperations.length) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
        return;
      }
      
      setOperations((prev) =>
        prev.map((op, index) => {
          if (index === currentOp) {
            return { ...op, status: 'in_progress' };
          } else if (index < currentOp) {
            return { ...op, status: 'completed', duration: Math.floor(Math.random() * 500) + 200 };
          }
          return op;
        })
      );
      
      setTimeout(() => {
        setOperations((prev) =>
          prev.map((op, index) => {
            if (index === currentOp) {
              return { ...op, status: 'completed', duration: Math.floor(Math.random() * 500) + 200 };
            }
            return op;
          })
        );
        
        currentOp++;
        setProgress((currentOp / mockOperations.length) * 100);
      }, Math.random() * 1000 + 500);
    }, 1500);
    
    // Update elapsed time
    const timeInterval = setInterval(() => {
      if (startTime) {
        setElapsedTime(Date.now() - startTime);
      }
    }, 100);
    
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [isHealing, onComplete]);
  
  if (!isHealing && operations.length === 0) {
    return null;
  }
  
  const completedOps = operations.filter(op => op.status === 'completed').length;
  const failedOps = operations.filter(op => op.status === 'failed').length;
  const totalOps = operations.length;
  
  const getStatusIcon = (status: FixOperation['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'in_progress':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-destructive" />;
    }
  };
  
  const formatTime = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  return (
    <div
      className="border-t border-border bg-muted/20 p-3 space-y-3"
      data-testid="self-healing-progress"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Loader2 className={`w-4 h-4 ${isHealing ? 'animate-spin' : ''}`} />
          Self-Healing {progress === 100 ? 'Complete' : 'in Progress'}
        </h3>
        <Badge variant="outline" className="text-xs" data-testid="healing-time">
          {formatTime(elapsedTime)}
        </Badge>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={progress} className="h-2" data-testid="healing-progress-bar" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid="healing-status">
            {completedOps}/{totalOps} fixed
          </span>
          <span data-testid="healing-percentage">{Math.round(progress)}%</span>
        </div>
      </div>
      
      {/* Operations List */}
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-2">
          {operations.map((op) => (
            <div
              key={op.id}
              className="flex items-start gap-2 p-2 rounded-md bg-card border border-border"
              data-testid={`fix-operation-${op.id}`}
            >
              {getStatusIcon(op.status)}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  {op.description}
                </p>
                {op.duration && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Completed in {op.duration}ms
                  </p>
                )}
                {op.error && (
                  <p className="text-xs text-destructive mt-0.5">
                    Error: {op.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
