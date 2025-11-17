import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, MessageCircle, Users, Calendar, Save } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface NotificationSettings {
  emailNotifications: {
    friendRequests: boolean;
    messages: boolean;
    events: boolean;
    comments: boolean;
  };
  pushNotifications: {
    friendRequests: boolean;
    messages: boolean;
    events: boolean;
    comments: boolean;
  };
  frequency: 'realtime' | 'daily' | 'weekly';
}

export default function NotificationSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: {
      friendRequests: true,
      messages: true,
      events: true,
      comments: true,
    },
    pushNotifications: {
      friendRequests: true,
      messages: true,
      events: true,
      comments: true,
    },
    frequency: 'realtime',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleEmailToggle = (category: keyof NotificationSettings['emailNotifications']) => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [category]: !prev.emailNotifications[category],
      },
    }));
  };

  const handlePushToggle = (category: keyof NotificationSettings['pushNotifications']) => {
    setSettings(prev => ({
      ...prev,
      pushNotifications: {
        ...prev.pushNotifications,
        [category]: !prev.pushNotifications[category],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved successfully.",
    });
    setIsSaving(false);
  };

  return (
    <PageLayout title="Notification Settings" showBreadcrumbs>
      <SelfHealingErrorBoundary pageName="Notification Settings" fallbackRoute="/settings">
        <SEO
          title="Notification Settings | Mundo Tango"
          description="Customize your notification preferences. Choose which push notifications and alerts you receive for events, messages, friend requests, and community updates."
        />
        <div className="container mx-auto max-w-4xl p-6 space-y-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-serif font-bold mb-3">Notification Settings</h1>
            <p className="text-lg text-muted-foreground">
              Customize how and when you receive notifications
            </p>
          </motion.div>

          {/* Notification Frequency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Bell className="w-5 h-5 text-[#40E0D0]" />
                  Notification Frequency
                </CardTitle>
                <CardDescription>
                  Choose how often you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-base font-semibold">
                    Delivery Frequency
                  </Label>
                  <Select
                    value={settings.frequency}
                    onValueChange={(value: any) =>
                      setSettings(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger id="frequency" data-testid="select-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time (as they happen)</SelectItem>
                      <SelectItem value="daily">Daily Digest (once per day)</SelectItem>
                      <SelectItem value="weekly">Weekly Digest (once per week)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {settings.frequency === 'realtime' && 'Receive notifications immediately as events occur'}
                    {settings.frequency === 'daily' && 'Get a summary of all notifications once per day'}
                    {settings.frequency === 'weekly' && 'Get a weekly summary of all your notifications'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Mail className="w-5 h-5 text-[#40E0D0]" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Manage what you receive via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-friend-requests" className="text-base font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friend Requests
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone sends you a friend request
                    </p>
                  </div>
                  <Switch
                    id="email-friend-requests"
                    checked={settings.emailNotifications.friendRequests}
                    onCheckedChange={() => handleEmailToggle('friendRequests')}
                    data-testid="switch-email-friend-requests"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-messages" className="text-base font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When you receive a new message
                    </p>
                  </div>
                  <Switch
                    id="email-messages"
                    checked={settings.emailNotifications.messages}
                    onCheckedChange={() => handleEmailToggle('messages')}
                    data-testid="switch-email-messages"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-events" className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Events
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Event reminders and updates
                    </p>
                  </div>
                  <Switch
                    id="email-events"
                    checked={settings.emailNotifications.events}
                    onCheckedChange={() => handleEmailToggle('events')}
                    data-testid="switch-email-events"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-comments" className="text-base font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Comments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone comments on your posts
                    </p>
                  </div>
                  <Switch
                    id="email-comments"
                    checked={settings.emailNotifications.comments}
                    onCheckedChange={() => handleEmailToggle('comments')}
                    data-testid="switch-email-comments"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Push Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Bell className="w-5 h-5 text-[#40E0D0]" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Manage browser and mobile push notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-friend-requests" className="text-base font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Friend Requests
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Instant alerts for new friend requests
                    </p>
                  </div>
                  <Switch
                    id="push-friend-requests"
                    checked={settings.pushNotifications.friendRequests}
                    onCheckedChange={() => handlePushToggle('friendRequests')}
                    data-testid="switch-push-friend-requests"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-messages" className="text-base font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Instant alerts for new messages
                    </p>
                  </div>
                  <Switch
                    id="push-messages"
                    checked={settings.pushNotifications.messages}
                    onCheckedChange={() => handlePushToggle('messages')}
                    data-testid="switch-push-messages"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-events" className="text-base font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Events
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders before events start
                    </p>
                  </div>
                  <Switch
                    id="push-events"
                    checked={settings.pushNotifications.events}
                    onCheckedChange={() => handlePushToggle('events')}
                    data-testid="switch-push-events"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-comments" className="text-base font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Comments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts for comments on your posts
                    </p>
                  </div>
                  <Switch
                    id="push-comments"
                    checked={settings.pushNotifications.comments}
                    onCheckedChange={() => handlePushToggle('comments')}
                    data-testid="switch-push-comments"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              data-testid="button-save-notifications"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </motion.div>
        </div>
      </SelfHealingErrorBoundary>
    </PageLayout>
  );
}
