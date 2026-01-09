/**
 * DiagnosisSummary - Mr. Blue's analysis of the bug context
 * Shows detected issues, suggested fixes, and related files
 * MB.MD Pattern 67: Universal Bug Diagnostic System
 */

import { 
  Brain, 
  FileCode, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiagnosticContext } from '@/lib/qa/componentRegistry';
import { 
  findMatchingBugPatterns, 
  findComponentForTestId,
  generateDiagnosisSummary 
} from '@/lib/qa/componentRegistry';

interface DiagnosisSummaryProps {
  context: DiagnosticContext;
  showRaw?: boolean;
}

export function DiagnosisSummary({ context, showRaw = false }: DiagnosisSummaryProps) {
  const matchedPatterns = findMatchingBugPatterns(context);
  const componentInfo = context.testId ? findComponentForTestId(context.testId) : null;
  
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
