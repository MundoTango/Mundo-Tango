import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, ChevronRight, Mail, CheckCircle, Loader2 } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PasswordResetPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: t('pages:passwordReset.emailSent', 'Email Sent'),
        description: t('pages:passwordReset.checkInbox', 'Check your inbox for the reset link'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common:error', 'Error'),
        description: error.message || t('pages:passwordReset.sendError', 'Failed to send reset email'),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: t('common:error', 'Error'),
        description: t('pages:passwordReset.emailRequired', 'Please enter your email address'),
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  return (
    <SelfHealingErrorBoundary pageName="Password Reset" fallbackRoute="/login">
      <>
        <SEO
          title={t('pages:passwordReset.seoTitle', 'Reset Your Password')}
          description={t('pages:passwordReset.seoDescription', "Reset your Mundo Tango password securely. Enter your email and we'll send you a reset link.")}
        />

        {/* Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
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
                <Key className="w-3 h-3 mr-1.5" />
                {t('pages:passwordReset.accountSecurity', 'Account Security')}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                {t('pages:passwordReset.heroTitle', 'Reset Your Password')}
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                {t('pages:passwordReset.heroSubtitle', "Enter your email and we'll send you a secure reset link")}
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
                    {isSubmitted ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <Mail className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-2xl font-serif">
                    {isSubmitted 
                      ? t('pages:passwordReset.checkEmail', 'Check Your Email')
                      : t('pages:passwordReset.formTitle', 'Enter Your Email')
                    }
                  </CardTitle>
                  <p className="text-base text-muted-foreground leading-relaxed mt-2">
                    {isSubmitted
                      ? t('pages:passwordReset.emailSentDescription', "We've sent a password reset link to your email address. Please check your inbox and spam folder.")
                      : t('pages:passwordReset.formDescription', "We'll send you instructions to reset your password")
                    }
                  </p>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor="email" className="text-base">{t('pages:passwordReset.emailLabel', 'Email Address')}</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder={t('pages:passwordReset.emailPlaceholder', 'you@example.com')}
                            className="mt-2 h-12"
                            data-testid="input-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={forgotPasswordMutation.isPending}
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12 gap-2" 
                          data-testid="button-send"
                          disabled={forgotPasswordMutation.isPending}
                        >
                          {forgotPasswordMutation.isPending ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {t('pages:passwordReset.sending', 'Sending...')}
                            </>
                          ) : (
                            <>
                              {t('pages:passwordReset.sendResetLink', 'Send Reset Link')}
                              <ChevronRight className="h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        {t('pages:passwordReset.didntReceive', "Didn't receive the email?")}
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsSubmitted(false);
                          setEmail("");
                        }}
                        data-testid="button-try-again"
                      >
                        {t('pages:passwordReset.tryAgain', 'Try Again')}
                      </Button>
                    </div>
                  )}

                  <div className="pt-6 border-t">
                    <p className="text-center text-base text-muted-foreground">
                      {t('pages:passwordReset.rememberPassword', 'Remember your password?')}{" "}
                      <Link href="/login">
                        <a className="text-primary hover:underline font-semibold">
                          {t('pages:passwordReset.backToLogin', 'Back to login')}
                        </a>
                      </Link>
                    </p>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Key className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="font-semibold text-base">{t('pages:passwordReset.securityNote', 'Security Note')}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t('pages:passwordReset.securityNoteText', "For your security, the reset link will expire in 1 hour. If you don't receive the email, check your spam folder.")}
                        </p>
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
