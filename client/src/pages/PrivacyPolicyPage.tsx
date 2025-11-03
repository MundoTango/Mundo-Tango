import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Mail } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function PrivacyPolicyPage() {
  return (
    <SelfHealingErrorBoundary pageName="Privacy Policy" fallbackRoute="/">
    <PageLayout title="Privacy Policy" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Account Information:</h4>
                <p>Name, email address, username, password, profile photo, and bio</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Profile Data:</h4>
                <p>Dance level, location, preferences, social connections, and activity history</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Usage Data:</h4>
                <p>Pages visited, features used, search queries, and interaction patterns</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Technical Data:</h4>
                <p>IP address, browser type, device information, and cookies</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• Provide and improve our services</p>
              <p>• Connect you with other dancers and events</p>
              <p>• Send notifications about your account and activity</p>
              <p>• Personalize your experience and recommendations</p>
              <p>• Ensure platform security and prevent fraud</p>
              <p>• Comply with legal obligations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Sharing & Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p><strong>We never sell your personal data.</strong></p>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">We may share data with:</h4>
                <p>• <strong>Other users:</strong> Profile information you choose to make public</p>
                <p>• <strong>Service providers:</strong> Cloud hosting, analytics, and email services</p>
                <p>• <strong>Legal authorities:</strong> When required by law or to protect rights</p>
                <p>• <strong>Business transfers:</strong> In case of merger or acquisition</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• Industry-standard encryption (SSL/TLS)</p>
              <p>• Secure password hashing with bcrypt</p>
              <p>• Regular security audits and monitoring</p>
              <p>• Limited employee access to personal data</p>
              <p>• Two-factor authentication option</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• <strong>Access:</strong> Request a copy of your personal data</p>
              <p>• <strong>Correction:</strong> Update inaccurate information</p>
              <p>• <strong>Deletion:</strong> Request account and data deletion</p>
              <p>• <strong>Portability:</strong> Export your data in a standard format</p>
              <p>• <strong>Opt-out:</strong> Unsubscribe from marketing emails</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies & Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>We use cookies to:</p>
              <p>• Keep you logged in</p>
              <p>• Remember your preferences</p>
              <p>• Analyze usage patterns</p>
              <p>• Improve platform performance</p>
              <p className="mt-4">You can control cookies through your browser settings.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>Mundo Tango is not intended for users under 13 years old. We do not knowingly collect information from children.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>Questions about this Privacy Policy?</p>
              <p className="mt-2">Email: <a href="mailto:privacy@mundotango.com" className="text-primary hover:underline">privacy@mundotango.com</a></p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-muted">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            <p>We may update this Privacy Policy from time to time.</p>
            <p>Continued use of Mundo Tango constitutes acceptance of the updated policy.</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>);
}
