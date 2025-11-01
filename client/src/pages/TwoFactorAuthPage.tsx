import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";

export default function TwoFactorAuthPage() {
  return (
    <PageLayout title="Two-Factor Authentication" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Enable 2FA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm mb-2">
                1. Download an authenticator app like Google Authenticator or Authy
              </p>
              <p className="text-sm mb-2">
                2. Scan the QR code below
              </p>
              <p className="text-sm">
                3. Enter the 6-digit code from your app
              </p>
            </div>

            <div className="flex justify-center py-6">
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                <Smartphone className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input id="code" placeholder="000000" maxLength={6} data-testid="input-code" />
            </div>

            <Button className="w-full" data-testid="button-enable">
              Enable Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>);
}
