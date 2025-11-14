import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { Shield, Download, CheckCircle2, Smartphone, Copy, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useLocation } from "wouter";

interface SetupResponse {
  qrCode: string;
  backupCodes: string[];
  message: string;
}

export default function TwoFactorSetup() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [qrCode, setQrCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);

  const setupMutation = useMutation({
    mutationFn: () => apiRequest<SetupResponse>('POST', '/api/auth/2fa/setup', {}),
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setBackupCodes(data.backupCodes);
      toast({
        title: "QR Code Generated",
        description: "Scan the QR code with your authenticator app.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) =>
      apiRequest('POST', '/api/auth/2fa/verify', { token }),
    onSuccess: () => {
      setSetupComplete(true);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/2fa/status'] });
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled!",
      });
      setTimeout(() => {
        navigate('/settings/security');
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Invalid token. Please try again.",
        variant: "destructive",
      });
      setToken("");
    },
  });

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const handleVerify = () => {
    if (token.length === 6) {
      verifyMutation.mutate(token);
    } else {
      toast({
        title: "Invalid Token",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = `Mundo Tango - Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mundotango-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup Codes Downloaded",
      description: "Keep this file in a safe place.",
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Backup code copied to clipboard.",
    });
  };

  return (
    <SelfHealingErrorBoundary pageName="Two-Factor Setup" fallbackRoute="/settings/security">
      <PageLayout title="Two-Factor Authentication Setup" showBreadcrumbs>
        <>
          <SEO 
            title="Two-Factor Authentication Setup"
            description="Set up two-factor authentication to secure your Mundo Tango account."
          />
          <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-[#40E0D0] via-[#1E90FF] to-[#9370DB] bg-clip-text text-transparent mb-2" data-testid="heading-2fa-setup">
                Enable Two-Factor Authentication
              </h1>
              <p className="text-muted-foreground">
                Protect your account with an additional layer of security
              </p>
            </div>

            {!qrCode && !setupComplete && (
              <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Shield className="h-5 w-5 text-[#40E0D0]" />
                    Get Started
                  </CardTitle>
                  <CardDescription>
                    Set up 2FA to add an extra security layer to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">What you'll need:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>An authenticator app (Google Authenticator, Authy, 1Password, etc.)</li>
                      <li>Your smartphone or device</li>
                      <li>A few minutes to complete the setup</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSetup}
                    disabled={setupMutation.isPending}
                    className="w-full"
                    data-testid="button-start-setup"
                  >
                    {setupMutation.isPending ? "Setting up..." : "Start Setup"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {qrCode && !setupComplete && (
              <>
                {/* Step 1: Scan QR Code */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Smartphone className="h-5 w-5 text-[#40E0D0]" />
                      Step 1: Scan QR Code
                    </CardTitle>
                    <CardDescription>
                      Open your authenticator app and scan this QR code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white rounded-lg" data-testid="qr-code-container">
                      <img 
                        src={qrCode} 
                        alt="2FA QR Code" 
                        className="w-64 h-64"
                        data-testid="img-qr-code"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Scan this code with your authenticator app to link your account
                    </p>
                  </CardContent>
                </Card>

                {/* Step 2: Save Backup Codes */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <Download className="h-5 w-5 text-[#40E0D0]" />
                      Step 2: Save Backup Codes
                    </CardTitle>
                    <CardDescription>
                      Store these codes in a safe place - you'll need them if you lose your device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          <strong>Important:</strong> Each backup code can only be used once. Save them now - they won't be shown again.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2" data-testid="backup-codes-list">
                      {backupCodes.map((code, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-md bg-card border border-border"
                        >
                          <code className="text-sm font-mono" data-testid={`backup-code-${index}`}>{code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(code)}
                            data-testid={`button-copy-code-${index}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={handleDownloadBackupCodes}
                      variant="outline"
                      className="w-full"
                      data-testid="button-download-backup-codes"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Backup Codes
                    </Button>
                  </CardContent>
                </Card>

                {/* Step 3: Verify */}
                <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-serif">
                      <CheckCircle2 className="h-5 w-5 text-[#40E0D0]" />
                      Step 3: Verify Setup
                    </CardTitle>
                    <CardDescription>
                      Enter the 6-digit code from your authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                      <InputOTP
                        maxLength={6}
                        value={token}
                        onChange={(value) => setToken(value)}
                        data-testid="input-verify-token"
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

                      <Button
                        onClick={handleVerify}
                        disabled={token.length !== 6 || verifyMutation.isPending}
                        className="w-full max-w-xs"
                        data-testid="button-verify-enable"
                      >
                        {verifyMutation.isPending ? "Verifying..." : "Verify & Enable 2FA"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {setupComplete && (
              <Card className="backdrop-blur-md bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
                <CardContent className="flex flex-col items-center space-y-4 py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-serif font-bold" data-testid="text-setup-complete">
                      2FA Enabled Successfully!
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                      Your account is now protected with two-factor authentication. You'll be redirected to security settings...
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/settings/security')}
                    variant="outline"
                    data-testid="button-return-to-security"
                  >
                    Return to Security Settings
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
