import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Zap,
  Trophy,
  Target
} from 'lucide-react';
import { useFocusModeStore } from '@/lib/focusModeStore';
import { cn } from '@/lib/utils';

interface FocusModeProps {
  onClose: () => void;
  children?: React.ReactNode;
}

interface SessionSummary {
  duration: number;
  editsCount: number;
  editsPerMinute: number;
  autoSaveCount: number;
  startTime: Date;
  endTime: Date;
}

export function FocusMode({ onClose, children }: FocusModeProps) {
  const { endSession, getSessionSummary } = useFocusModeStore();
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  const handleExit = useCallback(() => {
    const session = endSession();
    if (session && session.endTime) {
      setSummary({
        duration: session.duration,
        editsCount: session.editsCount,
        editsPerMinute: session.editsPerMinute,
        autoSaveCount: session.autoSaveCount,
        startTime: session.startTime,
        endTime: session.endTime,
      });
      setShowSummary(true);
    } else {
      onClose();
    }
  }, [endSession, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
      
      if (e.key === 'F11') {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.overflow = '';
    };
  }, [handleExit]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProductivityLevel = (editsPerMinute: number): { label: string; color: string; icon: any } => {
    if (editsPerMinute >= 5) {
      return { label: 'Exceptional', color: 'text-green-500', icon: Trophy };
    } else if (editsPerMinute >= 3) {
      return { label: 'Excellent', color: 'text-blue-500', icon: Target };
    } else if (editsPerMinute >= 2) {
      return { label: 'Good', color: 'text-ocean-600', icon: TrendingUp };
    } else {
      return { label: 'Steady', color: 'text-muted-foreground', icon: Zap };
    }
  };

  if (showSummary && summary) {
    const productivity = getProductivityLevel(summary.editsPerMinute);
    const ProductivityIcon = productivity.icon;

    return (
      <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full glass-card border-ocean-divider">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Session Complete! 🎉</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Great work! Here's your session summary
                </p>
              </div>
              <div className={cn("flex items-center gap-2", productivity.color)}>
                <ProductivityIcon className="w-8 h-8" />
                <div>
                  <div className="text-sm font-semibold">{productivity.label}</div>
                  <div className="text-xs opacity-80">Productivity</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-lg border border-ocean-divider">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Session Duration</span>
                </div>
                <div className="text-3xl font-bold">
                  {formatDuration(summary.duration)}
                </div>
              </div>

              <div className="glass-card p-4 rounded-lg border border-ocean-divider">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Total Edits</span>
                </div>
                <div className="text-3xl font-bold">
                  {summary.editsCount}
                </div>
              </div>

              <div className="glass-card p-4 rounded-lg border border-ocean-divider">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Edits Per Minute</span>
                </div>
                <div className="text-3xl font-bold">
                  {summary.editsPerMinute.toFixed(1)}
                </div>
              </div>

              <div className="glass-card p-4 rounded-lg border border-ocean-divider">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Auto-saves</span>
                </div>
                <div className="text-3xl font-bold">
                  {summary.autoSaveCount}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Session Timeline</h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Started: {summary.startTime.toLocaleTimeString()}</span>
                <span>Ended: {summary.endTime.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1"
                data-testid="button-close-summary"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[150]"
      data-focus-mode="active"
    >
      {children}
      
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[160] pointer-events-none">
        <Badge variant="outline" className="glass-card border-ocean-divider px-3 py-2">
          <span className="text-xs">Press <kbd className="px-2 py-1 rounded bg-muted mx-1">Esc</kbd> to exit Focus Mode</span>
        </Badge>
      </div>
    </div>
  );
}
