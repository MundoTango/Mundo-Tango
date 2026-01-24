import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarCheck, Users, TicketIcon, BarChart3, Globe, Mail,
  MapPin, CreditCard, MessageCircle, ArrowRight, Check, Sparkles
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Link } from "wouter";

export default function ForOrganizersPage() {
  const { t } = useTranslation(['pages', 'common']);
  const heroRef = useRef(null);
  
  const features = [
    {
      icon: CalendarCheck,
      title: t('pages:organizers.features.eventManagement.title', 'Event Management'),
      description: t('pages:organizers.features.eventManagement.description', 'Create and manage milongas, festivals, and workshops. One dashboard for all your events.')
    },
    {
      icon: TicketIcon,
      title: t('pages:organizers.features.ticketingRsvp.title', 'Ticketing & RSVP'),
      description: t('pages:organizers.features.ticketingRsvp.description', 'Sell tickets, manage capacity, and track RSVPs. Built-in waitlist management included.')
    },
    {
      icon: Users,
      title: t('pages:organizers.features.attendeeInsights.title', 'Attendee Insights'),
      description: t('pages:organizers.features.attendeeInsights.description', 'Understand your audience with detailed analytics. Know who comes, what they like, and when.')
    },
    {
      icon: Mail,
      title: t('pages:organizers.features.emailMarketing.title', 'Email Marketing'),
      description: t('pages:organizers.features.emailMarketing.description', 'Send announcements, reminders, and thank-you notes. Keep your dancers engaged.')
    },
    {
      icon: CreditCard,
      title: t('pages:organizers.features.paymentProcessing.title', 'Payment Processing'),
      description: t('pages:organizers.features.paymentProcessing.description', 'Accept payments online with low fees. Multi-currency support for international events.')
    },
    {
      icon: Globe,
      title: t('pages:organizers.features.globalReach.title', 'Global Reach'),
      description: t('pages:organizers.features.globalReach.description', 'Promote to dancers worldwide. Travelers discover your events before arriving.')
    }
  ];

  const benefitsList = [
    { key: 'marketing.organizers.benefits.freeEventListing', fallback: 'Free event listing' },
    { key: 'marketing.organizers.benefits.lowTicketingFees', fallback: 'Low ticketing fees' },
    { key: 'marketing.organizers.benefits.globalReach', fallback: 'Global reach' },
    { key: 'marketing.organizers.benefits.support247', fallback: '24/7 support' }
  ];
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <SelfHealingErrorBoundary pageName={t('pages:organizers.pageName', 'For Organizers')} fallbackRoute="/">
      <SEO 
        title={t('pages:organizers.seo.title', 'For Organizers - Mundo Tango')}
        description={t('pages:organizers.seo.description', 'Host successful tango events. Manage ticketing, reach global dancers, and grow your community with Mundo Tango.')}
      />
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        <PublicNavbar />
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background"
          data-testid="section-hero-organizers"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />

          <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Badge 
                variant="outline" 
                className="mb-6 border-primary/30 bg-primary/10"
                data-testid="badge-organizers"
              >
                {t('pages:organizers.badge', 'FOR ORGANIZERS')}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
                {t('pages:organizers.hero.heading', 'Host Unforgettable')}{" "}
                <br />
                <span className="text-primary">{t('pages:organizers.hero.headingHighlight', 'Tango Events')}</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              {t('pages:organizers.hero.paragraph', 'From intimate milongas to grand festivals, manage every detail and reach dancers worldwide. Your event deserves the spotlight.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/register?redirect=/talent-match&role=organizer">
                <Button size="lg" className="text-lg px-8" data-testid="button-join-organizers">
                  {t('pages:organizers.hero.button', 'Create Your Event')}
                  <CalendarCheck className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/events">
                <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-explore-organizers">
                  {t('pages:organizers.hero.buttonSecondary', 'See Examples')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <section className="py-20 px-8" data-testid="section-features-organizers">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {t('pages:organizers.featuresSection.heading', 'Everything for Your Events')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('pages:organizers.featuresSection.paragraph', 'Powerful tools to manage, promote, and analyze your tango events.')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full hover-elevate" data-testid={`card-feature-organizer-${idx}`}>
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-primary mb-4" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-8" data-testid="section-cta-organizers">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {t('pages:organizers.cta.heading', 'Ready to Fill Your Dance Floor?')}
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {t('pages:organizers.cta.paragraph', 'List your first event free. No credit card required.')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {benefitsList.map((benefit, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    <Check className="h-3 w-3 mr-1" />
                    {t(`pages:${benefit.key}`, benefit.fallback)}
                  </Badge>
                ))}
              </div>
              <Link href="/register?redirect=/talent-match&role=organizer">
                <Button size="lg" className="text-lg px-12" data-testid="button-cta-organizers">
                  {t('pages:organizers.cta.button', 'List Your Event')}
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </SelfHealingErrorBoundary>
  );
}
