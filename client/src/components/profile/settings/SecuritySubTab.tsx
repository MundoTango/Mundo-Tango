import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Key, Lock, CheckCircle } from "lucide-react";

export default function SecuritySubTab() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleTwoFactorChange = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    toast({
      title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
      description: checked 
        ? "Your account is now more secure." 
        : "Two-factor authentication has been turned off.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Password change",
      description: "Password change functionality coming soon.",
    });
  };

  return (
    <div className="space-y-6" data-testid="security-subtab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Account Security Status
              </Label>
              <p className="text-sm text-muted-foreground">
                Your account is {twoFactorEnabled ? 'fully protected' : 'protected'}
              </p>
            </div>
            <Badge 
              variant={twoFactorEnabled ? "default" : "secondary"}
              data-testid="badge-security-status"
            >
              {twoFactorEnabled ? 'Enhanced' : 'Standard'}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              id="two-factor" 
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorChange}
              data-testid="switch-two-factor" 
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <p className="text-sm text-muted-foreground">
                Update your password regularly for better security
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleChangePassword}
              data-testid="button-change-password"
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
