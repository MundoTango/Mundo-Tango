import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Shield, Key, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useLocation } from "wouter";

interface VerifyResponse {
  verified: boolean;
}

export default function TwoFactorVerify() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Get userId from URL params or session storage
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId') || sessionStorage.getItem('2fa_user_id') || '';

  const verifyMutation = useMutation({
    mutationFn: () => {
      const payload = useBackupCode
        ? { userId: Number(userId), backupCode }
        : { userId: Number(userId), token };
      
      return apiRequest<VerifyResponse>('POST', '/api/auth/2fa/login-verify', payload);
    },
    onSuccess: (data) => {
      if (data.verified) {
        // Clear session storage
        sessionStorage.removeItem('2fa_user_id');
        
        toast({
          title: "Verification Successful",
          description: "You have been successfully logged in.",
        });
        
        // Redirect to home or dashboard
        navigate('/');
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid code. Please try again.",
          variant: "destructive",
        });
        
        if (useBackupCode) {
          setBackupCode("");
        } else {
          setToken("");
        }
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Verification failed. Please try again.",
        variant: "destructive",
      });
      
      if (useBackupCode) {
        setBackupCode("");
      } else {
        setToken("");
      }
    },
  });

  const handleVerify = () => {
    if (useBackupCode) {
      if (!backupCode.trim()) {
        toast({
          title: "Invalid Input",
          description: "Please enter a backup code.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (token.length !== 6) {
        toast({
          title: "Invalid Code",
          description: "Please enter a 6-digit code.",
          variant: "destructive",
        });
        return;
      }
    }

    verifyMutation.mutate();
  };

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setToken("");
    setBackupCode("");
  };

  if (!userId) {
    return (
      <SelfHealingErrorBoundary pageName="Two-Factor Verification" fallbackRoute="/login">
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--gradient-hero-start))] to-[hsl(var(--gradient-hero-end))]">
          <Card className="w-full max-w-md backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Session Expired</h2>
              <p className="text-muted-foreground mb-4">
                Please log in again to continue.
              </p>
              <Button onClick={() => navigate('/login')} data-testid="button-return-login">
                Return to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Two-Factor Verification" fallbackRoute="/login">
      <>
        <SEO 
          title="Two-Factor Verification"
          description="Verify your identity with two-factor authentication."
        />
        
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--gradient-hero-start))] to-[hsl(var(--gradient-hero-end))]">
          <div className="w-full max-w-md space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#40E0D0]/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#40E0D0]" />
              </div>
              <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent" data-testid="heading-2fa-verify">
                Two-Factor Authentication
              </h1>
              <p className="text-muted-foreground">
                Enter the verification code to continue
              </p>
            </div>

            {/* Verification Card */}
            <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif">
                  {useBackupCode ? (
                    <>
                      <Key className="h-5 w-5 text-[#40E0D0]" />
                      Use Backup Code
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 text-[#40E0D0]" />
                      Enter Verification Code
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {useBackupCode
                    ? "Enter one of your backup codes"
                    : "Enter the 6-digit code from your authenticator app"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {useBackupCode ? (
                  <div className="space-y-2">
                    <Label htmlFor="backup-code">Backup Code</Label>
                    <Input
                      id="backup-code"
                      type="text"
                      placeholder="Enter backup code"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                      disabled={verifyMutation.isPending}
                      data-testid="input-backup-code"
                      className="font-mono text-center"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <InputOTP
                      maxLength={6}
                      value={token}
                      onChange={(value) => setToken(value)}
                      disabled={verifyMutation.isPending}
                      data-testid="input-2fa-token"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={
                    verifyMutation.isPending ||
                    (useBackupCode ? !backupCode.trim() : token.length !== 6)
                  }
                  className="w-full"
                  data-testid="button-verify"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={toggleBackupCode}
                    disabled={verifyMutation.isPending}
                    data-testid="button-toggle-backup"
                  >
                    {useBackupCode
                      ? "Use authenticator code instead"
                      : "Use backup code instead"}
                  </Button>
                </div>

                {!useBackupCode && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>Tip:</strong> Open your authenticator app and enter the 6-digit code displayed for Mundo Tango.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Text */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Lost your device?{" "}
                <a href="/help" className="text-primary hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
