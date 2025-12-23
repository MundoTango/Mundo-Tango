import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield,
  Loader2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useUser } from "@/hooks/use-user";

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  profileVisibility: "public" | "friends" | "private";
  showEmail: boolean;
  showPhone: boolean;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
}

export default function UserSettingsPage() {
  const { t } = useTranslation(['pages', 'common']);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useUser();

  const { data: settings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/users/me/settings"],
  });

  const isLoading = userLoading || settingsLoading;

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) =>
      apiRequest("/api/users/me/settings", "PATCH", data),
    onSuccess: () => {
      toast({ title: t('pages:settings.settingsUpdated', 'Settings updated successfully') });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/settings"] });
    },
    onError: () => {
      toast({ title: t('pages:settings.updateFailed', 'Failed to update settings'), variant: "destructive" });
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: typeof passwordForm) =>
      apiRequest("/api/users/me/password", "PATCH", data),
    onSuccess: () => {
      toast({ title: t('pages:settings.passwordChanged', 'Password changed successfully') });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => {
      toast({ title: t('pages:settings.passwordChangeFailed', 'Failed to change password'), variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName={t('pages:settings.userSettings', 'User Settings')} fallbackRoute="/settings">
      <>
        <SEO
          title={t('pages:settings.title', 'User Settings')}
          description={t('pages:settings.description', 'Manage your account settings, privacy preferences, notifications, and security options.')}
        />
        
        <PageLayout title={t('pages:settings.title', 'Settings')} showBreadcrumbs>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="container max-w-4xl mx-auto p-6" data-testid="page-user-settings">
              <motion.div 
                className="text-center pb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {t('pages:settings.yourSettings', 'Your Settings')}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {t('pages:settings.customizePreferences', 'Customize your account, privacy, notifications, and security preferences')}
                </p>
              </motion.div>

              <Tabs defaultValue="account" data-testid="tabs-settings">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account" data-testid="tab-account">
            <User className="h-4 w-4 mr-2" />
            {t('pages:settings.account', 'Account')}
          </TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">
            <Lock className="h-4 w-4 mr-2" />
            {t('pages:settings.privacy', 'Privacy')}
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            {t('pages:settings.notifications', 'Notifications')}
          </TabsTrigger>
          <TabsTrigger value="preferences" data-testid="tab-preferences">
            <Globe className="h-4 w-4 mr-2" />
            {t('pages:settings.preferences', 'Preferences')}
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="h-4 w-4 mr-2" />
            {t('pages:settings.security', 'Security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:settings.accountInformation', 'Account Information')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">{t('pages:settings.name', 'Name')}</Label>
                <Input 
                  id="name" 
                  type="text" 
                  defaultValue={user?.name || ""} 
                  placeholder={t('pages:settings.yourFullName', 'Your full name')}
                  data-testid="input-name" 
                />
              </div>
              <div>
                <Label htmlFor="email">{t('pages:settings.email', 'Email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={user?.email || ""} 
                  placeholder={t('pages:settings.emailPlaceholder', 'your@email.com')} 
                  data-testid="input-email" 
                  disabled 
                />
                <p className="text-sm text-muted-foreground mt-1">{t('pages:settings.emailCannotBeChanged', 'Email cannot be changed')}</p>
              </div>
              <div>
                <Label htmlFor="username">{t('pages:settings.username', 'Username')}</Label>
                <Input 
                  id="username" 
                  defaultValue={user?.username || ""} 
                  placeholder={t('pages:settings.usernamePlaceholder', '@username')} 
                  data-testid="input-username" 
                />
              </div>
              <div>
                <Label htmlFor="city">{t('pages:settings.location', 'Location')}</Label>
                <Input 
                  id="city" 
                  defaultValue={user?.city && user?.country ? `${user.city}, ${user.country}` : ""} 
                  placeholder={t('pages:settings.cityCountryPlaceholder', 'City, Country')} 
                  data-testid="input-location" 
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">{t('pages:settings.tangoExperience', 'Tango Experience')}</h3>
                <div>
                  <Label htmlFor="yearsOfDancing">{t('pages:settings.yearsOfDancing', 'Years of Dancing')}</Label>
                  <Input 
                    id="yearsOfDancing" 
                    type="number" 
                    min="0" 
                    max="100"
                    defaultValue={user?.yearsOfDancing || 0}
                    placeholder="0" 
                    data-testid="input-years-dancing" 
                  />
                </div>
                <div>
                  <Label htmlFor="leaderLevel">{t('pages:settings.leaderLevel', 'Leader Level (0-5)')}</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="leaderLevel"
                      min={0}
                      max={5}
                      step={1}
                      defaultValue={[user?.leaderLevel || 0]}
                      className="flex-1"
                      data-testid="slider-leader-level"
                    />
                    <Badge variant="secondary">{user?.leaderLevel || 0}</Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="followerLevel">{t('pages:settings.followerLevel', 'Follower Level (0-5)')}</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="followerLevel"
                      min={0}
                      max={5}
                      step={1}
                      defaultValue={[user?.followerLevel || 0]}
                      className="flex-1"
                      data-testid="slider-follower-level"
                    />
                    <Badge variant="secondary">{user?.followerLevel || 0}</Badge>
                  </div>
                </div>
              </div>
              <Button data-testid="button-save-account">{t('pages:settings.saveChanges', 'Save Changes')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:settings.privacySettings', 'Privacy Settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.profileVisibility', 'Profile Visibility')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.controlWhoCanSee', 'Control who can see your profile')}
                  </p>
                </div>
                <select 
                  className="border rounded-md px-3 py-2"
                  value={settings?.profileVisibility || "public"}
                  onChange={(e) => updateSettingsMutation.mutate({ 
                    profileVisibility: e.target.value as any 
                  })}
                  data-testid="select-profile-visibility"
                >
                  <option value="public">{t('pages:settings.public', 'Public')}</option>
                  <option value="friends">{t('pages:settings.friendsOnly', 'Friends Only')}</option>
                  <option value="private">{t('pages:settings.private', 'Private')}</option>
                </select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.showEmail', 'Show Email')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.displayEmailOnProfile', 'Display your email on your profile')}
                  </p>
                </div>
                <Switch
                  checked={settings?.showEmail || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ showEmail: checked })}
                  data-testid="switch-show-email"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.showPhone', 'Show Phone')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.displayPhoneOnProfile', 'Display your phone number on your profile')}
                  </p>
                </div>
                <Switch
                  checked={settings?.showPhone || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ showPhone: checked })}
                  data-testid="switch-show-phone"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:settings.notificationPreferences', 'Notification Preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.emailNotifications', 'Email Notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.receiveViaEmail', 'Receive notifications via email')}
                  </p>
                </div>
                <Switch
                  checked={settings?.emailNotifications || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ emailNotifications: checked })}
                  data-testid="switch-email-notifications"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.pushNotifications', 'Push Notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.receiveViaPush', 'Receive push notifications in browser')}
                  </p>
                </div>
                <Switch
                  checked={settings?.pushNotifications || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ pushNotifications: checked })}
                  data-testid="switch-push-notifications"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.smsNotifications', 'SMS Notifications')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('pages:settings.receiveViaSms', 'Receive notifications via SMS')}
                  </p>
                </div>
                <Switch
                  checked={settings?.smsNotifications || false}
                  onCheckedChange={(checked) => updateSettingsMutation.mutate({ smsNotifications: checked })}
                  data-testid="switch-sms-notifications"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:settings.languageRegion', 'Language & Region')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="language">{t('pages:settings.language', 'Language')}</Label>
                <select 
                  id="language"
                  className="w-full border rounded-md px-3 py-2 mt-2"
                  value={settings?.language || "en"}
                  onChange={(e) => updateSettingsMutation.mutate({ language: e.target.value })}
                  data-testid="select-language"
                >
                  <option value="en">{t('pages:settings.english', 'English')}</option>
                  <option value="es">{t('pages:settings.spanish', 'Español')}</option>
                  <option value="fr">{t('pages:settings.french', 'Français')}</option>
                  <option value="de">{t('pages:settings.german', 'Deutsch')}</option>
                  <option value="it">{t('pages:settings.italian', 'Italiano')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="timezone">{t('pages:settings.timezone', 'Timezone')}</Label>
                <select 
                  id="timezone"
                  className="w-full border rounded-md px-3 py-2 mt-2"
                  value={settings?.timezone || "UTC"}
                  onChange={(e) => updateSettingsMutation.mutate({ timezone: e.target.value })}
                  data-testid="select-timezone"
                >
                  <option value="UTC">{t('pages:settings.utc', 'UTC')}</option>
                  <option value="America/New_York">{t('pages:settings.easternTime', 'Eastern Time')}</option>
                  <option value="America/Chicago">{t('pages:settings.centralTime', 'Central Time')}</option>
                  <option value="America/Los_Angeles">{t('pages:settings.pacificTime', 'Pacific Time')}</option>
                  <option value="Europe/London">{t('pages:settings.london', 'London')}</option>
                  <option value="Europe/Paris">{t('pages:settings.paris', 'Paris')}</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages:settings.changePassword', 'Change Password')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">{t('pages:settings.currentPassword', 'Current Password')}</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  data-testid="input-current-password"
                />
              </div>
              <div>
                <Label htmlFor="new-password">{t('pages:settings.newPassword', 'New Password')}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">{t('pages:settings.confirmNewPassword', 'Confirm New Password')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button
                onClick={() => changePasswordMutation.mutate(passwordForm)}
                disabled={changePasswordMutation.isPending}
                data-testid="button-change-password"
              >
                {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('pages:settings.changePassword', 'Change Password')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages:settings.twoFactorAuth', 'Two-Factor Authentication')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('pages:settings.twoFaStatus', '2FA Status')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {settings?.twoFactorEnabled ? t('pages:settings.enabled', 'Enabled') : t('pages:settings.disabled', 'Disabled')}
                  </p>
                </div>
                {settings?.twoFactorEnabled ? (
                  <Badge variant="default">{t('pages:settings.enabled', 'Enabled')}</Badge>
                ) : (
                  <Button variant="outline" data-testid="button-enable-2fa">
                    {t('pages:settings.enable2fa', 'Enable 2FA')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </PageLayout>
      </>
    </SelfHealingErrorBoundary>
  );
}
