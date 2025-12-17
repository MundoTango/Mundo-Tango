/**
 * PAGE AUDIT PANEL - MB.MD PROTOCOL v9.2
 * November 20, 2025
 * 
 * UI for page auditing in Mr. Blue Visual Editor
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, FileCode, AlertCircle, CheckCircle, Info, Wrench, Zap } from 'lucide-react';

interface AuditCategory {
  id: string;
  name: string;
  description: string;
}

interface AuditIssue {
  category: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  location: {
    file: string;
    line?: number;
  };
  expected: string;
  actual: string;
  docReference?: string;
  autoFixable: boolean;
}

interface AuditReport {
  pagePath: string;
  pageType: string;
  totalIssues: number;
  critical: number;
  errors: number;
  warnings: number;
  info: number;
  autoFixableCount: number;
  issues: AuditIssue[];
  patterns: {
    hasUseQuery: boolean;
    hasUseForm: boolean;
    hasCard: boolean;
    hasAppLayout: boolean;
    hasDataTestIds: boolean;
  };
  recommendations: string[];
}

export function PageAuditPanel() {
  const { toast } = useToast();
  const [pagePath, setPagePath] = useState('client/src/pages/');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [handoffReference, setHandoffReference] = useState('');
  const [autoFix, setAutoFix] = useState(false);
  const [currentReport, setCurrentReport] = useState<AuditReport | null>(null);

  // Fetch available categories
  const { data: categoriesData } = useQuery<{ categories: AuditCategory[] }>({
    queryKey: ['/api/page-audit/categories']
  });

  // Audit mutation
  const auditMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/page-audit/audit', {
        method: 'POST',
        body: JSON.stringify({
          pagePath,
          category: selectedCategory,
          handoffReference: handoffReference || undefined,
          autoFix
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data: any) => {
      setCurrentReport(data.report);
      toast({
        title: '🔍 Audit Complete',
        description: `Found ${data.report.totalIssues} issues (${data.report.autoFixableCount} auto-fixable)`
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ Audit Failed',
        description: error.message || 'Failed to audit page',
        variant: 'destructive'
      });
    }
  });

  // Auto-fix mutation
  const autoFixMutation = useMutation({
    mutationFn: async (report: AuditReport) => {
      return await apiRequest('/api/page-audit/auto-fix', {
        method: 'POST',
        body: JSON.stringify({ report }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: '🔧 Auto-fix Complete',
        description: `Fixed ${data.fixed} issues, ${data.failed} failed`
      });
      // Re-run audit
      auditMutation.mutate();
    },
    onError: (error: any) => {
      toast({
        title: '❌ Auto-fix Failed',
        description: error.message || 'Failed to auto-fix issues',
        variant: 'destructive'
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <Info className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          Page Audit System
        </h2>
        <p className="text-muted-foreground mt-2">
          12-category comprehensive page auditing with AI-powered analysis
        </p>
      </div>

      {/* Audit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Configuration</CardTitle>
          <CardDescription>
            Analyze any page for issues across 12 categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="page-path">Page Path</Label>
            <Input
              id="page-path"
              data-testid="input-page-path"
              placeholder="client/src/pages/EventsPage.tsx"
              value={pagePath}
              onChange={(e) => setPagePath(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Relative path from project root
            </p>
          </div>

          <div>
            <Label htmlFor="category">Audit Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories (12)</SelectItem>
                {categoriesData?.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="handoff">Handoff Reference (Optional)</Label>
            <Input
              id="handoff"
              data-testid="input-handoff"
              placeholder="ULTIMATE_ZERO_TO_DEPLOY_PART_10"
              value={handoffReference}
              onChange={(e) => setHandoffReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Validate against specific handoff documentation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-fix"
              data-testid="checkbox-auto-fix"
              checked={autoFix}
              onCheckedChange={(checked) => setAutoFix(checked as boolean)}
            />
            <Label htmlFor="auto-fix" className="cursor-pointer">
              Enable AI-powered deep audit (GROQ Llama-3.3-70b)
            </Label>
          </div>

          <Button
            data-testid="button-audit-page"
            onClick={() => auditMutation.mutate()}
            disabled={auditMutation.isPending || !pagePath}
            className="w-full"
          >
            {auditMutation.isPending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Auditing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Audit Page
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audit Report */}
      {currentReport && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Audit Report</span>
                <Badge variant="outline">
                  {currentReport.pageType}
                </Badge>
              </CardTitle>
              <CardDescription>{currentReport.pagePath}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-2xl font-bold">{currentReport.totalIssues}</div>
                  <div className="text-xs text-muted-foreground">Total Issues</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{currentReport.critical}</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive">{currentReport.errors}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{currentReport.warnings}</div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{currentReport.info}</div>
                  <div className="text-xs text-muted-foreground">Info</div>
                </div>
              </div>

              {/* Patterns */}
              <div>
                <h4 className="font-semibold mb-2">Detected Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={currentReport.patterns.hasUseQuery ? 'default' : 'outline'}>
                    useQuery {currentReport.patterns.hasUseQuery ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={currentReport.patterns.hasUseForm ? 'default' : 'outline'}>
                    useForm {currentReport.patterns.hasUseForm ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={currentReport.patterns.hasCard ? 'default' : 'outline'}>
                    Card {currentReport.patterns.hasCard ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={currentReport.patterns.hasAppLayout ? 'default' : 'outline'}>
                    Layout {currentReport.patterns.hasAppLayout ? '✓' : '✗'}
                  </Badge>
                  <Badge variant={currentReport.patterns.hasDataTestIds ? 'default' : 'outline'}>
                    data-testid {currentReport.patterns.hasDataTestIds ? '✓' : '✗'}
                  </Badge>
                </div>
              </div>

              {/* Auto-fix button */}
              {currentReport.autoFixableCount > 0 && (
                <Button
                  data-testid="button-auto-fix"
                  onClick={() => autoFixMutation.mutate(currentReport)}
                  disabled={autoFixMutation.isPending}
                  variant="default"
                  className="w-full"
                >
                  {autoFixMutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Fixing...
                    </>
                  ) : (
                    <>
                      <Wrench className="mr-2 h-4 w-4" />
                      Auto-fix {currentReport.autoFixableCount} Issues
                    </>
                  )}
                </Button>
              )}

              {/* Recommendations */}
              {currentReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Recommendations
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {currentReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues List */}
          {currentReport.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues ({currentReport.issues.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentReport.issues.map((issue, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2 flex-1">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <div className="font-semibold">{issue.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {issue.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        {issue.autoFixable && (
                          <Badge variant="outline">
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-muted-foreground">Expected</div>
                        <div className="font-mono mt-1 bg-muted p-2 rounded">
                          {issue.expected}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-muted-foreground">Actual</div>
                        <div className="font-mono mt-1 bg-muted p-2 rounded">
                          {issue.actual}
                        </div>
                      </div>
                    </div>

                    {issue.docReference && (
                      <div className="text-xs text-muted-foreground">
                        <FileCode className="inline h-3 w-3 mr-1" />
                        Reference: {issue.docReference}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {currentReport.issues.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Issues Found! 🎉</h3>
                <p className="text-muted-foreground">
                  This page passes all audit checks
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
