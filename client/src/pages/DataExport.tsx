import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Download, FileArchive, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DataExportRequest {
  id: number;
  userId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export default function DataExport() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();

  const { data: exports, isLoading } = useQuery<DataExportRequest[]>({
    queryKey: ['/api/gdpr/exports'],
  });

  const requestExportMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/gdpr/export', {}),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/gdpr/exports'] });
      toast({
        title: t('pages:settings.dataExportRequested', 'Data export requested'),
        description: t('pages:settings.dataExportRequestedDesc', 'Your data export has been requested. You\'ll receive an email when it\'s ready.'),
      });
    },
    onError: () => {
      toast({
        title: t('pages:settings.error', 'Error'),
        description: t('pages:settings.dataExportFailed', 'Failed to request data export. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleDownload = (downloadUrl: string) => {
    if (downloadUrl.startsWith('data:')) {
      // Handle data URL download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mundo-tango-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Handle regular URL download
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <SelfHealingErrorBoundary pageName={t('pages:settings.dataExport', 'Data Export')} fallbackRoute="/settings">
      <PageLayout title={t('pages:settings.dataExport', 'Data Export')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:settings.dataExportSeoTitle', 'Data Export - GDPR Compliance')}
            description={t('pages:settings.dataExportSeoDescription', 'Request and download your personal data in compliance with GDPR Article 20.')}
          />
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-data-export">
                {t('pages:settings.dataExport', 'Data Export')}
              </h1>
              <p className="text-muted-foreground">
                {t('pages:settings.dataExportSubtitle', 'Request and download a copy of your personal data')}
              </p>
            </div>

            {/* Request New Export */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <FileArchive className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.requestDataExport', 'Request Data Export')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.gdprArticle20Desc', 'Download a complete copy of your data (GDPR Article 20)')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.exportWillInclude', 'Your export will include:')}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                    <li>{t('pages:settings.profileInfoSettings', 'Profile information and settings')}</li>
                    <li>{t('pages:settings.allPostsComments', 'All posts and comments')}</li>
                    <li>{t('pages:settings.eventsCreatedAttended', 'Events you\'ve created or attended')}</li>
                    <li>{t('pages:settings.groupMembershipsActivity', 'Group memberships and activity')}</li>
                    <li>{t('pages:settings.housingListingsBookings', 'Housing listings and bookings')}</li>
                    <li>{t('pages:settings.mediaUploadsPhotos', 'Media uploads and photos')}</li>
                    <li>{t('pages:settings.messagesConversations', 'Messages and conversations')}</li>
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">{t('pages:settings.whatToExpect', 'What to expect:')}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('pages:settings.processingTime', 'Processing usually takes a few minutes')}</li>
                    <li>• {t('pages:settings.emailNotification', 'You\'ll receive an email when your export is ready')}</li>
                    <li>• {t('pages:settings.linkExpiry', 'Download links expire after 7 days')}</li>
                    <li>• {t('pages:settings.dataFormat', 'Data is provided in JSON format')}</li>
                  </ul>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={requestExportMutation.isPending}
                      data-testid="button-request-export"
                    >
                      {requestExportMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('pages:settings.requesting', 'Requesting...')}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {t('pages:settings.requestDataExport', 'Request Data Export')}
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="backdrop-blur-md bg-white/95 dark:bg-black/95">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('pages:settings.requestDataExportTitle', 'Request Data Export?')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('pages:settings.requestDataExportDialogDesc', 'We\'ll prepare a complete copy of your personal data. This process may take a few minutes. You\'ll receive an email notification when your export is ready to download.')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-export">{t('pages:settings.cancel', 'Cancel')}</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => requestExportMutation.mutate()}
                        data-testid="button-confirm-export"
                      >
                        {t('pages:settings.continue', 'Continue')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Export History */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Clock className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.exportHistory', 'Export History')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.viewPreviousExports', 'View and download your previous data export requests')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#40E0D0]" />
                    <p className="text-sm text-muted-foreground" data-testid="text-loading">{t('pages:settings.loadingHistory', 'Loading export history...')}</p>
                  </div>
                ) : exports && exports.length > 0 ? (
                  <div className="space-y-4">
                    {exports.map((exportRequest) => (
                      <div 
                        key={exportRequest.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover-elevate"
                        data-testid={`export-request-${exportRequest.id}`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium" data-testid={`text-export-date-${exportRequest.id}`}>
                              {t('pages:settings.requestedOn', 'Requested')} {new Date(exportRequest.requestedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <Badge 
                              variant={getStatusVariant(exportRequest.status)} 
                              className="flex items-center gap-1"
                              data-testid={`badge-status-${exportRequest.id}`}
                            >
                              {getStatusIcon(exportRequest.status)}
                              {t(`pages:settings.status_${exportRequest.status}`, exportRequest.status.charAt(0).toUpperCase() + exportRequest.status.slice(1))}
                            </Badge>
                          </div>
                          {exportRequest.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              {t('pages:settings.completedOn', 'Completed')} {new Date(exportRequest.completedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          {exportRequest.expiresAt && exportRequest.status === 'completed' && (
                            <p className="text-sm text-muted-foreground">
                              {t('pages:settings.expiresOn', 'Expires')} {new Date(exportRequest.expiresAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                        <div>
                          {exportRequest.status === 'completed' && exportRequest.downloadUrl && (
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => handleDownload(exportRequest.downloadUrl!)}
                              data-testid={`button-download-${exportRequest.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t('pages:settings.download', 'Download')}
                            </Button>
                          )}
                          {exportRequest.status === 'processing' && (
                            <Button variant="outline" size="sm" disabled>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {t('pages:settings.status_processing', 'Processing')}
                            </Button>
                          )}
                          {exportRequest.status === 'pending' && (
                            <Button variant="outline" size="sm" disabled>
                              <Clock className="h-4 w-4 mr-2" />
                              {t('pages:settings.status_pending', 'Pending')}
                            </Button>
                          )}
                          {exportRequest.status === 'failed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => requestExportMutation.mutate()}
                            >
                              {t('pages:settings.retry', 'Retry')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileArchive className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground" data-testid="text-no-exports">
                      {t('pages:settings.noExports', 'No export requests yet')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('pages:settings.requestFirstExport', 'Request your first data export above')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
