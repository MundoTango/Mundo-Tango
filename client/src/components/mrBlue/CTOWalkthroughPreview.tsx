import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RotateCcw, CheckCircle2, XCircle, Loader2, Monitor, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMrBlue } from '@/contexts/MrBlueContext';

interface WalkthroughStep {
  id: string;
  action: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  screenshot?: string;
  error?: string;
  duration?: number;
}

interface CTOWalkthroughPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onError?: (error: { message: string; step: string; mbmdAnalysis: any }) => void;
}

const WALKTHROUGH_STEPS: Omit<WalkthroughStep, 'status'>[] = [
  { id: '1', action: 'navigate', description: 'Navigate to mundotango.life/onboarding/waitlist' },
  { id: '2', action: 'wait', description: 'Wait for page to load completely' },
  { id: '3', action: 'scroll', description: 'Scroll to resume upload section' },
  { id: '4', action: 'upload', description: 'Upload test resume (PDF)' },
  { id: '5', action: 'submit', description: 'Submit resume for parsing' },
  { id: '6', action: 'verify', description: 'Verify parsed data appears correctly' },
];

export function CTOWalkthroughPreview({ isOpen, onClose, onError }: CTOWalkthroughPreviewProps) {
  const { openChat, setSelfHealError, reportWalkthroughComplete } = useMrBlue();
  const [steps, setSteps] = useState<WalkthroughStep[]>(
    WALKTHROUGH_STEPS.map(s => ({ ...s, status: 'pending' }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 100);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const startWalkthrough = useCallback(() => {
    cleanupSSE();
    
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);
    setElapsedTime(0);
    setErrorDetails(null);
    setSteps(WALKTHROUGH_STEPS.map(s => ({ ...s, status: 'pending' })));

    try {
      eventSourceRef.current = new EventSource('/api/cto/walkthrough/run');

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'step_start') {
            setCurrentStep(data.stepIndex);
            setSteps(prev => prev.map((s, i) => 
              i === data.stepIndex ? { ...s, status: 'running' } : s
            ));
          } else if (data.type === 'step_complete') {
            setSteps(prev => prev.map((s, i) => 
              i === data.stepIndex ? { ...s, status: 'success', duration: data.duration } : s
            ));
            setProgress(((data.stepIndex + 1) / WALKTHROUGH_STEPS.length) * 100);
          } else if (data.type === 'step_failed') {
            setSteps(prev => prev.map((s, i) => 
              i === data.stepIndex ? { ...s, status: 'failed', error: data.error } : s
            ));
            setErrorDetails(data);
            setIsRunning(false);
            
            if (onError) {
              onError({
                message: data.error,
                step: WALKTHROUGH_STEPS[data.stepIndex]?.description || 'Unknown step',
                mbmdAnalysis: data.mbmdAnalysis
              });
            }
            
            setSelfHealError({
              errorMessage: data.error,
              page: '/onboarding/waitlist',
              mbmdAnalysis: data.mbmdAnalysis
            });
            openChat();
            
          } else if (data.type === 'screenshot') {
            setScreenshot(data.image);
          } else if (data.type === 'complete') {
            setProgress(100);
            setIsRunning(false);
            eventSourceRef.current?.close();
            
            // Report completion to Mr. Blue
            setSteps(prev => {
              const finalSteps = prev;
              const successSteps = finalSteps.filter(s => s.status === 'success');
              const failedSteps = finalSteps.filter(s => s.status === 'failed');
              
              reportWalkthroughComplete({
                success: failedSteps.length === 0,
                testName: 'Resume Upload Test',
                totalSteps: WALKTHROUGH_STEPS.length,
                completedSteps: successSteps.length,
                duration: elapsedTime,
                steps: finalSteps.map(s => ({
                  description: s.description,
                  status: s.status === 'success' ? 'success' : 'failed',
                  duration: s.duration,
                  error: s.error,
                })),
                timestamp: Date.now(),
              });
              
              return prev;
            });
          }
        } catch (error) {
          console.error('Failed to parse walkthrough event:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('Walkthrough SSE error:', error);
        setIsRunning(false);
        eventSourceRef.current?.close();
      };

    } catch (error) {
      console.error('Failed to start walkthrough:', error);
      setIsRunning(false);
    }
  }, [cleanupSSE, onError, openChat, setSelfHealError]);

  useEffect(() => {
    if (isOpen && !hasAutoStarted && !isRunning) {
      setHasAutoStarted(true);
      const timer = setTimeout(() => {
        startWalkthrough();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      cleanupSSE();
      setHasAutoStarted(false);
    }
  }, [isOpen, hasAutoStarted, isRunning, cleanupSSE, startWalkthrough]);

  useEffect(() => {
    return () => {
      cleanupSSE();
    };
  }, [cleanupSSE]);

  const resetWalkthrough = useCallback(() => {
    cleanupSSE();
    setIsRunning(false);
    setCurrentStep(0);
    setProgress(0);
    setElapsedTime(0);
    setErrorDetails(null);
    setScreenshot(null);
    setSteps(WALKTHROUGH_STEPS.map(s => ({ ...s, status: 'pending' })));
  }, [cleanupSSE]);

  const handleClose = useCallback(() => {
    cleanupSSE();
    onClose();
  }, [cleanupSSE, onClose]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  const getStepIcon = (status: WalkthroughStep['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
      data-testid="cto-walkthrough-preview"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">CTO Walkthrough: Resume Upload Test</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" data-testid="elapsed-time">
              {formatTime(elapsedTime)}
            </Badge>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleClose}
              data-testid="button-close-walkthrough"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 h-full">
            <div className="border-r border-border p-4 flex flex-col">
              <div className="mb-4">
                <Progress value={progress} className="h-2" data-testid="walkthrough-progress" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(progress)}% complete
                </p>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        index === currentStep && isRunning 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-muted/30'
                      }`}
                      data-testid={`walkthrough-step-${step.id}`}
                    >
                      {getStepIcon(step.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{step.description}</p>
                        {step.duration && (
                          <p className="text-xs text-muted-foreground">
                            Completed in {step.duration}ms
                          </p>
                        )}
                        {step.error && (
                          <p className="text-xs text-destructive mt-1">
                            {step.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {!isRunning ? (
                  <Button 
                    onClick={startWalkthrough} 
                    className="flex-1"
                    data-testid="button-start-walkthrough"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {progress > 0 ? 'Restart Walkthrough' : 'Start Walkthrough'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={resetWalkthrough}
                    className="flex-1"
                    data-testid="button-reset-walkthrough"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Stop & Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-muted/20 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Live Preview</span>
                {isRunning && (
                  <Badge variant="secondary" className="ml-auto">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Recording
                  </Badge>
                )}
              </div>

              <div 
                className="flex-1 rounded-lg border border-border bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center"
                data-testid="preview-container"
              >
                {screenshot ? (
                  <img 
                    src={screenshot} 
                    alt="Test screenshot" 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : errorDetails ? (
                  <div className="text-center p-6">
                    <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-destructive mb-2">
                      Test Failed
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {errorDetails.error}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mr. Blue is analyzing the issue...
                    </p>
                  </div>
                ) : isRunning ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Running test...
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <Monitor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Click "Start Walkthrough" to begin the test
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Live screenshots will appear here
                    </p>
                  </div>
                )}
              </div>

              {errorDetails?.mbmdAnalysis && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    MB.MD Analysis
                  </h4>
                  <div className="mt-2 text-xs space-y-1">
                    <p><strong>Pattern:</strong> {errorDetails.mbmdAnalysis.mbmdPattern}</p>
                    <p><strong>Root Cause:</strong> {errorDetails.mbmdAnalysis.rootCause}</p>
                    <p><strong>Recommended Fix:</strong> {errorDetails.mbmdAnalysis.recommendedFix}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
