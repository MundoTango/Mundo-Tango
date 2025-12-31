import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, Users, MapPin, Calendar, Music, Star, MessageCircle, 
  Globe, Sparkles, Check, ArrowRight 
} from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Link } from "wouter";

export default function ForDancersPage() {
  const { t } = useTranslation(['pages', 'common']);
  const heroRef = useRef(null);
  
  const features = [
    {
      icon: Users,
      title: t('pages:dancers.features.findPartners.title', 'Find Dance Partners'),
      description: t('pages:dancers.features.findPartners.description', 'Connect with dancers at your level in any city. Our AI matching considers style, experience, and availability.')
    },
    {
      icon: Calendar,
      title: t('pages:dancers.features.discoverEvents.title', 'Discover Events'),
      description: t('pages:dancers.features.discoverEvents.description', 'Never miss a milonga, practica, or festival. Get personalized recommendations based on your preferences.')
    },
    {
      icon: Globe,
      title: t('pages:dancers.features.travelDance.title', 'Travel & Dance'),
      description: t('pages:dancers.features.travelDance.description', 'Plan tango trips with local recommendations. Find milongas, housing, and dancers wherever you go.')
    },
    {
      icon: Star,
      title: t('pages:dancers.features.trackJourney.title', 'Track Your Journey'),
      description: t('pages:dancers.features.trackJourney.description', 'Build your tango portfolio with memories, events attended, and skills developed over time.')
    },
    {
      icon: MessageCircle,
      title: t('pages:dancers.features.communityChat.title', 'Community Chat'),
      description: t('pages:dancers.features.communityChat.description', 'Join discussions, ask questions, and share experiences with the global tango community.')
    },
    {
      icon: Heart,
      title: t('pages:dancers.features.buildConnections.title', 'Build Connections'),
      description: t('pages:dancers.features.buildConnections.description', 'Create meaningful friendships that last beyond the dance floor. Your tango family awaits.')
    }
  ];
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <SelfHealingErrorBoundary pageName={t('pages:dancers.pageName', 'For Dancers')} fallbackRoute="/">
      <SEO 
        title={t('pages:dancers.seo.title', 'For Dancers - Mundo Tango')}
        description={t('pages:dancers.seo.description', 'Join the global tango community. Find partners, discover events, and connect with dancers worldwide.')}
      />
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        <PublicNavbar />
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity }}
          className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-background"
          data-testid="section-hero-dancers"
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
                data-testid="badge-dancers"
              >
                {t('pages:dancers.badge', 'FOR DANCERS')}
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
                {t('pages:dancers.hero.heading', 'Your Tango Journey')}{" "}
                <br />
                <span className="text-primary">{t('pages:dancers.hero.headingHighlight', 'Starts Here')}</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              {t('pages:dancers.hero.paragraph', 'Whether you are taking your first steps or perfecting your volcadas, Mundo Tango connects you with dancers, events, and experiences that elevate your passion.')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/register?redirect=/talent-match">
                <Button size="lg" className="text-lg px-8" data-testid="button-join-dancers">
                  {t('pages:dancers.hero.button', 'Join Free Today')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <section className="py-20 px-8" data-testid="section-features-dancers">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {t('pages:dancers.featuresSection.heading', 'Everything You Need to Dance')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('pages:dancers.featuresSection.paragraph', 'From finding partners to discovering your next milonga, we have got you covered.')}
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
                  <Card className="h-full hover-elevate" data-testid={`card-feature-${idx}`}>
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

        <section className="py-20 px-8" data-testid="section-cta-dancers">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                {t('pages:dancers.cta.heading', 'Ready to Dance?')}
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {t('pages:dancers.cta.paragraph', 'Join Mundo Tango today and become part of the global tango family.')}
              </p>
              <Link href="/register?redirect=/talent-match">
                <Button size="lg" className="text-lg px-12" data-testid="button-cta-dancers">
                  {t('pages:dancers.cta.button', 'Start Dancing')}
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
