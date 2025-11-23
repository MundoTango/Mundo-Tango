/**
 * Backend Save Progress Modal
 * MB.MD v9.3 - Shows progress during backend agent work
 * 
 * Displays:
 * - Current phase (Schema, API, Security, Service)
 * - Progress bar
 * - Files being modified
 * - Success/error messages
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Loader2, AlertCircle, Database, Code2, Shield, Cog, GitCommit, RefreshCw } from "lucide-react";

export interface BackendSaveProgress {
  phase: 'analyzing' | 'schema' | 'api' | 'security' | 'service' | 'committing' | 'restarting' | 'complete';
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  agentsWorking: string[];
  filesModified: string[];
  errors: string[];
}

interface BackendSaveProgressModalProps {
  open: boolean;
  progress: BackendSaveProgress | null;
  onClose?: () => void;
}

const PHASE_ICONS = {
  analyzing: Loader2,
  schema: Database,
  api: Code2,
  security: Shield,
  service: Cog,
  committing: GitCommit,
  restarting: RefreshCw,
  complete: CheckCircle2,
};

const PHASE_LABELS = {
  analyzing: 'Analyzing Changes',
  schema: 'Updating Database Schema',
  api: 'Updating API Routes',
  security: 'Updating Security',
  service: 'Updating Services',
  committing: 'Committing to Git',
  restarting: 'Restarting Application',
  complete: 'Complete!',
};

export function BackendSaveProgressModal({
  open,
  progress,
  onClose,
}: BackendSaveProgressModalProps) {
  if (!progress) return null;

  const Icon = PHASE_ICONS[progress.phase];
  const phaseLabel = PHASE_LABELS[progress.phase];
  const percentComplete = (progress.completedSteps / progress.totalSteps) * 100;
  const isComplete = progress.phase === 'complete';
  const hasErrors = progress.errors.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : hasErrors ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <Icon className="h-5 w-5 animate-spin" />
            )}
            {isComplete ? 'Backend Save Complete' : 'Saving Backend Changes'}
          </DialogTitle>
          <DialogDescription>
            {isComplete 
              ? 'All backend changes have been applied successfully'
              : 'Processing backend agents to apply your UI changes'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{phaseLabel}</span>
              <span className="font-medium">{progress.completedSteps}/{progress.totalSteps}</span>
            </div>
            <Progress value={percentComplete} className="h-2" />
          </div>

          {/* Current Step */}
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">{progress.currentStep}</p>
          </div>

          {/* Active Agents */}
          {progress.agentsWorking.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Agents:</p>
              <div className="flex flex-wrap gap-2">
                {progress.agentsWorking.map((agent) => (
                  <Badge key={agent} variant="secondary" className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {agent}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Files Modified */}
          {progress.filesModified.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Files Modified ({progress.filesModified.length}):</p>
              <ScrollArea className="h-24 rounded-md border">
                <div className="p-2 space-y-1">
                  {progress.filesModified.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <code className="text-muted-foreground">{file}</code>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Errors */}
          {hasErrors && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">Errors:</p>
              <ScrollArea className="h-24 rounded-md border border-destructive/20 bg-destructive/10">
                <div className="p-2 space-y-1">
                  {progress.errors.map((error, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <AlertCircle className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">{error}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
