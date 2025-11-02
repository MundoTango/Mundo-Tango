import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, Sparkles, Music, Users, Heart, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getThemeByName } from "@/config/theme";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

const theme = getThemeByName('ocean');

export default function MarketingPrototypeOcean() {
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <SelfHealingErrorBoundary pageName="Marketing Ocean" fallbackRoute="/">
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Video Hero Section - MT Ocean Theme */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-testid="section-hero-ocean"
      >
        {/* MT Ocean Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-cyan-400/30"
        >
          <Sparkles size={120} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-10 text-purple-400/30"
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
            <Badge className={cn("mb-6 text-white font-semibold text-sm px-4 py-2", theme.badge)} data-testid="badge-network-ocean">
              THE GLOBAL TANGO NETWORK
            </Badge>
            <h1 className="text-7xl md:text-9xl font-bold mb-6 text-white tracking-tight">
              WHERE TANGO{" "}
              <br />
              <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", theme.accentGradient)}>
                MEETS COMMUNITY
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto"
          >
            Connect with 10,000+ dancers worldwide. Discover events, find partners, and immerse yourself in the global tango movement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              size="lg"
              className={cn("text-lg px-8 py-6 shadow-2xl transition-all hover:scale-105", theme.ctaPrimary)}
              data-testid="button-join-ocean"
            >
              Join the Community
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn("text-lg px-8 py-6 backdrop-blur-sm transition-all hover:scale-105", theme.ctaSecondary)}
              data-testid="button-explore-ocean"
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
            opacity: { delay: 1.5, duration: 0.5 },
            y: { duration: 2, repeat: Infinity }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70"
        >
          <ArrowDown size={32} />
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <ScrollRevealSection delay={0.2}>
        <section className="py-20 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-purple-600/10" data-testid="section-stats-ocean">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <StatCard number="10,000+" label="Active Dancers" delay={0.1} color="text-cyan-400" />
              <StatCard number="50+" label="Countries" delay={0.2} color="text-blue-400" />
              <StatCard number="500+" label="Events Monthly" delay={0.3} color="text-purple-400" />
              <StatCard number="100+" label="Cities" delay={0.4} color="text-cyan-500" />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Features Grid */}
      <ScrollRevealSection delay={0.3}>
        <section className="py-32 px-4" data-testid="section-features-ocean">
          <div className="max-w-7xl mx-auto">
            <motion.h2 className="text-6xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              7 Ways to Connect
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Heart className="text-cyan-400" size={48} />}
                title="Social Feed"
                description="Share your tango journey with a vibrant community"
                delay={0.1}
              />
              <FeatureCard
                icon={<Users className="text-blue-400" size={48} />}
                title="Find Partners"
                description="Connect with dancers worldwide for events and practice"
                delay={0.2}
              />
              <FeatureCard
                icon={<Music className="text-purple-400" size={48} />}
                title="Events & Milongas"
                description="Discover and attend tango events in your city"
                delay={0.3}
              />
              <FeatureCard
                icon={<Globe className="text-cyan-500" size={48} />}
                title="Housing Network"
                description="Find accommodation with fellow tango enthusiasts"
                delay={0.4}
              />
              <FeatureCard
                icon={<Sparkles className="text-blue-500" size={48} />}
                title="Workshops"
                description="Learn from world-class teachers and maestros"
                delay={0.5}
              />
              <FeatureCard
                icon={<Heart className="text-purple-500" size={48} />}
                title="Volunteer"
                description="Contribute to the global tango community"
                delay={0.6}
              />
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA Section */}
      <ScrollRevealSection delay={0.2}>
        <section className="py-32 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 relative overflow-hidden" data-testid="section-cta-ocean">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Ready to Dance?
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Join thousands of dancers already on Mundo Tango
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90 text-xl px-12 py-8 shadow-2xl transition-all hover:scale-105"
              data-testid="button-get-started-ocean"
            >
              Get Started Free
            </Button>
          </div>
        </section>
      </ScrollRevealSection>
    </div>
    </SelfHealingErrorBoundary>
  );
}

function ScrollRevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ number, label, delay, color }: { number: string; label: string; delay: number; color: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className={cn("text-5xl md:text-6xl font-bold mb-2", color)}>{number}</div>
      <div className="text-lg text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="h-full transition-all hover:shadow-2xl cursor-pointer border-2 border-cyan-500/30">
        <CardContent className="p-8">
          <div className="mb-4">{icon}</div>
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-500">
            <span>Learn More</span>
            <ArrowDown className="rotate-[-90deg] h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
