import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Database, Calendar, MessageSquare, Users, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface DataExportRequest {
  id: number;
  status: string;
  format: string;
  fileUrl: string | null;
  requestedAt: string;
  completedAt: string | null;
}

export default function DataExportPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<string>("json");

  const { data: exports, isLoading } = useQuery<DataExportRequest[]>({
    queryKey: ['/api/gdpr/exports'],
  });

  const requestExportMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/gdpr/export', { format: selectedFormat }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gdpr/exports'] });
      toast({
        title: t('pages:settings.dataExport.exportComplete', 'Export complete'),
        description: t('pages:settings.dataExport.exportCompleteDesc', 'Your data export is ready. Download will begin automatically.'),
      });
    },
    onError: () => {
      toast({
        title: t('pages:settings.dataExport.error', 'Error'),
        description: t('pages:settings.dataExport.failedToRequestExport', 'Failed to request data export. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const handleRequestExport = () => {
    requestExportMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'processing':
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const dataIncludes = [
    { icon: FileText, label: t('pages:settings.dataExport.postsComments', 'Posts & Comments'), description: t('pages:settings.dataExport.postsCommentsDesc', 'All your posts, comments, and reactions') },
    { icon: MessageSquare, label: t('pages:settings.dataExport.messages', 'Messages'), description: t('pages:settings.dataExport.messagesDesc', 'Private conversations and group chats') },
    { icon: Database, label: t('pages:settings.dataExport.profileData', 'Profile Data'), description: t('pages:settings.dataExport.profileDataDesc', 'Account information and preferences') },
    { icon: Calendar, label: t('pages:settings.dataExport.eventsRsvps', 'Events & RSVPs'), description: t('pages:settings.dataExport.eventsRsvpsDesc', 'Events you created or attended') },
    { icon: Users, label: t('pages:settings.dataExport.connections', 'Connections'), description: t('pages:settings.dataExport.connectionsDesc', 'Friends, followers, and groups') },
  ];

  return (
    <SelfHealingErrorBoundary pageName="Data Export" fallbackRoute="/settings">
      <PageLayout title={t('pages:settings.dataExport.pageTitle', 'Data Export')} showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:settings.dataExport.seoTitle', 'Download Your Data')}
            description={t('pages:settings.dataExport.seoDescription', 'Request a copy of your data in compliance with GDPR Article 20 - Right to Data Portability.')}
          />
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-data-export">
                {t('pages:settings.dataExport.title', 'Download Your Data')}
              </h1>
              <p className="text-muted-foreground">
                {t('pages:settings.dataExport.subtitle', 'Exercise your right to data portability under GDPR Article 20')}
              </p>
            </div>

            {/* Request New Export */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Download className="h-5 w-5 text-[#40E0D0]" />
                  {t('pages:settings.dataExport.requestExport', 'Request Data Export')}
                </CardTitle>
                <CardDescription>
                  {t('pages:settings.dataExport.requestExportDesc', 'Get a complete copy of your personal data from Mundo Tango')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* What's Included */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{t('pages:settings.dataExport.whatsIncluded', "What's included in your export:")}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dataIncludes.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5"
                      >
                        <item.icon className="h-5 w-5 text-[#40E0D0] mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{t('pages:settings.dataExport.chooseFormat', 'Choose export format:')}</h3>
                  <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat} className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5">
                      <RadioGroupItem value="json" id="format-json" data-testid="radio-format-json" />
                      <Label htmlFor="format-json" className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <p className="font-medium">{t('pages:settings.dataExport.formatJson', 'JSON')}</p>
                          <p className="text-sm text-muted-foreground">{t('pages:settings.dataExport.formatJsonDesc', 'Machine-readable format, ideal for developers')}</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5">
                      <RadioGroupItem value="csv" id="format-csv" data-testid="radio-format-csv" />
                      <Label htmlFor="format-csv" className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <p className="font-medium">{t('pages:settings.dataExport.formatCsv', 'CSV')}</p>
                          <p className="text-sm text-muted-foreground">{t('pages:settings.dataExport.formatCsvDesc', 'Spreadsheet format, easy to view in Excel')}</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5">
                      <RadioGroupItem value="zip" id="format-zip" data-testid="radio-format-zip" />
                      <Label htmlFor="format-zip" className="flex-1 cursor-pointer">
                        <div className="space-y-1">
                          <p className="font-medium">{t('pages:settings.dataExport.formatZip', 'ZIP Archive')}</p>
                          <p className="text-sm text-muted-foreground">{t('pages:settings.dataExport.formatZipDesc', 'Complete archive with all files and media')}</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Request Button */}
                <Button
                  onClick={handleRequestExport}
                  disabled={requestExportMutation.isPending}
                  className="w-full"
                  size="lg"
                  data-testid="button-request-export"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {requestExportMutation.isPending ? t('pages:settings.dataExport.requesting', 'Requesting...') : t('pages:settings.dataExport.requestExportButton', 'Request Export')}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t('pages:settings.dataExport.processingTime', 'Exports typically take 15-30 minutes to process. You\'ll receive an email when ready.')}
                </p>
              </CardContent>
            </Card>

            {/* Export History */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="font-serif">{t('pages:settings.dataExport.exportHistory', 'Export History')}</CardTitle>
                <CardDescription>
                  {t('pages:settings.dataExport.exportHistoryDesc', 'View and download your previous export requests')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">{t('pages:settings.dataExport.loadingHistory', 'Loading export history...')}</p>
                ) : exports && exports.length > 0 ? (
                  <div className="space-y-4">
                    {exports.map((exportRequest) => (
                      <div
                        key={exportRequest.id}
                        className="flex items-center justify-between p-4 rounded-lg backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(exportRequest.status)}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium capitalize" data-testid={`text-export-format-${exportRequest.id}`}>
                                {exportRequest.format.toUpperCase()} {t('pages:settings.dataExport.export', 'Export')}
                              </p>
                              <Badge variant={exportRequest.status === 'completed' ? 'default' : 'secondary'} className="text-xs" data-testid={`badge-export-status-${exportRequest.id}`}>
                                {exportRequest.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t('pages:settings.dataExport.requested', 'Requested')} {safeDateDistance(exportRequest.requestedAt, { addSuffix: true })}
                            </p>
                            {exportRequest.completedAt && (
                              <p className="text-xs text-muted-foreground">
                                {t('pages:settings.dataExport.completed', 'Completed')} {safeDateDistance(exportRequest.completedAt, { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                        {exportRequest.status === 'completed' && exportRequest.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            data-testid={`button-download-export-${exportRequest.id}`}
                          >
                            <a href={exportRequest.fileUrl} download>
                              <Download className="h-4 w-4 mr-2" />
                              {t('pages:settings.dataExport.download', 'Download')}
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t('pages:settings.dataExport.noExports', 'No export requests yet')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('pages:settings.dataExport.requestFirst', 'Request your first data export above')}
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
