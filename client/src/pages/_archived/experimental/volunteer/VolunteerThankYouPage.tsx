import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { CheckCircle, Home, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function VolunteerThankYouPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, setLocation] = useLocation();

  return (
    <SelfHealingErrorBoundary pageName="Volunteer Thank You" fallbackRoute="/">
      <PageLayout title="Thank You" showBreadcrumbs>
        <SEO
          title="Thank You - Mundo Tango Volunteer Program"
          description="Your volunteer interview is complete. Welcome to the Mundo Tango community!"
        />

        <div className="min-h-[80vh] flex items-center justify-center p-4" data-testid="page-volunteer-thank-you">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            <Card className="glass-card text-center">
              <CardContent className="pt-8 pb-8 px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>

                <h1 className="text-2xl font-bold mb-2" data-testid="heading-thank-you">
                  {t('pages:volunteerThankYou.title', 'Interview Complete!')}
                </h1>
                
                <p className="text-muted-foreground mb-6" data-testid="text-thank-you-message">
                  Thank you for completing your volunteer interview with Mr. Blue. 
                  Your profile has been submitted for review. We'll match your skills 
                  with available opportunities and notify you soon.
                </p>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setLocation("/h2ac-dashboard")}
                    data-testid="button-go-dashboard"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    View Your Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/profile")}
                    data-testid="button-go-profile"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setLocation("/")}
                    data-testid="button-go-home"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Return Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
