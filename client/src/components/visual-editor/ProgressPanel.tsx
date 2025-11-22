/**
 * Progress Panel - Real-time task progress tracking via SSE
 * 
 * Features:
 * - Real-time progress updates via Server-Sent Events (SSE)
 * - Phase tracking (planning → execution → validation → complete)
 * - Subtask breakdown with individual progress
 * - Time estimation and ETA
 * - Visual progress indicators
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, CheckCircle2, XCircle, Clock, 
  Zap, FileCheck, AlertCircle, Activity 
} from 'lucide-react';

type TaskPhase = 'planning' | 'execution' | 'validation' | 'complete' | 'failed';

interface SubtaskProgress {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  percent: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

interface TaskProgress {
  sessionId: string;
  phase: TaskPhase;
  percent: number;
  message: string;
  currentTask?: number;
  totalTasks?: number;
  completedTasks?: number;
  failedTasks?: number;
  startedAt: number;
  estimatedCompletion?: number;
  subtasks?: SubtaskProgress[];
}

export function ProgressPanel() {
  const [activeProgress, setActiveProgress] = useState<TaskProgress | null>(null);
  const [progressHistory, setProgressHistory] = useState<TaskProgress[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE for active session
  useEffect(() => {
    if (!activeProgress?.sessionId) return;

    const token = localStorage.getItem('accessToken');
    const sessionId = activeProgress.sessionId;
    
    // Create EventSource connection
    const url = `/api/mrblue/orchestration/progress/${sessionId}/stream`;
    const eventSource = new EventSource(url);
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('[ProgressPanel] SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const progress: TaskProgress = JSON.parse(event.data);
        setActiveProgress(progress);
        
        // Update history if complete or failed
        if (progress.phase === 'complete' || progress.phase === 'failed') {
          setProgressHistory(prev => [progress, ...prev.slice(0, 9)]); // Keep last 10
        }
      } catch (error) {
        console.error('[ProgressPanel] Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      console.error('[ProgressPanel] SSE connection error');
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [activeProgress?.sessionId]);

  const getPhaseIcon = (phase: TaskPhase) => {
    switch (phase) {
      case 'planning':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'execution':
        return <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'validation':
        return <FileCheck className="w-4 h-4 text-purple-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPhaseColor = (phase: TaskPhase) => {
    switch (phase) {
      case 'planning':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'execution':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'validation':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'complete':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const getStatusIcon = (status: SubtaskProgress['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="w-3 h-3 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateETA = (progress: TaskProgress): string => {
    if (progress.percent === 0) return 'Calculating...';
    const elapsed = Date.now() - progress.startedAt;
    const totalEstimated = (elapsed / progress.percent) * 100;
    const remaining = totalEstimated - elapsed;
    return formatDuration(remaining);
  };

  return (
    <div className="flex flex-col h-full" data-testid="progress-panel">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Progress Tracking</h2>
          </div>
          {isConnected && (
            <Badge variant="outline" className="text-xs" data-testid="sse-status">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Live
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time updates for active tasks
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          
          {/* Active Progress */}
          {activeProgress ? (
            <Card data-testid="active-progress-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPhaseIcon(activeProgress.phase)}
                    <CardTitle className="text-sm">
                      {activeProgress.message}
                    </CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getPhaseColor(activeProgress.phase)}`}
                    data-testid="phase-badge"
                  >
                    {activeProgress.phase}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-semibold" data-testid="progress-percent">
                      {activeProgress.percent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={activeProgress.percent} className="h-2" />
                </div>

                {/* Task Counts */}
                {activeProgress.totalTasks !== undefined && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 rounded-md bg-muted/50">
                      <div className="font-semibold">{activeProgress.totalTasks}</div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-2 rounded-md bg-green-500/10">
                      <div className="font-semibold text-green-600">{activeProgress.completedTasks || 0}</div>
                      <div className="text-muted-foreground">Done</div>
                    </div>
                    <div className="text-center p-2 rounded-md bg-red-500/10">
                      <div className="font-semibold text-red-600">{activeProgress.failedTasks || 0}</div>
                      <div className="text-muted-foreground">Failed</div>
                    </div>
                  </div>
                )}

                {/* Time Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Elapsed: {formatDuration(Date.now() - activeProgress.startedAt)}
                  </div>
                  {activeProgress.percent > 0 && activeProgress.percent < 100 && (
                    <div>
                      ETA: {calculateETA(activeProgress)}
                    </div>
                  )}
                </div>

                {/* Subtasks */}
                {activeProgress.subtasks && activeProgress.subtasks.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Subtasks</h4>
                      <div className="space-y-2">
                        {activeProgress.subtasks.map((subtask, index) => (
                          <div 
                            key={subtask.id} 
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                            data-testid={`subtask-${index}`}
                          >
                            {getStatusIcon(subtask.status)}
                            <span className="text-xs flex-1">{subtask.description}</span>
                            {subtask.status === 'running' && subtask.percent > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {subtask.percent}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert data-testid="no-active-progress-alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                No active tasks. Progress will appear here when Mr. Blue starts working.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress History */}
          {progressHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Recent Tasks</h3>
                <div className="space-y-2">
                  {progressHistory.map((progress, index) => (
                    <Card 
                      key={progress.sessionId} 
                      className="hover-elevate cursor-pointer"
                      data-testid={`history-item-${index}`}
                    >
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {getPhaseIcon(progress.phase)}
                            <span className="text-xs truncate">{progress.message}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPhaseColor(progress.phase)}`}
                          >
                            {progress.phase === 'complete' ? 'Done' : 'Failed'}
                          </Badge>
                        </div>
                        {progress.totalTasks !== undefined && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {progress.completedTasks}/{progress.totalTasks} tasks completed
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Info */}
          <Alert data-testid="progress-info-alert">
            <Activity className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Progress updates are streamed in real-time via Server-Sent Events (SSE).
            </AlertDescription>
          </Alert>

        </div>
      </ScrollArea>
    </div>
  );
}
