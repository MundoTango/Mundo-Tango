import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, Clock, MapPin, CheckCircle2, XCircle, AlertTriangle, KeyRound } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface Session {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: string;
}

export default function SecuritySettings() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();

  const { data: twoFactorStatus, isLoading: statusLoading } = useQuery<{ enabled: boolean }>({
    queryKey: ['/api/auth/2fa/status'],
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ['/api/settings/sessions'],
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ['/api/security/audit-logs'],
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest('POST', '/api/settings/revoke-session', { sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/sessions'] });
      toast({
        title: t('pages:settings.sessionRevoked', 'Session revoked'),
        description: t('pages:settings.sessionRevokedDesc', 'The session has been successfully logged out.'),
      });
    },
    onError: () => {
      toast({
        title: t('pages:settings.error', 'Error'),
        description: t('pages:settings.revokeSessionFailed', 'Failed to revoke session. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: (token: string) =>
      apiRequest('POST', '/api/auth/2fa/disable', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/2fa/status'] });
      toast({
        title: t('pages:settings.twoFaDisabled', '2FA Disabled'),
        description: t('pages:settings.twoFaDisabledDesc', 'Two-factor authentication has been disabled for your account.'),
      });
    },
    onError: () => {
      toast({
        title: t('pages:settings.error', 'Error'),
        description: t('pages:settings.disableTwoFaFailed', 'Failed to disable 2FA. Please verify your token.'),
        variant: "destructive",
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    if (confirm(t('pages:settings.confirmRevokeSession', 'Are you sure you want to log out this session?'))) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleDisable2FA = () => {
    const token = prompt(t('pages:settings.enterTokenToDisable', 'Enter your 2FA token to disable two-factor authentication:'));
    if (token) {
      disable2FAMutation.mutate(token);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:settings.securitySettings', 'Security Settings')} fallbackRoute="/settings">
      <PageLayout title={t('pages:settings.securityTitle', 'Security Settings')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:settings.securitySeoTitle', 'Security Settings')}
            description={t('pages:settings.securitySeoDescription', 'Manage your account security settings, active sessions, and two-factor authentication.')}
          />
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-security-settings">
                {t('pages:settings.securityTitle', 'Security Settings')}
              </h1>
              <p className="text-muted-foreground">
                {t('pages:settings.securitySubtitle', 'Protect your account and manage security preferences')}
              </p>
            </div>

            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Shield className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.twoFactorAuth', 'Two-Factor Authentication')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.twoFaDescription', 'Add an extra layer of security to your account')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusLoading ? (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.loading2faStatus', 'Loading 2FA status...')}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium" data-testid="text-2fa-status">
                            {t('pages:settings.status', 'Status')}: {twoFactorStatus?.enabled ? t('pages:settings.enabled', 'Enabled') : t('pages:settings.disabled', 'Disabled')}
                          </p>
                          {twoFactorStatus?.enabled ? (
                            <Badge variant="default" className="text-xs" data-testid="badge-2fa-enabled">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t('pages:settings.active', 'Active')}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs" data-testid="badge-2fa-disabled">
                              <XCircle className="h-3 w-3 mr-1" />
                              {t('pages:settings.inactive', 'Inactive')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {twoFactorStatus?.enabled 
                            ? t('pages:settings.accountProtected', 'Your account is protected with 2FA')
                            : t('pages:settings.requireVerification', 'Require a verification code in addition to your password')}
                        </p>
                      </div>
                      {twoFactorStatus?.enabled ? (
                        <Button
                          variant="destructive"
                          onClick={handleDisable2FA}
                          disabled={disable2FAMutation.isPending}
                          data-testid="button-disable-2fa"
                        >
                          {disable2FAMutation.isPending ? t('pages:settings.disabling', 'Disabling...') : t('pages:settings.disable2fa', 'Disable 2FA')}
                        </Button>
                      ) : (
                        <Link href="/settings/2fa/setup">
                          <Button variant="default" data-testid="button-enable-2fa">
                            <KeyRound className="h-4 w-4 mr-2" />
                            {t('pages:settings.enable2fa', 'Enable 2FA')}
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    {!twoFactorStatus?.enabled && (
                      <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          <strong>{t('pages:settings.recommended', 'Recommended')}:</strong> {t('pages:settings.enable2faRecommendation', 'Enable two-factor authentication to protect your account from unauthorized access.')}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Smartphone className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.activeSessions', 'Active Sessions')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.activeSessionsDesc', 'Manage devices and locations where you\'re logged in')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.loadingSessions', 'Loading sessions...')}</p>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <div key={session.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium" data-testid={`text-session-device-${session.id}`}>{session.device}</p>
                            {session.current && (
                              <Badge variant="default" className="text-xs" data-testid="badge-current-session">
                                {t('pages:settings.current', 'Current')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span data-testid={`text-session-location-${session.id}`}>{session.location}</span>
                            </div>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span data-testid={`text-session-lastactive-${session.id}`}>
                                {safeDateDistance(session.lastActive, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">IP: {session.ipAddress}</p>
                        </div>
                        {!session.current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revokeSessionMutation.isPending}
                            data-testid={`button-revoke-session-${session.id}`}
                          >
                            {t('pages:settings.revoke', 'Revoke')}
                          </Button>
                        )}
                      </div>
                      {index !== sessions.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.noActiveSessions', 'No active sessions found.')}</p>
                )}
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <AlertTriangle className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.auditLog', 'Security Audit Log')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.auditLogDesc', 'Recent security events on your account')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.loadingAuditLogs', 'Loading audit logs...')}</p>
                ) : auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map((log, index) => (
                    <div key={log.id}>
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {log.status === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium capitalize" data-testid={`text-audit-action-${log.id}`}>
                              {log.action.replace(/_/g, ' ')}
                            </p>
                            <span className="text-xs text-muted-foreground" data-testid={`text-audit-timestamp-${log.id}`}>
                              {safeDateDistance(log.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {log.ipAddress} • {log.userAgent}
                          </p>
                        </div>
                      </div>
                      {index !== auditLogs.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.noSecurityEvents', 'No security events found.')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
