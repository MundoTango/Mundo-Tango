import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLayout } from "@/components/PageLayout";

export default function PrivacySettingsPage() {
  return (
    <PageLayout title="Privacy Settings" showBreadcrumbs>
      <div className="container mx-auto max-w-2xl">

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Profile Visibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profile-visibility">Who can see your profile?</Label>
              <Select defaultValue="everyone">
                <SelectTrigger id="profile-visibility" data-testid="select-profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-visibility">Who can see your posts?</Label>
              <Select defaultValue="everyone">
                <SelectTrigger id="post-visibility" data-testid="select-post-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Only Me</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="show-location">Show Location</Label>
                <p className="text-sm text-muted-foreground">
                  Display your location on your profile
                </p>
              </div>
              <Switch id="show-location" defaultChecked data-testid="switch-show-location" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-online">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">
                  Let others see when you're online
                </p>
              </div>
              <Switch id="show-online" defaultChecked data-testid="switch-show-online" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="indexing">Search Engine Indexing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow search engines to index your profile
                </p>
              </div>
              <Switch id="indexing" data-testid="switch-indexing" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" data-testid="button-save">
          Save Settings
        </Button>
      </div>
    </PageLayout>
  );
}
