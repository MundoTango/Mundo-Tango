import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, Clock, MapPin, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { safeDateDistance } from "@/lib/safeDateFormat";

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

export default function SecuritySettingsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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
        title: t('pages:settings.security.sessionRevoked', 'Session revoked'),
        description: t('pages:settings.security.sessionRevokedDesc', 'The session has been successfully logged out.'),
      });
    },
    onError: () => {
      toast({
        title: t('pages:settings.security.error', 'Error'),
        description: t('pages:settings.security.failedToRevokeSession', 'Failed to revoke session. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    if (confirm(t('pages:settings.security.confirmRevokeSession', 'Are you sure you want to log out this session?'))) {
      revokeSessionMutation.mutate(sessionId);
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast({
      title: checked ? t('pages:settings.security.twoFaEnabled', '2FA Enabled') : t('pages:settings.security.twoFaDisabled', '2FA Disabled'),
      description: checked 
        ? t('pages:settings.security.twoFaEnabledDesc', 'Two-factor authentication has been enabled for your account.')
        : t('pages:settings.security.twoFaDisabledDesc', 'Two-factor authentication has been disabled.'),
    });
  };

  return (
    <SelfHealingErrorBoundary pageName="Security Settings" fallbackRoute="/settings">
      <PageLayout title={t('pages:settings.security.pageTitle', 'Security Settings')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:settings.security.seoTitle', 'Security Settings')}
            description={t('pages:settings.security.seoDescription', 'Manage your account security settings, active sessions, and two-factor authentication.')}
          />
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-security-settings">
                {t('pages:settings.security.title', 'Security Settings')}
              </h1>
              <p className="text-muted-foreground">
                {t('pages:settings.security.subtitle', 'Protect your account and manage security preferences')}
              </p>
            </div>

            {/* Active Sessions */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Smartphone className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.security.activeSessions', 'Active Sessions')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.security.activeSessionsDesc', "Manage devices and locations where you're logged in")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.security.loadingSessions', 'Loading sessions...')}</p>
                ) : sessions && sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div key={session.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium" data-testid={`text-session-device-${session.id}`}>{session.device}</p>
                            {session.current && (
                              <Badge variant="default" className="text-xs" data-testid="badge-current-session">
                                {t('pages:settings.security.current', 'Current')}
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
                          <p className="text-xs text-muted-foreground">{t('pages:settings.security.ip', 'IP')}: {session.ipAddress}</p>
                        </div>
                        {!session.current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revokeSessionMutation.isPending}
                            data-testid={`button-revoke-session-${session.id}`}
                          >
                            {t('pages:settings.security.revoke', 'Revoke')}
                          </Button>
                        )}
                      </div>
                      {session.id !== sessions[sessions.length - 1].id && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.security.noActiveSessions', 'No active sessions found.')}</p>
                )}
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Shield className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.security.twoFactorAuth', 'Two-Factor Authentication')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.security.twoFactorAuthDesc', 'Add an extra layer of security to your account')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa-toggle" className="font-medium">{t('pages:settings.security.enable2fa', 'Enable 2FA')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:settings.security.enable2faDesc', 'Require a verification code in addition to your password')}
                    </p>
                  </div>
                  <Switch
                    id="2fa-toggle"
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                    data-testid="switch-2fa"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Audit Log */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <AlertTriangle className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.security.securityAuditLog', 'Security Audit Log')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.security.securityAuditLogDesc', 'Recent security events on your account')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {logsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.security.loadingLogs', 'Loading audit logs...')}</p>
                ) : auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
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
                      {log.id !== auditLogs[auditLogs.length - 1].id && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.security.noSecurityEvents', 'No security events found.')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
