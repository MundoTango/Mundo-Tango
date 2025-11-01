import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, Music, Users, Heart, Globe } from "lucide-react";
import { Link } from "wouter";

export default function MarketingPrototype() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section - Full Screen with Animated Gradient */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-testid="section-hero"
      >
        {/* Animated Ocean Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 text-cyan-400/30"
        >
          <Sparkles size={120} />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
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
            <h1 className="text-7xl md:text-9xl font-bold mb-6 text-white tracking-tight">
              WHERE TANGO
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
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
              className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6"
              data-testid="button-join-community"
            >
              Join the Community
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 backdrop-blur-sm"
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
            opacity: { delay: 1.5, duration: 0.5 },
            y: { duration: 2, repeat: Infinity }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70"
        >
          <ArrowDown size={32} />
        </motion.div>
      </motion.section>

      {/* Chapter 1: The Dance */}
      <ChapterSection
        title="THE DANCE"
        subtitle="Feel the passion of tango"
        description="From Buenos Aires milongas to global festivals, discover the art of connection through movement. Every step tells a story, every embrace creates a moment."
        icon={<Heart size={80} className="text-cyan-500" />}
        gradient="from-cyan-500/20 to-blue-600/20"
        iconPosition="right"
      />

      {/* Chapter 2: The Music */}
      <ChapterSection
        title="THE MUSIC"
        subtitle="Listen to the rhythm of tradition"
        description="Immerse yourself in the rich sounds of tango orchestras, from classic Pugliese to modern nuevo. Each melody carries decades of emotion and culture."
        icon={<Music size={80} className="text-blue-500" />}
        gradient="from-blue-600/20 to-purple-600/20"
        iconPosition="left"
      />

      {/* Chapter 3: The Community */}
      <ChapterSection
        title="THE COMMUNITY"
        subtitle="Connect with dancers worldwide"
        description="Join 10,000+ passionate dancers from 50+ countries. Find your tribe, share your journey, and experience tango culture together."
        icon={<Users size={80} className="text-purple-500" />}
        gradient="from-purple-600/20 to-cyan-500/20"
        iconPosition="right"
      />

      {/* Global Network Section */}
      <section className="py-32 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-purple-600/10" data-testid="section-global">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <Globe size={80} className="mx-auto mb-8 text-blue-500" />
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              A TRULY GLOBAL PLATFORM
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Mundo Tango brings together dancers from every corner of the world, creating connections that transcend borders and language.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard number="10,000+" label="Active Dancers" delay={0.2} />
            <StatCard number="50+" label="Countries" delay={0.4} />
            <StatCard number="1,000+" label="Events Monthly" delay={0.6} />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-purple-600 to-cyan-500 text-white relative overflow-hidden" data-testid="section-cta">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-6xl md:text-7xl font-bold mb-8">
              YOUR TANGO JOURNEY
              <br />
              STARTS HERE
            </h2>
            <p className="text-2xl mb-12 text-white/90">
              Join the world's most vibrant tango community today.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 text-xl px-12 py-8"
                data-testid="button-get-started"
              >
                Get Started Free
              </Button>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-xl px-12 py-8 backdrop-blur-sm"
                  data-testid="link-back-home"
                >
                  Back to Platform
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Prototype Badge */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm border border-white/20">
          PROTOTYPE
        </div>
      </div>
    </div>
  );
}

// Chapter Section Component
interface ChapterSectionProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconPosition: "left" | "right";
}

function ChapterSection({ title, subtitle, description, icon, gradient, iconPosition }: ChapterSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <section
      ref={ref}
      className={`min-h-screen flex items-center py-32 bg-gradient-to-br ${gradient}`}
      data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${iconPosition === "left" ? "lg:flex-row-reverse" : ""}`}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: iconPosition === "right" ? -100 : 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: iconPosition === "right" ? -100 : 100 }}
            transition={{ duration: 1 }}
            className={iconPosition === "left" ? "lg:order-2" : ""}
          >
            <p className="text-sm font-semibold text-primary mb-4 tracking-widest uppercase">
              {subtitle}
            </p>
            <h2 className="text-7xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Icon with Parallax */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: -10 }}
            transition={{ duration: 1, delay: 0.3 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`flex justify-center ${iconPosition === "left" ? "lg:order-1" : ""}`}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full" />
              <div className="relative bg-background/50 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl">
                {icon}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Stat Card Component
interface StatCardProps {
  number: string;
  label: string;
  delay: number;
}

function StatCard({ number, label, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="bg-background/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl text-center"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-lg text-muted-foreground">{label}</div>
    </motion.div>
  );
}

// Add gradient animation to global styles
const style = document.createElement('style');
style.textContent = `
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .animate-gradient-shift {
    background-size: 200% 200%;
    animation: gradient-shift 15s ease infinite;
  }
`;
document.head.appendChild(style);
