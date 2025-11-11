import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Shield, Bell, Mail, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "Mundo Tango",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxUploadSize: 10,
    sessionTimeout: 24,
    enableNotifications: true,
    enableEmailAlerts: true,
  });

  const handleSave = () => {
    toast({ title: "Settings saved successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-settings-title">
            Platform Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your Mundo Tango platform
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" data-testid="tab-general">
              <Settings className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="email" data-testid="tab-email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">
              <Code className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    data-testid="input-site-name"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable public access to the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                    data-testid="switch-maintenance"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow New Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable user sign-ups
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, allowRegistration: checked })
                    }
                    data-testid="switch-registration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uploadSize">Max Upload Size (MB)</Label>
                  <Input
                    id="uploadSize"
                    type="number"
                    value={settings.maxUploadSize}
                    onChange={(e) =>
                      setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })
                    }
                    data-testid="input-upload-size"
                  />
                </div>

                <Button onClick={handleSave} data-testid="button-save-general">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify email before accessing the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, requireEmailVerification: checked })
                    }
                    data-testid="switch-email-verification"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                    }
                    data-testid="input-session-timeout"
                  />
                  <p className="text-sm text-muted-foreground">
                    How long users can stay logged in without activity
                  </p>
                </div>

                <Button onClick={handleSave} data-testid="button-save-security">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow real-time notifications across the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableNotifications: checked })
                    }
                    data-testid="switch-notifications"
                  />
                </div>

                <Button onClick={handleSave} data-testid="button-save-notifications">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send admin alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enableEmailAlerts: checked })
                    }
                    data-testid="switch-email-alerts"
                  />
                </div>

                <Button onClick={handleSave} data-testid="button-save-email">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold text-foreground mb-2">Database Management</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Advanced database operations and maintenance
                  </p>
                  <Button variant="outline" data-testid="button-database">
                    Manage Database
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <Code className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-semibold text-foreground mb-2">API Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure API rate limits and access control
                  </p>
                  <Button variant="outline" data-testid="button-api-config">
                    Configure API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
