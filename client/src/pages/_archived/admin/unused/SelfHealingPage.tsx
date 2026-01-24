import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { useTranslation } from 'react-i18next';

interface PageHealth {
  id: number;
  page_path: string;
  status: 'healthy' | 'unhealthy';
  last_checked_at: string;
  error_details?: string;
  fix_suggested?: string;
  fix_applied?: boolean;
}

/**
 * BLOCKER 5: Self-Healing System Dashboard
 * 
 * Super Admin-only page for monitoring automated page validation:
 * - View all page health statuses
 * - Inspect validation issues
 * - Trigger manual scans
 * - Review AI-generated fixes
 */
export default function SelfHealingPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);

  // Fetch page health data
  const { data: pageHealth = [], isLoading } = useQuery<PageHealth[]>({
    queryKey: ['/api/admin/self-healing/dashboard'],
  });

  // Trigger manual scan
  const handleScan = async () => {
    setScanning(true);
    try {
      const response = await apiRequest('POST', '/api/admin/self-healing/scan');
      const result = await response.json();
      
      toast({
        title: t('pages:agents.scanCompleted', 'Scan completed'),
        description: t('pages:agents.scanDescription', 'Scanned {{scanned}} pages. {{healthy}} healthy, {{unhealthy}} unhealthy.', { 
          scanned: result.scanned, 
          healthy: result.healthy, 
          unhealthy: result.unhealthy 
        }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/self-healing/dashboard'] });
    } catch (error: any) {
      toast({
        title: t('pages:agents.scanFailed', 'Scan failed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const healthyPages = pageHealth.filter(p => p.status === 'healthy').length;
  const unhealthyPages = pageHealth.filter(p => p.status === 'unhealthy').length;

  return (
    <SelfHealingErrorBoundary pageName={t('pages:agents.selfHealingDashboard', 'Self-Healing Dashboard')} fallbackRoute="/platform">
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('pages:agents.selfHealingDashboard', 'Self-Healing Dashboard')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('pages:agents.automatedValidation', 'Automated page validation with Playwright + AI fixes')}
          </p>
        </div>
        <Button 
          onClick={handleScan} 
          disabled={scanning}
          data-testid="button-scan-pages"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? t('pages:agents.scanning', 'Scanning...') : t('pages:agents.runScan', 'Run Scan')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('pages:agents.totalPages', 'Total Pages')}</CardTitle>
            <CardDescription>{t('pages:agents.monitoredEndpoints', 'Monitored endpoints')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{pageHealth.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t('pages:agents.healthy', 'Healthy')}
            </CardTitle>
            <CardDescription>{t('pages:agents.noIssuesDetected', 'No issues detected')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{healthyPages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              {t('pages:agents.unhealthy', 'Unhealthy')}
            </CardTitle>
            <CardDescription>{t('pages:agents.requiresAttention', 'Requires attention')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{unhealthyPages}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pages:agents.pageHealthStatus', 'Page Health Status')}</CardTitle>
          <CardDescription>{t('pages:agents.detailedValidationResults', 'Detailed validation results')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pageHealth.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t('pages:agents.noPagesScanned', 'No pages scanned yet. Click "Run Scan" to start.')}
              </p>
            ) : (
              pageHealth.map((page: any) => (
                <div
                  key={page.page_path}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`page-health-${page.page_path.replace(/\//g, '-')}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{page.page_name}</h3>
                      <Badge 
                        variant={page.status === 'healthy' ? 'default' : 'destructive'}
                      >
                        {page.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {page.page_path}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{t('pages:agents.elements', 'Elements')}: {page.total_elements}</span>
                      {page.missing_testids > 0 && (
                        <span className="text-yellow-600">
                          {t('pages:agents.missingTestIds', 'Missing testIds')}: {page.missing_testids}
                        </span>
                      )}
                      {page.broken_links > 0 && (
                        <span className="text-red-600">
                          {t('pages:agents.brokenLinks', 'Broken links')}: {page.broken_links}
                        </span>
                      )}
                      {page.js_errors > 0 && (
                        <span className="text-red-600">
                          {t('pages:agents.jsErrors', 'JS errors')}: {page.js_errors}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(page.last_checked_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </SelfHealingErrorBoundary>
  );
}
