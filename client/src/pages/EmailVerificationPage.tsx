import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, RefreshCw, Loader2, ArrowRight, KeyRound } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import tangoHeroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

export default function EmailVerificationPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const { refreshCurrentUser } = useAuth();
  const [, navigate] = useLocation();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const searchParams = new URLSearchParams(window.location.search);
  const email = searchParams.get("email") || "";
  
  const getCsrfToken = () => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? match[1] : null;
  };
  
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t('pages:emailVerification.toast.invalidCode.title', 'Invalid code'),
        description: t('pages:emailVerification.toast.invalidCode.description', 'Please enter a valid 6-digit verification code.'),
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ token: verificationCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsVerified(true);
        
        // Store the access token from the response
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        
        // Refresh auth context to update user state
        await refreshCurrentUser();
        
        toast({
          title: t('pages:emailVerification.toast.verified.title', 'Email verified!'),
          description: t('pages:emailVerification.toast.verified.description', 'Your email has been verified. Redirecting...'),
        });
        
        // Check if user needs onboarding or can go directly to home
        if (data.user && data.user.onboardingCompleted) {
          navigate("/home");
        } else {
          navigate("/onboarding");
        }
      } else {
        toast({
          title: t('pages:emailVerification.toast.verifyError.title', 'Verification failed'),
          description: data.message || t('pages:emailVerification.toast.verifyError.description', 'Invalid or expired code. Please try again.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('pages:emailVerification.toast.error.title', 'Error'),
        description: t('pages:emailVerification.toast.error.description', 'Failed to verify email. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResend = async () => {
    if (!email) {
      toast({
        title: t('pages:emailVerification.toast.noEmail.title', 'No email address'),
        description: t('pages:emailVerification.toast.noEmail.description', 'Please return to registration and try again.'),
        variant: "destructive",
      });
      return;
    }
    
    setIsResending(true);
    
    try {
      const csrfToken = getCsrfToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (csrfToken) {
        headers["x-xsrf-token"] = csrfToken;
      }
      
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.status === 429) {
        toast({
          title: t('pages:emailVerification.toast.tooMany.title', 'Too many requests'),
          description: t('pages:emailVerification.toast.tooMany.description', 'Please wait a few minutes before trying again.'),
          variant: "destructive",
        });
      } else {
        setResendSuccess(true);
        setVerificationCode("");
        toast({
          title: t('pages:emailVerification.toast.sent.title', 'Code sent!'),
          description: data.message || t('pages:emailVerification.toast.sent.description', 'Please check your inbox for a new code.'),
        });
        setTimeout(() => setResendSuccess(false), 5000);
      }
    } catch (error) {
      toast({
        title: t('pages:emailVerification.toast.error.title', 'Error'),
        description: t('pages:emailVerification.toast.error.description', 'Failed to resend code. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(digitsOnly);
  };
  
  return (
    <SelfHealingErrorBoundary pageName="Email Verification" fallbackRoute="/login">
      <PublicLayout>
        <SEO
          title={t('pages:emailVerification.seo.title', 'Verify Your Email - Mundo Tango')}
          description={t('pages:emailVerification.seo.description', 'Enter your verification code to complete your Mundo Tango registration.')}
        />

        <div className="relative min-h-screen w-full overflow-hidden" data-testid="hero-verification">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url(${tangoHeroImage})`}}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-verification">
                  {isVerified ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <KeyRound className="w-3 h-3 mr-1" />
                  )}
                  {isVerified 
                    ? t('pages:emailVerification.badge.verified', 'Verified!')
                    : t('pages:emailVerification.badge', 'Almost There')
                  }
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight leading-tight" data-testid="text-page-title">
                  {isVerified 
                    ? t('pages:emailVerification.title.verified', 'Email Verified!')
                    : t('pages:emailVerification.title', 'Enter Verification Code')
                  }
                </h1>
                
                <p className="text-lg text-white/80 max-w-md mx-auto">
                  {isVerified 
                    ? t('pages:emailVerification.subtitle.verified', 'Redirecting you to login...')
                    : t('pages:emailVerification.subtitle', "We've sent a 6-digit code to your email")
                  }
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="backdrop-blur-md bg-white/10 border border-white/20 overflow-hidden">
                  <CardContent className="p-8 text-center space-y-6">
                    {isVerified ? (
                      <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-green-400" />
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                          <Mail className="h-10 w-10 text-white" />
                        </div>

                        {email && (
                          <div className="bg-white/10 p-4 rounded-lg">
                            <div className="flex items-center gap-3 justify-center flex-wrap">
                              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                              <span className="text-white/90 font-medium" data-testid="text-email-sent">
                                {t('pages:emailVerification.emailSentTo', 'Code sent to:')} <span className="text-white">{email}</span>
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <p className="text-white/70 text-sm">
                            {t('pages:emailVerification.instructions', 'Enter the 6-digit code from your email to verify your account.')}
                          </p>
                          
                          <div className="flex justify-center">
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="000000"
                              value={verificationCode}
                              onChange={(e) => handleCodeChange(e.target.value)}
                              className="text-center text-2xl tracking-[0.5em] font-mono w-48 bg-white/20 border-white/30 text-white placeholder:text-white/30"
                              maxLength={6}
                              data-testid="input-verification-code"
                            />
                          </div>
                          
                          <Button 
                            onClick={handleVerify}
                            disabled={isVerifying || verificationCode.length !== 6}
                            className="w-full gap-2"
                            data-testid="button-verify"
                          >
                            {isVerifying ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            {t('pages:emailVerification.verifyButton', 'Verify Email')}
                          </Button>
                        </div>

                        <div className="space-y-4 pt-2">
                          <p className="text-white/60 text-sm">
                            {t('pages:emailVerification.didntReceive', "Didn't receive the code? Check your spam folder or:")}
                          </p>
                          
                          <Button 
                            variant="outline" 
                            onClick={handleResend}
                            disabled={isResending || resendSuccess}
                            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                            data-testid="button-resend"
                          >
                            {isResending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : resendSuccess ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            {resendSuccess 
                              ? t('pages:emailVerification.codeResent', 'Code Resent!')
                              : t('pages:emailVerification.resendButton', 'Resend Verification Code')
                            }
                          </Button>
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <Link href="/login">
                        <Button variant="ghost" className="gap-2 text-white/80 hover:text-white hover:bg-white/10" data-testid="button-already-verified">
                          {t('pages:emailVerification.alreadyVerified', "Already verified? Sign in")}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </PublicLayout>
    </SelfHealingErrorBoundary>
  );
}
