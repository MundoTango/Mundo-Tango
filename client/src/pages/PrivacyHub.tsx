import { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Shield, Mail, AlertTriangle, Eye, EyeOff, Trash2, Plus, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from "react-i18next";

export default function PrivacyHub() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [newEmailLabel, setNewEmailLabel] = useState('');
  const [forwardTo, setForwardTo] = useState('');

  const { data: virtualEmails } = useQuery<any[]>({
    queryKey: ['/api/privacy/virtual-emails'],
  });

  const { data: securityAlerts } = useQuery<any[]>({
    queryKey: ['/api/privacy/security-alerts'],
  });

  const createEmailMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/privacy/virtual-email', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: t('pages:settings.emailCreated', 'Virtual Email Created!'),
        description: t('pages:settings.emailCreatedDesc', 'Your new disposable email is ready to use'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/privacy/virtual-emails'] });
      setNewEmailLabel('');
      setForwardTo('');
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.creationFailed', 'Creation Failed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (emailId: number) => {
      return await apiRequest(`/api/privacy/virtual-email/${emailId}`, 'DELETE', {});
    },
    onSuccess: () => {
      toast({
        title: t('pages:settings.emailDeleted', 'Email Deleted'),
        description: t('pages:settings.emailDeletedDesc', 'Virtual email has been removed'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/privacy/virtual-emails'] });
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.deletionFailed', 'Deletion Failed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const toggleEmailMutation = useMutation({
    mutationFn: async ({ emailId, isActive }: { emailId: number; isActive: boolean }) => {
      return await apiRequest(`/api/privacy/virtual-email/${emailId}/toggle`, 'POST', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/privacy/virtual-emails'] });
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.toggleFailed', 'Toggle Failed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/privacy/dark-web-scan', 'POST', {});
    },
    onSuccess: (data) => {
      toast({
        title: data.breaches.length === 0 ? t('pages:settings.allClear', 'All Clear!') : t('pages:settings.breachesFound', 'Breaches Found'),
        description: data.breaches.length === 0 
          ? t('pages:settings.noBreaches', 'No data breaches detected')
          : t('pages:settings.foundBreaches', `Found in ${data.breaches.length} breach${data.breaches.length !== 1 ? 'es' : ''}`),
        variant: data.breaches.length === 0 ? "default" : "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/privacy/security-alerts'] });
    },
    onError: (error: any) => {
      toast({
        title: t('pages:settings.scanFailed', 'Scan Failed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateEmail = () => {
    if (!newEmailLabel.trim()) {
      toast({
        title: t('pages:settings.labelRequired', 'Label Required'),
        description: t('pages:settings.labelRequiredDesc', 'Please provide a label for this email'),
        variant: "destructive"
      });
      return;
    }

    createEmailMutation.mutate({
      label: newEmailLabel,
      forwardTo: forwardTo || undefined
    });
  };

  return (
    <PageLayout title={t('pages:settings.privacyHubTitle', 'Privacy & Security Hub')} showBreadcrumbs>
      <>
        <SEO
          title={t('pages:settings.privacyHubSeoTitle', 'Privacy & Security Hub - Mundo Tango')}
          description={t('pages:settings.privacyHubSeoDescription', 'Manage your privacy with virtual emails and dark web monitoring')}
        />

        <div className="container mx-auto max-w-6xl space-y-6 p-6" data-testid="page-privacy-hub">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-500" />
              {t('pages:settings.privacyHubTitle', 'Privacy & Security Hub')}
            </h1>
            <p className="text-muted-foreground">
              {t('pages:settings.privacyHubSubtitle', 'Protect your identity with virtual emails and dark web monitoring')}
            </p>
          </div>

          <Tabs defaultValue="virtual-emails">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="virtual-emails" data-testid="tab-virtual-emails">
                <Mail className="h-4 w-4 mr-2" />
                {t('pages:settings.virtualEmails', 'Virtual Emails')}
              </TabsTrigger>
              <TabsTrigger value="dark-web" data-testid="tab-dark-web">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t('pages:settings.darkWebMonitoring', 'Dark Web Monitoring')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="virtual-emails" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-500" />
                    {t('pages:settings.createVirtualEmail', 'Create Virtual Email')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages:settings.createEmailDesc', 'Generate a disposable email address to protect your identity')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="label">{t('pages:settings.labelField', 'Label (e.g., "Newsletter", "Shopping")')}</Label>
                      <Input
                        id="label"
                        placeholder={t('pages:settings.labelPlaceholder', 'Shopping Sites')}
                        value={newEmailLabel}
                        onChange={(e) => setNewEmailLabel(e.target.value)}
                        data-testid="input-email-label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="forward-to">{t('pages:settings.forwardTo', 'Forward To (Optional)')}</Label>
                      <Input
                        id="forward-to"
                        type="email"
                        placeholder="your@email.com"
                        value={forwardTo}
                        onChange={(e) => setForwardTo(e.target.value)}
                        data-testid="input-forward-to"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateEmail}
                    disabled={createEmailMutation.isPending}
                    className="w-full"
                    data-testid="button-create-email"
                  >
                    {createEmailMutation.isPending ? t('pages:settings.creating', 'Creating...') : t('pages:settings.createVirtualEmail', 'Create Virtual Email')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('pages:settings.yourVirtualEmails', 'Your Virtual Emails')}</CardTitle>
                  <CardDescription>
                    {virtualEmails?.length || 0} {t('pages:settings.virtualEmailCount', 'virtual email')}{virtualEmails?.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {virtualEmails?.length === 0 || !virtualEmails ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('pages:settings.noEmails', 'No virtual emails yet. Create your first one above!')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {virtualEmails.map((email) => (
                        <Card key={email.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{email.label}</span>
                                  <Badge variant={email.isActive ? 'default' : 'secondary'}>
                                    {email.isActive ? t('pages:settings.active', 'Active') : t('pages:settings.disabled', 'Disabled')}
                                  </Badge>
                                </div>
                                
                                <div className="text-sm font-mono bg-muted p-2 rounded">
                                  {email.virtualEmail}
                                </div>

                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  <span>📧 {email.emailCount} {t('pages:settings.received', 'received')}</span>
                                  {email.spamCount > 0 && (
                                    <span className="text-red-500">🚨 {email.spamCount} {t('pages:settings.spamBlocked', 'spam blocked')}</span>
                                  )}
                                  <span>→ {email.forwardTo}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleEmailMutation.mutate({ emailId: email.id, isActive: !email.isActive })}
                                  data-testid={`button-toggle-${email.id}`}
                                >
                                  {email.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => deleteEmailMutation.mutate(email.id)}
                                  data-testid={`button-delete-${email.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dark-web" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    {t('pages:settings.darkWebScan', 'Dark Web Scan')}
                  </CardTitle>
                  <CardDescription>
                    {t('pages:settings.darkWebScanDesc', 'Check if your email has been found in data breaches')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => scanMutation.mutate()}
                    disabled={scanMutation.isPending}
                    className="w-full"
                    data-testid="button-scan-dark-web"
                  >
                    {scanMutation.isPending ? t('pages:settings.scanning', 'Scanning...') : t('pages:settings.scanForBreaches', 'Scan for Data Breaches')}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('pages:settings.securityAlerts', 'Security Alerts')}</CardTitle>
                  <CardDescription>
                    {securityAlerts?.length || 0} {t('pages:settings.alertCount', 'alert')}{securityAlerts?.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {securityAlerts?.length === 0 || !securityAlerts ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                      <h3 className="font-semibold mb-2">{t('pages:settings.allClear', 'All Clear!')}</h3>
                      <p>{t('pages:settings.noAlerts', 'No security alerts at this time')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {securityAlerts.map((alert) => (
                        <Card key={alert.id} className={`border-l-4 ${
                          alert.severity === 'critical' ? 'border-l-red-500' :
                          alert.severity === 'high' ? 'border-l-orange-500' :
                          'border-l-yellow-500'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    alert.severity === 'critical' ? 'destructive' :
                                    alert.severity === 'high' ? 'destructive' :
                                    'default'
                                  }>
                                    {alert.severity}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(alert.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <p className="font-medium">{alert.message}</p>
                                
                                {alert.metadata?.breaches && (
                                  <div className="text-sm text-muted-foreground">
                                    {t('pages:settings.foundIn', 'Found in')}: {alert.metadata.breaches.map((b: any) => b.name).join(', ')}
                                  </div>
                                )}
                              </div>

                              {!alert.isRead && (
                                <Badge variant="outline">{t('pages:settings.new', 'New')}</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </>
    </PageLayout>
  );
}
