import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Control how you receive notifications on the platform
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Push Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="event-reminders">Event Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before events you've RSVP'd to
                </p>
              </div>
              <Switch id="event-reminders" defaultChecked data-testid="switch-event-reminders" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-messages">New Messages</Label>
                <p className="text-sm text-muted-foreground">
                  When someone sends you a message
                </p>
              </div>
              <Switch id="new-messages" defaultChecked data-testid="switch-new-messages" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="friend-requests">Friend Requests</Label>
                <p className="text-sm text-muted-foreground">
                  When someone sends you a friend request
                </p>
              </div>
              <Switch id="friend-requests" defaultChecked data-testid="switch-friend-requests" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="post-likes">Post Likes</Label>
                <p className="text-sm text-muted-foreground">
                  When someone likes your posts
                </p>
              </div>
              <Switch id="post-likes" defaultChecked data-testid="switch-post-likes" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comments">Comments</Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments on your posts
                </p>
              </div>
              <Switch id="comments" defaultChecked data-testid="switch-comments" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" data-testid="button-save">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
