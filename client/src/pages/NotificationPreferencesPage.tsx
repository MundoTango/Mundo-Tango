import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Users, Calendar, MessageSquare, Heart, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";

interface EmailPreferences {
  newMessage: boolean;
  friendRequest: boolean;
  eventInvite: boolean;
  eventReminder: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface NotificationPreferencesData {
  browserPushEnabled: boolean;
  pushEvents: boolean;
  pushMessages: boolean;
  pushFriendRequests: boolean;
  pushGroupInvites: boolean;
  pushReactions: boolean;
  inAppEnabled: boolean;
  inAppEvents: boolean;
  inAppMessages: boolean;
  inAppFriendRequests: boolean;
  inAppGroupInvites: boolean;
  inAppReactions: boolean;
}

export default function NotificationPreferencesPage() {
  const { toast } = useToast();
  
  const { data: emailPrefs, isLoading: isLoadingEmail } = useQuery<EmailPreferences>({
    queryKey: ['/api/user/email-preferences'],
  });

  const { data: notificationPrefs, isLoading: isLoadingNotifications } = useQuery<NotificationPreferencesData>({
    queryKey: ['/api/notifications/preferences'],
  });

  const [emailSettings, setEmailSettings] = useState<EmailPreferences>({
    newMessage: false,
    friendRequest: false,
    eventInvite: false,
    eventReminder: false,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const [pushSettings, setPushSettings] = useState<NotificationPreferencesData>({
    browserPushEnabled: false,
    pushEvents: true,
    pushMessages: true,
    pushFriendRequests: true,
    pushGroupInvites: true,
    pushReactions: false,
    inAppEnabled: true,
    inAppEvents: true,
    inAppMessages: true,
    inAppFriendRequests: true,
    inAppGroupInvites: true,
    inAppReactions: true,
  });

  useEffect(() => {
    if (emailPrefs) {
      setEmailSettings(emailPrefs);
    }
  }, [emailPrefs]);

  useEffect(() => {
    if (notificationPrefs) {
      setPushSettings(notificationPrefs);
    }
  }, [notificationPrefs]);

  const updateEmailMutation = useMutation({
    mutationFn: async (data: Partial<EmailPreferences>) => {
      return await apiRequest("/api/user/email-preferences", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/email-preferences'] });
      toast({ title: "Email preferences saved" });
    },
    onError: () => {
      toast({ title: "Failed to save email preferences", variant: "destructive" });
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferencesData>) => {
      return await apiRequest("/api/notifications/preferences", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
      toast({ title: "Notification preferences saved" });
    },
    onError: () => {
      toast({ title: "Failed to save notification preferences", variant: "destructive" });
    },
  });

  const handleEmailToggle = (key: keyof EmailPreferences) => {
    const newValue = !emailSettings[key];
    setEmailSettings(prev => ({ ...prev, [key]: newValue }));
    updateEmailMutation.mutate({ [key]: newValue });
  };

  const handlePushToggle = (key: keyof NotificationPreferencesData) => {
    const newValue = !pushSettings[key];
    setPushSettings(prev => ({ ...prev, [key]: newValue }));
    updateNotificationMutation.mutate({ [key]: newValue });
  };

  return (
    <AppLayout>
      <SEO 
        title="Notification Preferences"
        description="Customize email and push notification settings for events, messages, friend requests, and community updates on Mundo Tango"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3" data-testid="text-notification-prefs-title">
              <Bell className="h-10 w-10 text-primary" />
              Notification Preferences
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage how and when you receive notifications
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Receive updates and alerts via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingEmail ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-event-invite" className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Event Invites
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications about new event invitations
                        </p>
                      </div>
                      <Switch
                        id="email-event-invite"
                        checked={emailSettings.eventInvite}
                        onCheckedChange={() => handleEmailToggle('eventInvite')}
                        disabled={updateEmailMutation.isPending}
                        data-testid="switch-email-event-invite"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-new-message" className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          New Messages
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          New direct messages from other users
                        </p>
                      </div>
                      <Switch
                        id="email-new-message"
                        checked={emailSettings.newMessage}
                        onCheckedChange={() => handleEmailToggle('newMessage')}
                        disabled={updateEmailMutation.isPending}
                        data-testid="switch-email-new-message"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-friend-request" className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Friend Requests
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When someone sends you a friend request
                        </p>
                      </div>
                      <Switch
                        id="email-friend-request"
                        checked={emailSettings.friendRequest}
                        onCheckedChange={() => handleEmailToggle('friendRequest')}
                        disabled={updateEmailMutation.isPending}
                        data-testid="switch-email-friend-request"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-event-reminder" className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Event Reminders
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Reminders before events you're attending
                        </p>
                      </div>
                      <Switch
                        id="email-event-reminder"
                        checked={emailSettings.eventReminder}
                        onCheckedChange={() => handleEmailToggle('eventReminder')}
                        disabled={updateEmailMutation.isPending}
                        data-testid="switch-email-event-reminder"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-weekly-digest" className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Weekly Digest
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Weekly summary of tango news and tips
                        </p>
                      </div>
                      <Switch
                        id="email-weekly-digest"
                        checked={emailSettings.weeklyDigest}
                        onCheckedChange={() => handleEmailToggle('weeklyDigest')}
                        disabled={updateEmailMutation.isPending}
                        data-testid="switch-email-weekly-digest"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-marketing" className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Promotional content and special offers
                        </p>
                      </div>
                      <Switch
                        id="email-marketing"
                        checked={emailSettings.marketingEmails}
                        onCheckedChange={() => handleEmailToggle('marketingEmails')}
                        disabled={updateEmailMutation.isPending}
                        data-testid="switch-email-marketing"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Browser Push Notifications
                </CardTitle>
                <CardDescription>
                  Real-time alerts in your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-enabled" className="text-base flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          Enable Browser Push
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow browser notifications when you're not on the site
                        </p>
                      </div>
                      <Switch
                        id="push-enabled"
                        checked={pushSettings.browserPushEnabled}
                        onCheckedChange={() => handlePushToggle('browserPushEnabled')}
                        disabled={updateNotificationMutation.isPending}
                        data-testid="switch-push-enabled"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-events" className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Event Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Instant notifications for event changes
                        </p>
                      </div>
                      <Switch
                        id="push-events"
                        checked={pushSettings.pushEvents}
                        onCheckedChange={() => handlePushToggle('pushEvents')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.browserPushEnabled}
                        data-testid="switch-push-events"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-messages" className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          Messages
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          New message alerts
                        </p>
                      </div>
                      <Switch
                        id="push-messages"
                        checked={pushSettings.pushMessages}
                        onCheckedChange={() => handlePushToggle('pushMessages')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.browserPushEnabled}
                        data-testid="switch-push-messages"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-friend-requests" className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Friend Requests
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Instant friend request notifications
                        </p>
                      </div>
                      <Switch
                        id="push-friend-requests"
                        checked={pushSettings.pushFriendRequests}
                        onCheckedChange={() => handlePushToggle('pushFriendRequests')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.browserPushEnabled}
                        data-testid="switch-push-friend-requests"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-group-invites" className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Group Invites
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Notifications for group invitations
                        </p>
                      </div>
                      <Switch
                        id="push-group-invites"
                        checked={pushSettings.pushGroupInvites}
                        onCheckedChange={() => handlePushToggle('pushGroupInvites')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.browserPushEnabled}
                        data-testid="switch-push-group-invites"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-reactions" className="text-base flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          Reactions & Likes
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When someone reacts to your posts
                        </p>
                      </div>
                      <Switch
                        id="push-reactions"
                        checked={pushSettings.pushReactions}
                        onCheckedChange={() => handlePushToggle('pushReactions')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.browserPushEnabled}
                        data-testid="switch-push-reactions"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  In-App Notifications
                </CardTitle>
                <CardDescription>
                  Notifications while using the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inapp-enabled" className="text-base flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          Enable In-App Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications in the notification bell
                        </p>
                      </div>
                      <Switch
                        id="inapp-enabled"
                        checked={pushSettings.inAppEnabled}
                        onCheckedChange={() => handlePushToggle('inAppEnabled')}
                        disabled={updateNotificationMutation.isPending}
                        data-testid="switch-inapp-enabled"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inapp-events" className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Event Updates
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Event changes and reminders
                        </p>
                      </div>
                      <Switch
                        id="inapp-events"
                        checked={pushSettings.inAppEvents}
                        onCheckedChange={() => handlePushToggle('inAppEvents')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.inAppEnabled}
                        data-testid="switch-inapp-events"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inapp-messages" className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          Messages
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          New message notifications
                        </p>
                      </div>
                      <Switch
                        id="inapp-messages"
                        checked={pushSettings.inAppMessages}
                        onCheckedChange={() => handlePushToggle('inAppMessages')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.inAppEnabled}
                        data-testid="switch-inapp-messages"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inapp-friend-requests" className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Friend Requests
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Friend request notifications
                        </p>
                      </div>
                      <Switch
                        id="inapp-friend-requests"
                        checked={pushSettings.inAppFriendRequests}
                        onCheckedChange={() => handlePushToggle('inAppFriendRequests')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.inAppEnabled}
                        data-testid="switch-inapp-friend-requests"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inapp-group-invites" className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          Group Invites
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Group invitation notifications
                        </p>
                      </div>
                      <Switch
                        id="inapp-group-invites"
                        checked={pushSettings.inAppGroupInvites}
                        onCheckedChange={() => handlePushToggle('inAppGroupInvites')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.inAppEnabled}
                        data-testid="switch-inapp-group-invites"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="inapp-reactions" className="text-base flex items-center gap-2">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          Reactions & Likes
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          When someone reacts to your content
                        </p>
                      </div>
                      <Switch
                        id="inapp-reactions"
                        checked={pushSettings.inAppReactions}
                        onCheckedChange={() => handlePushToggle('inAppReactions')}
                        disabled={updateNotificationMutation.isPending || !pushSettings.inAppEnabled}
                        data-testid="switch-inapp-reactions"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Changes are saved automatically. Your preferences will take effect immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
