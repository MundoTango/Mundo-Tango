import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, Star, Award, Crown, Users
} from "lucide-react";

interface Supporter {
  id: number;
  name: string;
  tier: "cachafaz" | "piazzolla" | "copes" | "gardel";
  message: string | null;
  createdAt: string;
}

function SupportersPageContent() {
  const { t } = useTranslation(['pages', 'common']);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const { data: supporters, isLoading } = useQuery<Supporter[]>({
    queryKey: ["/api/public/supporters"],
  });

  const { data: donationStats } = useQuery<{
    totalRaisedCents: number;
    totalRaisedFormatted: string;
    donorCount: number;
  }>({
    queryKey: ["/api/public/donation-stats"],
  });

  const tierConfig = {
    gardel: { 
      icon: Crown, 
      label: t('pages:supporters.tiers.gardel', 'Gardel'),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500",
    },
    copes: { 
      icon: Award, 
      label: t('pages:supporters.tiers.copes', 'Copes'),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
    },
    piazzolla: { 
      icon: Star, 
      label: t('pages:supporters.tiers.piazzolla', 'Piazzolla'),
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500",
    },
    cachafaz: { 
      icon: Heart, 
      label: t('pages:supporters.tiers.cachafaz', 'Cachafaz'),
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500",
    },
  };

  const groupedSupporters = {
    gardel: supporters?.filter(s => s.tier === "gardel") || [],
    copes: supporters?.filter(s => s.tier === "copes") || [],
    piazzolla: supporters?.filter(s => s.tier === "piazzolla") || [],
    cachafaz: supporters?.filter(s => s.tier === "cachafaz") || [],
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title={t('pages:supporters.seo.title', 'Our Supporters - Mundo Tango')}
        description={t('pages:supporters.seo.description', 'Meet the tango lovers who support Mundo Tango. Gardel, Copes, Piazzolla, and Cachafaz tier supporters making the platform possible.')}
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
                  <Users className="h-3 w-3 mr-1" />
                  {t('pages:supporters.badge', 'Recognition Wall')}
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                {t('pages:supporters.hero.title', 'Our Tango Legends')}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                {t('pages:supporters.hero.subtitle', 'Thank you to every supporter who believes in our mission to connect the global tango community.')}
              </motion.p>

              {donationStats && donationStats.donorCount > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center gap-8 pt-4"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{donationStats.totalRaisedFormatted}</div>
                    <div className="text-sm text-white/80">{t('pages:supporters.stats.totalRaised', 'Total Raised')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{donationStats.donorCount}</div>
                    <div className="text-sm text-white/80">{t('pages:supporters.stats.supporters', 'Supporters')}</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Supporters by Tier */}
      <section className="py-16" data-testid="section-supporters">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">{t('pages:supporters.loading', 'Loading supporters...')}</p>
            </div>
          ) : supporters && supporters.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-12"
            >
              {(["gardel", "copes", "piazzolla", "cachafaz"] as const).map((tier) => {
                const tierSupporters = groupedSupporters[tier];
                const config = tierConfig[tier];
                const Icon = config.icon;
                
                if (tierSupporters.length === 0) return null;

                return (
                  <motion.div key={tier} variants={fadeInUp}>
                    <div className="flex items-center gap-3 mb-6">
                      <Icon className={`h-6 w-6 ${config.color}`} />
                      <h2 className="text-2xl font-bold">{config.label} {t('pages:supporters.supportersLabel', 'Supporters')}</h2>
                      <Badge variant="outline" className={config.borderColor}>
                        {tierSupporters.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {tierSupporters.map((supporter) => (
                        <motion.div
                          key={supporter.id}
                          variants={fadeInUp}
                          className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} text-center hover-elevate`}
                          data-testid={`supporter-${supporter.id}`}
                        >
                          <Avatar className="h-12 w-12 mx-auto mb-2">
                            <AvatarFallback className={config.bgColor}>
                              {getInitials(supporter.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-sm truncate">{supporter.name}</div>
                          {supporter.message && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              "{supporter.message}"
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('pages:supporters.empty.title', 'Be the First Supporter')}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('pages:supporters.empty.description', 'Become a founding supporter and help build the platform the tango community deserves. Your name will appear here as a Tango Legend.')}
              </p>
              <Link href="/support">
                <Button size="lg" data-testid="button-become-first">
                  {t('pages:supporters.cta.becomeSupporter', 'Become a Supporter')}
                  <Heart className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30" data-testid="section-cta">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
              {t('pages:supporters.finalCta.title', 'Join the Wall of Legends')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-lg">
              {t('pages:supporters.finalCta.subtitle', "Support Mundo Tango and become part of the community that's building the future of tango.")}
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/support">
                <Button size="lg" data-testid="button-support-now">
                  {t('pages:supporters.cta.supportNow', 'Support Now')}
                  <Heart className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function SupportersPage() {
  return (
    <SelfHealingErrorBoundary>
      <SupportersPageContent />
    </SelfHealingErrorBoundary>
  );
}
