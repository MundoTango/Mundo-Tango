import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Moon, 
  Clock,
  MessageCircle,
  UserPlus,
  Calendar,
  Users,
  Volume2,
  Monitor,
  BadgeCheck,
  Megaphone,
  Heart,
  Tag
} from "lucide-react";

type DigestMode = 'realtime' | 'hourly' | 'daily';

interface NotificationSettingsState {
  pushEnabled: boolean;
  pushMessages: boolean;
  pushFriendRequests: boolean;
  pushEventInvites: boolean;
  pushEventReminders: boolean;
  pushGroupActivity: boolean;

  emailEnabled: boolean;
  emailWeeklyDigest: boolean;
  emailEventAnnouncements: boolean;
  emailFriendActivity: boolean;
  emailMarketing: boolean;

  inAppSoundEffects: boolean;
  inAppDesktopNotifications: boolean;
  inAppBadgeCounts: boolean;

  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;

  digestMode: DigestMode;
}

const defaultSettings: NotificationSettingsState = {
  pushEnabled: true,
  pushMessages: true,
  pushFriendRequests: true,
  pushEventInvites: true,
  pushEventReminders: true,
  pushGroupActivity: true,

  emailEnabled: true,
  emailWeeklyDigest: true,
  emailEventAnnouncements: true,
  emailFriendActivity: true,
  emailMarketing: false,

  inAppSoundEffects: true,
  inAppDesktopNotifications: true,
  inAppBadgeCounts: true,

  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',

  digestMode: 'realtime',
};

const TIME_OPTIONS = [
  { value: '00:00', label: '12:00 AM' },
  { value: '01:00', label: '1:00 AM' },
  { value: '02:00', label: '2:00 AM' },
  { value: '03:00', label: '3:00 AM' },
  { value: '04:00', label: '4:00 AM' },
  { value: '05:00', label: '5:00 AM' },
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '23:00', label: '11:00 PM' },
];

