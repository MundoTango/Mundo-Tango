import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Heart } from "lucide-react";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PublicNavbar } from "@/components/PublicNavbar";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation(['pages', 'common', 'navigation']);
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <SelfHealingErrorBoundary pageName="Contact" fallbackRoute="/">
      <SEO
        title="Contact Us | Mundo Tango"
        description="Get in touch with the Mundo Tango team. We're here to help with questions about the platform, events, and the global tango community."
      />

      <div className="min-h-screen bg-background">
        <PublicNavbar />

        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 ocean-gradient opacity-90" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="glass-card rounded-2xl p-8 md:p-12 space-y-6">
                <motion.div variants={fadeInUp} className="flex justify-center">
                  <div className="w-24 h-24 rounded-full ocean-gradient flex items-center justify-center">
                    <Mail className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                <motion.h1
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-white"
                  data-testid="text-page-title"
                >
                  {t('pages:contact.title', 'Contact Us')}
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="text-xl text-white/90 max-w-2xl mx-auto"
                  data-testid="text-page-description"
                >
                  {t('pages:contact.subtitle', "Have questions or suggestions? We'd love to hear from you.")}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16" data-testid="section-contact-info">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-2xl mx-auto"
            >
              <motion.div variants={fadeInUp}>
                <Card className="text-center hover-elevate" data-testid="card-email-contact">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif flex items-center justify-center gap-2">
                      <Mail className="h-6 w-6 text-primary" />
                      {t('pages:contact.emailTitle', 'Email Us')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      {t('pages:contact.emailDescription', 'For questions, feedback, partnerships, or support, reach out to us at:')}
                    </p>
                    <a 
                      href="mailto:contact@mundotango.life" 
                      className="text-2xl md:text-3xl font-semibold text-primary hover:underline block"
                      data-testid="link-email"
                    >
                      contact@mundotango.life
                    </a>
                    <p className="text-sm text-muted-foreground">
                      {t('pages:contact.responseTime', 'We typically respond within 24-48 hours.')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  {t('pages:contact.supportCta', 'Want to support our mission to connect the global tango community?')}
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <Link href="/support">
                    <Button variant="outline" data-testid="button-support">
                      <Heart className="h-4 w-4 mr-2" />
                      {t('common:buttons.support', 'Support Us')}
                    </Button>
                  </Link>
                  <Link href="/volunteer">
                    <Button variant="outline" data-testid="button-volunteer">
                      {t('navigation:footer.volunteer')}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </SelfHealingErrorBoundary>
  );
}
