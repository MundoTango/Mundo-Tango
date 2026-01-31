import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

export default function VerifyEmailPage() {
  const { t } = useTranslation(["pages", "common"]);
  const params = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!params.token) {
        setStatus("error");
        setErrorMessage("No verification token provided");
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${params.token}`);
        
        if (response.ok) {
          setStatus("success");
        } else {
          const data = await response.json();
          setStatus("error");
          setErrorMessage(data.message || "Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("Failed to verify email. Please try again.");
      }
    };

    verifyEmail();
  }, [params.token]);

  return (
    <SelfHealingErrorBoundary pageName="Verify Email" fallbackRoute="/login">
      <PublicLayout>
        <SEO
          title={t('pages:verifyEmail.seo.title', 'Verify Email - Mundo Tango')}
          description={t('pages:verifyEmail.seo.description', 'Verify your email address to complete your Mundo Tango registration.')}
        />

        <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-8 text-center space-y-6">
                {status === "loading" && (
                  <>
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif font-bold" data-testid="text-verifying">
                        {t('pages:verifyEmail.verifying', 'Verifying your email...')}
                      </h2>
                      <p className="text-muted-foreground">
                        {t('pages:verifyEmail.pleaseWait', 'Please wait while we verify your email address.')}
                      </p>
                    </div>
                  </>
                )}

                {status === "success" && (
                  <>
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="mb-2 border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('pages:verifyEmail.verified', 'Verified')}
                      </Badge>
                      <h2 className="text-2xl font-serif font-bold" data-testid="text-success">
                        {t('pages:verifyEmail.successTitle', 'Email Verified!')}
                      </h2>
                      <p className="text-muted-foreground">
                        {t('pages:verifyEmail.successMessage', 'Your email has been successfully verified. You can now access all features of Mundo Tango.')}
                      </p>
                    </div>
                    <Link href="/login">
                      <Button className="w-full" data-testid="button-login">
                        {t('pages:verifyEmail.continueToLogin', 'Continue to Login')}
                      </Button>
                    </Link>
                  </>
                )}

                {status === "error" && (
                  <>
                    <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="mb-2 border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20">
                        <XCircle className="w-3 h-3 mr-1" />
                        {t('pages:verifyEmail.failed', 'Failed')}
                      </Badge>
                      <h2 className="text-2xl font-serif font-bold" data-testid="text-error">
                        {t('pages:verifyEmail.errorTitle', 'Verification Failed')}
                      </h2>
                      <p className="text-muted-foreground">
                        {errorMessage || t('pages:verifyEmail.errorMessage', 'The verification link may have expired or is invalid.')}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Link href="/register">
                        <Button variant="outline" className="w-full" data-testid="button-register">
                          {t('pages:verifyEmail.createNewAccount', 'Create New Account')}
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="ghost" className="w-full" data-testid="button-back-login">
                          {t('pages:verifyEmail.backToLogin', 'Back to Login')}
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PublicLayout>
    </SelfHealingErrorBoundary>
  );
}