export default function NotificationsSubTab() {
  const { profile, useUpdatePreferences } = useAuth();
  const { toast } = useToast();
  const updatePreferencesMutation = useUpdatePreferences();

  const [settings, setSettings] = useState<NotificationSettingsState>(defaultSettings);

  useEffect(() => {
    if (profile) {
      const notificationSettings = (profile as any).notificationSettings;
      if (notificationSettings) {
        setSettings({
          pushEnabled: notificationSettings.pushEnabled ?? true,
          pushMessages: notificationSettings.pushMessages ?? true,
          pushFriendRequests: notificationSettings.pushFriendRequests ?? true,
          pushEventInvites: notificationSettings.pushEventInvites ?? true,
          pushEventReminders: notificationSettings.pushEventReminders ?? true,
          pushGroupActivity: notificationSettings.pushGroupActivity ?? true,

          emailEnabled: notificationSettings.emailEnabled ?? true,
          emailWeeklyDigest: notificationSettings.emailWeeklyDigest ?? true,
          emailEventAnnouncements: notificationSettings.emailEventAnnouncements ?? true,
          emailFriendActivity: notificationSettings.emailFriendActivity ?? true,
          emailMarketing: notificationSettings.emailMarketing ?? false,

          inAppSoundEffects: notificationSettings.inAppSoundEffects ?? true,
          inAppDesktopNotifications: notificationSettings.inAppDesktopNotifications ?? true,
          inAppBadgeCounts: notificationSettings.inAppBadgeCounts ?? true,

          quietHoursEnabled: notificationSettings.quietHoursEnabled ?? false,
          quietHoursStart: notificationSettings.quietHoursStart ?? '22:00',
          quietHoursEnd: notificationSettings.quietHoursEnd ?? '08:00',

          digestMode: notificationSettings.digestMode ?? 'realtime',
        });
      }
    }
  }, [profile]);

  const handleSettingUpdate = useCallback(async <K extends keyof NotificationSettingsState>(
    key: K, 
    value: NotificationSettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await updatePreferencesMutation.mutateAsync({ 
        notificationSettings: newSettings 
      } as any);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      setSettings(settings);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    }
  }, [settings, updatePreferencesMutation, toast]);

  const isPending = updatePreferencesMutation.isPending;

  return (
    <div className="space-y-6" data-testid="notifications-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Control push notifications on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Enable Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all push notifications
              </p>
            </div>
            <Switch 
              id="push-enabled" 
              checked={settings.pushEnabled}
              onCheckedChange={(checked) => handleSettingUpdate('pushEnabled', checked)}
              disabled={isPending}
              data-testid="switch-push-enabled" 
            />
          </div>
          
          {settings.pushEnabled && (
            <>
              <Separator />
              <div className="ml-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-messages" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New direct messages
                    </p>
                  </div>
                  <Switch 
                    id="push-messages" 
                    checked={settings.pushMessages}
                    onCheckedChange={(checked) => handleSettingUpdate('pushMessages', checked)}
                    disabled={isPending}
                    data-testid="switch-push-messages" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-friend-requests" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Friend Requests
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New friend requests and accepts
                    </p>
                  </div>
                  <Switch 
                    id="push-friend-requests" 
                    checked={settings.pushFriendRequests}
                    onCheckedChange={(checked) => handleSettingUpdate('pushFriendRequests', checked)}
                    disabled={isPending}
                    data-testid="switch-push-friend-requests" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-event-invites" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Invites
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Invitations to events
                    </p>
                  </div>
                  <Switch 
                    id="push-event-invites" 
                    checked={settings.pushEventInvites}
                    onCheckedChange={(checked) => handleSettingUpdate('pushEventInvites', checked)}
                    disabled={isPending}
                    data-testid="switch-push-event-invites" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-event-reminders" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Event Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders before events start
                    </p>
                  </div>
                  <Switch 
                    id="push-event-reminders" 
                    checked={settings.pushEventReminders}
                    onCheckedChange={(checked) => handleSettingUpdate('pushEventReminders', checked)}
                    disabled={isPending}
                    data-testid="switch-push-event-reminders" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-group-activity" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Group Activity
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Posts and updates in your groups
                    </p>
                  </div>
                  <Switch 
                    id="push-group-activity" 
                    checked={settings.pushGroupActivity}
                    onCheckedChange={(checked) => handleSettingUpdate('pushGroupActivity', checked)}
                    disabled={isPending}
                    data-testid="switch-push-group-activity" 
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Control email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Enable Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Master toggle for all email notifications
              </p>
            </div>
            <Switch 
              id="email-enabled" 
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => handleSettingUpdate('emailEnabled', checked)}
              disabled={isPending}
              data-testid="switch-email-enabled" 
            />
          </div>
          
          {settings.emailEnabled && (
            <>
              <Separator />
              <div className="ml-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-weekly-digest" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Weekly Digest
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Summary of activity and updates
                    </p>
                  </div>
                  <Switch 
                    id="email-weekly-digest" 
                    checked={settings.emailWeeklyDigest}
                    onCheckedChange={(checked) => handleSettingUpdate('emailWeeklyDigest', checked)}
                    disabled={isPending}
                    data-testid="switch-email-weekly-digest" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-event-announcements" className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4" />
                      Event Announcements
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New events in your area
                    </p>
                  </div>
                  <Switch 
                    id="email-event-announcements" 
                    checked={settings.emailEventAnnouncements}
                    onCheckedChange={(checked) => handleSettingUpdate('emailEventAnnouncements', checked)}
                    disabled={isPending}
                    data-testid="switch-email-event-announcements" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-friend-activity" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Friend Activity
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Updates from friends
                    </p>
                  </div>
                  <Switch 
                    id="email-friend-activity" 
                    checked={settings.emailFriendActivity}
                    onCheckedChange={(checked) => handleSettingUpdate('emailFriendActivity', checked)}
                    disabled={isPending}
                    data-testid="switch-email-friend-activity" 
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-marketing" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Marketing & Promotions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Special offers and news
                    </p>
                  </div>
                  <Switch 
                    id="email-marketing" 
                    checked={settings.emailMarketing}
                    onCheckedChange={(checked) => handleSettingUpdate('emailMarketing', checked)}
                    disabled={isPending}
                    data-testid="switch-email-marketing" 
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Control in-app notification behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-sound-effects" className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Sound Effects
              </Label>
              <p className="text-sm text-muted-foreground">
                Play sounds for notifications
              </p>
            </div>
            <Switch 
              id="inapp-sound-effects" 
              checked={settings.inAppSoundEffects}
              onCheckedChange={(checked) => handleSettingUpdate('inAppSoundEffects', checked)}
              disabled={isPending}
              data-testid="switch-inapp-sound-effects" 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-desktop-notifications" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show browser notifications on desktop
              </p>
            </div>
            <Switch 
              id="inapp-desktop-notifications" 
              checked={settings.inAppDesktopNotifications}
              onCheckedChange={(checked) => handleSettingUpdate('inAppDesktopNotifications', checked)}
              disabled={isPending}
              data-testid="switch-inapp-desktop-notifications" 
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inapp-badge-counts" className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" />
                Badge Counts
              </Label>
              <p className="text-sm text-muted-foreground">
                Show notification badges on icons
              </p>
            </div>
            <Switch 
              id="inapp-badge-counts" 
              checked={settings.inAppBadgeCounts}
              onCheckedChange={(checked) => handleSettingUpdate('inAppBadgeCounts', checked)}
              disabled={isPending}
              data-testid="switch-inapp-badge-counts" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when notifications are muted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiet-hours-enabled" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Enable Quiet Hours
              </Label>
              <p className="text-sm text-muted-foreground">
                Silence notifications during specific hours
              </p>
            </div>
            <Switch 
              id="quiet-hours-enabled" 
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => handleSettingUpdate('quietHoursEnabled', checked)}
              disabled={isPending}
              data-testid="switch-quiet-hours-enabled" 
            />
          </div>
          
          {settings.quietHoursEnabled && (
            <>
              <Separator />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <Label htmlFor="quiet-hours-start" className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </Label>
                  <Select 
                    value={settings.quietHoursStart}
                    onValueChange={(value) => handleSettingUpdate('quietHoursStart', value)}
                    disabled={isPending}
                  >
                    <SelectTrigger 
                      id="quiet-hours-start" 
                      className="w-full"
                      data-testid="select-quiet-hours-start"
                    >
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 w-full">
                  <Label htmlFor="quiet-hours-end" className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    End Time
                  </Label>
                  <Select 
                    value={settings.quietHoursEnd}
                    onValueChange={(value) => handleSettingUpdate('quietHoursEnd', value)}
                    disabled={isPending}
                  >
                    <SelectTrigger 
                      id="quiet-hours-end" 
                      className="w-full"
                      data-testid="select-quiet-hours-end"
                    >
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            Control how often you receive notification digests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="digest-mode" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Delivery Frequency
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose how often to receive notification summaries
              </p>
            </div>
            <Select 
              value={settings.digestMode}
              onValueChange={(value) => handleSettingUpdate('digestMode', value as DigestMode)}
              disabled={isPending}
            >
              <SelectTrigger 
                className="w-[180px]" 
                id="digest-mode" 
                data-testid="select-digest-mode"
              >
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
