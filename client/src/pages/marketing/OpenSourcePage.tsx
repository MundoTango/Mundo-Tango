import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { 
  Github, Code, Shield, Users, Lock, Eye, Heart,
  Database, Layout, Server, Bot, Globe, Zap,
  ArrowRight, ExternalLink
} from "lucide-react";
import { SiReact, SiTypescript, SiTailwindcss, SiPostgresql, SiRedis, SiOpenai, SiStripe } from "react-icons/si";

function OpenSourcePageContent() {
  const { t } = useTranslation(['pages', 'common']);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const techStack = [
    { name: "React", icon: SiReact, category: t('pages:openSource.tech.frontend', 'Frontend') },
    { name: "TypeScript", icon: SiTypescript, category: t('pages:openSource.tech.language', 'Language') },
    { name: "Tailwind CSS", icon: SiTailwindcss, category: t('pages:openSource.tech.styling', 'Styling') },
    { name: "PostgreSQL", icon: SiPostgresql, category: t('pages:openSource.tech.database', 'Database') },
    { name: "Redis", icon: SiRedis, category: t('pages:openSource.tech.cache', 'Cache') },
    { name: "OpenAI", icon: SiOpenai, category: t('pages:openSource.tech.ai', 'AI') },
    { name: "Stripe", icon: SiStripe, category: t('pages:openSource.tech.payments', 'Payments') },
  ];

  const pillars = [
    {
      icon: Shield,
      title: t('pages:openSource.pillars.transparency.title', 'Trust Through Transparency'),
      description: t('pages:openSource.pillars.transparency.desc', 'Every line of code is visible. No hidden trackers, no secret algorithms. You can verify exactly how your data is handled.'),
    },
    {
      icon: Lock,
      title: t('pages:openSource.pillars.security.title', 'Security by Community'),
      description: t('pages:openSource.pillars.security.desc', 'Open source means thousands of eyes reviewing our code. Security vulnerabilities are found and fixed faster than any closed system.'),
    },
    {
      icon: Users,
      title: t('pages:openSource.pillars.ownership.title', 'Community Ownership'),
      description: t('pages:openSource.pillars.ownership.desc', 'The tango community owns this platform. Fork it, improve it, or run your own instance. Your contributions shape the future.'),
    },
  ];

  const stats = [
    { value: "61", label: t('pages:openSource.stats.layers', 'Technology Layers') },
    { value: "927+", label: t('pages:openSource.stats.agents', 'AI Agents') },
    { value: "380+", label: t('pages:openSource.stats.tables', 'Database Tables') },
    { value: "MIT", label: t('pages:openSource.stats.license', 'License') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title={t('pages:openSource.seo.title', 'Open Source - Mundo Tango')}
        description={t('pages:openSource.seo.description', 'Mundo Tango is built on open source principles. Transparent, secure, community-owned. View our code on GitHub.')}
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
              <motion.div variants={fadeInUp} className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                  <Code className="h-10 w-10 text-white" />
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                {t('pages:openSource.hero.title', 'Built in the Open')}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                {t('pages:openSource.hero.subtitle', "Mundo Tango is proudly open source. Transparent code, community contributions, and a commitment to the tango community's ownership of their platform.")}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-white/90 mb-2">{t('pages:openSource.hero.validation', 'Mundo Tango is currently in community validation.')}</p>
                  <p className="text-white/70 text-sm">{t('pages:openSource.hero.validationNote', 'Our code repository will be publicly available after stakeholder review and community feedback.')}</p>
                </div>
                <Link href="/volunteer">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-contribute">
                    {t('pages:openSource.cta.joinValidation', 'Join the Validation Community')}
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16" data-testid="section-pillars">
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
                {t('pages:openSource.pillarsSection.title', 'Why Open Source Matters')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                {t('pages:openSource.pillarsSection.subtitle', 'Three pillars that guide our commitment to transparency.')}
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pillars.map((pillar, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`pillar-${index}`}>
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 rounded-full ocean-gradient flex items-center justify-center mx-auto mb-4">
                        <pillar.icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle>{pillar.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-center">{pillar.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-muted/30" data-testid="section-tech">
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
                {t('pages:openSource.techSection.title', 'Built With Modern Technology')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground">
                {t('pages:openSource.techSection.subtitle', 'Enterprise-grade stack, community-driven development.')}
              </motion.p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {techStack.map((tech, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border hover-elevate"
                  data-testid={`tech-${index}`}
                >
                  <tech.icon className="h-10 w-10 text-primary" />
                  <span className="font-medium">{tech.name}</span>
                  <Badge variant="outline" className="text-xs">{tech.category}</Badge>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="text-center">
              <p className="text-muted-foreground mb-4">{t('pages:openSource.techSection.more', 'And 30+ more technologies powering Mundo Tango')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How to Contribute */}
      <section className="py-16" data-testid="section-contribute">
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
                <CardTitle className="text-2xl">{t('pages:openSource.contribute.title', 'How to Contribute')}</CardTitle>
                <CardDescription>
                  {t('pages:openSource.contribute.subtitle', 'Join hundreds of contributors building the future of tango')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: Code, title: t('pages:openSource.contribute.code.title', 'Code'), desc: t('pages:openSource.contribute.code.desc', 'Fix bugs, add features, improve performance') },
                    { icon: Layout, title: t('pages:openSource.contribute.design.title', 'Design'), desc: t('pages:openSource.contribute.design.desc', 'UI/UX improvements, icons, illustrations') },
                    { icon: Globe, title: t('pages:openSource.contribute.translate.title', 'Translate'), desc: t('pages:openSource.contribute.translate.desc', 'Help us reach dancers in 68 languages') },
                    { icon: Eye, title: t('pages:openSource.contribute.review.title', 'Review'), desc: t('pages:openSource.contribute.review.desc', 'Test features, report bugs, provide feedback') },
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <item.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

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
              {t('pages:openSource.finalCta.title', 'Join the Movement')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/90 text-lg">
              {t('pages:openSource.finalCta.subtitle', 'Help build the platform the tango community deserves. Every contribution matters.')}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-white/90">{t('pages:openSource.finalCta.validation', 'Currently in community validation.')}</p>
                <p className="text-white/70 text-sm">{t('pages:openSource.finalCta.validationNote', 'Code will be public after stakeholder approval.')}</p>
              </div>
              <Link href="/volunteer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-volunteer">
                  {t('pages:openSource.cta.becomeContributor', 'Become a Contributor')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function OpenSourcePage() {
  return (
    <SelfHealingErrorBoundary>
      <OpenSourcePageContent />
    </SelfHealingErrorBoundary>
  );
}
