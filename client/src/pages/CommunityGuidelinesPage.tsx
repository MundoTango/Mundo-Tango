import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function CommunityGuidelinesPage() {
  return (
    <PageLayout title="Community Guidelines" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        

        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Our Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>• <strong>Respect:</strong> Treat all community members with kindness and dignity</p>
            <p>• <strong>Inclusivity:</strong> Welcome dancers of all levels, backgrounds, and identities</p>
            <p>• <strong>Authenticity:</strong> Share genuine experiences and honest feedback</p>
            <p>• <strong>Safety:</strong> Create a secure environment for everyone</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Do's
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>✓ <strong>Be respectful:</strong> Use courteous language in all interactions</p>
              <p>✓ <strong>Give constructive feedback:</strong> Help others improve with kindness</p>
              <p>✓ <strong>Share knowledge:</strong> Contribute tips, experiences, and resources</p>
              <p>✓ <strong>Honor the embrace:</strong> Respect personal boundaries and consent</p>
              <p>✓ <strong>Support events:</strong> Promote local milongas and community gatherings</p>
              <p>✓ <strong>Report issues:</strong> Help us maintain a safe environment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Don'ts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>✗ <strong>No harassment:</strong> Zero tolerance for bullying, discrimination, or unwanted advances</p>
              <p>✗ <strong>No spam:</strong> Don't post promotional content without permission</p>
              <p>✗ <strong>No misinformation:</strong> Share only accurate information about events and teachers</p>
              <p>✗ <strong>No trolling:</strong> Avoid inflammatory or off-topic comments</p>
              <p>✗ <strong>No inappropriate content:</strong> Keep all posts family-friendly</p>
              <p>✗ <strong>No personal attacks:</strong> Criticize ideas, not individuals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>First violation:</strong> Warning and content removal</p>
              <p><strong>Second violation:</strong> Temporary suspension (7-30 days)</p>
              <p><strong>Third violation:</strong> Permanent account ban</p>
              <p><strong>Severe violations:</strong> Immediate permanent ban (harassment, threats, illegal content)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Reporting & Appeals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Report violations:</strong> Use the "Report" button on any post or profile</p>
              <p><strong>Appeal a decision:</strong> Contact support@mundotango.com within 14 days</p>
              <p><strong>Response time:</strong> We aim to review reports within 24-48 hours</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-muted">
          <CardContent className="py-6 text-center text-muted-foreground">
            <p>By using Mundo Tango, you agree to follow these guidelines.</p>
            <p className="text-sm mt-2">Last updated: October 31, 2025</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>);
}
