import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { SEO } from "@/components/SEO";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Link } from "wouter";
import { TANGO_ROLES, getRolesByCategory, type TangoRole } from "@/lib/tangoRoles";

function TangoRolesPageContent() {
  const { t } = useTranslation(['pages', 'common']);
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const categoryInfo = {
    dance: {
      title: t('pages:tangoRoles.categories.dance.title', 'Dance Roles'),
      description: t('pages:tangoRoles.categories.dance.desc', 'The heart of tango - leaders and followers who bring the dance to life'),
      gradient: "from-blue-500/20 to-pink-500/20"
    },
    professional: {
      title: t('pages:tangoRoles.categories.professional.title', 'Professional Roles'),
      description: t('pages:tangoRoles.categories.professional.desc', 'The experts who teach, organize, and elevate the tango community'),
      gradient: "from-green-500/20 to-blue-500/20"
    },
    creative: {
      title: t('pages:tangoRoles.categories.creative.title', 'Creative Roles'),
      description: t('pages:tangoRoles.categories.creative.desc', "Artists, photographers, and creators who capture and express tango's beauty"),
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    community: {
      title: t('pages:tangoRoles.categories.community.title', 'Community Roles'),
      description: t('pages:tangoRoles.categories.community.desc', 'The builders and supporters who strengthen our global tango family'),
      gradient: "from-amber-500/20 to-green-500/20"
    }
  };

  const categories: Array<TangoRole['category']> = ['dance', 'professional', 'creative', 'community'];

  function RoleCard({ role, index }: { role: TangoRole; index: number }) {
    const Icon = role.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="h-full hover-elevate group" data-testid={`card-role-${role.value}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${role.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: role.color }} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{role.label}</CardTitle>
                {role.bookable && (
                  <Badge variant="outline" className="text-xs mt-1">
                    {t('pages:tangoRoles.bookable', 'Bookable')}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicNavbar />
      <SEO 
        title={t('pages:tangoRoles.seo.title', 'Tango Roles - Mundo Tango')}
        description={t('pages:tangoRoles.seo.description', 'Explore 21+ tango roles from dancers to DJs, teachers to photographers. Find your place in the global tango community.')}
      />
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-500/20 via-primary/10 to-background"
        data-testid="section-hero-roles"
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
              className="mb-6 border-purple-500/30 bg-purple-500/10"
              data-testid="badge-roles"
            >
              {t('pages:tangoRoles.hero.badge', '{{count}} TANGO ROLES', { count: TANGO_ROLES.length })}
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 tracking-tight leading-tight">
              {t('pages:tangoRoles.hero.title', 'Find Your Role')}{" "}
              <br />
              <span className="text-purple-500">{t('pages:tangoRoles.hero.titleHighlight', 'In the Tango World')}</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            {t('pages:tangoRoles.hero.subtitle', 'Tango is more than dancing. From teachers to DJs, photographers to historians, discover the diverse roles that make our community thrive.')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/register?redirect=/talent-match">
              <Button size="lg" className="text-lg px-8" data-testid="button-join-roles">
                {t('pages:tangoRoles.cta.joinCommunity', 'Join the Community')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {categories.map((category, categoryIdx) => {
        const roles = getRolesByCategory(category);
        const info = categoryInfo[category];
        
        return (
          <section 
            key={category}
            className={`py-16 px-8 ${categoryIdx % 2 === 1 ? 'bg-muted/30' : ''}`}
            data-testid={`section-category-${category}`}
          >
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">
                  {info.title}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {info.description}
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {roles.map((role, idx) => (
                  <RoleCard key={role.value} role={role} index={idx} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="py-20 px-8 bg-gradient-to-br from-purple-500/10 via-primary/5 to-background" data-testid="section-cta-roles">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              {t('pages:tangoRoles.finalCta.title', 'Ready to Join?')}
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t('pages:tangoRoles.finalCta.subtitle', "Whether you dance, teach, perform, or support - there's a place for you in Mundo Tango.")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <Badge variant="secondary" className="text-sm">
                <Check className="h-3 w-3 mr-1" />
                {t('pages:tangoRoles.features.multipleRoles', 'Select multiple roles')}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Check className="h-3 w-3 mr-1" />
                {t('pages:tangoRoles.features.trackExperience', 'Track experience per role')}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Check className="h-3 w-3 mr-1" />
                {t('pages:tangoRoles.features.getDiscovered', 'Get discovered by the community')}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Check className="h-3 w-3 mr-1" />
                {t('pages:tangoRoles.features.bookProfessionals', 'Book professionals directly')}
              </Badge>
            </div>
            <Link href="/register?redirect=/talent-match">
              <Button size="lg" className="text-lg px-12" data-testid="button-cta-roles">
                {t('pages:tangoRoles.cta.startJourney', 'Start Your Journey')}
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function TangoRolesPage() {
  return (
    <SelfHealingErrorBoundary pageName="Tango Roles" fallbackRoute="/">
      <TangoRolesPageContent />
    </SelfHealingErrorBoundary>
  );
}
