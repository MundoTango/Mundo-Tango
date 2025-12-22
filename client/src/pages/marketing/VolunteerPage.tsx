import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { TalentMatchModal } from "@/components/TalentMatchModal";
import { useQuery } from "@tanstack/react-query";
import { 
  Code, Layout, TrendingUp, Brain, Shield, Globe,
  Users, Clock, Zap, Award, ArrowRight, CheckCircle,
  Database, Palette, LineChart, Lock, Languages, Heart
} from "lucide-react";

interface VolunteerDivision {
  id: string;
  name: string;
  layers: string;
  description: string;
  roles: string[];
  skills: string[];
  icon: string;
}

function VolunteerPageContent() {
  const { t } = useTranslation(['pages', 'common']);
  const [showTalentMatch, setShowTalentMatch] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const { data: divisions } = useQuery<VolunteerDivision[]>({
    queryKey: ["/api/public/volunteer-divisions"],
  });

  const iconMap: Record<string, typeof Code> = {
    Database: Database,
    Layout: Layout,
    TrendingUp: TrendingUp,
    Brain: Brain,
    Shield: Shield,
    Globe: Globe,
  };

  const divisionColors: Record<string, string> = {
    foundation: "border-blue-500 bg-blue-500/10",
    core: "border-green-500 bg-green-500/10",
    business: "border-amber-500 bg-amber-500/10",
    intelligence: "border-purple-500 bg-purple-500/10",
    platform: "border-red-500 bg-red-500/10",
    extended: "border-teal-500 bg-teal-500/10",
  };

  const roleHierarchy = [
    { level: t('pages:volunteer.roles.cLevel', 'C-Level Advisors'), description: t('pages:volunteer.roles.cLevelDesc', 'Strategic guidance and industry expertise'), count: t('pages:volunteer.roles.cLevelCount', 'CEO, CTO, CPO, CMO') },
    { level: t('pages:volunteer.roles.divisionChiefs', 'Division Chiefs'), description: t('pages:volunteer.roles.divisionChiefsDesc', 'Lead entire technology divisions'), count: t('pages:volunteer.roles.divisionChiefsCount', '6 positions') },
    { level: t('pages:volunteer.roles.directors', 'Directors'), description: t('pages:volunteer.roles.directorsDesc', 'Manage teams within divisions'), count: t('pages:volunteer.roles.directorsCount', '~20 positions') },
    { level: t('pages:volunteer.roles.teamLeads', 'Team Leads'), description: t('pages:volunteer.roles.teamLeadsDesc', 'Coordinate small teams on projects'), count: t('pages:volunteer.roles.teamLeadsCount', '~50 positions') },
    { level: t('pages:volunteer.roles.expertAgents', 'Expert Agents'), description: t('pages:volunteer.roles.expertAgentsDesc', 'Senior contributors with specialized skills'), count: t('pages:volunteer.roles.expertAgentsCount', '~100 positions') },
    { level: t('pages:volunteer.roles.contributors', 'Individual Contributors'), description: t('pages:volunteer.roles.contributorsDesc', 'Core contributors to various tasks'), count: t('pages:volunteer.roles.contributorsCount', 'Open positions') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <SEO
        title={t('pages:volunteer.seo.title', 'Volunteer with Mundo Tango')}
        description={t('pages:volunteer.seo.description', 'Join our volunteer program. Contribute your skills to build the platform connecting the global tango community.')}
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
                  {t('pages:volunteer.badge', 'Volunteer Program')}
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-white"
                data-testid="text-hero-headline"
              >
                {t('pages:volunteer.hero.title', 'Volunteer with Mundo Tango')}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-white/90 max-w-2xl mx-auto"
              >
                {t('pages:volunteer.hero.subtitle', 'Work alongside our team to build the platform the tango community deserves. Contribute your skills. Make a real impact.')}
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-wrap justify-center gap-4 pt-4"
              >
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Heart className="h-4 w-4" />
                  <span>{t('pages:volunteer.features.communityDriven', 'Community Driven')}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Clock className="h-4 w-4" />
                  <span>{t('pages:volunteer.features.flexibleHours', 'Flexible Hours')}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Globe className="h-4 w-4" />
                  <span>{t('pages:volunteer.features.remoteFriendly', 'Remote Friendly')}</span>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="pt-6">
                <Button 
                  size="lg" 
                  onClick={() => setShowTalentMatch(true)}
                  className="bg-white text-primary hover:bg-white/90"
                  data-testid="button-apply-volunteer"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {t('pages:volunteer.cta.applyNow', 'Apply Now')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <TalentMatchModal 
        open={showTalentMatch} 
        onOpenChange={setShowTalentMatch} 
      />

      {/* Role Hierarchy Section */}
      <section className="py-16" data-testid="section-hierarchy">
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
                {t('pages:volunteer.hierarchy.title', 'Volunteer Role Hierarchy')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                {t('pages:volunteer.hierarchy.subtitle', 'From C-level advisors to individual contributors, find your place in our organization.')}
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {roleHierarchy.map((role, index) => (
                <motion.div key={role.level} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`role-${index}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full ocean-gradient flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg">{role.level}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                      <Badge variant="outline">{role.count}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divisions Section */}
      <section className="py-16 bg-muted/30" data-testid="section-divisions">
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
                {t('pages:volunteer.divisions.title', '6 Technology Divisions')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
                {t('pages:volunteer.divisions.subtitle', 'Each division covers specific layers of our technology stack.')}
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions?.map((division) => {
                const Icon = iconMap[division.icon] || Code;
                const colorClass = divisionColors[division.id] || "";

                return (
                  <motion.div key={division.id} variants={fadeInUp}>
                    <Card 
                      className={`h-full border-2 hover-elevate ${colorClass}`}
                      data-testid={`division-${division.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Icon className="h-8 w-8 text-primary" />
                          <div>
                            <CardTitle>{division.name}</CardTitle>
                            <CardDescription>{t('pages:volunteer.divisions.layers', 'Layers')} {division.layers}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{division.description}</p>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">{t('pages:volunteer.divisions.rolesLabel', 'Roles:')}</div>
                          <div className="flex flex-wrap gap-1">
                            {division.roles.slice(0, 3).map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {division.roles.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{division.roles.length - 3} {t('common:more', 'more')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">{t('pages:volunteer.divisions.skillsLabel', 'Skills:')}</div>
                          <div className="flex flex-wrap gap-1">
                            {division.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {division.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{division.skills.length - 3} {t('common:more', 'more')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold">
                {t('pages:volunteer.benefits.title', 'Why Volunteer?')}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground">
                {t('pages:volunteer.benefits.subtitle', 'Gain experience, build your portfolio, and make a real impact.')}
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Award, title: t('pages:volunteer.benefits.portfolio.title', 'Build Portfolio'), desc: t('pages:volunteer.benefits.portfolio.desc', 'Real-world experience on a production platform') },
                { icon: Users, title: t('pages:volunteer.benefits.community.title', 'Join Community'), desc: t('pages:volunteer.benefits.community.desc', 'Connect with passionate tango enthusiasts') },
                { icon: Clock, title: t('pages:volunteer.benefits.flexible.title', 'Flexible Hours'), desc: t('pages:volunteer.benefits.flexible.desc', 'Contribute on your own schedule') },
                { icon: Zap, title: t('pages:volunteer.benefits.impact.title', 'Real Impact'), desc: t('pages:volunteer.benefits.impact.desc', 'Your work helps dancers worldwide') },
              ].map((benefit, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full text-center hover-elevate">
                    <CardContent className="pt-6">
                      <benefit.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application CTA */}
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
              {t('pages:volunteer.finalCta.title', 'Ready to Contribute?')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-white/90 text-lg">
              {t('pages:volunteer.finalCta.subtitle', "Apply to join our volunteer program. We'll match you with tasks that fit your skills and interests.")}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex justify-center gap-4 flex-wrap">
              <Link href="/register?redirect=/talent-match&role=volunteer">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  data-testid="button-apply-now"
                >
                  {t('pages:volunteer.cta.applyToVolunteer', 'Apply to Volunteer')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/ambassadors">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  data-testid="button-become-ambassador"
                >
                  {t('pages:volunteer.cta.becomeAmbassador', 'Become Ambassador')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <SelfHealingErrorBoundary>
      <VolunteerPageContent />
    </SelfHealingErrorBoundary>
  );
}
