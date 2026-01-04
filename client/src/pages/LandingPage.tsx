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
  Heart,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import scottPhotoPath from "@assets/scott-founder-optimized.jpg";

// Type-safe motion components for React 19 compatibility
const MotionDivSafe = motion.div as any;
const MotionH2Safe = motion.h2 as any;
const MotionPSafe = motion.p as any;

// Original Motion components for nested consistency if needed
const MotionDiv = MotionDivSafe;
const MotionH2 = MotionH2Safe;
const MotionP = MotionPSafe;

// Cookie helpers
const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

export default function LandingPage() {
  const { t, i18n } = useTranslation(['pages', 'navigation', 'common']);
  const { toast } = useToast();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [emailCaptureOpen, setEmailCaptureOpen] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState("");
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  
  // Check for stored email in cookies on mount
  useEffect(() => {
    const email = getCookie('mt_visitor_email');
    if (email) {
      setStoredEmail(email);
    }
  }, []);
  
  // Handle Facebook Live button click
  const handleFacebookLiveClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // If we already have their email, go directly to Facebook
    if (storedEmail) {
      // Track the click with existing email
      console.log('[Analytics] Facebook Live click with stored email:', storedEmail);
      window.location.href = 'https://www.facebook.com/sboddye';
      return;
    }
    
    // Show email capture modal
    setEmailCaptureOpen(true);
  }, [storedEmail]);
  
  // Handle email submission
  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedEmail || !capturedEmail.includes('@')) {
      toast({
        title: t('common:error', 'Error'),
        description: t('common:invalidEmail', 'Please enter a valid email address'),
        variant: "destructive",
      });
      return;
    }
    
    // Store email in cookie
    setCookie('mt_visitor_email', capturedEmail);
    setStoredEmail(capturedEmail);
    
    // Close modal
    setEmailCaptureOpen(false);
    
    // Track and redirect to Facebook
    console.log('[Analytics] New email captured:', capturedEmail);
    
    // Save to server if we have an endpoint
    try {
      const response = await fetch('/api/qa-platform/visitor-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: capturedEmail, source: 'facebook_live_modal' })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      console.log('[Analytics] Email saved to server successfully');
    } catch (e) {
      console.error('[Analytics] Failed to save email to server:', e);
    }

    // Show thank you message and redirect
    toast({
      title: t('pages:landing.hero.thankYou', 'Thank you!'),
      description: t('pages:landing.hero.emailSaved', "We'll keep you updated about our live sessions."),
    });

    // Redirect to Facebook after a tiny delay to ensure toast is visible
    setTimeout(() => {
      window.location.href = 'https://www.facebook.com/sboddye';
    }, 1000);
  }, [capturedEmail, t, toast]);
  
  // Skip email capture and go directly
  const handleSkipEmail = useCallback(() => {
    setEmailCaptureOpen(false);
    window.location.href = 'https://www.facebook.com/sboddye';
  }, []);
  
  // Dynamic next Thursday calculation (local time) - always shows upcoming session
  const nextThursday = useMemo(() => {
    const now = new Date();
    const result = new Date(now);
    // Calculate days until next Thursday (4 = Thursday in JS Date) using local time
    const currentDay = result.getDay();
    const daysUntilThursday = (4 - currentDay + 7) % 7 || 7;
    result.setDate(result.getDate() + daysUntilThursday);
    return result;
  }, []);
  
  // Use i18n language for localized date formatting with fallback to browser default
  const nextSessionLabel = nextThursday.toLocaleDateString(i18n.language || undefined, { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

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
    waitlistRoles?: { role: string; count: number }[];
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
          <div className="max-w-6xl mx-auto">
            <div className="glass-card rounded-2xl p-8 md:p-12">
              <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <h1
                      className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
                      data-testid="text-hero-headline"
                    >
                      {t('pages:landing.hero.title', 'The Global Heart of Tango')}
                    </h1>

                    <p
                      className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto lg:mx-0"
                      data-testid="text-hero-subheadline"
                    >
                      {t('pages:landing.hero.subtitle', 'Connecting dancers, teachers, and organizers in a unified ecosystem for the worldwide tango community.')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
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
                      <Link href="/register?redirect=/onboarding">
                        <Button
                          size="lg"
                          className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold"
                          data-testid="button-join-free"
                        >
                          {t('pages:landing.hero.getStarted', 'Get Started Free')}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <a 
                        href="https://www.gofundme.com/f/join-us-in-bringing-mundo-tango-to-life" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-primary/20 border-primary/40 text-white hover:bg-primary/30 text-lg px-8 py-6 h-auto font-semibold gap-3"
                          data-testid="button-support-us-hero"
                        >
                          <Heart className="h-5 w-5 text-red-400" />
                          {t('common:supportUs', 'Support Us')}
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Live Sessions Announcement - Permanent recurring Thursday sessions */}
              <MotionDivSafe
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-red-500/30 backdrop-blur-md border-2 border-amber-400/50 rounded-xl p-6 mt-12 max-w-4xl mx-auto shadow-lg shadow-amber-500/20"
                data-testid="announcement-live-sessions"
              >
                {/* Q&A Header with photo on right */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                      <div className="flex gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        <div className="h-3 w-3 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="text-amber-300 font-bold uppercase tracking-wider text-sm">
                        {t('pages:landing.hero.facebookLive', 'Facebook Live Every Thursday')}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                      {t('pages:landing.hero.qaScott', 'Live Q&A Sessions with Scott')}
                    </h3>
                    {/* Dynamic next session */}
                    <div className="bg-white/10 rounded-lg px-4 py-2 inline-block">
                      <span className="text-lg font-bold text-amber-200">
                        {t('pages:landing.hero.nextSession', { date: nextSessionLabel }, 'Next Session: {{date}}')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Scott's photo - landscape thumbnail on right */}
                  <div className="shrink-0 group order-first md:order-last">
                    <div className="relative w-48 h-32 md:w-72 md:h-48">
                      <div className="absolute -inset-1 ocean-gradient opacity-50 blur rounded-xl group-hover:opacity-100 transition duration-500"></div>
                      <img 
                        src={scottPhotoPath} 
                        alt="Scott - Mundo Tango Founder" 
                        loading="eager"
                        className="relative rounded-lg w-full h-full object-cover shadow-xl border border-white/20"
                      />
                    </div>
                    <div className="text-center mt-2 text-[10px] text-white/70">
                      PC: Alex <a href="https://www.instagram.com/otroalexrobledo/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-200 underline transition-colors">@otroalexrobledo</a>
                    </div>
                  </div>
                </div>
                
                {/* Time zones grid - below header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-white/90 mb-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇺🇸</span>
                    <div className="text-xs font-bold">CA 9AM / NY 12PM</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇦🇷</span>
                    <div className="text-xs font-bold">1:00 PM</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center border border-amber-400/30">
                    <span className="text-4xl block mb-1">🇬🇧</span>
                    <div className="text-xs font-bold">5:00 PM</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇫🇷</span>
                    <div className="text-xs font-bold">6:00 PM</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇺🇦</span>
                    <div className="text-xs font-bold">7:00 PM</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇨🇳</span>
                    <div className="text-xs font-bold">1AM (+1)</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇰🇷</span>
                    <div className="text-xs font-bold">2AM (+1)</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-4xl block mb-1">🇦🇺</span>
                    <div className="text-xs font-bold">4AM (+1)</div>
                  </div>
                </div>
                <p className="text-white/90 leading-relaxed text-sm mb-3 text-center">
                  <span dangerouslySetInnerHTML={{ __html: t('pages:landing.hero.qaDescription', 'Answering all your questions: <span className="font-semibold text-amber-200">What is Mundo Tango?</span> Who is it for and how could it impact <span className="font-semibold text-amber-200">YOU</span>? Why do we need it? And more!') }} />
                </p>
                <p className="text-white/80 leading-relaxed text-sm mb-4 text-center">
                  <span dangerouslySetInnerHTML={{ __html: t('pages:landing.hero.recurringNotice', 'We will be doing live sessions <span className="font-semibold text-amber-200">every Thursday</span> at the same time to hear what <span className="font-semibold text-amber-200">YOU</span> want out of this platform and to tell you what is happening!') }} />
                </p>
                <div className="text-center">
                  <button 
                    onClick={handleFacebookLiveClick}
                    className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold px-5 py-2.5 rounded-lg transition-all hover-elevate text-sm cursor-pointer"
                    data-testid="button-facebook-live"
                  >
                    <Facebook className="h-4 w-4" />
                    {t('pages:landing.hero.joinFacebook', 'Join on Facebook Live')}
                  </button>
                </div>
              </MotionDivSafe>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24" data-testid="section-features">
        <div className="container mx-auto px-4">
          <MotionDivSafe
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2Safe
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-features-heading"
              >
                {t('common:featuresTitle', 'Everything You Need for Your Tango Journey')}
              </MotionH2Safe>
              <MotionPSafe
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('common:featuresSubtitle', 'Powerful features designed to connect dancers, discover events, and grow the global tango community.')}
              </MotionPSafe>
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
          <MotionDivSafe
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2Safe
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-talent-match-heading"
              >
                {t('pages:landing.talentMatch.title', 'Talent Match AI')}
              </MotionH2Safe>
              <MotionPSafe
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('pages:landing.talentMatch.subtitle', 'Our advanced AI connects tango professionals with global opportunities based on skills, experience, and style.')}
              </MotionPSafe>
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
          <MotionDivSafe
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2Safe
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-how-it-works-heading"
              >
                {t('common:howItWorks', 'How It Works')}
              </MotionH2Safe>
              <MotionPSafe
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('common:howItWorksSubtitle', 'Get started in minutes and join thousands of tango dancers worldwide.')}
              </MotionPSafe>
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
          <MotionDivSafe
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <MotionH2Safe
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-coming-soon-heading"
              >
                {t('common:comingSoon', 'Coming Soon')}
              </MotionH2Safe>
              <MotionPSafe
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('common:comingSoonSubtitle', "We're building incredible features to transform your tango experience. Here's what's on the horizon.")}
              </MotionPSafe>
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
          <MotionDivSafe
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <MotionH2Safe
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              data-testid="text-cta-heading"
            >
              {t('common:ctaTitle', 'Ready to Join the Global Tango Community?')}
            </MotionH2Safe>

            <MotionPSafe variants={fadeInUp} className="text-xl text-white/90">
              {t('common:ctaSubtitle', 'Create your free account and start connecting with dancers worldwide.')}
            </MotionPSafe>

            <MotionDivSafe
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
            </MotionDivSafe>

            {publicStats?.dancers && (
              <MotionPSafe variants={fadeInUp} className="text-white/80 text-sm">
                {t('common:joinCommunity', { count: publicStats.dancers })}
              </MotionPSafe>
            )}
          </MotionDivSafe>
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
                  {t('pages:landing.hero.scottStory', {
                    date: publicStats?.platformStats?.startedDancing || "September 2007",
                    cities: publicStats?.platformStats?.cities || 79,
                    countries: publicStats?.platformStats?.countries || 27,
                    hours: publicStats?.platformStats?.hoursInvested?.toLocaleString() || "3,000",
                    amount: (publicStats?.platformStats?.amountInvested || 30000).toLocaleString()
                  }, "Scott started dancing tango in {{date}} and has traveled to {{cities}} cities across {{countries}} countries for tango. In April 2024, he began building Mundo Tango, investing over {{hours}} hours and ${{amount}} of his own money to create the platform the tango community deserves.")}
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
      
      {/* Email Capture Modal for Facebook Live */}
      <Dialog open={emailCaptureOpen} onOpenChange={setEmailCaptureOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              {t('pages:landing.hero.joinLiveSession', 'Join Our Live Session')}
            </DialogTitle>
            <DialogDescription>
              {t('pages:landing.hero.emailCaptureDesc', "Enter your email to stay updated about our weekly Thursday sessions. We'll send you reminders before each session!")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visitor-email">{t('common:email', 'Email')}</Label>
              <Input
                id="visitor-email"
                type="email"
                placeholder={t('common:emailPlaceholder', 'your@email.com')}
                value={capturedEmail}
                onChange={(e) => setCapturedEmail(e.target.value)}
                className="w-full"
                data-testid="input-visitor-email"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white"
                data-testid="button-submit-email"
              >
                {t('pages:landing.hero.continueToFacebook', 'Continue to Facebook')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipEmail}
                data-testid="button-skip-email"
              >
                {t('common:skip', 'Skip')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
