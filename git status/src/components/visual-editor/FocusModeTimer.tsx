import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  X, 
  Clock, 
  TrendingUp,
  Save,
  Zap
} from 'lucide-react';
import { useFocusModeStore, type SessionDuration } from '@/lib/focusModeStore';
import { cn } from '@/lib/utils';

interface FocusModeTimerProps {
  onExit: () => void;
  onAutoSave?: () => void;
  className?: string;
}

const DURATION_OPTIONS: { value: SessionDuration; label: string; icon: string }[] = [
  { value: 25, label: 'Sprint', icon: '⚡' },
  { value: 50, label: 'Focus', icon: '🎯' },
  { value: 90, label: 'Deep Work', icon: '🔥' },
];

export function FocusModeTimer({ onExit, onAutoSave, className }: FocusModeTimerProps) {
  const {
    isActive,
    isPaused,
    timeRemaining,
    sessionDuration,
    editsThisSession,
    lastAutoSave,
    currentSession,
    updateTimeRemaining,
    pauseSession,
    resumeSession,
    setSessionDuration,
    recordAutoSave,
    getSessionSummary,
  } = useFocusModeStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        updateTimeRemaining(Math.max(0, timeRemaining - 1));
        
        if (timeRemaining <= 1) {
          new Audio('/sounds/session-complete.mp3').catch(() => {});
          onExit();
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isActive, isPaused, timeRemaining, updateTimeRemaining, onExit]);

  useEffect(() => {
    if (isActive && !isPaused) {
      const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;
      
      autoSaveRef.current = setInterval(() => {
        if (onAutoSave) {
          onAutoSave();
          recordAutoSave();
        }
      }, AUTO_SAVE_INTERVAL);

      return () => {
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      };
    }
  }, [isActive, isPaused, onAutoSave, recordAutoSave]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return ((sessionDuration * 60 - timeRemaining) / (sessionDuration * 60)) * 100;
  };

  const getEditsPerMinute = (): number => {
    if (!currentSession?.startTime) return 0;
    const elapsedMinutes = (Date.now() - currentSession.startTime.getTime()) / 60000;
    return elapsedMinutes > 0 ? Math.round(editsThisSession / elapsedMinutes) : 0;
  };

  const getTimeSinceAutoSave = (): string => {
    if (!lastAutoSave) return 'Never';
    const seconds = Math.floor((Date.now() - lastAutoSave.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <Card 
      className={cn(
        "glass-card border-ocean-divider p-6 space-y-6",
        className
      )}
      data-testid="focus-mode-timer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Focus Mode</h3>
            <p className="text-xs text-muted-foreground">BlitzNow Session</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onExit}
          data-testid="button-exit-focus-mode"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {!isActive ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Choose your session duration to start focused editing
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={sessionDuration === option.value ? "default" : "outline"}
                onClick={() => setSessionDuration(option.value)}
                className="flex flex-col h-auto py-4 gap-2"
                data-testid={`button-duration-${option.value}`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="font-semibold">{option.value}m</span>
                <span className="text-xs opacity-80">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Time Remaining</span>
              </div>
              <Badge variant={timeRemaining < 300 ? "destructive" : "default"}>
                {DURATION_OPTIONS.find(d => d.value === sessionDuration)?.label}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums tracking-tight">
                {formatTime(timeRemaining)}
              </div>
            </div>

            <Progress 
              value={getProgressPercentage()} 
              className="h-2"
              data-testid="focus-progress-bar"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-3 rounded-lg border border-ocean-divider">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Edits/Min</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-edits-per-minute">
                {getEditsPerMinute()}
              </div>
            </div>

            <div className="glass-card p-3 rounded-lg border border-ocean-divider">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Total Edits</span>
              </div>
              <div className="text-2xl font-bold" data-testid="text-total-edits">
                {editsThisSession}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Save className="w-3 h-3" />
              <span>Last save: {getTimeSinceAutoSave()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPaused ? resumeSession : pauseSession}
              className="flex-1"
              data-testid="button-pause-resume"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
