import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function EmailVerificationPage() {
  return (
    <SelfHealingErrorBoundary pageName="Email Verification" fallbackRoute="/login">
      <PageLayout title="Verify Your Email" showBreadcrumbs>
        <div className="min-h-screen">
          {/* Hero Section - 16:9 */}
          <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop')`
            }}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                  <Mail className="w-3 h-3 mr-1.5" />
                  Verification
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                  Verify Your Email
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  We've sent you a verification link to complete your registration
                </p>
              </motion.div>
            </div>
          </section>

          <div className="bg-background py-12 px-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-2xl"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-12 text-center space-y-8">
                  <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-12 w-12 text-primary" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-serif font-bold" data-testid="text-verification-title">
                      Check Your Inbox
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                      We've sent a verification link to your email address.
                      Please check your inbox and click the link to verify your account.
                    </p>
                  </div>

                  <div className="bg-muted p-6 rounded-lg">
                    <div className="flex items-center gap-3 justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium">Email sent to: john@example.com</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam folder or request a new one.
                    </p>
                    <Button variant="outline" className="gap-2" data-testid="button-resend">
                      <RefreshCw className="h-4 w-4" />
                      Resend Verification Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
