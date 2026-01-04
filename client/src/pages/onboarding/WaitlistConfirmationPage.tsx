import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { PartyPopper, HandHeart, CreditCard, ArrowRight, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TalentMatchModal } from "@/components/TalentMatchModal";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

export default function WaitlistConfirmationPage() {
  const { user } = useAuth();
  const { t } = useTranslation(['pages', 'common']);
  const [showTalentMatch, setShowTalentMatch] = useState(false);

  return (
    <SelfHealingErrorBoundary pageName="WaitlistConfirmation" fallbackRoute="/">
      <PageLayout title={t('pages:onboarding.waitlist.pageTitle', 'WaitlistConfirmation')} showBreadcrumbs={false}>
        <SEO
          title={t('pages:onboarding.waitlist.seoTitle', "You're on the List! - Mundo Tango")}
          description={t('pages:onboarding.waitlist.seoDescription', "Welcome to the Mundo Tango community. We're preparing your account and will notify you soon!")}
        />

        <div className="relative min-h-screen w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <PartyPopper className="w-12 h-12 text-green-400" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-serif text-white font-bold mb-4" data-testid="heading-waitlist-success">
                {t('pages:onboarding.waitlist.title', "You're on the List!")}
              </h1>

              <p className="text-xl text-white/80 mb-8" data-testid="text-welcome-message">
                {t('pages:onboarding.waitlist.welcomeMessage', 'Welcome to the Mundo Tango community, {{name}}!', { name: user?.name || t('pages:onboarding.waitlist.defaultName', 'Dancer') })}
              </p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl"
                data-testid="section-waitlist-confirmation"
              >
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                  <Mail className="w-5 h-5 text-white/70 flex-shrink-0" />
                  <p className="text-sm text-white/80 text-left">
                    {t('pages:onboarding.waitlist.emailNotice', "We'll email you at")} <span className="text-white font-medium">{user?.email}</span> {t('pages:onboarding.waitlist.whenReady', 'when your account is ready for full access.')}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-white/60 font-medium uppercase tracking-wide mb-4">
                    {t('pages:onboarding.waitlist.whileYouWait', 'While you wait, help us grow')}
                  </p>
                  
                  <Button 
                    className="w-full bg-white text-black hover:bg-white/90"
                    size="lg"
                    data-testid="button-volunteer-cta"
                    onClick={() => setShowTalentMatch(true)}
                  >
                    <HandHeart className="mr-2 h-5 w-5" />
                    {t('pages:onboarding.waitlist.volunteerButton', 'Volunteer with us')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <a href="https://www.gofundme.com/f/join-us-in-bringing-mundo-tango-to-life" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      className="w-full border-white/30 text-white hover:bg-white/10"
                      size="lg"
                      data-testid="button-support-cta"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      {t('pages:onboarding.waitlist.supportButton', 'Support Mundo Tango')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-white/70">
                      <p className="font-medium text-white/90 mb-1">{t('pages:onboarding.waitlist.profileComplete', 'Your profile is complete!')}</p>
                      <p>{t('pages:onboarding.waitlist.profileCompleteDesc', "You've finished setting up your Mundo Tango profile. We'll notify you as soon as your account is activated.")}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <TalentMatchModal 
          open={showTalentMatch} 
          onOpenChange={setShowTalentMatch} 
        />
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
