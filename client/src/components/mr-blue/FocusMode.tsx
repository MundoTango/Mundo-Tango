import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Zap, Clock, Play, SkipForward } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PomodoroSession {
  id: number;
  duration: number;
  type: 'work' | 'break';
  startedAt: Date;
}

export function FocusMode() {
  const { toast } = useToast();
  const [taskDescription, setTaskDescription] = useState('');

  const { data: activeSession } = useQuery<PomodoroSession | null>({
    queryKey: ['/api/productivity/pomodoro/active'],
    refetchInterval: 1000,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (data: { taskId?: number; duration: number; type: 'work' | 'break' }) => {
      return await apiRequest('/api/productivity/pomodoro/start', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Focus Session Started! 🎯",
        description: "You're in the zone. Time to get things done!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/productivity/pomodoro/active'] });
      setTaskDescription('');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Start",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest(`/api/productivity/pomodoro/${sessionId}/complete`, 'POST', {});
    },
    onSuccess: () => {
      toast({
        title: "Great Work! 🎉",
        description: "Focus session completed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/productivity/pomodoro/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/productivity/stats'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return await apiRequest(`/api/productivity/pomodoro/${sessionId}/cancel`, 'POST', {});
    },
    onSuccess: () => {
      toast({
        title: "Session Cancelled",
        description: "No worries, try again when you're ready!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/productivity/pomodoro/active'] });
    }
  });

  const handleStartBlitz = (duration: number, type: 'work' | 'break' = 'work') => {
    startSessionMutation.mutate({ duration, type });
  };

  const getRemainingTime = (session: PomodoroSession) => {
    const startTime = new Date(session.startedAt).getTime();
    const endTime = startTime + (session.duration * 60 * 1000);
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { 
      minutes, 
      seconds, 
      progress: ((session.duration * 60 * 1000 - remaining) / (session.duration * 60 * 1000)) * 100 
    };
  };

  const timeInfo = activeSession ? getRemainingTime(activeSession) : null;

  return (
    <Card className="hover-elevate" data-testid="card-focus-mode">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Focus Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSession && timeInfo ? (
          <>
            <div className="text-center space-y-2">
              <Badge variant="default" className="animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                In Progress
              </Badge>
              <div className="text-4xl font-bold font-mono">
                {String(timeInfo.minutes).padStart(2, '0')}:{String(timeInfo.seconds).padStart(2, '0')}
              </div>
              <Progress value={timeInfo.progress} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => completeMutation.mutate(activeSession.id)}
                disabled={completeMutation.isPending}
                data-testid="button-complete-session"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cancelMutation.mutate(activeSession.id)}
                disabled={cancelMutation.isPending}
                data-testid="button-cancel-session"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <Input
              placeholder="What are you working on?"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              data-testid="input-task-description"
            />
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartBlitz(25)}
                disabled={startSessionMutation.isPending}
                data-testid="button-start-25"
              >
                <Play className="h-3 w-3 mr-1" />
                25 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartBlitz(15)}
                disabled={startSessionMutation.isPending}
                data-testid="button-start-15"
              >
                <Play className="h-3 w-3 mr-1" />
                15 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartBlitz(5, 'break')}
                disabled={startSessionMutation.isPending}
                data-testid="button-start-5-break"
              >
                <Play className="h-3 w-3 mr-1" />
                5 min
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Pomodoro Technique for Deep Work
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
