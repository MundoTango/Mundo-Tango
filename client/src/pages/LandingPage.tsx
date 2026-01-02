import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicNavbar } from "@/components/PublicNavbar";
import { DemoModal } from "@/components/marketing/DemoModal";
import { MotionDiv, MotionH2, MotionP } from "@/components/marketing/MotionComponents";
import {
  MapPin,
  Users,
  Calendar,
  Home,
  Briefcase,
  Video,
  Bot,
  Globe,
  ArrowRight,
  Play,
  UserPlus,
  Search,
  MessageCircle,
  TrendingUp,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation(['pages', 'navigation', 'common']);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Mundo Tango - Global Tango Community Platform";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey. Join thousands of passionate dancers.",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey. Join thousands of passionate dancers.";
      document.head.appendChild(meta);
    }

    const addOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    addOgTag("og:title", "Mundo Tango - Global Tango Community Platform");
    addOgTag(
      "og:description",
      "Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey.",
    );
    addOgTag("og:type", "website");
    addOgTag("og:image", "/og-image.jpg");
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      icon: MapPin,
      title: t('common:globalMap', 'Global Tango Map'),
      description: t('common:globalMapDesc', 'Discover dancers, events, and communities across the globe. Never feel alone in your tango journey.'),
    },
    {
      icon: Bot,
      title: t('common:smartMatching', 'Smart Matching'),
      description: t('common:smartMatchingDesc', 'Connect with dancers who match your level, style, and interests. Smart recommendations that grow with you.'),
    },
    {
      icon: Calendar,
      title: t('common:eventDiscovery', 'Event Discovery'),
      description: t('common:eventDiscoveryDesc', 'Find milongas, practicas, festivals, and workshops happening near you or plan your tango travels worldwide.'),
    },
    {
      icon: Home,
      title: t('common:housingMarketplace', 'Housing Marketplace'),
      description: t('common:housingMarketplaceDesc', 'Stay with local tango dancers when traveling. Offer your home to visiting dancers. Build friendships through shared spaces.'),
    },
    {
      icon: Briefcase,
      title: t('common:proNetworking', 'Professional Networking'),
      description: t('common:proNetworkingDesc', 'Connect with teachers, organizers, DJs, and performers. Grow your tango career or find the perfect instructor.'),
    },
    {
      icon: Video,
      title: t('common:liveStreaming', 'Live Streaming'),
      description: t('common:liveStreamingDesc', 'Attend virtual milongas, watch live performances, and take online classes from maestros around the world.'),
    },
    {
      icon: Users,
      title: t('common:communityConnections', 'Community Connections'),
      description: t('common:communityConnectionsDesc', 'Join city-based groups, connect with local dancers, and build lasting friendships in the global tango community.'),
    },
    {
      icon: Globe,
      title: t('common:multiLanguage', 'Multi-Language Support'),
      description: t('common:multiLanguageDesc', 'Platform available in English, Spanish, Portuguese, French, Italian, and more. Tango speaks all languages.'),
    },
  ];

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: t('common:createProfile', 'Create Your Profile'),
      description: t('common:createProfileDesc', 'Share your tango journey, experience level, preferred roles, and what you\'re looking for in the community.'),
    },
    {
      number: 2,
      icon: Search,
      title: t('common:discoverEventsStep', 'Discover Events & Dancers'),
      description: t('common:discoverEventsStepDesc', 'Browse events happening worldwide, find dance partners, and explore communities in cities you plan to visit.'),
    },
    {
      number: 3,
      icon: MessageCircle,
      title: t('common:connectCollaborate', 'Connect & Collaborate'),
      description: t('common:connectCollaborateDesc', 'Message dancers, join group chats, RSVP to events, and arrange housing stays with verified community members.'),
    },
    {
      number: 4,
      icon: TrendingUp,
      title: t('common:growJourney', 'Grow Your Tango Journey'),
      description: t('common:growJourneyDesc', 'Track your progress, collect memories, build your network, and become part of the global tango family.'),
    },
  ];

  const comingSoonFeatures = [
    {
      icon: Home,
      title: t('common:comingHousing', 'Housing Marketplace'),
      description: t('common:comingHousingDesc', 'Find tango-friendly accommodations or host traveling dancers. Build connections through shared spaces.'),
    },
    {
      icon: Briefcase,
      title: t('common:comingProTools', 'Professional Tools'),
      description: t('common:comingProToolsDesc', 'Advanced features for teachers and organizers: student management, event analytics, and booking systems.'),
    },
    {
      icon: Bot,
      title: t('common:comingAI', 'Enhanced AI Matching'),
      description: t('common:comingAIDesc', 'Smart algorithms learn your preferences and suggest perfect dance partners based on style, level, and personality.'),
    },
    {
      icon: Users,
      title: t('common:comingGroupTravel', 'Group Travel Planning'),
      description: t('common:comingGroupTravelDesc', 'Coordinate festival trips with your tango friends. Shared itineraries, housing, and transportation.'),
    },
  ];

  const { data: publicStats } = useQuery<{
    dancers: number | null;
    teachers: number | null;
    organizers: number | null;
    events: number | null;
    cities: string | null;
    countries: number | null;
    platformStats: {
      yearsBuilding: number;
      hoursInvested: number;
      amountInvested: number;
      foundedYear: number;
      startedDancing: string;
      yearsOfDancing: number;
      trips: number;
      cities: number;
      countries: number;
    };
  }>({
    queryKey: ["/api/stats/public"],
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    publicStats?.dancers
      ? { value: `${publicStats.dancers}+`, label: t('common:members', 'Members') }
      : null,
    publicStats?.events
      ? { value: `${publicStats.events}+`, label: t('common:events') }
      : null,
    publicStats?.cities
      ? { value: publicStats.cities.toString(), label: t('common:cities') }
      : null,
    publicStats?.countries
      ? { value: `${publicStats.countries}+`, label: t('common:countries', 'Countries') }
      : null,
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section
        className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
        data-testid="section-hero"
      >
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
                data-testid="text-hero-headline"
              >
                {t('pages:landing.hero.title', 'The Global Heart of Tango')}
              </h1>

              <p
                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto"
                data-testid="text-hero-subheadline"
              >
                {t('pages:landing.hero.subtitle', 'Connecting dancers, teachers, and organizers in a unified ecosystem for the worldwide tango community.')}
              </p>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6 h-auto font-semibold gap-3"
                    onClick={() => setDemoModalOpen(true)}
                    data-testid="button-watch-demo"
                  >
                    <Play className="h-5 w-5" />
                    {t('pages:landing.hero.watchDemo', 'Watch Demo')}
                  </Button>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold"
                    data-testid="button-join-free"
                  >
                    {t('pages:landing.hero.getStarted', 'Get Started Free')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                </div>
              </div>
            </div>

            {stats.length > 0 && (
              <div
                className={`grid gap-4 mt-12 ${
                  stats.length === 1
                    ? "grid-cols-1 max-w-xs mx-auto"
                    : stats.length === 2
                      ? "grid-cols-2 max-w-md mx-auto"
                      : stats.length === 3
                        ? "grid-cols-3 max-w-lg mx-auto"
                        : "grid-cols-2 lg:grid-cols-4"
                }`}
              >
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-xl p-6 text-center"
                    data-testid={`stat-${index}`}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-white/80 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24" data-testid="section-features">
        <div className="container mx-auto px-4">
          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-features-heading"
              >
                {t('common:featuresTitle', 'Everything You Need for Your Tango Journey')}
              </MotionH2>
              <MotionP
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('common:featuresSubtitle', 'Powerful features designed to connect dancers, discover events, and grow the global tango community.')}
              </MotionP>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <MotionDiv key={index} variants={fadeInUp}>
                  <Card
                    className="h-full hover-elevate"
                    data-testid={`card-feature-${index}`}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Talent Match Section */}
      <section className="py-20 md:py-24 bg-muted/30" data-testid="section-talent-match">
        <div className="container mx-auto px-4">
          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-talent-match-heading"
              >
                {t('pages:landing.talentMatch.title', 'Talent Match AI')}
              </MotionH2>
              <MotionP
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('pages:landing.talentMatch.subtitle', 'Our advanced AI connects tango professionals with global opportunities based on skills, experience, and style.')}
              </MotionP>
            </div>

            <div className="flex justify-center">
              <Link href="/talent-match">
                <Button size="lg" className="ocean-gradient text-white">
                  {t('pages:landing.talentMatch.cta', 'Join the Network')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 md:py-24 gradient-hero"
        data-testid="section-how-it-works"
      >
        <div className="container mx-auto px-4">
          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-how-it-works-heading"
              >
                {t('common:howItWorks', 'How It Works')}
              </MotionH2>
              <MotionP
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('common:howItWorksSubtitle', 'Get started in minutes and join thousands of tango dancers worldwide.')}
              </MotionP>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <MotionDiv
                  key={index}
                  variants={fadeInUp}
                  className="relative"
                  data-testid={`step-${index + 1}`}
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full ocean-gradient mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <step.icon className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  )}
                </MotionDiv>
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section
        className="py-20 md:py-24 gradient-hero"
        data-testid="section-coming-soon"
      >
        <div className="container mx-auto px-4">
          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-coming-soon-heading"
              >
                {t('common:comingSoon', 'Coming Soon')}
              </MotionH2>
              <MotionP
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('common:comingSoonSubtitle', "We're building incredible features to transform your tango experience. Here's what's on the horizon.")}
              </MotionP>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {comingSoonFeatures.map((feature, index) => (
                <MotionDiv key={index} variants={fadeInUp}>
                  <Card
                    className="h-full hover-elevate"
                    data-testid={`card-coming-soon-${index}`}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              ))}
            </div>

            <MotionDiv
              variants={fadeInUp}
              className="text-center max-w-2xl mx-auto pt-8"
            >
              <p className="text-muted-foreground mb-4">
                {t('common:supportCta', 'Help us build these features faster by supporting Mundo Tango')}
              </p>
              <Link href="/support">
                <Button
                  size="lg"
                  className="ocean-gradient text-white"
                  data-testid="button-support-coming-soon"
                >
                  {t('common:supportMission', 'Support Our Mission')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </MotionDiv>
          </MotionDiv>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="py-20 md:py-24 relative overflow-hidden"
        data-testid="section-cta"
      >
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 container mx-auto px-4">
          <MotionDiv
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <MotionH2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              data-testid="text-cta-heading"
            >
              {t('common:ctaTitle', 'Ready to Join the Global Tango Community?')}
            </MotionH2>

            <MotionP variants={fadeInUp} className="text-xl text-white/90">
              {t('common:ctaSubtitle', 'Create your free account and start connecting with dancers worldwide.')}
            </MotionP>

            <MotionDiv
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder={t('common:email', 'Enter your email')}
                className="bg-white/90 backdrop-blur-sm border-white/20"
                data-testid="input-email-signup"
              />
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
                  data-testid="button-join-now"
                >
                  {t('common:joinNow', 'Join Now')}
                </Button>
              </Link>
            </MotionDiv>

            {publicStats?.dancers && (
              <MotionP variants={fadeInUp} className="text-white/80 text-sm">
                {t('common:joinCommunity', { count: publicStats.dancers })}
              </MotionP>
            )}
          </MotionDiv>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12" data-testid="section-footer">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {t('common:builtByTanguero', 'Built by a Tanguero, For Tangueros')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Scott started dancing tango in{" "}
                  {publicStats?.platformStats?.startedDancing ||
                    "September 2007"}{" "}
                  and has traveled to {publicStats?.platformStats?.cities || 79}{" "}
                  cities across {publicStats?.platformStats?.countries || 27}{" "}
                  countries for tango. In April 2024, he began building Mundo
                  Tango, investing over{" "}
                  {publicStats?.platformStats?.hoursInvested?.toLocaleString() ||
                    "3,000"}{" "}
                  hours and $
                  {(
                    publicStats?.platformStats?.amountInvested || 30000
                  ).toLocaleString()}{" "}
                  of his own money to create the platform the tango community
                  deserves.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/about">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-about-scott"
                  >
                    {t('navigation:footer.about', 'About Us')}
                  </Button>
                </Link>
                <Link href="/support">
                  <Button size="sm" data-testid="button-support-platform">
                    {t('navigation:footer.support', 'Support')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 ocean-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MT</span>
                </div>
                <span className="font-bold text-xl ocean-gradient-text">
                  Mundo Tango
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('common:footerTagline', 'Connecting the global tango community, one dance at a time.')}
              </p>
              <div className="flex gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-social-facebook"
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-social-twitter"
                >
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-social-instagram"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  data-testid="button-social-youtube"
                >
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('navigation:footer.company', 'Company')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:footer.about', 'About Us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-dancers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:forDancers', 'For Dancers')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-teachers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:forTeachers', 'For Teachers')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-organizers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:forOrganizers', 'For Organizers')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('navigation:community', 'Community')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/support"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:footer.support', 'Support')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/volunteer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:footer.volunteer', 'Volunteer')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t('navigation:footer.legal', 'Legal')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:footer.terms', 'Terms of Service')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:footer.privacy', 'Privacy Policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('navigation:footer.contact', 'Contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {t('common:copyright', 'Mundo Tango. Built with love for the global tango community.')}</p>
          </div>
        </div>
      </footer>

      <DemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}
