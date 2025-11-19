import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertCircle, Wrench, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AuditIssue {
  category: 'ui_ux' | 'routing' | 'integration' | 'performance' | 'accessibility' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  suggestedFix: string;
  agentId: string;
}

interface AuditResults {
  pageId: string;
  timestamp: Date;
  totalIssues: number;
  criticalIssues: number;
  issuesByCategory: {
    ui_ux: AuditIssue[];
    routing: AuditIssue[];
    integration: AuditIssue[];
    performance: AuditIssue[];
    accessibility: AuditIssue[];
    security: AuditIssue[];
  };
  hasIssues: boolean;
  auditDurationMs: number;
}

interface AuditResultsPanelProps {
  results: AuditResults | null;
  onFixAll?: () => void;
  loading?: boolean;
}

export function AuditResultsPanel({ results, onFixAll, loading }: AuditResultsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  const getSeverityColor = (severity: AuditIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };
  
  const getSeverityIcon = (severity: AuditIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-3 h-3" />;
      case 'high':
        return <AlertCircle className="w-3 h-3" />;
      case 'medium':
        return <Info className="w-3 h-3" />;
      case 'low':
        return <CheckCircle2 className="w-3 h-3" />;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    const icons = {
      ui_ux: '🎨',
      routing: '🔀',
      integration: '🔌',
      performance: '⚡',
      accessibility: '♿',
      security: '🔒',
    };
    return icons[category as keyof typeof icons] || '📋';
  };
  
  if (!results) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground" data-testid="audit-results-empty">
        No audit results available. Run an audit to see findings.
      </div>
    );
  }
  
  return (
    <div className="border-t border-border" data-testid="audit-results-panel">
      {/* Summary Header */}
      <div className="px-3 py-3 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Audit Results</h3>
          <Badge variant="outline" className="text-xs">
            {results.auditDurationMs}ms
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Total:</span>
            <Badge variant="secondary" data-testid="total-issues">
              {results.totalIssues}
            </Badge>
          </div>
          
          {results.criticalIssues > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-destructive" />
              <span className="text-destructive font-medium" data-testid="critical-issues">
                {results.criticalIssues} Critical
              </span>
            </div>
          )}
          
          {!results.hasIssues && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span className="font-medium">No Issues</span>
            </div>
          )}
        </div>
        
        {results.hasIssues && onFixAll && (
          <Button
            size="sm"
            className="w-full mt-3"
            onClick={onFixAll}
            disabled={loading}
            data-testid="button-fix-all"
          >
            <Wrench className="w-3 h-3 mr-2" />
            Fix All Issues
          </Button>
        )}
      </div>
      
      {/* Issues by Category */}
      <ScrollArea className="max-h-[400px]">
        <div className="divide-y divide-border">
          {Object.entries(results.issuesByCategory).map(([category, issues]) => {
            if (issues.length === 0) return null;
            
            const isExpanded = expandedCategories.has(category);
            
            return (
              <Collapsible
                key={category}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-3 py-2 h-auto hover-elevate"
                    data-testid={`category-${category}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getCategoryIcon(category)}</span>
                      <span className="text-sm font-medium capitalize">
                        {category.replace('_', ' / ')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {issues.length}
                      </Badge>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-3 py-2 space-y-2">
                    {issues.map((issue, index) => (
                      <div
                        key={`${category}-${index}`}
                        className="p-3 rounded-md bg-muted/20 border border-border space-y-2"
                        data-testid={`issue-${category}-${index}`}
                      >
                        <div className="flex items-start gap-2">
                          <Badge
                            variant={getSeverityColor(issue.severity)}
                            className="text-xs mt-0.5"
                          >
                            {getSeverityIcon(issue.severity)}
                            <span className="ml-1">{issue.severity}</span>
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">
                              {issue.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              📍 {issue.location}
                            </p>
                          </div>
                        </div>
                        
                        <div className="pl-2 border-l-2 border-primary/30 text-xs">
                          <div className="flex items-start gap-1">
                            <Wrench className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">Suggested fix:</span>{' '}
                              {issue.suggestedFix}
                            </span>
                          </div>
                          <code className="text-xs text-muted-foreground mt-1 block">
                            Agent: {issue.agentId}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
