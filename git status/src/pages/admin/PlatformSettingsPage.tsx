import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Mail, Bell, Shield, Database, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  apiRateLimit: number;
  maxUploadSize: number;
}

export default function PlatformSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  const { data: settings, isLoading } = useQuery<PlatformSettings>({
    queryKey: ['/api/admin/settings'],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<PlatformSettings>) => {
      return apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: 'Settings Saved',
        description: 'Platform settings have been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    },
  });

  const [formData, setFormData] = useState<Partial<PlatformSettings>>({});

  const handleSave = (section: string) => {
    saveSettingsMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="page-platform-settings">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure platform-wide settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">
            <Database className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  defaultValue={settings?.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  data-testid="input-site-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  defaultValue={settings?.siteDescription}
                  onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                  data-testid="input-site-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  defaultValue={settings?.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  data-testid="input-logo-url"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Disable access to the platform for maintenance
                  </p>
                </div>
                <Switch
                  checked={formData.maintenanceMode ?? settings?.maintenanceMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                  data-testid="switch-maintenance-mode"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Signups</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  checked={formData.signupsEnabled ?? settings?.signupsEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, signupsEnabled: checked })}
                  data-testid="switch-signups-enabled"
                />
              </div>

              <Button onClick={() => handleSave('general')} data-testid="button-save-general">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>SMTP settings for outbound email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  defaultValue={settings?.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  data-testid="input-smtp-host"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  defaultValue={settings?.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                  data-testid="input-smtp-port"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  defaultValue={settings?.smtpUser}
                  onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                  data-testid="input-smtp-user"
                />
              </div>

              <Button onClick={() => handleSave('email')} data-testid="button-save-email">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications to users
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications ?? settings?.emailNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                  data-testid="switch-email-notifications"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable push notifications
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications ?? settings?.pushNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
                  data-testid="switch-push-notifications"
                />
              </div>

              <Button onClick={() => handleSave('notifications')} data-testid="button-save-notifications">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>API and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  defaultValue={settings?.apiRateLimit}
                  onChange={(e) => setFormData({ ...formData, apiRateLimit: parseInt(e.target.value) })}
                  data-testid="input-api-rate-limit"
                />
              </div>

              <Button onClick={() => handleSave('security')} data-testid="button-save-security">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                <Input
                  id="maxUploadSize"
                  type="number"
                  defaultValue={settings?.maxUploadSize}
                  onChange={(e) => setFormData({ ...formData, maxUploadSize: parseInt(e.target.value) })}
                  data-testid="input-max-upload-size"
                />
              </div>

              <Button onClick={() => handleSave('advanced')} data-testid="button-save-advanced">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
