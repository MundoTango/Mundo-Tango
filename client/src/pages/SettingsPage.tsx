import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Crown, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { profile, useUpdatePreferences, useSubscription } = useAuth();
  const { toast } = useToast();
  const updatePreferencesMutation = useUpdatePreferences();
  const { data: subscription } = useSubscription();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [locationSharing, setLocationSharing] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (profile) {
      setEmailNotifications(profile.email_notifications ?? true);
      setPushNotifications(profile.push_notifications ?? true);
      setProfileVisibility(profile.profile_visibility ?? 'public');
      setLocationSharing(profile.location_sharing ?? true);
      setLanguage(profile.language ?? 'en');
    }
  }, [profile]);

  const handlePreferenceUpdate = async (updates: Record<string, any>) => {
    try {
      await updatePreferencesMutation.mutateAsync(updates);
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleEmailNotificationsChange = (checked: boolean) => {
    setEmailNotifications(checked);
    handlePreferenceUpdate({ email_notifications: checked });
  };

  const handlePushNotificationsChange = (checked: boolean) => {
    setPushNotifications(checked);
    handlePreferenceUpdate({ push_notifications: checked });
  };

  const handleProfileVisibilityChange = (value: 'public' | 'friends' | 'private') => {
    setProfileVisibility(value);
    handlePreferenceUpdate({ profile_visibility: value });
  };

  const handleLocationSharingChange = (checked: boolean) => {
    setLocationSharing(checked);
    handlePreferenceUpdate({ location_sharing: checked });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    handlePreferenceUpdate({ language: value });
  };

  return (
    <>
      <SEO 
        title="Settings"
        description="Customize your Mundo Tango experience. Manage account settings, privacy preferences, and notification options."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>

        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Current Plan</Label>
                  <p className="text-sm text-muted-foreground">
                    {subscription.plan === 'free' && 'You are on the free plan'}
                    {subscription.plan === 'pro' && 'You are subscribed to Pro'}
                    {subscription.plan === 'enterprise' && 'You are on the Enterprise plan'}
                  </p>
                </div>
                <Badge variant={subscription.plan === 'free' ? 'secondary' : 'default'} data-testid="badge-subscription-plan">
                  {subscription.plan}
                </Badge>
              </div>
              {subscription.status && subscription.status !== 'active' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Your subscription status
                      </p>
                    </div>
                    <Badge variant="outline" data-testid="badge-subscription-status">
                      {subscription.status}
                    </Badge>
                  </div>
                </>
              )}
              {subscription.current_period_end && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Next Billing Date</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <Separator />
              <Button variant="outline" className="w-full" data-testid="button-manage-subscription">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications}
                onCheckedChange={handleEmailNotificationsChange}
                disabled={updatePreferencesMutation.isPending}
                data-testid="switch-email-notifications" 
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={pushNotifications}
                onCheckedChange={handlePushNotificationsChange}
                disabled={updatePreferencesMutation.isPending}
                data-testid="switch-push-notifications" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Control who can see your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile
                </p>
              </div>
              <Select 
                value={profileVisibility}
                onValueChange={handleProfileVisibilityChange}
                disabled={updatePreferencesMutation.isPending}
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
                <Label htmlFor="location-sharing">Location Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share your location with other users
                </p>
              </div>
              <Switch 
                id="location-sharing" 
                checked={locationSharing}
                onCheckedChange={handleLocationSharingChange}
                disabled={updatePreferencesMutation.isPending}
                data-testid="switch-location-sharing" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
            <CardDescription>
              Set your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="language">Language</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
              <Select 
                value={language}
                onValueChange={handleLanguageChange}
                disabled={updatePreferencesMutation.isPending}
              >
                <SelectTrigger className="w-[180px]" id="language" data-testid="select-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Switch id="two-factor" disabled data-testid="switch-two-factor" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Button variant="outline" className="w-full" data-testid="button-change-password">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
