import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Zap, X, Clock, Pause, Play, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface PomodoroSession {
  id: number;
  duration: number;
  type: 'work' | 'break';
  startedAt: Date;
}

export function BlitzNowButton() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');

  const { data: activeSession } = useQuery<PomodoroSession | null>({
    queryKey: ['/api/productivity/pomodoro/active'],
    refetchInterval: 1000, // Update every second
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
      setIsOpen(false);
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
    return { minutes, seconds, progress: ((session.duration * 60 * 1000 - remaining) / (session.duration * 60 * 1000)) * 100 };
  };

  const timeInfo = activeSession ? getRemainingTime(activeSession) : null;

  return (
    <>
      {/* Floating BLITZ NOW Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-full h-16 w-16 shadow-lg ${
            activeSession 
              ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
          }`}
          data-testid="button-blitz-now"
        >
          <Zap className="h-8 w-8" />
        </Button>
      </motion.div>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="w-80 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    BLITZ MODE
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    data-testid="button-close-blitz"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!activeSession ? (
                  <>
                    {/* Start New Session */}
                    <div className="space-y-2">
                      <Input
                        placeholder="What are you working on?"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        data-testid="input-task-description"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleStartBlitz(5)}
                        data-testid="button-blitz-5"
                        className="flex flex-col h-auto py-3"
                      >
                        <span className="text-2xl font-bold">5</span>
                        <span className="text-xs">min</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleStartBlitz(15)}
                        data-testid="button-blitz-15"
                        className="flex flex-col h-auto py-3"
                      >
                        <span className="text-2xl font-bold">15</span>
                        <span className="text-xs">min</span>
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => handleStartBlitz(25)}
                        data-testid="button-blitz-25"
                        className="flex flex-col h-auto py-3 bg-purple-600 hover:bg-purple-700"
                      >
                        <span className="text-2xl font-bold">25</span>
                        <span className="text-xs">min</span>
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleStartBlitz(5, 'break')}
                      className="w-full"
                      data-testid="button-break"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Take a 5min Break
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Active Session */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge variant={activeSession.type === 'work' ? 'default' : 'secondary'} className="mb-2">
                          {activeSession.type === 'work' ? '🎯 Focus Mode' : '☕ Break Time'}
                        </Badge>
                        <div className="text-4xl font-bold tabular-nums">
                          {timeInfo?.minutes.toString().padStart(2, '0')}:
                          {timeInfo?.seconds.toString().padStart(2, '0')}
                        </div>
                      </div>

                      <Progress value={timeInfo?.progress || 0} />

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          onClick={() => completeMutation.mutate(activeSession.id)}
                          className="flex-1"
                          data-testid="button-complete-session"
                        >
                          <SkipForward className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => cancelMutation.mutate(activeSession.id)}
                          className="flex-1"
                          data-testid="button-cancel-session"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
