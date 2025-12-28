import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, RotateCcw, CheckCircle2, XCircle, Loader2, Monitor, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMrBlue } from '@/contexts/MrBlueContext';
import { useToast } from '@/hooks/use-toast';

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
  { id: '1', action: 'login', description: 'Login with admin credentials' },
  { id: '2', action: 'navigate', description: 'Navigate to Talent Match page' },
  { id: '3', action: 'scroll', description: 'Scroll to resume upload section' },
  { id: '4', action: 'upload', description: 'Upload test resume (PDF)' },
  { id: '5', action: 'begin_interview', description: 'Click Begin AI Interview button' },
  { id: '6', action: 'verify', description: 'Verify AI parsing triggers correctly' },
];

export function CTOWalkthroughPreview({ isOpen, onClose, onError }: CTOWalkthroughPreviewProps) {
  const { setSelfHealError, reportWalkthroughComplete } = useMrBlue();
  const { toast } = useToast();
  const [steps, setSteps] = useState<WalkthroughStep[]>(
    WALKTHROUGH_STEPS.map(s => ({ ...s, status: 'pending' }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [fixStatus, setFixStatus] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAutoHealing, setIsAutoHealing] = useState(false);
  const MAX_AUTO_RETRIES = 3;
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

  const startWalkthrough = useCallback((isAutoRetry = false) => {
    cleanupSSE();
    
    setIsRunning(true);
    setIsApplyingFix(false);
    setCurrentStep(0);
    setProgress(0);
    setElapsedTime(0);
    setErrorDetails(null);
    setFixStatus(null);
    // Only reset retry counter for manual starts, not auto-retries
    if (!isAutoRetry) {
      setRetryCount(0);
    }
    setSteps(WALKTHROUGH_STEPS.map(s => ({ ...s, status: 'pending' })));

    try {
      // Pass autoRetry flag to backend so it knows not to reset its retry counter
      const runUrl = isAutoRetry 
        ? '/api/cto/walkthrough/run?autoRetry=true' 
        : '/api/cto/walkthrough/run';
      eventSourceRef.current = new EventSource(runUrl);

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'step_start') {
            setCurrentStep(data.stepIndex);
            // Update progress on step_start (show incremental progress)
            setProgress((data.stepIndex / WALKTHROUGH_STEPS.length) * 100);
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
            setFixStatus(null); // Clear any previous fix status
            
            // Trigger Mr Blue Self-Healing automatically with auto-retry loop
            console.log('[Mr Blue] Triggering autonomous self-healing... (Attempt', retryCount + 1, 'of', MAX_AUTO_RETRIES, ')');
            setIsAutoHealing(true);
            
            fetch('/api/cto/walkthrough/self-heal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                error: data.error,
                page: '/talent-match',
                step: WALKTHROUGH_STEPS[data.stepIndex]?.description || 'Unknown step',
                logs: [],
                retryAttempt: retryCount + 1
              })
            })
            .then(res => res.json())
            .then(healResult => {
              console.log('[Mr Blue Self-Healing] Result:', healResult);
              setIsAutoHealing(false);
              
              // Update error details with healing analysis
              if (healResult.pattern) {
                setErrorDetails((prev: any) => ({
                  ...prev,
                  mrBlueAnalysis: {
                    pattern: healResult.pattern,
                    fixResult: healResult.fixResult,
                    retryRecommended: healResult.retryRecommended,
                    agents: healResult.agents,
                    retryCount: retryCount + 1
                  }
                }));
              }
              
              // MB.MD Pattern 53: Autonomous retry loop
              // If fix was applied and retry is recommended, auto-restart the test
              if (healResult.retryRecommended && retryCount < MAX_AUTO_RETRIES - 1) {
                console.log('[Mr Blue] Auto-retry triggered! Attempt', retryCount + 2, 'of', MAX_AUTO_RETRIES);
                setRetryCount(prev => prev + 1);
                
                // Wait 2 seconds for any fixes to stabilize, then auto-restart
                setTimeout(() => {
                  console.log('[Mr Blue] Executing auto-restart...');
                  startWalkthrough(true); // Pass true for isAutoRetry
                }, 2000);
              } else if (retryCount >= MAX_AUTO_RETRIES - 1) {
                console.log('[Mr Blue] Max retries reached (', MAX_AUTO_RETRIES, '). Manual intervention required.');
                toast({
                  title: 'Self-Healing Exhausted',
                  description: `Tried ${MAX_AUTO_RETRIES} times. Manual review needed.`,
                  variant: 'destructive'
                });
              }
            })
            .catch(e => {
              console.error('[Mr Blue Self-Healing] Failed:', e);
              setIsAutoHealing(false);
            });
            
            if (onError) {
              onError({
                message: data.error,
                step: WALKTHROUGH_STEPS[data.stepIndex]?.description || 'Unknown step',
                mbmdAnalysis: data.mbmdAnalysis
              });
            }
            
            // Store error context but DON'T open chat - keep in walkthrough panel
            setSelfHealError({
              errorMessage: data.error,
              page: '/talent-match',
              mbmdAnalysis: data.mbmdAnalysis
            });
            // Removed: openChat() - errors stay in walkthrough panel
            
          } else if (data.type === 'screenshot') {
            setScreenshot(data.image);
          } else if (data.type === 'complete') {
            setProgress(100);
            setIsRunning(false);
            eventSourceRef.current?.close();
            
            // Schedule report completion after render (to avoid setState-during-render warning)
            setTimeout(() => {
              setSteps(currentSteps => {
                const successSteps = currentSteps.filter(s => s.status === 'success');
                const failedSteps = currentSteps.filter(s => s.status === 'failed');
                
                reportWalkthroughComplete({
                  success: failedSteps.length === 0,
                  testName: 'Resume Upload Test',
                  totalSteps: WALKTHROUGH_STEPS.length,
                  completedSteps: successSteps.length,
                  duration: elapsedTime,
                  steps: currentSteps.map(s => ({
                    description: s.description,
                    status: s.status === 'success' ? 'success' : 'failed',
                    duration: s.duration,
                    error: s.error,
                  })),
                  timestamp: Date.now(),
                });
                
                return currentSteps; // Don't modify state, just read it
              });
            }, 0);
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
  }, [cleanupSSE, onError, setSelfHealError]);

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
    setFixStatus(null);
    setSteps(WALKTHROUGH_STEPS.map(s => ({ ...s, status: 'pending' })));
  }, [cleanupSSE]);

  // Apply fix automatically and re-run the test
  const applyFixAndRerun = useCallback(async () => {
    if (!errorDetails?.mbmdAnalysis) {
      startWalkthrough();
      return;
    }

    setIsApplyingFix(true);
    setFixStatus('Applying fix...');
    
    try {
      const response = await fetch('/api/cto/walkthrough/apply-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: errorDetails.mbmdAnalysis.mbmdPattern,
          error: errorDetails.error,
          rootCause: errorDetails.mbmdAnalysis.rootCause,
          recommendedFix: errorDetails.mbmdAnalysis.recommendedFix
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFixStatus(`Fix applied: ${data.message}`);
        toast({
          title: "Fix Applied",
          description: data.message || "Attempting to fix the issue...",
        });
        
        // Wait a moment for server changes to take effect, then re-run
        setTimeout(() => {
          setFixStatus('Re-running test...');
          startWalkthrough();
        }, 1500);
      } else {
        setFixStatus(`Fix failed: ${data.error || 'Unknown error'}`);
        toast({
          title: "Fix Failed",
          description: data.error || "Could not apply fix automatically",
          variant: "destructive"
        });
        setIsApplyingFix(false);
      }
    } catch (error: any) {
      setFixStatus(`Fix error: ${error.message}`);
      toast({
        title: "Fix Error",
        description: error.message || "Network error while applying fix",
        variant: "destructive"
      });
      setIsApplyingFix(false);
    }
  }, [errorDetails, startWalkthrough, toast]);

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

              {/* Fix status display */}
              {fixStatus && (
                <div className="mt-3 p-2 rounded bg-muted/50 border">
                  <div className="flex items-center gap-2 text-sm">
                    {isApplyingFix && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    {!isApplyingFix && fixStatus.includes('applied') && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {!isApplyingFix && fixStatus.includes('failed') && <XCircle className="w-4 h-4 text-destructive" />}
                    <span className="text-muted-foreground">{fixStatus}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                {!isRunning && !isApplyingFix ? (
                  <Button 
                    onClick={errorDetails?.mbmdAnalysis ? applyFixAndRerun : startWalkthrough} 
                    className="flex-1"
                    data-testid="button-start-walkthrough"
                  >
                    {errorDetails?.mbmdAnalysis ? (
                      <>
                        <Wrench className="w-4 h-4 mr-2" />
                        Apply Fix & Re-run
                      </>
                    ) : progress > 0 ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restart Walkthrough
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Walkthrough
                      </>
                    )}
                  </Button>
                ) : isApplyingFix ? (
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1"
                    data-testid="button-applying-fix"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying Fix...
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
                    {isAutoHealing ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <p className="text-xs font-medium">
                          Mr. Blue is self-healing... Attempt {retryCount + 1} of {MAX_AUTO_RETRIES}
                        </p>
                      </div>
                    ) : retryCount > 0 && retryCount < MAX_AUTO_RETRIES ? (
                      <div className="flex items-center justify-center gap-2 text-amber-500">
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <p className="text-xs font-medium">
                          Auto-retrying in 2s... (Attempt {retryCount + 1} of {MAX_AUTO_RETRIES})
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Mr. Blue is analyzing the issue...
                      </p>
                    )}
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
                    {errorDetails.mbmdAnalysis.fixSteps && (
                      <div className="mt-3 pt-2 border-t border-destructive/20">
                        <p className="font-semibold mb-1">Fix Steps:</p>
                        <ul className="space-y-1 text-muted-foreground">
                          {errorDetails.mbmdAnalysis.fixSteps.map((step: string, i: number) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-primary">{'\u2022'}</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
