import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, Users, Calendar, Gift, Star, Globe,
  ArrowRight, Check, Heart, Megaphone
} from "lucide-react";

interface Ambassador {
  id: number;
  city: string;
  country: string;
  userName: string;
  userAvatar: string | null;
  activatedAt: string;
}

interface CitySeekingAmbassador {
  city: string;
  country: string;
  userCount: number;
}

function AmbassadorsPageContent() {
  const { t } = useTranslation(['pages', 'common']);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const { data: ambassadors } = useQuery<Ambassador[]>({
    queryKey: ["/api/public/ambassadors"],
  });

  const { data: citiesSeeking } = useQuery<CitySeekingAmbassador[]>({
    queryKey: ["/api/public/cities-seeking-ambassadors"],
  });

  const benefits = [
    { icon: Star, title: t('pages:ambassadors.benefits.badge.title', 'Ambassador Badge'), description: t('pages:ambassadors.benefits.badge.desc', 'Exclusive profile badge showing your ambassador status') },
    { icon: Gift, title: t('pages:ambassadors.benefits.pro.title', 'Free Pro Membership'), description: t('pages:ambassadors.benefits.pro.desc', "Complimentary Pro features while you're an active ambassador") },
    { icon: Megaphone, title: t('pages:ambassadors.benefits.promotion.title', 'Event Promotion'), description: t('pages:ambassadors.benefits.promotion.desc', 'Priority promotion for events you organize or recommend') },
    { icon: Users, title: t('pages:ambassadors.benefits.network.title', 'Network Access'), description: t('pages:ambassadors.benefits.network.desc', 'Connect with ambassadors worldwide and share insights') },
    { icon: Calendar, title: t('pages:ambassadors.benefits.earlyAccess.title', 'Early Access'), description: t('pages:ambassadors.benefits.earlyAccess.desc', 'Be the first to try new features before public release') },
    { icon: Heart, title: t('pages:ambassadors.benefits.impact.title', 'Community Impact'), description: t('pages:ambassadors.benefits.impact.desc', 'Shape the tango community in your city') },
  ];

  const requirements = [
    t('pages:ambassadors.requirements.milonga', 'Host at least 1 milonga per week in your city'),
    t('pages:ambassadors.requirements.active', 'Be active on the platform (post, share events, connect)'),
    t('pages:ambassadors.requirements.respond', 'Respond to questions from visiting dancers'),
    t('pages:ambassadors.requirements.onboard', 'Help onboard new local dancers to the platform'),
    t('pages:ambassadors.requirements.share', 'Share accurate local event information'),
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title={t('pages:ambassadors.seo.title', 'Become an Ambassador - Mundo Tango')}
        description={t('pages:ambassadors.seo.description', 'Represent Mundo Tango in your city. Get free Pro membership, exclusive badges, and help connect the global tango community.')}
      />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" data-testid="section-hero">
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
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4">
                  <Globe className="h-3 w-3 mr-1" />
                  {t('pages:ambassadors.badge', 'Global Network')}
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                {t('pages:ambassadors.hero.title', 'Become a City Ambassador')}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                {t('pages:ambassadors.hero.subtitle', 'Represent Mundo Tango in your city. Help visiting dancers discover your local scene and connect the global tango community.')}
              </motion.p>

              <motion.div variants={fadeInUp}>
                <Link href="/register?redirect=/talent-match&role=ambassador">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-apply">
                    {t('pages:ambassadors.cta.apply', 'Apply to be Ambassador')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16" data-testid="section-benefits">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold">
                {t('pages:ambassadors.benefitsSection.title', 'Ambassador Benefits')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                {t('pages:ambassadors.benefitsSection.subtitle', 'Be recognized for your contribution to the tango community.')}
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`benefit-${index}`}>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center mb-4">
                        <benefit.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-muted/30" data-testid="section-requirements">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">{t('pages:ambassadors.requirements.title', 'Ambassador Requirements')}</CardTitle>
                <CardDescription>
                  {t('pages:ambassadors.requirements.subtitle', 'What it takes to represent Mundo Tango in your city')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <motion.li 
                      key={index} 
                      variants={fadeInUp}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full ocean-gradient flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span>{req}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="justify-center pt-6">
                <Link href="/register?redirect=/talent-match&role=ambassador">
                  <Button size="lg" data-testid="button-apply-now">
                    {t('pages:ambassadors.cta.applyNow', 'Apply Now')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Current Ambassadors */}
      {ambassadors && ambassadors.length > 0 && (
        <section className="py-16" data-testid="section-current">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
                  {t('pages:ambassadors.current.title', 'Current Ambassadors')}
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-muted-foreground">
                  {t('pages:ambassadors.current.count', '{{count}} ambassadors representing cities worldwide', { count: ambassadors.length })}
                </motion.p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {ambassadors.map((amb) => (
                  <motion.div
                    key={amb.id}
                    variants={fadeInUp}
                    className="p-4 rounded-lg border bg-card text-center hover-elevate"
                    data-testid={`ambassador-${amb.id}`}
                  >
                    <Avatar className="h-12 w-12 mx-auto mb-2">
                      <AvatarFallback>
                        {amb.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-sm truncate">{amb.userName}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {amb.city}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Cities Seeking Ambassadors */}
      {citiesSeeking && citiesSeeking.length > 0 && (
        <section className="py-16 bg-muted/30" data-testid="section-seeking">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
                  {t('pages:ambassadors.seeking.title', 'Cities Looking for Ambassadors')}
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-muted-foreground">
                  {t('pages:ambassadors.seeking.subtitle', 'These cities have active dancers but no ambassador yet. Could it be you?')}
                </motion.p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {citiesSeeking.slice(0, 20).map((city, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <Badge 
                      variant="outline" 
                      className="py-2 px-4 text-sm hover-elevate cursor-pointer"
                      data-testid={`city-${index}`}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {city.city}, {city.country}
                      <span className="ml-2 text-muted-foreground">({city.userCount} {t('pages:ambassadors.seeking.dancers', 'dancers')})</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 ocean-gradient" data-testid="section-cta">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-white">
              {t('pages:ambassadors.finalCta.title', 'Ready to Represent Your City?')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/90 text-lg">
              {t('pages:ambassadors.finalCta.subtitle', 'Join the global network of ambassadors connecting dancers worldwide.')}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex justify-center gap-4">
              <Link href="/register?redirect=/talent-match&role=ambassador">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" data-testid="button-apply-final">
                  {t('pages:ambassadors.cta.apply', 'Apply to be Ambassador')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function AmbassadorsPage() {
  return (
    <SelfHealingErrorBoundary>
      <AmbassadorsPageContent />
    </SelfHealingErrorBoundary>
  );
}
