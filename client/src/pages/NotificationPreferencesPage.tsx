import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Users, Calendar, MessageSquare, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";

interface NotificationPreferences {
  email: {
    events: boolean;
    messages: boolean;
    friendRequests: boolean;
    groupInvites: boolean;
    eventReminders: boolean;
    newsletter: boolean;
  };
  push: {
    events: boolean;
    messages: boolean;
    friendRequests: boolean;
    groupInvites: boolean;
    reactions: boolean;
  };
}

export default function NotificationPreferencesPage() {
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      events: true,
      messages: true,
      friendRequests: true,
      groupInvites: true,
      eventReminders: true,
      newsletter: false,
    },
    push: {
      events: true,
      messages: true,
      friendRequests: true,
      groupInvites: true,
      reactions: false,
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      return await apiRequest("PATCH", "/api/user/notification-preferences", data);
    },
    onSuccess: () => {
      toast({ title: "Preferences saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save preferences", variant: "destructive" });
    },
  });

  const handleToggle = (type: 'email' | 'push', key: string) => {
    setPreferences(prev => {
      if (type === 'email') {
        return {
          ...prev,
          email: {
            ...prev.email,
            [key]: !prev.email[key as keyof typeof prev.email],
          },
        };
      } else {
        return {
          ...prev,
          push: {
            ...prev.push,
            [key]: !prev.push[key as keyof typeof prev.push],
          },
        };
      }
    });
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
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
            {/* Email Notifications */}
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
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-events" className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Event Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about new events and changes
                    </p>
                  </div>
                  <Switch
                    id="email-events"
                    checked={preferences.email.events}
                    onCheckedChange={() => handleToggle('email', 'events')}
                    data-testid="switch-email-events"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-messages" className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New direct messages from other users
                    </p>
                  </div>
                  <Switch
                    id="email-messages"
                    checked={preferences.email.messages}
                    onCheckedChange={() => handleToggle('email', 'messages')}
                    data-testid="switch-email-messages"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-friend-requests" className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Friend Requests
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone sends you a friend request
                    </p>
                  </div>
                  <Switch
                    id="email-friend-requests"
                    checked={preferences.email.friendRequests}
                    onCheckedChange={() => handleToggle('email', 'friendRequests')}
                    data-testid="switch-email-friend-requests"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-group-invites" className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Group Invites
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Invitations to join groups
                    </p>
                  </div>
                  <Switch
                    id="email-group-invites"
                    checked={preferences.email.groupInvites}
                    onCheckedChange={() => handleToggle('email', 'groupInvites')}
                    data-testid="switch-email-group-invites"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-event-reminders" className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Event Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders before events you're attending
                    </p>
                  </div>
                  <Switch
                    id="email-event-reminders"
                    checked={preferences.email.eventReminders}
                    onCheckedChange={() => handleToggle('email', 'eventReminders')}
                    data-testid="switch-email-event-reminders"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-newsletter" className="text-base flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Newsletter
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly digest of tango news and tips
                    </p>
                  </div>
                  <Switch
                    id="email-newsletter"
                    checked={preferences.email.newsletter}
                    onCheckedChange={() => handleToggle('email', 'newsletter')}
                    data-testid="switch-email-newsletter"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Real-time alerts on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      Messages
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      New message alerts
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
                      Friend Requests
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Instant friend request notifications
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
                      Group Invites
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for group invitations
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
                      Reactions & Likes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone reacts to your posts
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

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={updatePreferencesMutation.isPending}
                size="lg"
                data-testid="button-save-preferences"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
