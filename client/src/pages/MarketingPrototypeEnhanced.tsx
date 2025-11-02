/**
 * MARKETING PROTOTYPE - BOLD MINIMAXIMALIST THEME
 * Automatically uses burgundy #b91c3b, 800 font weight, 6px radius
 * Route: /marketing-prototype-enhanced
 * 
 * DESIGN CHARACTERISTICS:
 * - Burgundy (#b91c3b) primary - PASSIONATE
 * - Purple (#8b5cf6) creative accent - ARTISTIC
 * - Gold (#f59e0b) warmth accent - AUTHENTIC
 * - Heavy 800 typography - DRAMATIC
 * - Sharp 6px corners - CRISP
 * - Strong burgundy shadows - DEPTH
 * - Fast 150ms animations - ENERGETIC
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AdaptiveButton } from "@/components/adaptive/AdaptiveButton";
import { AdaptiveCard } from "@/components/adaptive/AdaptiveCard";
import { ArrowDown, Sparkles, Music, Users, Heart, Globe, Calendar, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MarketingPrototypeEnhanced() {
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      {/* HERO SECTION - Burgundy Gradient */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-testid="section-hero"
      >
        {/* Bold Minimaximalist Gradient: Burgundy → Purple → Gold */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        
        {/* Dark wash for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Floating Animated Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-[var(--color-accent)]/30"
        >
          <Sparkles size={120} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 text-[var(--color-secondary)]/30"
        >
          <Music size={100} />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span 
              className="inline-block mb-6 text-white font-[var(--font-weight-body)] text-sm px-6 py-3 bg-[var(--color-primary)]/90 rounded-[var(--radius-base)] shadow-[var(--shadow-large)]"
              data-testid="badge-network"
            >
              THE GLOBAL TANGO NETWORK
            </span>
            
            <h1 className="text-7xl md:text-9xl font-[var(--font-weight-heading)] mb-6 text-white tracking-tight leading-[var(--line-height-heading)]">
              WHERE TANGO{" "}
              <br />
              <span className="bg-gradient-to-r from-[var(--color-accent)] via-white to-[var(--color-secondary)] bg-clip-text text-transparent">
                MEETS COMMUNITY
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-[var(--font-weight-body)]"
          >
            Connect with 10,000+ dancers worldwide. Discover events, find partners, and immerse yourself in the global tango movement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <AdaptiveButton
              size="lg"
              variant="primary"
              className="shadow-[var(--shadow-xlarge)]"
              data-testid="button-join-community"
            >
              Join the Community
            </AdaptiveButton>
            <AdaptiveButton
              size="lg"
              variant="secondary"
              className="backdrop-blur-sm bg-white/10 text-white border-white hover:bg-white/20"
              data-testid="button-explore-events"
            >
              Explore Events
            </AdaptiveButton>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1.5, duration: 0.5 },
            y: { duration: 2, repeat: Infinity }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70"
        >
          <ArrowDown size={32} />
        </motion.div>
      </motion.section>

      {/* STATS SECTION */}
      <section className="py-20 bg-[var(--color-background)]" data-testid="section-stats">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard number="10,000+" label="Active Dancers" />
            <StatCard number="50+" label="Countries" />
            <StatCard number="500+" label="Events Monthly" />
            <StatCard number="100+" label="Cities" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32 px-4 bg-[var(--color-surface)]" data-testid="section-features">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[var(--font-size-hero)] font-[var(--font-weight-heading)] text-center mb-4 text-[var(--color-text-primary)] leading-[var(--line-height-heading)]">
            7 Ways to Connect
          </h2>
          <p className="text-center text-[var(--color-text-secondary)] text-xl mb-16 max-w-2xl mx-auto font-[var(--font-weight-body)]">
            Mundo Tango brings the global tango community together through powerful features
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Heart className="text-[var(--color-primary)]" size={48} />}
              title="Social Feed"
              description="Share your tango journey with a vibrant community"
            />
            <FeatureCard
              icon={<Users className="text-[var(--color-primary)]" size={48} />}
              title="Find Partners"
              description="Connect with dancers worldwide for events and practice"
            />
            <FeatureCard
              icon={<Music className="text-[var(--color-secondary)]" size={48} />}
              title="Events & Milongas"
              description="Discover and attend tango events in your city"
            />
            <FeatureCard
              icon={<Globe className="text-[var(--color-secondary)]" size={48} />}
              title="Global Community"
              description="Join dancers from over 50 countries"
            />
            <FeatureCard
              icon={<Calendar className="text-[var(--color-accent)]" size={48} />}
              title="Event Calendar"
              description="Never miss a milonga with our comprehensive calendar"
            />
            <FeatureCard
              icon={<MapPin className="text-[var(--color-accent)]" size={48} />}
              title="Interactive Map"
              description="Explore tango venues and events on our interactive map"
            />
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-32 px-4 bg-[var(--color-background)]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[var(--font-size-h1)] font-[var(--font-weight-heading)] mb-6 text-[var(--color-text-primary)] leading-[var(--line-height-heading)]">
            Join the Movement
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-12 font-[var(--font-weight-body)]">
            Start connecting with the global tango community today
          </p>
          
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
            />
          </div>

          <AdaptiveButton size="lg" variant="primary">
            View Full Pricing
          </AdaptiveButton>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-[var(--gradient-primary)]" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
          <h2 className="text-[var(--font-size-hero)] font-[var(--font-weight-heading)] mb-6 leading-[var(--line-height-heading)]">
            Ready to Dance?
          </h2>
          <p className="text-2xl mb-12 font-[var(--font-weight-body)]">
            Join 10,000+ dancers from around the world
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <AdaptiveButton 
              size="lg" 
              variant="primary"
              className="bg-white text-[var(--color-primary)] hover:bg-gray-100"
            >
              Create Free Account
            </AdaptiveButton>
            <AdaptiveButton 
              size="lg" 
              variant="secondary"
              className="border-white text-white hover:bg-white/10"
            >
              Learn More
            </AdaptiveButton>
          </div>
        </div>
      </section>
    </div>
  );
}

