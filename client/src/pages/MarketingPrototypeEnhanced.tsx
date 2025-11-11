/**
 * MARKETING PROTOTYPE ENHANCED - EDITORIAL DESIGN
 * Route: /marketing-prototype-enhanced
 * 
 * EDITORIAL DESIGN STANDARDS APPLIED:
 * - 16:9 aspect ratio hero images
 * - Serif fonts for all headlines
 * - Framer Motion scroll animations
 * - Editorial card layouts with image hover effects
 * - Generous whitespace (60% more than default)
 * - Gradient overlays on images
 * - Dark mode optimized
 */

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Sparkles, Music, Users, Heart, Globe, Calendar, MapPin, Check } from "lucide-react";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import tangoHeroImage from "@assets/stock_images/elegant_professional_f6beef21.jpg";
import communityImage1 from "@assets/stock_images/business_team_meetin_e7614141.jpg";
import communityImage2 from "@assets/stock_images/business_team_meetin_061b6626.jpg";
import dataVizImage from "@assets/stock_images/data_visualization_t_03b1d852.jpg";

export default function MarketingPrototypeEnhanced() {
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <SelfHealingErrorBoundary pageName="Marketing Enhanced" fallbackRoute="/">
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* EDITORIAL HERO SECTION - 16:9 Aspect Ratio */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden"
        data-testid="section-hero"
      >
        {/* 16:9 Background Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${tangoHeroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge 
              variant="outline" 
              className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm"
              data-testid="badge-network"
            >
              THE GLOBAL TANGO NETWORK
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">
              Where Tango{" "}
              <br />
              Meets Community
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Connect with 10,000+ dancers worldwide. Discover events, find partners, and immerse yourself in the global tango movement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              className="text-lg px-8"
              data-testid="button-join-community"
            >
              Join the Community
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 backdrop-blur-sm bg-white/10 text-white border-white/30 hover:bg-white/20"
              data-testid="button-explore-events"
            >
              Explore Events
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1, duration: 0.5 },
            y: { duration: 2, repeat: Infinity }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
        >
          <ArrowDown size={32} />
        </motion.div>
      </motion.section>

      {/* STATS SECTION */}
      <section className="py-16 bg-background" data-testid="section-stats">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="10,000+" label="Active Dancers" delay={0.1} />
            <StatCard number="50+" label="Countries" delay={0.2} />
            <StatCard number="500+" label="Events Monthly" delay={0.3} />
            <StatCard number="100+" label="Cities" delay={0.4} />
          </div>
        </div>
      </section>

      {/* EDITORIAL FEATURES SECTION WITH 16:9 IMAGES */}
      <section className="py-20 px-6 bg-card/30" data-testid="section-features">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              7 Ways to Connect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Mundo Tango brings the global tango community together through powerful features
            </p>
          </motion.div>
          
          <div className="grid gap-12 md:grid-cols-2 mb-20">
            <EditorialFeatureCard
              image={communityImage1}
              icon={<Heart className="text-primary" size={32} />}
              title="Social Feed"
              description="Share your tango journey with a vibrant community. Connect with dancers, share experiences, and celebrate the passion of tango."
              delay={0.1}
            />
            <EditorialFeatureCard
              image={communityImage2}
              icon={<Users className="text-primary" size={32} />}
              title="Find Partners"
              description="Connect with dancers worldwide for events and practice. Build meaningful connections with people who share your love for tango."
              delay={0.2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SimpleFeatureCard
              icon={<Music size={40} className="text-primary" />}
              title="Events & Milongas"
              description="Discover and attend tango events in your city"
              delay={0.1}
            />
            <SimpleFeatureCard
              icon={<Globe size={40} className="text-primary" />}
              title="Global Community"
              description="Join dancers from over 50 countries"
              delay={0.2}
            />
            <SimpleFeatureCard
              icon={<Calendar size={40} className="text-primary" />}
              title="Event Calendar"
              description="Never miss a milonga with our comprehensive calendar"
              delay={0.3}
            />
            <SimpleFeatureCard
              icon={<MapPin size={40} className="text-primary" />}
              title="Interactive Map"
              description="Explore tango venues and events on our interactive map"
              delay={0.4}
            />
            <SimpleFeatureCard
              icon={<Heart size={40} className="text-primary" />}
              title="Community Groups"
              description="Join or create groups based on your interests"
              delay={0.5}
            />
            <SimpleFeatureCard
              icon={<Sparkles size={40} className="text-primary" />}
              title="Premium Features"
              description="Unlock advanced tools for organizers and professionals"
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Join the Movement
            </h2>
            <p className="text-lg text-muted-foreground">
              Start connecting with the global tango community today
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <PricingCard
              title="Dancer"
              price="Free"
              features={[
                "Social feed access",
                "Event discovery",
                "Basic messaging",
                "Community groups"
              ]}
              delay={0.1}
            />
            <PricingCard
              title="Pro"
              price="$9/mo"
              features={[
                "Everything in Dancer",
                "Advanced search",
                "Event creation",
                "Priority support",
                "Analytics dashboard"
              ]}
              highlighted
              delay={0.2}
            />
            <PricingCard
              title="Organizer"
              price="$29/mo"
              features={[
                "Everything in Pro",
                "Unlimited events",
                "Ticketing system",
                "Marketing tools",
                "Custom branding"
              ]}
              delay={0.3}
            />
          </div>

          <div className="text-center">
            <Button size="lg" className="text-lg px-8" data-testid="button-view-pricing">
              View Full Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* EDITORIAL CTA SECTION WITH 16:9 IMAGE */}
      <section className="relative py-20 overflow-hidden" data-testid="section-cta">
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dataVizImage})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
                Ready to Dance?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join 10,000+ dancers from around the world
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-white/90 text-lg px-8"
                  data-testid="button-create-account"
                >
                  Create Free Account
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 text-lg px-8"
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
    </SelfHealingErrorBoundary>
  );
}

// STAT CARD COMPONENT
function StatCard({ number, label, delay }: { number: string; label: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
        {number}
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
    </motion.div>
  );
}

// EDITORIAL FEATURE CARD WITH 16:9 IMAGE
function EditorialFeatureCard({ 
  image,
  icon, 
  title, 
  description,
  delay
}: { 
  image: string;
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="overflow-hidden hover-elevate">
        {/* 16:9 Image with Hover Zoom */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="mb-2">{icon}</div>
            <h3 className="text-2xl font-serif font-bold">{title}</h3>
          </div>
        </div>
        
        <CardContent className="p-6">
          <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// SIMPLE FEATURE CARD
function SimpleFeatureCard({ 
  icon, 
  title, 
  description,
  delay
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="h-full hover-elevate p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-serif font-bold mb-3">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </Card>
    </motion.div>
  );
}

// PRICING CARD COMPONENT
function PricingCard({
  title,
  price,
  features,
  highlighted = false,
  delay
}: {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  delay: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <Card 
        className={`relative h-full ${highlighted ? 'border-primary border-2 shadow-lg' : ''}`}
      >
        {highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              MOST POPULAR
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-serif font-bold">
            {title}
          </CardTitle>
          <div className="text-4xl font-serif font-bold text-primary mt-4">
            {price}
          </div>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-3 mb-8">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="text-primary shrink-0 mt-0.5" size={18} />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            variant={highlighted ? "default" : "outline"}
            className="w-full"
            data-testid={`button-${title.toLowerCase()}`}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
