/**
 * DiagnosisSummary - Mr. Blue's analysis of the bug context
 * Shows detected issues, suggested fixes, and related files
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 * 
 * Enhanced with Auto-Fix capabilities - connects diagnostics to AutoFixEngine
 */

import { useState } from 'react';
import { 
  Brain, 
  FileCode, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Wrench,
  Loader2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { DiagnosticContext } from '@/lib/qa/componentRegistry';
import { 
  findMatchingBugPatterns, 
  findComponentForTestId,
  generateDiagnosisSummary,
  type BugPattern
} from '@/lib/qa/componentRegistry';

interface AutoFixResult {
  success: boolean;
  decision?: {
    action: 'auto-fix' | 'request-approval' | 'manual-review';
    confidence: number;
    reasoning: string;
  };
  fixAnalysis?: {
    rootCause: string;
    suggestedFix: string;
    affectedFiles: string[];
    estimatedComplexity: string;
    confidence: number;
  };
  error?: string;
  errorPatternId?: number;
}

interface DiagnosisSummaryProps {
  context: DiagnosticContext;
  showRaw?: boolean;
  onAutoFixAttempt?: (pattern: BugPattern, result: AutoFixResult) => void;
}

export function DiagnosisSummary({ context, showRaw = false, onAutoFixAttempt }: DiagnosisSummaryProps) {
  const { toast } = useToast();
  const [fixingPatternId, setFixingPatternId] = useState<string | null>(null);
  const [fixResults, setFixResults] = useState<Record<string, AutoFixResult>>({});
  
  const matchedPatterns = findMatchingBugPatterns(context);
  const componentInfo = context.testId ? findComponentForTestId(context.testId) : null;

  const handleAutoFix = async (pattern: BugPattern) => {
    setFixingPatternId(pattern.id);
    
    try {
      const response = await apiRequest('POST', '/api/mrblue/diagnostic-auto-fix', {
        patternId: pattern.id,
        diagnosis: pattern.diagnosis,
        suggestedFix: pattern.suggestedFix,
        relatedFiles: pattern.relatedFiles,
        severity: pattern.severity,
        context: {
          errors: context.errors,
          apiCalls: context.apiCalls,
          testId: context.testId,
          breadcrumb: context.breadcrumb,
          userContext: context.userContext
        }
      });

      const result: AutoFixResult = await response.json();
      setFixResults(prev => ({ ...prev, [pattern.id]: result }));
      
      if (result.success) {
        if (result.decision?.action === 'auto-fix') {
          toast({
            title: "Fix Applied",
            description: `Auto-fix applied with ${result.decision.confidence}% confidence`,
          });
        } else if (result.decision?.action === 'request-approval') {
          toast({
            title: "Fix Pending Approval",
            description: "Fix requires admin approval before applying",
          });
        }
      } else {
        toast({
          title: "Auto-Fix Failed",
          description: result.error || "Unable to generate fix",
          variant: "destructive",
        });
      }
      
      onAutoFixAttempt?.(pattern, result);
    } catch (error: any) {
      const errorResult: AutoFixResult = { success: false, error: error.message };
      setFixResults(prev => ({ ...prev, [pattern.id]: errorResult }));
      toast({
        title: "Auto-Fix Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFixingPatternId(null);
    }
  };
  
  const hasIssues = matchedPatterns.length > 0 || context.errors.length > 0;
  
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2 text-base font-medium">
        <Brain className="h-5 w-5 text-primary" />
        <span>Mr. Blue Analysis</span>
        {hasIssues ? (
          <span className="ml-auto text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
            Issues Detected
          </span>
        ) : (
          <span className="ml-auto text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
            No Issues Found
          </span>
        )}
      </div>
      
      {componentInfo && (
        <div className="p-2 bg-muted rounded-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <FileCode className="h-3 w-3" />
            <span>Location Identified</span>
          </div>
          <div className="font-mono text-xs">
            <span className="text-primary">{componentInfo.file}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Component: {componentInfo.component}
            {componentInfo.section && ` → ${componentInfo.section}`}
          </div>
          {componentInfo.relatedAPIs && componentInfo.relatedAPIs.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              APIs: {componentInfo.relatedAPIs.join(', ')}
            </div>
          )}
        </div>
      )}
      
      {context.breadcrumb.length > 0 && (
        <div className="p-2 bg-muted rounded-md">
          <div className="text-xs text-muted-foreground mb-1">User Path</div>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {context.breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="px-2 py-0.5 bg-background rounded">
                  {item}
                </span>
                {idx < context.breadcrumb.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {matchedPatterns.length > 0 && (
        <div className="space-y-2">
          {matchedPatterns.map((pattern, idx) => (
            <div 
              key={pattern.id}
              className={cn(
                "p-3 rounded-md border",
                pattern.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                pattern.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                pattern.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                'bg-muted border-border'
              )}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className={cn(
                  "h-4 w-4 mt-0.5",
                  pattern.severity === 'critical' ? 'text-red-500' :
                  pattern.severity === 'high' ? 'text-orange-500' :
                  'text-yellow-500'
                )} />
                <div className="flex-1">
                  <div className="text-xs font-medium uppercase text-muted-foreground mb-1">
                    {pattern.severity} priority
                  </div>
                  <p className="text-sm">{pattern.diagnosis}</p>
                </div>
              </div>
              
              <div className="mt-2 pl-6">
                <div className="flex items-start gap-2 text-xs">
                  <Lightbulb className="h-3 w-3 mt-0.5 text-green-500" />
                  <span className="text-green-400">{pattern.suggestedFix}</span>
                </div>
                
                {pattern.relatedFiles.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span>Related files: </span>
                    <span className="font-mono">{pattern.relatedFiles.join(', ')}</span>
                  </div>
                )}
                
                {fixResults[pattern.id] ? (
                  <div className={cn(
                    "mt-3 p-2 rounded-md text-xs",
                    fixResults[pattern.id].success 
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-red-500/10 border border-red-500/30"
                  )}>
                    {fixResults[pattern.id].success ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {fixResults[pattern.id].decision?.action === 'auto-fix' ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : fixResults[pattern.id].decision?.action === 'request-approval' ? (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          ) : (
                            <Sparkles className="h-3 w-3 text-blue-500" />
                          )}
                          <span className={cn(
                            fixResults[pattern.id].decision?.action === 'auto-fix' ? "text-green-400" :
                            fixResults[pattern.id].decision?.action === 'request-approval' ? "text-yellow-400" :
                            "text-blue-400"
                          )}>
                            {fixResults[pattern.id].decision?.action === 'auto-fix' 
                              ? `Fix Applied (${fixResults[pattern.id].decision?.confidence}% confidence)`
                              : fixResults[pattern.id].decision?.action === 'request-approval'
                              ? `Pending Admin Approval (${fixResults[pattern.id].decision?.confidence}% confidence)`
                              : `Manual Review Required (${fixResults[pattern.id].decision?.confidence}% confidence)`
                            }
                          </span>
                        </div>
                        {fixResults[pattern.id].fixAnalysis && (
                          <div className="text-muted-foreground">
                            Root cause: {fixResults[pattern.id].fixAnalysis?.rootCause}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="h-3 w-3" />
                        <span>{fixResults[pattern.id].error || 'Fix failed'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5 border-primary/30 hover:bg-primary/10"
                      onClick={() => handleAutoFix(pattern)}
                      disabled={fixingPatternId === pattern.id}
                      data-testid={`button-auto-fix-${pattern.id}`}
                    >
                      {fixingPatternId === pattern.id ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Wrench className="h-3 w-3" />
                          Try Auto-Fix
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!hasIssues && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
          <div>
            <p className="text-sm">No known issues detected in the captured context.</p>
            <p className="text-xs text-muted-foreground mt-1">
              The bug may require manual investigation. Your description and journey data will help developers identify the issue.
            </p>
          </div>
        </div>
      )}
      
      {showRaw && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            View Raw Diagnostic Data
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto max-h-48 overflow-y-auto">
            {generateDiagnosisSummary(context)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default DiagnosisSummary;
