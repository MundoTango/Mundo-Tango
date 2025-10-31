import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";

export default function SettingsPage() {
  return (
    <>
      <SEO 
        title="Settings"
        description="Customize your Mundo Tango experience. Manage account settings, privacy preferences, and notification options."
      />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch id="email-notifications" data-testid="switch-email-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="event-updates">Event Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about upcoming events
              </p>
            </div>
            <Switch id="event-updates" data-testid="switch-event-updates" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-notifications">Message Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive messages
              </p>
            </div>
            <Switch id="message-notifications" data-testid="switch-message-notifications" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Control who can see your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="profile-visibility">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to everyone
              </p>
            </div>
            <Switch id="profile-visibility" defaultChecked data-testid="switch-profile-visibility" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-email">Show Email</Label>
              <p className="text-sm text-muted-foreground">
                Display your email on your profile
              </p>
            </div>
            <Switch id="show-email" data-testid="switch-show-email" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Switch id="two-factor" data-testid="switch-two-factor" />
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