// STAT CARD COMPONENT
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-5xl font-[var(--font-weight-heading)] text-[var(--color-primary)] mb-2 leading-[var(--line-height-heading)]">
        {number}
      </div>
      <div className="text-[var(--color-text-secondary)] font-[var(--font-weight-body)] uppercase tracking-wide text-sm">
        {label}
      </div>
    </motion.div>
  );
}

// FEATURE CARD COMPONENT
function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <AdaptiveCard 
        variant="solid" 
        className="h-full hover:shadow-[var(--shadow-xlarge)] transition-all duration-[var(--transition-speed)]"
      >
        <div className="mb-4">{icon}</div>
        <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-subheading)] mb-3 text-[var(--color-text-primary)]">
          {title}
        </h3>
        <p className="text-[var(--color-text-secondary)] font-[var(--font-weight-body)]">
          {description}
        </p>
      </AdaptiveCard>
    </motion.div>
  );
}

// PRICING CARD COMPONENT
function PricingCard({
  title,
  price,
  features,
  highlighted = false
}: {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <AdaptiveCard 
      variant="solid"
      className={cn(
        "relative",
        highlighted && "ring-4 ring-[var(--color-primary)] shadow-[var(--shadow-xlarge)]"
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white px-4 py-1 rounded-[var(--radius-button)] text-sm font-[var(--font-weight-body)]">
          MOST POPULAR
        </div>
      )}
      
      <h3 className="text-[var(--font-size-h3)] font-[var(--font-weight-heading)] mb-2 text-[var(--color-text-primary)]">
        {title}
      </h3>
      <div className="text-4xl font-[var(--font-weight-heading)] text-[var(--color-primary)] mb-6">
        {price}
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-[var(--color-text-secondary)] font-[var(--font-weight-body)]">
            <Check className="text-[var(--color-primary)] shrink-0 mt-1" size={20} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <AdaptiveButton 
        variant={highlighted ? "primary" : "secondary"}
        className="w-full"
      >
        Get Started
      </AdaptiveButton>
    </AdaptiveCard>
  );
}
