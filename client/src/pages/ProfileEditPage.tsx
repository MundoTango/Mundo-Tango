import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function ProfileEditPage() {
  return (
    <PageLayout title="Edit Profile" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline" data-testid="button-change-photo">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" defaultValue="John" data-testid="input-first-name" />
              </div>
              <div>
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" defaultValue="Doe" data-testid="input-last-name" />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                defaultValue="Passionate tango dancer from New York"
                data-testid="input-bio"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue="New York, NY" data-testid="input-location" />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://" data-testid="input-website" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tango Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="level">Dance Level</Label>
              <Input id="level" defaultValue="Intermediate" data-testid="input-level" />
            </div>
            <div>
              <Label htmlFor="role">Preferred Role</Label>
              <Input id="role" defaultValue="Both" data-testid="input-role" />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" defaultValue="3" data-testid="input-experience" />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" data-testid="button-save">
          Save Changes
        </Button>
      </div>
    </div>
    </PageLayout>);
}
