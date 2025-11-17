import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PublicNavbar } from "@/components/PublicNavbar";
import { 
  MapPin, Users, Calendar, Home, Briefcase, Video, 
  Bot, Globe, Check, Star, ArrowRight, Play,
  UserPlus, Search, MessageCircle, TrendingUp,
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  Mail
} from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  // Set page title
  useEffect(() => {
    document.title = "Mundo Tango - Global Tango Community Platform";
    
    // Add meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey. Join 10,000+ dancers in 95 cities.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey. Join 10,000+ dancers in 95 cities.';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags
    const addOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    addOgTag('og:title', 'Mundo Tango - Global Tango Community Platform');
    addOgTag('og:description', 'Connect with tango dancers worldwide, discover events, find housing, and grow your tango journey.');
    addOgTag('og:type', 'website');
    addOgTag('og:image', '/og-image.jpg');
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: MapPin,
      title: "Global Tango Map",
      description: "Discover dancers, events, and communities in 95 cities across 50+ countries. Never feel alone in your tango journey."
    },
    {
      icon: Bot,
      title: "AI-Powered Matching",
      description: "Mr. Blue AI connects you with dancers who match your level, style, and interests. Smart recommendations that grow with you."
    },
    {
      icon: Calendar,
      title: "Event Discovery",
      description: "Find milongas, practicas, festivals, and workshops happening near you or plan your tango travels worldwide."
    },
    {
      icon: Home,
      title: "Housing Marketplace",
      description: "Stay with local tango dancers when traveling. Offer your home to visiting dancers. Build friendships through shared spaces."
    },
    {
      icon: Briefcase,
      title: "Professional Networking",
      description: "Connect with teachers, organizers, DJs, and performers. Grow your tango career or find the perfect instructor."
    },
    {
      icon: Video,
      title: "Live Streaming",
      description: "Attend virtual milongas, watch live performances, and take online classes from maestros around the world."
    },
    {
      icon: Bot,
      title: "Mr. Blue AI Assistant",
      description: "Your personal tango companion answers questions, suggests events, helps plan trips, and provides learning resources 24/7."
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Platform available in English, Spanish, Portuguese, French, Italian, and more. Tango speaks all languages."
    }
  ];

  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: "Create Your Profile",
      description: "Share your tango journey, experience level, preferred roles, and what you're looking for in the community."
    },
    {
      number: 2,
      icon: Search,
      title: "Discover Events & Dancers",
      description: "Browse events happening worldwide, find dance partners, and explore communities in cities you plan to visit."
    },
    {
      number: 3,
      icon: MessageCircle,
      title: "Connect & Collaborate",
      description: "Message dancers, join group chats, RSVP to events, and arrange housing stays with verified community members."
    },
    {
      number: 4,
      icon: TrendingUp,
      title: "Grow Your Tango Journey",
      description: "Track your progress, collect memories, build your network, and become part of the global tango family."
    }
  ];

  const testimonials = [
    {
      quote: "Mundo Tango connected me with dancers worldwide! I've made lifelong friends in Buenos Aires, Paris, and Seoul.",
      author: "Maria S.",
      location: "Buenos Aires, Argentina",
      initials: "MS",
      rating: 5
    },
    {
      quote: "Best platform for finding tango events. I discovered amazing milongas I never knew existed in my own city!",
      author: "Carlos R.",
      location: "Seoul, South Korea",
      initials: "CR",
      rating: 5
    },
    {
      quote: "The AI assistant is a game-changer. It helped me plan my entire European tango tour with personalized recommendations.",
      author: "Sofia L.",
      location: "Paris, France",
      initials: "SL",
      rating: 5
    },
    {
      quote: "Housing marketplace saved me thousands on my tango travels. Stayed with incredible hosts who became dear friends.",
      author: "James K.",
      location: "New York, USA",
      initials: "JK",
      rating: 5
    },
    {
      quote: "Found my regular dance partners here. The matching algorithm really understands what I'm looking for in a connection.",
      author: "Isabella M.",
      location: "Milan, Italy",
      initials: "IM",
      rating: 5
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for casual dancers",
      features: [
        "Basic profile",
        "Event discovery",
        "Community map access",
        "Group messaging",
        "Limited AI assistant queries (10/month)"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "For dedicated tangueros",
      features: [
        "Everything in Free",
        "Advanced matching algorithm",
        "Unlimited AI assistant",
        "Housing marketplace access",
        "Priority event listings",
        "Video call features",
        "Ad-free experience"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Premium",
      price: "$29",
      period: "per month",
      description: "For professionals & organizers",
      features: [
        "Everything in Pro",
        "Event creation & management",
        "Analytics dashboard",
        "Promotional tools",
        "Live streaming capabilities",
        "Custom branding",
        "Premium support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const screenshots = [
    {
      title: "Tango Map",
      description: "Discover dancers worldwide",
      gradient: "from-teal-400 to-blue-500"
    },
    {
      title: "Event Calendar",
      description: "Never miss a milonga",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "AI Chat",
      description: "Your tango assistant",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Profile",
      description: "Showcase your journey",
      gradient: "from-pink-400 to-rose-500"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Dancers" },
    { value: "226+", label: "Events/Month" },
    { value: "95", label: "Cities" },
    { value: "50+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden" data-testid="section-hero">
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
                Connect with the global tango community. Discover events, find dance partners, 
                and grow your journey with 10,000+ passionate dancers worldwide.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
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
                  variant="outline"
                  className="backdrop-blur-sm bg-white/20 border-white/30 text-white hover:bg-white/30 text-lg px-8 py-6 h-auto"
                  data-testid="button-watch-demo"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </div>

            {/* Stats Bar */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
            >
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="glass-card rounded-xl p-6 text-center"
                  data-testid={`stat-${stat.label.toLowerCase().replace("/", "-")}`}
                >
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm md:text-base text-white/80 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
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
                Powerful features designed to connect dancers, discover events, and grow the global tango community.
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`card-feature-${index}`}>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-24 gradient-hero" data-testid="section-how-it-works">
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
                Get started in minutes and join thousands of tango dancers worldwide.
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
                      <span className="text-2xl font-bold text-white">{step.number}</span>
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

      {/* Social Proof / Testimonials Section */}
      <section className="py-20 md:py-24" data-testid="section-testimonials">
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
                data-testid="text-testimonials-heading"
              >
                Loved by Dancers Worldwide
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                Join thousands of tangueros who have transformed their dance journey with Mundo Tango.
              </motion.p>
            </div>

            {/* Testimonials Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover-elevate" data-testid={`testimonial-${index}`}>
                    <CardContent className="pt-6 space-y-4">
                      {/* Stars */}
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-lg italic">"{testimonial.quote}"</p>

                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Avatar>
                          <AvatarFallback className="ocean-gradient text-white">
                            {testimonial.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{testimonial.author}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-24 gradient-hero" data-testid="section-pricing">
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
                Start free and upgrade as your tango journey grows. No credit card required.
              </motion.p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card 
                    className={`h-full relative ${tier.popular ? 'border-primary border-2' : ''}`}
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
                        <span className="text-muted-foreground ml-2">/ {tier.period}</span>
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
                          className={`w-full ${tier.popular ? 'ocean-gradient text-white' : ''}`}
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
                Explore our beautiful, intuitive interface designed for dancers by dancers.
              </motion.p>
            </div>

            {/* Screenshots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {screenshots.map((screenshot, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full overflow-hidden hover-elevate" data-testid={`screenshot-${index}`}>
                    <div className={`h-48 bg-gradient-to-br ${screenshot.gradient} flex items-center justify-center`}>
                      <div className="text-white text-center p-6">
                        <div className="text-6xl mb-4">📱</div>
                        <div className="text-xs uppercase tracking-wider opacity-80">PLACEHOLDER</div>
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-semibold text-lg">{screenshot.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{screenshot.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-24 relative overflow-hidden" data-testid="section-cta">
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
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/90"
            >
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
            <motion.p 
              variants={fadeInUp}
              className="text-white/80 text-sm"
            >
              Join 10,000+ dancers worldwide
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12" data-testid="section-footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 ocean-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MT</span>
                </div>
                <span className="font-bold text-xl ocean-gradient-text">Mundo Tango</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting the global tango community, one dance at a time.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3">
                <Button size="icon" variant="ghost" data-testid="button-social-facebook">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" data-testid="button-social-twitter">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" data-testid="button-social-instagram">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" data-testid="button-social-youtube">
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about"><a className="text-muted-foreground hover:text-foreground">About</a></Link></li>
                <li><Link href="/features"><a className="text-muted-foreground hover:text-foreground">Features</a></Link></li>
                <li><Link href="/pricing"><a className="text-muted-foreground hover:text-foreground">Pricing</a></Link></li>
                <li><Link href="/blog"><a className="text-muted-foreground hover:text-foreground">Blog</a></Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help"><a className="text-muted-foreground hover:text-foreground">Help Center</a></Link></li>
                <li><Link href="/faq"><a className="text-muted-foreground hover:text-foreground">FAQ</a></Link></li>
                <li><Link href="/contact"><a className="text-muted-foreground hover:text-foreground">Contact</a></Link></li>
                <li><Link href="/community-guidelines"><a className="text-muted-foreground hover:text-foreground">Community Guidelines</a></Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy"><a className="text-muted-foreground hover:text-foreground">Privacy Policy</a></Link></li>
                <li><Link href="/terms"><a className="text-muted-foreground hover:text-foreground">Terms of Service</a></Link></li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Mundo Tango. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Language: English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
