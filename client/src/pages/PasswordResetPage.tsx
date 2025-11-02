import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function PasswordResetPage() {
  return (
    <SelfHealingErrorBoundary pageName="Password Reset" fallbackRoute="/login">
      <PageLayout title="PasswordReset" showBreadcrumbs>
<div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" data-testid="input-email" />
          </div>
          <Button className="w-full" data-testid="button-send">
            Send Reset Link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <a href="/login" className="text-primary hover:underline">
              Back to login
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
