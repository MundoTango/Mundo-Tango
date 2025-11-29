import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Bell, Mail } from "lucide-react";

export default function NotificationsSubTab() {
  const { profile, useUpdatePreferences } = useAuth();
  const { toast } = useToast();
  const updatePreferencesMutation = useUpdatePreferences();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      setEmailNotifications((profile as any).email_notifications ?? true);
      setPushNotifications((profile as any).push_notifications ?? true);
    }
  }, [profile]);

  const handlePreferenceUpdate = async (updates: Record<string, any>) => {
    try {
      await updatePreferencesMutation.mutateAsync(updates);
      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
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

  return (
    <div className="space-y-6" data-testid="notifications-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
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
              <Label htmlFor="push-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Push Notifications
              </Label>
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
    </div>
  );
}
