import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, Clock, AlertCircle, FileText, Calendar } from 'lucide-react';
import { LoadingFallback } from '@/components/LoadingFallback';
import { format } from 'date-fns';

interface LegalStatus {
  accepted: boolean;
  upToDate: boolean;
  lastAccepted: string;
  versions: {
    privacy: string;
    tos: string;
    coc: string;
  };
}

interface LegalHistory {
  id: number;
  userId: number;
  privacyPolicyVersion: string;
  tosVersion: string;
  cocVersion: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
}

export default function LegalStatus() {
  const { data: status, isLoading: statusLoading } = useQuery<LegalStatus>({
    queryKey: ['/api/onboarding/legal/status']
  });

  const { data: history, isLoading: historyLoading } = useQuery<LegalHistory[]>({
    queryKey: ['/api/onboarding/legal/history']
  });

  if (statusLoading || historyLoading) {
    return <LoadingFallback />;
  }

  const currentVersions = {
    privacy: '1.0',
    tos: '1.0',
    coc: '1.0'
  };

  const needsUpdate = status?.accepted && !status?.upToDate;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-legal-status">
              Legal Agreements
            </h1>
            <p className="text-muted-foreground">
              View your acceptance status and history
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <Card data-testid="card-current-status">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Current Status
          </CardTitle>
          <CardDescription>
            Your current legal agreement acceptance status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.accepted ? (
            <Alert variant="destructive" data-testid="alert-not-accepted">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have not accepted the legal agreements yet.
              </AlertDescription>
            </Alert>
          ) : needsUpdate ? (
            <Alert data-testid="alert-needs-update">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                New versions of our legal agreements are available. Please review and accept them.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-500/50 bg-green-500/10" data-testid="alert-up-to-date">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Your legal agreements are up to date
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2" data-testid="status-privacy-policy">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Privacy Policy</span>
                <Badge variant={status?.versions?.privacy === currentVersions.privacy ? 'default' : 'secondary'}>
                  v{status?.versions?.privacy || 'N/A'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: v{currentVersions.privacy}
              </p>
            </div>

            <div className="space-y-2" data-testid="status-terms-of-service">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Terms of Service</span>
                <Badge variant={status?.versions?.tos === currentVersions.tos ? 'default' : 'secondary'}>
                  v{status?.versions?.tos || 'N/A'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: v{currentVersions.tos}
              </p>
            </div>

            <div className="space-y-2" data-testid="status-code-of-conduct">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Code of Conduct</span>
                <Badge variant={status?.versions?.coc === currentVersions.coc ? 'default' : 'secondary'}>
                  v{status?.versions?.coc || 'N/A'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: v{currentVersions.coc}
              </p>
            </div>
          </div>

          {status?.lastAccepted && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-last-accepted">
              <Clock className="w-4 h-4" />
              Last accepted on {format(new Date(status.lastAccepted), 'PPP')}
            </div>
          )}

          {needsUpdate && (
            <Button asChild className="w-full" data-testid="button-review-updates">
              <a href="/onboarding/legal">Review and Accept Updates</a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card data-testid="card-legal-documents">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Legal Documents
          </CardTitle>
          <CardDescription>
            Access our legal documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild data-testid="link-view-privacy-policy">
            <a href="/privacy-policy" target="_blank">
              <FileText className="w-4 h-4 mr-2" />
              Privacy Policy (v{currentVersions.privacy})
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild data-testid="link-view-terms-of-service">
            <a href="/terms" target="_blank">
              <FileText className="w-4 h-4 mr-2" />
              Terms of Service (v{currentVersions.tos})
            </a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild data-testid="link-view-code-of-conduct">
            <a href="/community-guidelines" target="_blank">
              <FileText className="w-4 h-4 mr-2" />
              Code of Conduct (v{currentVersions.coc})
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Acceptance History */}
      <Card data-testid="card-acceptance-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Acceptance History
          </CardTitle>
          <CardDescription>
            Complete history of your legal agreement acceptances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-history">
              No acceptance history found
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div key={record.id} data-testid={`history-item-${index}`}>
                  {index > 0 && <div className="border-t my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="font-medium">
                          Accepted on {format(new Date(record.acceptedAt), 'PPP')}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(record.acceptedAt), 'p')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Privacy:</span>{' '}
                        <span className="font-medium">v{record.privacyPolicyVersion}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ToS:</span>{' '}
                        <span className="font-medium">v{record.tosVersion}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CoC:</span>{' '}
                        <span className="font-medium">v{record.cocVersion}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      IP: {record.ipAddress}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
