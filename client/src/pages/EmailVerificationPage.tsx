import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function EmailVerificationPage() {
  return (
    <PageLayout title="Verify Your Email" showBreadcrumbs>
<div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <div>
            
            <p className="text-muted-foreground">
              We've sent a verification link to your email address.
              Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 justify-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Email sent to: john@example.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder.
            </p>
            <Button variant="outline" className="w-full" data-testid="button-resend">
              Resend Verification Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </PageLayout>);
}
