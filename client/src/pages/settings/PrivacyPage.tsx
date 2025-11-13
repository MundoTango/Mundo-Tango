import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Shield, Download, Link as LinkIcon, Eye, Mail, BarChart3, Share2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLocation } from "wouter";

interface PrivacySettings {
  marketingEmails: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  profileVisibility: string;
  searchable: boolean;
  showActivity: boolean;
}

export default function PrivacyPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { data: privacySettings, isLoading } = useQuery<PrivacySettings>({
    queryKey: ['/api/settings/privacy'],
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (updates: Partial<PrivacySettings>) =>
      apiRequest('PATCH', '/api/settings/privacy', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/privacy'] });
      toast({
        title: "Privacy settings updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof PrivacySettings, value: boolean) => {
    updatePrivacyMutation.mutate({ [key]: value });
  };

  const handleRequestExport = () => {
    setShowExportDialog(false);
    setLocation('/settings/data-export');
  };

  const mockConnectedApps = [
    { id: "1", name: "Spotify", connectedDate: "2024-01-15" },
    { id: "2", name: "Google Calendar", connectedDate: "2024-02-20" },
  ];

  return (
    <SelfHealingErrorBoundary pageName="Privacy & Data" fallbackRoute="/settings">
      <PageLayout title="Privacy & Data" showBreadcrumbs>
        <>
          <SEO 
            title="Privacy & Data Settings"
            description="Control your privacy settings, data sharing preferences, and manage connected applications."
          />
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-privacy-settings">
                Privacy & Data
              </h1>
              <p className="text-muted-foreground">
                Manage your data and privacy preferences
              </p>
            </div>

            {/* Download Your Data */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Download className="h-5 w-5 text-[#40E0D0]" />
                  Download Your Data
                </CardTitle>
                <CardDescription>
                  Request a copy of your personal data (GDPR Article 20)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You can download a copy of all your data including posts, messages, profile information, and more.
                </p>
                <Button
                  onClick={() => setShowExportDialog(true)}
                  variant="default"
                  data-testid="button-request-export"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Request Data Export
                </Button>
              </CardContent>
            </Card>

            {/* Data Usage Consent */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Shield className="h-5 w-5 text-[#40E0D0]" />
                  Data Usage Consent
                </CardTitle>
                <CardDescription>
                  Control how we use your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading settings...</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails" className="flex items-center gap-2 font-medium">
                          <Mail className="h-4 w-4" />
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional emails and newsletters
                        </p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={privacySettings?.marketingEmails ?? true}
                        onCheckedChange={(checked) => handleToggle('marketingEmails', checked)}
                        disabled={updatePrivacyMutation.isPending}
                        data-testid="switch-marketing-emails"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics" className="flex items-center gap-2 font-medium">
                          <BarChart3 className="h-4 w-4" />
                          Analytics
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Help us improve by sharing anonymous usage data
                        </p>
                      </div>
                      <Switch
                        id="analytics"
                        checked={privacySettings?.analytics ?? true}
                        onCheckedChange={(checked) => handleToggle('analytics', checked)}
                        disabled={updatePrivacyMutation.isPending}
                        data-testid="switch-analytics"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="third-party" className="flex items-center gap-2 font-medium">
                          <Share2 className="h-4 w-4" />
                          Third-Party Sharing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow data sharing with trusted partners
                        </p>
                      </div>
                      <Switch
                        id="third-party"
                        checked={privacySettings?.thirdPartySharing ?? false}
                        onCheckedChange={(checked) => handleToggle('thirdPartySharing', checked)}
                        disabled={updatePrivacyMutation.isPending}
                        data-testid="switch-third-party"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Connected Apps */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <LinkIcon className="h-5 w-5 text-[#40E0D0]" />
                  Connected Apps
                </CardTitle>
                <CardDescription>
                  Manage third-party applications with access to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockConnectedApps.length > 0 ? (
                  mockConnectedApps.map((app) => (
                    <div key={app.id}>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="font-medium" data-testid={`text-app-name-${app.id}`}>{app.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Connected {new Date(app.connectedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-revoke-app-${app.id}`}
                        >
                          Revoke Access
                        </Button>
                      </div>
                      {app.id !== mockConnectedApps[mockConnectedApps.length - 1].id && <Separator className="mt-4" />}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No connected apps</p>
                )}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Eye className="h-5 w-5 text-[#40E0D0]" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your profile visibility and activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading settings...</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="searchable" className="font-medium">Searchable Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to find your profile in search
                        </p>
                      </div>
                      <Switch
                        id="searchable"
                        checked={privacySettings?.searchable ?? true}
                        onCheckedChange={(checked) => handleToggle('searchable', checked)}
                        disabled={updatePrivacyMutation.isPending}
                        data-testid="switch-searchable"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="show-activity" className="font-medium">Show Activity</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your recent activity to others
                        </p>
                      </div>
                      <Switch
                        id="show-activity"
                        checked={privacySettings?.showActivity ?? true}
                        onCheckedChange={(checked) => handleToggle('showActivity', checked)}
                        disabled={updatePrivacyMutation.isPending}
                        data-testid="switch-show-activity"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Export Confirmation Dialog */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogContent className="backdrop-blur-md bg-white/95 dark:bg-black/95">
              <DialogHeader>
                <DialogTitle>Request Data Export</DialogTitle>
                <DialogDescription>
                  You will be redirected to the Data Export page where you can choose the format and request your data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExportDialog(false)} data-testid="button-cancel-export">
                  Cancel
                </Button>
                <Button onClick={handleRequestExport} data-testid="button-confirm-export">
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
