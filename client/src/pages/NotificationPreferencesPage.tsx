import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Users, Calendar, MessageSquare, Heart, Loader2 } from "lucide-react";
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

interface NotificationPreferences {
  email: EmailPreferences;
  push: {
    events: boolean;
    messages: boolean;
    friendRequests: boolean;
    groupInvites: boolean;
    reactions: boolean;
  };
}

export default function NotificationPreferencesPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  
  // Load preferences from backend
  const { data: emailPrefs, isLoading } = useQuery<EmailPreferences>({
    queryKey: ['/api/user/email-preferences'],
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      newMessage: false,
      friendRequest: false,
      eventInvite: false,
      eventReminder: false,
      weeklyDigest: false,
      marketingEmails: false,
    },
    push: {
      events: true,
      messages: true,
      friendRequests: true,
      groupInvites: true,
      reactions: false,
    },
  });

  // Sync backend data with local state
  useEffect(() => {
    if (emailPrefs) {
      setPreferences(prev => ({
        ...prev,
        email: emailPrefs
      }));
    }
  }, [emailPrefs]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: EmailPreferences) => {
      return await apiRequest("/api/user/email-preferences", "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/email-preferences'] });
      toast({ title: t('pages:notificationPreferences.savedSuccess', 'Preferences saved successfully') });
    },
    onError: () => {
      toast({ title: t('pages:notificationPreferences.savedError', 'Failed to save preferences'), variant: "destructive" });
    },
  });

  const handleToggle = (type: 'email' | 'push', key: string) => {
    if (type === 'email') {
      const newEmailPrefs = {
        ...preferences.email,
        [key]: !preferences.email[key as keyof typeof preferences.email],
      };
      
      setPreferences(prev => ({
        ...prev,
        email: newEmailPrefs,
      }));
      
      // Save immediately to backend (no fake setTimeout!)
      updatePreferencesMutation.mutate(newEmailPrefs);
    } else {
      setPreferences(prev => ({
        ...prev,
        push: {
          ...prev.push,
          [key]: !prev.push[key as keyof typeof prev.push],
        },
      }));
      // Note: Push notifications not implemented in backend yet
      toast({ 
        title: t('pages:notificationPreferences.pushComingSoon', 'Push notifications coming soon'), 
        description: t('pages:notificationPreferences.pushComingSoonDesc', 'Push notification settings will be available in a future update.'),
        variant: "default"
      });
    }
  };

  return (
    <AppLayout>
      <SEO 
        title={t('pages:notificationPreferences.seoTitle', 'Notification Preferences')}
        description={t('pages:notificationPreferences.seoDescription', 'Customize email and push notification settings for events, messages, friend requests, and community updates on Mundo Tango')}
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-4xl py-8 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3" data-testid="text-notification-prefs-title">
              <Bell className="h-10 w-10 text-primary" />
              {t('pages:notificationPreferences.title', 'Notification Preferences')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('pages:notificationPreferences.subtitle', 'Manage how and when you receive notifications')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t('pages:notificationPreferences.emailNotifications', 'Email Notifications')}
                </CardTitle>
                <CardDescription>
                  {t('pages:notificationPreferences.emailDescription', 'Receive updates and alerts via email')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-event-invite" className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {t('pages:notificationPreferences.eventInvites', 'Event Invites')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:notificationPreferences.eventInvitesDesc', 'Notifications about new event invitations')}
                        </p>
                      </div>
                      <Switch
                        id="email-event-invite"
                        checked={preferences.email.eventInvite}
                        onCheckedChange={() => handleToggle('email', 'eventInvite')}
                        data-testid="switch-email-event-invite"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-new-message" className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          {t('pages:notificationPreferences.newMessages', 'New Messages')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:notificationPreferences.newMessagesDesc', 'New direct messages from other users')}
                        </p>
                      </div>
                      <Switch
                        id="email-new-message"
                        checked={preferences.email.newMessage}
                        onCheckedChange={() => handleToggle('email', 'newMessage')}
                        data-testid="switch-email-new-message"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-friend-request" className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {t('pages:notificationPreferences.friendRequests', 'Friend Requests')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:notificationPreferences.friendRequestsDesc', 'When someone sends you a friend request')}
                        </p>
                      </div>
                      <Switch
                        id="email-friend-request"
                        checked={preferences.email.friendRequest}
                        onCheckedChange={() => handleToggle('email', 'friendRequest')}
                        data-testid="switch-email-friend-request"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-event-reminder" className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {t('pages:notificationPreferences.eventReminders', 'Event Reminders')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:notificationPreferences.eventRemindersDesc', "Reminders before events you're attending")}
                        </p>
                      </div>
                      <Switch
                        id="email-event-reminder"
                        checked={preferences.email.eventReminder}
                        onCheckedChange={() => handleToggle('email', 'eventReminder')}
                        data-testid="switch-email-event-reminder"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-weekly-digest" className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {t('pages:notificationPreferences.weeklyDigest', 'Weekly Digest')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:notificationPreferences.weeklyDigestDesc', 'Weekly summary of tango news and tips')}
                        </p>
                      </div>
                      <Switch
                        id="email-weekly-digest"
                        checked={preferences.email.weeklyDigest}
                        onCheckedChange={() => handleToggle('email', 'weeklyDigest')}
                        data-testid="switch-email-weekly-digest"
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-marketing" className="text-base flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {t('pages:notificationPreferences.marketingEmails', 'Marketing Emails')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {t('pages:notificationPreferences.marketingEmailsDesc', 'Promotional content and special offers')}
                        </p>
                      </div>
                      <Switch
                        id="email-marketing"
                        checked={preferences.email.marketingEmails}
                        onCheckedChange={() => handleToggle('email', 'marketingEmails')}
                        data-testid="switch-email-marketing"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  {t('pages:notificationPreferences.pushNotifications', 'Push Notifications')}
                </CardTitle>
                <CardDescription>
                  {t('pages:notificationPreferences.pushDescription', 'Real-time alerts on your device')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-events" className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {t('pages:notificationPreferences.eventUpdates', 'Event Updates')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:notificationPreferences.eventUpdatesDesc', 'Instant notifications for event changes')}
                    </p>
                  </div>
                  <Switch
                    id="push-events"
                    checked={preferences.push.events}
                    onCheckedChange={() => handleToggle('push', 'events')}
                    data-testid="switch-push-events"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-messages" className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      {t('pages:notificationPreferences.messages', 'Messages')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:notificationPreferences.messagesDesc', 'New message alerts')}
                    </p>
                  </div>
                  <Switch
                    id="push-messages"
                    checked={preferences.push.messages}
                    onCheckedChange={() => handleToggle('push', 'messages')}
                    data-testid="switch-push-messages"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-friend-requests" className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {t('pages:notificationPreferences.friendRequestsPush', 'Friend Requests')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:notificationPreferences.friendRequestsPushDesc', 'Instant friend request notifications')}
                    </p>
                  </div>
                  <Switch
                    id="push-friend-requests"
                    checked={preferences.push.friendRequests}
                    onCheckedChange={() => handleToggle('push', 'friendRequests')}
                    data-testid="switch-push-friend-requests"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-group-invites" className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {t('pages:notificationPreferences.groupInvites', 'Group Invites')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:notificationPreferences.groupInvitesDesc', 'Notifications for group invitations')}
                    </p>
                  </div>
                  <Switch
                    id="push-group-invites"
                    checked={preferences.push.groupInvites}
                    onCheckedChange={() => handleToggle('push', 'groupInvites')}
                    data-testid="switch-push-group-invites"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-reactions" className="text-base flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      {t('pages:notificationPreferences.reactionsLikes', 'Reactions & Likes')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:notificationPreferences.reactionsLikesDesc', 'When someone reacts to your posts')}
                    </p>
                  </div>
                  <Switch
                    id="push-reactions"
                    checked={preferences.push.reactions}
                    onCheckedChange={() => handleToggle('push', 'reactions')}
                    data-testid="switch-push-reactions"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {t('pages:notificationPreferences.autoSaveNote', 'Changes are saved automatically. Email preferences take effect immediately, while push notifications will be available in a future update.')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
