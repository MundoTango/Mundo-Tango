import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Scale, UserX } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function TermsPage() {
  return (
    <SelfHealingErrorBoundary pageName="Terms of Service" fallbackRoute="/">
    <PageLayout title="Terms of Service" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>By accessing or using Mundo Tango, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use our services.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Eligibility:</strong> You must be at least 13 years old to create an account.</p>
              <p><strong>Accuracy:</strong> You must provide accurate and complete information.</p>
              <p><strong>Security:</strong> You are responsible for maintaining the security of your account.</p>
              <p><strong>One Account:</strong> You may only maintain one active account.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>You agree NOT to:</p>
              <p>• Violate any laws or regulations</p>
              <p>• Infringe on intellectual property rights</p>
              <p>• Harass, bully, or threaten other users</p>
              <p>• Post spam or misleading content</p>
              <p>• Impersonate others or misrepresent affiliations</p>
              <p>• Attempt to hack or compromise platform security</p>
              <p>• Use automated tools to access the platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Content Ownership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>Your Content:</strong> You retain ownership of content you post.</p>
              <p><strong>License to Us:</strong> By posting, you grant us a worldwide, non-exclusive license to use, display, and distribute your content on the platform.</p>
              <p><strong>Our Content:</strong> All Mundo Tango branding, design, and features are our property.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Payments & Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• Subscription fees are billed in advance</p>
              <p>• All fees are non-refundable unless required by law</p>
              <p>• We may change pricing with 30 days notice</p>
              <p>• Cancellation takes effect at the end of the billing period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                6. Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong>AS-IS Service:</strong> The platform is provided "as is" without warranties of any kind.</p>
              <p><strong>No Guarantees:</strong> We don't guarantee uninterrupted or error-free service.</p>
              <p><strong>User Interactions:</strong> We are not responsible for interactions between users.</p>
              <p><strong>Third-Party Content:</strong> We don't endorse or verify user-generated content.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                7. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>To the maximum extent permitted by law, Mundo Tango shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>You agree to indemnify and hold harmless Mundo Tango from any claims, damages, or expenses arising from your use of the platform or violation of these terms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-500" />
                9. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong>By You:</strong> You may delete your account at any time.</p>
              <p><strong>By Us:</strong> We may suspend or terminate accounts that violate these terms.</p>
              <p><strong>Effect:</strong> Upon termination, your access ends and content may be deleted.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong>Governing Law:</strong> These terms are governed by the laws of [Jurisdiction].</p>
              <p><strong>Arbitration:</strong> Disputes shall be resolved through binding arbitration.</p>
              <p><strong>Class Action Waiver:</strong> You waive the right to participate in class actions.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>We may modify these terms at any time. Continued use after changes constitutes acceptance. We'll notify users of material changes via email or platform notification.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>Questions about these Terms of Service?</p>
              <p className="mt-2">Email: <a href="mailto:legal@mundotango.com" className="text-primary hover:underline">legal@mundotango.com</a></p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center text-muted-foreground">
            <p className="font-semibold">By using Mundo Tango, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
