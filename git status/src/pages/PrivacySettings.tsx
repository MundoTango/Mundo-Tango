import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, BarChart3, Share2, Eye, Search, Activity } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PrivacySettings {
  id?: number;
  userId?: number;
  marketingEmails: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
  profileVisibility: string;
  searchable: boolean;
  showActivity: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function PrivacySettings() {
  const { toast } = useToast();

  const { data: privacySettings, isLoading } = useQuery<PrivacySettings>({
    queryKey: ['/api/gdpr/privacy-settings'],
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (updates: Partial<PrivacySettings>) =>
      apiRequest('PUT', '/api/gdpr/privacy-settings', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gdpr/privacy-settings'] });
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

  const handleToggle = (key: keyof PrivacySettings, value: boolean | string) => {
    updatePrivacyMutation.mutate({ [key]: value });
  };

  return (
    <SelfHealingErrorBoundary pageName="Privacy Settings" fallbackRoute="/settings">
      <PageLayout title="Privacy Settings" showBreadcrumbs>
        <>
          <SEO 
            title="Privacy Settings - GDPR Compliance"
            description="Control your privacy settings and data sharing preferences in compliance with GDPR."
          />
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-privacy-settings">
                Privacy Settings
              </h1>
              <p className="text-muted-foreground">
                Control your privacy preferences and manage how your data is used
              </p>
            </div>

            {isLoading ? (
              <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                <CardContent className="p-8">
                  <p className="text-center text-muted-foreground" data-testid="text-loading">Loading privacy settings...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Communication Preferences */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Mail className="h-5 w-5 text-[#40E0D0]" />
                      Communication Preferences
                    </CardTitle>
                    <CardDescription>
                      Control how we communicate with you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails" className="font-medium">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional emails, newsletters, and event announcements
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
                  </CardContent>
                </Card>

                {/* Data Usage Consent */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <BarChart3 className="h-5 w-5 text-[#40E0D0]" />
                      Data Usage Consent
                    </CardTitle>
                    <CardDescription>
                      Control how your data is used to improve our services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="analytics" className="font-medium">
                          Analytics Tracking
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Help us improve by sharing anonymous usage data and analytics
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
                        <Label htmlFor="third-party" className="font-medium">
                          Third-Party Data Sharing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow sharing anonymized data with trusted analytics partners
                        </p>
                      </div>
                      <Switch
                        id="third-party"
                        checked={privacySettings?.thirdPartySharing ?? false}
                        onCheckedChange={(checked) => handleToggle('thirdPartySharing', checked)}
                        disabled={updatePrivacyMutation.isPending}
                        data-testid="switch-third-party-sharing"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Visibility */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Eye className="h-5 w-5 text-[#40E0D0]" />
                      Profile Visibility
                    </CardTitle>
                    <CardDescription>
                      Control who can see your profile and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1 pr-4">
                        <Label htmlFor="profile-visibility" className="font-medium">
                          Profile Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Choose who can view your profile information
                        </p>
                      </div>
                      <Select
                        value={privacySettings?.profileVisibility ?? 'public'}
                        onValueChange={(value) => handleToggle('profileVisibility', value)}
                        disabled={updatePrivacyMutation.isPending}
                      >
                        <SelectTrigger className="w-[180px]" id="profile-visibility" data-testid="select-profile-visibility">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="searchable" className="flex items-center gap-2 font-medium">
                          <Search className="h-4 w-4" />
                          Searchable Profile
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to find your profile through search
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
                        <Label htmlFor="show-activity" className="flex items-center gap-2 font-medium">
                          <Activity className="h-4 w-4" />
                          Show Activity Status
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Display when you're online and your recent activity
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
                  </CardContent>
                </Card>

                {/* GDPR Information */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Shield className="h-5 w-5 text-[#40E0D0]" />
                      Your Data Rights
                    </CardTitle>
                    <CardDescription>
                      Learn about your rights under GDPR
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Under the General Data Protection Regulation (GDPR), you have the right to:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                      <li>Access your personal data</li>
                      <li>Correct inaccurate data</li>
                      <li>Delete your data (right to be forgotten)</li>
                      <li>Export your data in a portable format</li>
                      <li>Restrict processing of your data</li>
                      <li>Object to data processing</li>
                    </ul>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild data-testid="button-view-data-export">
                        <a href="/settings/data-export">Download My Data</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild data-testid="button-view-delete-account">
                        <a href="/settings/delete-account">Delete Account</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
