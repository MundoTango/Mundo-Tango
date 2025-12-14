import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PublicNavbar } from "@/components/PublicNavbar";
import { DemoModal } from "@/components/marketing/DemoModal";
import { VideoDemoModal } from "@/components/marketing/VideoDemoModal";
import {
  MapPin,
  Users,
  Calendar,
  Home,
  Briefcase,
  Video,
  Bot,
  Globe,
  Check,
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
  Linkedin,
  Mail,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoDemo, setSelectedVideoDemo] = useState<number>(0);

  // Set page title
  useEffect(() => {
    document.title = "Mundo Tango - Global Tango Community Platform";

    // Add meta tags
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

    // Add Open Graph tags
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

  // Animation variants
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
      title: "Global Tango Map",
      description:
        "Discover dancers, events, and communities across the globe. Never feel alone in your tango journey.",
    },
    {
      icon: Bot,
      title: "AI-Powered Matching",
      description:
        "Mr. Blue AI connects you with dancers who match your level, style, and interests. Smart recommendations that grow with you.",
    },
    {
      icon: Calendar,
      title: "Event Discovery",
      description:
        "Find milongas, practicas, festivals, and workshops happening near you or plan your tango travels worldwide.",
    },
    {
      icon: Home,
      title: "Housing Marketplace",
      description:
        "Stay with local tango dancers when traveling. Offer your home to visiting dancers. Build friendships through shared spaces.",
    },
    {
      icon: Briefcase,
      title: "Professional Networking",
      description:
        "Connect with teachers, organizers, DJs, and performers. Grow your tango career or find the perfect instructor.",
    },
    {
      icon: Video,
      title: "Live Streaming",
      description:
        "Attend virtual milongas, watch live performances, and take online classes from maestros around the world.",
    },
    {
      icon: Bot,
      title: "Mr. Blue AI Assistant",
      description:
        "Your personal tango companion answers questions, suggests events, helps plan trips, and provides learning resources 24/7.",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description:
        "Platform available in English, Spanish, Portuguese, French, Italian, and more. Tango speaks all languages.",
    },
  ];

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Create Your Profile",
      description:
        "Share your tango journey, experience level, preferred roles, and what you're looking for in the community.",
    },
    {
      number: 2,
      icon: Search,
      title: "Discover Events & Dancers",
      description:
        "Browse events happening worldwide, find dance partners, and explore communities in cities you plan to visit.",
    },
    {
      number: 3,
      icon: MessageCircle,
      title: "Connect & Collaborate",
      description:
        "Message dancers, join group chats, RSVP to events, and arrange housing stays with verified community members.",
    },
    {
      number: 4,
      icon: TrendingUp,
      title: "Grow Your Tango Journey",
      description:
        "Track your progress, collect memories, build your network, and become part of the global tango family.",
    },
  ];

  const pricingTiers = [
    {
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      description: "Try Pro features free",
      features: [
        "Full Pro features for 7 days",
        "No credit card required",
        "Event discovery",
        "Community access",
        "AI assistant access",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Basic",
      price: "$4.99",
      period: "per month",
      description: "Essential tango tools",
      features: [
        "Basic profile & messaging",
        "Browse events",
        "Join groups",
        "Community access",
        "Limited AI queries",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Dancer Pro",
      price: "$9.99",
      period: "per month",
      description: "For dedicated dancers",
      features: [
        "Everything in Basic",
        "Unlimited AI assistant",
        "Advanced partner matching",
        "Housing marketplace access",
        "Priority event listings",
        "Ad-free experience",
        "Travel planning tools",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Professional",
      price: "$29.99",
      period: "per month",
      description: "For teachers & organizers",
      features: [
        "Everything in Dancer Pro",
        "Event creation & management",
        "Analytics dashboard",
        "Student management tools",
        "Verified badge",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
  ];

  const screenshots = [
    {
      id: "tango-map",
      journeyId: "tango-map-promo",
      title: "Global Tango Map",
      description: "Find dancers worldwide",
      gradient: "from-teal-500 to-cyan-600",
      icon: MapPin,
      image: "/demos/tango-map.png",
      videoUrl: "/videos/marketing/tango-map-promo.mp4",
      duration: "0:15",
    },
    {
      id: "events",
      journeyId: "event-discovery",
      title: "Event Discovery",
      description: "Never miss a milonga near you",
      gradient: "from-purple-500 to-indigo-600",
      icon: Calendar,
      image: "/demos/events-discovery.png",
      videoUrl: "/videos/customer/event-discovery.mp4",
      duration: "0:30",
    },
    {
      id: "mr-blue",
      journeyId: "mr-blue-chat",
      title: "Mr. Blue AI",
      description: "Your personal tango guide",
      gradient: "from-blue-500 to-cyan-500",
      icon: Bot,
      image: "/demos/mr-blue-chat.png",
      videoUrl: "/videos/customer/mr-blue-chat.mp4",
      duration: "0:25",
    },
    {
      id: "profile",
      journeyId: "profile-view",
      title: "Your Profile",
      description: "Showcase your tango journey",
      gradient: "from-rose-500 to-pink-600",
      icon: Users,
      image: "/demos/profile-view.png",
      videoUrl: "/videos/customer/profile-view.mp4",
      duration: "0:20",
    },
  ];

  // Fetch dynamic stats from API - shows real data only, no fake numbers
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

  // Only display stats that have real data (not null)
  const stats = [
    publicStats?.dancers
      ? { value: `${publicStats.dancers}+`, label: "Dancers" }
      : null,
    publicStats?.events
      ? { value: `${publicStats.events}+`, label: "Events" }
      : null,
    publicStats?.cities
      ? { value: publicStats.cities.toString(), label: "Cities" }
      : null,
    publicStats?.countries
      ? { value: `${publicStats.countries}+`, label: "Countries" }
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
        {/* Background Gradient */}
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Glassmorphic Panel */}
            <div className="glass-card rounded-2xl p-8 md:p-12 space-y-8">
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
                data-testid="text-hero-headline"
              >
                Where Tango Lives
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto"
                data-testid="text-hero-subheadline"
              >
                Connect with the global tango community. Discover events, find
                dance partners, and grow your journey with passionate dancers
                worldwide.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="bg-transparent text-white text-lg px-8 py-6 h-auto font-semibold"
                id="element-1764009472969"
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold"
                    data-testid="button-join-free"
                  >
                    Join Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="default"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto"
                  data-testid="button-watch-demo"
                  onClick={() => setDemoModalOpen(true)}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            {/* Stats Bar - Only shows when there's real data */}
            {stats.length > 0 && (
              <motion.div
                variants={fadeInUp}
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
                    data-testid={`stat-${stat.label.toLowerCase().replace("/", "-")}`}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-white/80 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-20 md:py-24" data-testid="section-features">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-features-heading"
              >
                Everything You Need for Your Tango Journey
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                Powerful features designed to connect dancers, discover events,
                and grow the global tango community.
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className="py-20 md:py-24 gradient-hero"
        data-testid="section-how-it-works"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-16"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-how-it-works-heading"
              >
                How It Works
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                Get started in minutes and join thousands of tango dancers
                worldwide.
              </motion.p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="relative"
                  data-testid={`step-${index + 1}`}
                >
                  <div className="text-center space-y-4">
                    {/* Number Circle */}
                    <div className="w-16 h-16 rounded-full ocean-gradient mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center">
                      <step.icon className="h-12 w-12 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Connecting Line (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        className="py-20 md:py-24 gradient-hero"
        data-testid="section-pricing"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-pricing-heading"
              >
                Choose Your Plan
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                Start free and upgrade as your tango journey grows. No credit
                card required.
              </motion.p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card
                    className={`h-full relative ${tier.popular ? "border-primary border-2" : ""}`}
                    data-testid={`pricing-card-${tier.name.toLowerCase()}`}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription>{tier.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground ml-2">
                          / {tier.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {tier.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/register" className="w-full">
                        <Button
                          className={`w-full ${tier.popular ? "ocean-gradient text-white" : ""}`}
                          variant={tier.popular ? "default" : "outline"}
                          data-testid={`button-pricing-${tier.name.toLowerCase()}`}
                        >
                          {tier.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section className="py-20 md:py-24" data-testid="section-screenshots">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
                data-testid="text-screenshots-heading"
              >
                See Mundo Tango in Action
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                Explore our beautiful, intuitive interface designed for dancers
                by dancers.
              </motion.p>
            </div>

            {/* Video Demo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {screenshots.map((screenshot, index) => {
                const IconComponent = screenshot.icon;
                return (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card
                      className="h-full overflow-hidden hover-elevate cursor-pointer group"
                      data-testid={`video-demo-${index}`}
                      onClick={() => {
                        setSelectedVideoDemo(index);
                        setVideoModalOpen(true);
                      }}
                    >
                      <div
                        className={`h-48 bg-gradient-to-br ${screenshot.gradient} relative overflow-hidden`}
                      >
                        {screenshot.image && (
                          <img
                            src={screenshot.image}
                            alt={screenshot.title}
                            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        {/* Video Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                            <Play
                              className="h-7 w-7 text-primary ml-1"
                              fill="currentColor"
                            />
                          </div>
                        </div>

                        {/* Video Duration Badge */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <Badge className="bg-black/70 text-white border-0 text-xs font-mono">
                            {screenshot.duration}
                          </Badge>
                        </div>

                        {/* Video Type Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary/90 text-white border-0 text-xs">
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium">
                              {screenshot.title}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h3
                          className="font-semibold text-lg"
                          data-testid={`text-demo-title-${screenshot.id}`}
                        >
                          {screenshot.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {screenshot.description}
                        </p>
                        <p className="text-xs text-primary mt-2 flex items-center gap-1 group-hover:underline">
                          <Play className="h-3 w-3" /> Watch video demo
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="py-20 md:py-24 relative overflow-hidden"
        data-testid="section-cta"
      >
        {/* Background */}
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white"
              data-testid="text-cta-heading"
            >
              Ready to Join the Global Tango Community?
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-xl text-white/90">
              Get started free. No credit card required.
            </motion.p>

            {/* Email Signup Form */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/90 backdrop-blur-sm border-white/20"
                data-testid="input-email-signup"
              />
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold w-full sm:w-auto"
                  data-testid="button-join-now"
                >
                  Join Now
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            {publicStats?.dancers && (
              <motion.p variants={fadeInUp} className="text-white/80 text-sm">
                Join {publicStats.dancers}+ dancers worldwide
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12" data-testid="section-footer">
        <div className="container mx-auto px-4">
          {/* Scott's Story Banner */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Built by a Dancer, For Dancers
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
                    About Scott
                  </Button>
                </Link>
                <Link href="/support">
                  <Button size="sm" data-testid="button-support-platform">
                    Support Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            {/* Logo & Description */}
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
                Connecting the global tango community, one dance at a time.{" "}
                {publicStats?.platformStats?.yearsOfDancing || 18} years of
                passion, now a platform for all.
              </p>
              {/* Social Icons */}
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

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-dancers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    For Dancers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-teachers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    For Teachers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for-organizers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    For Organizers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/support"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Support Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/supporters"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Our Supporters
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ambassadors"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Ambassadors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/volunteer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Volunteer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/open-source"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Open Source
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources & Legal */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/mr-blue"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Mr. Blue AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              © 2025 Mundo Tango. All rights reserved. Built with love from
              April 2024.
            </p>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Language: English</span>
            </div>
          </div>
        </div>
      </footer>

      <DemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
      <VideoDemoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        initialSlide={selectedVideoDemo}
        screenshots={screenshots}
      />
    </div>
  );
}
