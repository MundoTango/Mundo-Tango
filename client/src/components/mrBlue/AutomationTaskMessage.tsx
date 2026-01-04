import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, XCircle, ExternalLink, Image } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AutomationTaskMessageProps {
  taskId: string;
  automationType: string;
  initialStatus?: string;
  pollUrl?: string;
}

interface TaskStatus {
  taskId: string;
  instruction: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires_approval';
  currentStep: number;
  maxSteps: number;
  steps: Array<{
    step: number;
    action: string;
  }>;
  result?: any;
  error?: string;
  screenshots?: Array<{
    stepNumber: number;
    screenshotBase64: string;
    action: { description: string };
  }>;
}

export function AutomationTaskMessage({
  taskId,
  automationType,
  initialStatus = 'running',
  pollUrl
}: AutomationTaskMessageProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<number | null>(null);
  
  // Poll task status every 3 seconds
  const { data: taskStatus, isLoading } = useQuery<TaskStatus>({
    queryKey: ['/api/computer-use/task', taskId],
    refetchInterval: (data) => {
      // Stop polling if task is completed or failed
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        return false;
      }
      return 3000; // Poll every 3 seconds
    },
    enabled: !!taskId
  });

  const status = taskStatus?.status || initialStatus;
  const progress = taskStatus ? (taskStatus.currentStep / taskStatus.maxSteps) * 100 : 0;

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="border-2" data-testid={`automation-task-${taskId}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon()}
            {automationType === 'wix_extraction' ? 'Wix Contact Extraction' : 'Automation Task'}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        {status === 'running' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {taskStatus?.currentStep || 0} of {taskStatus?.maxSteps || 0}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full ${getStatusColor()} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Steps */}
        {taskStatus?.steps && taskStatus.steps.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Recent Actions:</p>
            <ScrollArea className="h-20">
              <div className="space-y-1">
                {taskStatus.steps.slice(-5).map((step, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 bg-secondary/50 rounded flex items-start gap-2"
                  >
                    <span className="text-muted-foreground min-w-[3ch]">{step.step}.</span>
                    <span>{step.action}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Error Message */}
        {status === 'failed' && taskStatus?.error && (
          <div className="text-xs p-2 bg-destructive/10 text-destructive rounded">
            <p className="font-medium">Error:</p>
            <p>{taskStatus.error}</p>
          </div>
        )}

        {/* Success Result */}
        {status === 'completed' && taskStatus?.result && (
          <div className="text-xs p-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded">
            <p className="font-medium">✅ Extraction Complete!</p>
            {taskStatus.result.contacts && (
              <p className="mt-1">Found {taskStatus.result.contacts.length} contacts</p>
            )}
            {taskStatus.result.csvPath && (
              <p className="mt-1">Saved to: {taskStatus.result.csvPath}</p>
            )}
          </div>
        )}

        {/* Screenshots */}
        {taskStatus?.screenshots && taskStatus.screenshots.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Image className="h-3 w-3" />
              Screenshots ({taskStatus.screenshots.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {taskStatus.screenshots.slice(-6).map((screenshot, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedScreenshot(screenshot.stepNumber)}
                  className="relative aspect-video rounded overflow-hidden border hover:border-primary transition-colors"
                  data-testid={`screenshot-${screenshot.stepNumber}`}
                >
                  <img
                    src={`data:image/png;base64,${screenshot.screenshotBase64}`}
                    alt={`Step ${screenshot.stepNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1">
                    Step {screenshot.stepNumber}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Task Link */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          asChild
          data-testid="button-view-full-task"
        >
          <a href={`/mr-blue-chat?tab=computer-use&task=${taskId}`} target="_blank" rel="noopener noreferrer">
            View Full Task Details
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </CardContent>

      {/* Screenshot Modal */}
      {selectedScreenshot !== null && taskStatus?.screenshots && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
          data-testid="screenshot-modal"
        >
          <div className="max-w-4xl max-h-full">
            {taskStatus.screenshots
              .filter(s => s.stepNumber === selectedScreenshot)
              .map((screenshot, idx) => (
                <div key={idx} className="space-y-2">
                  <img
                    src={`data:image/png;base64,${screenshot.screenshotBase64}`}
                    alt={`Step ${screenshot.stepNumber}`}
                    className="max-w-full max-h-[80vh] rounded"
                  />
                  <p className="text-center text-white text-sm">
                    {screenshot.action.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
