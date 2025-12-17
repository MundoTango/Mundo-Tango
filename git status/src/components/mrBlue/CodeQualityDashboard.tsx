import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, AlertTriangle, Shield, Zap, Code, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CodeIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  category: string;
  autoFixable: boolean;
}

interface SecurityVulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  package?: string;
  fix?: string;
}

interface PerformanceIssue {
  type: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
}

interface QualityReport {
  score: number;
  issues: CodeIssue[];
  securityReport: {
    vulnerabilities: SecurityVulnerability[];
    score: number;
  };
  performanceIssues: PerformanceIssue[];
  linesOfCode: number;
  filesScanned: number;
  timestamp: string;
}

export function CodeQualityDashboard() {
  const { toast } = useToast();
  const [filePath, setFilePath] = useState('');
  const [report, setReport] = useState<QualityReport | null>(null);

  // Mutation: Validate code quality
  const validateMutation = useMutation({
    mutationFn: async (path: string) => {
      return await apiRequest('/api/mrblue/quality/validate', {
        method: 'POST',
        body: { filePath: path || undefined }
      });
    },
    onSuccess: (data) => {
      setReport(data);
      toast({
        title: 'Quality Analysis Complete',
        description: `Scanned ${data.filesScanned} files, found ${data.issues.length} issues.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Analysis Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation: Security scan
  const securityScanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/mrblue/quality/security', {
        method: 'POST',
        body: {}
      });
    },
    onSuccess: (data) => {
      if (report) {
        setReport({
          ...report,
          securityReport: data
        });
      }
      toast({
        title: 'Security Scan Complete',
        description: `Found ${data.vulnerabilities.length} vulnerabilities.`,
      });
    }
  });

  // Mutation: Performance analysis
  const performanceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/mrblue/quality/performance', {
        method: 'POST',
        body: {}
      });
    },
    onSuccess: (data) => {
      if (report) {
        setReport({
          ...report,
          performanceIssues: data.issues
        });
      }
      toast({
        title: 'Performance Analysis Complete',
        description: `Found ${data.issues.length} optimization opportunities.`,
      });
    }
  });

  const handleValidate = () => {
    validateMutation.mutate(filePath);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const autoFixableCount = report?.issues.filter(i => i.autoFixable).length || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="panel-code-quality">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Code className="h-6 w-6" />
              Code Quality Dashboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered code analysis and security scanning
            </p>
          </div>
          {report && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Quality Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}/100
                </p>
              </div>
              <div className="h-24 w-24 relative">
                <svg className="transform -rotate-90 h-24 w-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - report.score / 100)}`}
                    className={getScoreColor(report.score)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${getScoreColor(report.score)}`}>
                    {report.score}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Scan Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Run Analysis</CardTitle>
              <CardDescription>Scan your codebase for quality, security, and performance issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>File Path (optional)</Label>
                  <Input
                    placeholder="Leave empty to scan entire project"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    data-testid="input-file-path"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleValidate}
                  disabled={validateMutation.isPending}
                  data-testid="button-validate"
                >
                  <Code className="h-4 w-4 mr-2" />
                  {validateMutation.isPending ? 'Analyzing...' : 'Run Quality Scan'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => securityScanMutation.mutate()}
                  disabled={securityScanMutation.isPending || !report}
                  data-testid="button-security-scan"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {securityScanMutation.isPending ? 'Scanning...' : 'Security Scan'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => performanceMutation.mutate()}
                  disabled={performanceMutation.isPending || !report}
                  data-testid="button-performance"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {performanceMutation.isPending ? 'Analyzing...' : 'Performance'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {report && (
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="issues" data-testid="tab-issues">
                  Issues ({report.issues.length})
                </TabsTrigger>
                <TabsTrigger value="security" data-testid="tab-security">
                  Security ({report.securityReport.vulnerabilities.length})
                </TabsTrigger>
                <TabsTrigger value="performance" data-testid="tab-performance">
                  Performance ({report.performanceIssues.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Code Issues</CardTitle>
                        <CardDescription>
                          {autoFixableCount > 0 && `${autoFixableCount} issues can be auto-fixed`}
                        </CardDescription>
                      </div>
                      {autoFixableCount > 0 && (
                        <Button size="sm" data-testid="button-auto-fix">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Auto-Fix ({autoFixableCount})
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {report.issues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
                          <p className="text-sm">No issues found!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {report.issues.map((issue, index) => (
                            <div key={index}>
                              {index > 0 && <Separator className="my-2" />}
                              <div className="flex gap-3" data-testid={`issue-${index}`}>
                                {getSeverityIcon(issue.severity)}
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{issue.message}</p>
                                    {issue.autoFixable && (
                                      <Badge variant="secondary" className="text-xs">Auto-fixable</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {issue.file}:{issue.line} • {issue.category}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Vulnerabilities</CardTitle>
                    <CardDescription>
                      Security score: {report.securityReport.score}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {report.securityReport.vulnerabilities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <Shield className="h-8 w-8 mb-2 text-green-500" />
                          <p className="text-sm">No vulnerabilities detected</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {report.securityReport.vulnerabilities.map((vuln, index) => (
                            <div key={index}>
                              {index > 0 && <Separator className="my-2" />}
                              <div className="flex gap-3" data-testid={`vulnerability-${index}`}>
                                {getSeverityIcon(vuln.severity)}
                                <div className="flex-1 space-y-1">
                                  <p className="font-medium text-sm">{vuln.title}</p>
                                  <p className="text-sm text-muted-foreground">{vuln.description}</p>
                                  {vuln.package && (
                                    <p className="text-xs text-muted-foreground">Package: {vuln.package}</p>
                                  )}
                                  {vuln.fix && (
                                    <p className="text-xs text-primary">Fix: {vuln.fix}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Optimizations</CardTitle>
                    <CardDescription>Opportunities to improve performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {report.performanceIssues.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <Zap className="h-8 w-8 mb-2 text-green-500" />
                          <p className="text-sm">No performance issues found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {report.performanceIssues.map((issue, index) => (
                            <div key={index}>
                              {index > 0 && <Separator className="my-2" />}
                              <div className="space-y-2" data-testid={`performance-issue-${index}`}>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{issue.type}</p>
                                  <Badge
                                    variant={
                                      issue.impact === 'high' ? 'destructive' :
                                      issue.impact === 'medium' ? 'default' :
                                      'secondary'
                                    }
                                  >
                                    {issue.impact} impact
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{issue.description}</p>
                                <p className="text-sm text-primary">💡 {issue.suggestion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Stats */}
          {report && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Files Scanned</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{report.filesScanned}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lines of Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{report.linesOfCode.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Last Scan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{new Date(report.timestamp).toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
