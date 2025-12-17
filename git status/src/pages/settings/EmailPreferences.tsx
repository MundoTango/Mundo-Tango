import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Mail, Bell, Calendar, MessageSquare, Home, CreditCard, BarChart3 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EmailPreferencesData {
  id: number;
  userId: number;
  eventReminders: boolean;
  newMessages: boolean;
  friendRequests: boolean;
  postReactions: boolean;
  housingBookings: boolean;
  subscriptionUpdates: boolean;
  weeklyDigest: boolean;
  emailsEnabled: boolean;
  unsubscribeToken: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmailPreferences() {
  const { toast } = useToast();

  const { data: prefs, isLoading } = useQuery<EmailPreferencesData>({
    queryKey: ['/api/user/email-preferences'],
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<EmailPreferencesData>) =>
      apiRequest('PATCH', '/api/user/email-preferences', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/email-preferences'] });
      toast({
        title: "Preferences updated",
        description: "Your email preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update email preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const togglePreference = (key: keyof EmailPreferencesData, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  return (
    <SelfHealingErrorBoundary pageName="Email Preferences" fallbackRoute="/settings">
      <PageLayout title="Email Preferences" showBreadcrumbs>
        <>
          <SEO 
            title="Email Preferences"
            description="Manage your email notification preferences and control what emails you receive from Mundo Tango."
          />
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-email-preferences">
                Email Preferences
              </h1>
              <p className="text-muted-foreground">
                Control which emails you receive from Mundo Tango
              </p>
            </div>

            {/* Master Toggle */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  <Mail className="h-5 w-5 text-[#40E0D0]" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Master control for all email notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreferenceToggle
                  icon={<Mail className="h-5 w-5 text-[#40E0D0]" />}
                  label="All Email Notifications"
                  description="Master toggle for all email notifications. When disabled, you won't receive any emails."
                  checked={prefs?.emailsEnabled ?? true}
                  onChange={(v) => togglePreference('emailsEnabled', v)}
                  testId="toggle-emails-enabled"
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="font-serif">Notification Types</CardTitle>
                <CardDescription>
                  Choose which types of emails you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PreferenceToggle
                  icon={<Calendar className="h-5 w-5 text-[#1E90FF]" />}
                  label="Event Reminders"
                  description="Get reminded 1 day before your upcoming events"
                  checked={prefs?.eventReminders ?? true}
                  onChange={(v) => togglePreference('eventReminders', v)}
                  testId="toggle-event-reminders"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />

                <Separator />

                <PreferenceToggle
                  icon={<MessageSquare className="h-5 w-5 text-[#40E0D0]" />}
                  label="New Messages"
                  description="Notifications when you receive new messages"
                  checked={prefs?.newMessages ?? true}
                  onChange={(v) => togglePreference('newMessages', v)}
                  testId="toggle-new-messages"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />

                <Separator />

                <PreferenceToggle
                  icon={<Bell className="h-5 w-5 text-[#9370DB]" />}
                  label="Friend Requests"
                  description="Notifications when someone wants to connect with you"
                  checked={prefs?.friendRequests ?? true}
                  onChange={(v) => togglePreference('friendRequests', v)}
                  testId="toggle-friend-requests"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />

                <Separator />

                <PreferenceToggle
                  icon={<Bell className="h-5 w-5 text-[#FFD700]" />}
                  label="Post Reactions"
                  description="Notifications when someone reacts to your posts"
                  checked={prefs?.postReactions ?? false}
                  onChange={(v) => togglePreference('postReactions', v)}
                  testId="toggle-post-reactions"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />

                <Separator />

                <PreferenceToggle
                  icon={<Home className="h-5 w-5 text-[#40E0D0]" />}
                  label="Housing Bookings"
                  description="Booking confirmations and updates for your housing reservations"
                  checked={prefs?.housingBookings ?? true}
                  onChange={(v) => togglePreference('housingBookings', v)}
                  testId="toggle-housing-bookings"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />

                <Separator />

                <PreferenceToggle
                  icon={<CreditCard className="h-5 w-5 text-[#1E90FF]" />}
                  label="Subscription Updates"
                  description="Billing and subscription renewal notifications"
                  checked={prefs?.subscriptionUpdates ?? true}
                  onChange={(v) => togglePreference('subscriptionUpdates', v)}
                  testId="toggle-subscription-updates"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />

                <Separator />

                <PreferenceToggle
                  icon={<BarChart3 className="h-5 w-5 text-[#9370DB]" />}
                  label="Weekly Digest"
                  description="Weekly summary of activity and updates in your community"
                  checked={prefs?.weeklyDigest ?? true}
                  onChange={(v) => togglePreference('weeklyDigest', v)}
                  testId="toggle-weekly-digest"
                  disabled={isLoading || !prefs?.emailsEnabled}
                />
              </CardContent>
            </Card>

            {/* Rate Limit Info */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="font-serif">Email Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  📊 Rate limit: Maximum 5 emails per day to prevent inbox overload
                </p>
                <p className="text-sm text-muted-foreground">
                  🔕 You can unsubscribe from individual email types using the toggles above
                </p>
                <p className="text-sm text-muted-foreground">
                  ✉️ All transactional emails are sent from notifications@mundotango.life
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}

interface PreferenceToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  testId: string;
  disabled?: boolean;
}

function PreferenceToggle({ 
  icon, 
  label, 
  description, 
  checked, 
  onChange, 
  testId,
  disabled = false
}: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <Label 
            className="text-base font-medium cursor-pointer"
            htmlFor={testId}
          >
            {label}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
      <Switch 
        id={testId}
        checked={checked} 
        onCheckedChange={onChange} 
        data-testid={testId}
        disabled={disabled}
      />
    </div>
  );
}
