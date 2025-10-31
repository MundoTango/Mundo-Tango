import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function EmailPreferencesPage() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Preferences</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications and updates from Mundo Tango
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="events">Event Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming events in your area
                </p>
              </div>
              <Switch id="events" defaultChecked data-testid="switch-events" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="messages">Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for new messages
                </p>
              </div>
              <Switch id="messages" defaultChecked data-testid="switch-messages" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="posts">Posts & Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone mentions you or comments on your posts
                </p>
              </div>
              <Switch id="posts" defaultChecked data-testid="switch-posts" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter">Weekly Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Get our weekly digest of tango news and tips
                </p>
              </div>
              <Switch id="newsletter" defaultChecked data-testid="switch-newsletter" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="promotions">Promotions & Offers</Label>
                <p className="text-sm text-muted-foreground">
                  Receive exclusive deals and special offers
                </p>
              </div>
              <Switch id="promotions" data-testid="switch-promotions" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" data-testid="button-save">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
