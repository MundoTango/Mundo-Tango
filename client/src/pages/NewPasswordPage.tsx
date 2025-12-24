import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, ChevronRight, Lock, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Link, useLocation, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NewPasswordPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/reset-password/:token");
  const token = params?.token || "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: t('pages:newPassword.success', 'Password Reset Successful'),
        description: t('pages:newPassword.successDescription', 'You can now log in with your new password'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common:error', 'Error'),
        description: error.message || t('pages:newPassword.resetError', 'Failed to reset password. The link may have expired.'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast({
        title: t('common:error', 'Error'),
        description: t('pages:newPassword.passwordTooShort', 'Password must be at least 8 characters'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('common:error', 'Error'),
        description: t('pages:newPassword.passwordMismatch', 'Passwords do not match'),
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <SelfHealingErrorBoundary pageName="New Password" fallbackRoute="/forgot-password">
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Key className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold mb-2">{t('pages:newPassword.invalidLink', 'Invalid Reset Link')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('pages:newPassword.invalidLinkDescription', 'This password reset link is invalid or has expired.')}
              </p>
              <Link href="/forgot-password">
                <Button className="w-full" data-testid="button-request-new">
                  {t('pages:newPassword.requestNewLink', 'Request New Reset Link')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="New Password" fallbackRoute="/login">
      <>
        <SEO
          title={t('pages:newPassword.seoTitle', 'Set New Password')}
          description={t('pages:newPassword.seoDescription', 'Create a new password for your Mundo Tango account.')}
        />

        {/* Hero Section */}
        <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=80')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                <Lock className="w-3 h-3 mr-1.5" />
                {t('pages:newPassword.setNewPassword', 'Set New Password')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
                {t('pages:newPassword.heroTitle', 'Create New Password')}
              </h1>
              
              <p className="text-lg text-white/80 max-w-xl mx-auto">
                {t('pages:newPassword.heroSubtitle', 'Choose a strong password to secure your account')}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-background py-16 px-6">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="text-center border-b pb-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    {isSuccess ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <Lock className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-2xl font-serif">
                    {isSuccess 
                      ? t('pages:newPassword.passwordChanged', 'Password Changed!')
                      : t('pages:newPassword.formTitle', 'Enter New Password')
                    }
                  </CardTitle>
                  <p className="text-base text-muted-foreground leading-relaxed mt-2">
                    {isSuccess
                      ? t('pages:newPassword.successMessage', 'Your password has been successfully changed. You can now log in with your new password.')
                      : t('pages:newPassword.formDescription', 'Create a strong password with at least 8 characters')
                    }
                  </p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="newPassword" className="text-base">
                            {t('pages:newPassword.newPasswordLabel', 'New Password')}
                          </Label>
                          <div className="relative mt-2">
                            <Input 
                              id="newPassword" 
                              type={showPassword ? "text" : "password"}
                              placeholder={t('pages:newPassword.newPasswordPlaceholder', 'Enter new password')}
                              className="h-12 pr-10"
                              data-testid="input-new-password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={resetPasswordMutation.isPending}
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword" className="text-base">
                            {t('pages:newPassword.confirmPasswordLabel', 'Confirm Password')}
                          </Label>
                          <div className="relative mt-2">
                            <Input 
                              id="confirmPassword" 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder={t('pages:newPassword.confirmPasswordPlaceholder', 'Confirm new password')}
                              className="h-12 pr-10"
                              data-testid="input-confirm-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={resetPasswordMutation.isPending}
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              data-testid="button-toggle-confirm-password"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 gap-2" 
                          data-testid="button-reset-password"
                          disabled={resetPasswordMutation.isPending}
                        >
                          {resetPasswordMutation.isPending ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {t('pages:newPassword.resetting', 'Resetting...')}
                            </>
                          ) : (
                            <>
                              {t('pages:newPassword.resetPassword', 'Reset Password')}
                              <ChevronRight className="h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center">
                      <Button 
                        onClick={() => setLocation("/login")}
                        className="w-full h-12 gap-2"
                        data-testid="button-go-to-login"
                      >
                        {t('pages:newPassword.goToLogin', 'Go to Login')}
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  <div className="pt-6 border-t">
                    <p className="text-center text-base text-muted-foreground">
                      {t('pages:newPassword.needHelp', 'Need help?')}{" "}
                      <Link href="/contact">
                        <a className="text-primary hover:underline font-semibold">
                          {t('pages:newPassword.contactSupport', 'Contact Support')}
                        </a>
                      </Link>
                    </p>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Key className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="font-semibold text-base">{t('pages:newPassword.passwordTips', 'Password Tips')}</p>
                        <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1">
                          <li>{t('pages:newPassword.tip1', 'Use at least 8 characters')}</li>
                          <li>{t('pages:newPassword.tip2', 'Mix letters, numbers, and symbols')}</li>
                          <li>{t('pages:newPassword.tip3', 'Avoid common words or patterns')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
