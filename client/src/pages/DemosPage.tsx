import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Bot, 
  Calendar, 
  Users, 
  Plane, 
  Sparkles, 
  Play, 
  ArrowRight,
  Music,
  MapPin,
  Star,
  Zap
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

interface DemoCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  isExternal?: boolean;
}

function DemoCard({ title, description, icon: Icon, href, badge, isExternal }: DemoCardProps) {
  const content = (
    <Card className="h-full hover-elevate transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="w-12 h-12 rounded-lg ocean-gradient flex items-center justify-center">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl mt-4">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
          <Play className="h-4 w-4" />
          <span>Try Demo</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

const demos: DemoCardProps[] = [
  {
    title: "Mr. Blue AI Assistant",
    description: "Experience our Pixar-style AI companion with 10 dynamic expression states. Ask questions, get recommendations, and enjoy interactive conversations.",
    icon: Bot,
    href: "/mr-blue-demo",
    badge: "AI Powered"
  },
  {
    title: "3D Avatar Experience",
    description: "Explore our stunning 3D avatar system with real-time animations, customizable states, and responsive interactions.",
    icon: Sparkles,
    href: "/mr-blue-avatar-demo",
    badge: "Interactive"
  },
  {
    title: "Events Discovery",
    description: "Find milongas, festivals, and workshops worldwide. Filter by city, date, and dance style to discover your perfect tango event.",
    icon: Calendar,
    href: "/events",
    badge: "Live Data"
  },
  {
    title: "Community Groups",
    description: "Connect with local tango communities, join city groups, and engage with professional networks across the globe.",
    icon: Users,
    href: "/groups"
  },
  {
    title: "Talent Match AI",
    description: "Our intelligent matching system connects dancers based on skill level, style preferences, and dance goals.",
    icon: Star,
    href: "/talent-match",
    badge: "AI Matching"
  },
  {
    title: "Travel Planner",
    description: "Plan your tango journey with our travel planner. Find events, housing, and connect with dancers in any city.",
    icon: Plane,
    href: "/travel-planner"
  },
  {
    title: "Music Library",
    description: "Explore classic and modern tango music. Create playlists, discover orchestras, and learn about tango musical heritage.",
    icon: Music,
    href: "/music"
  },
  {
    title: "City Guides",
    description: "Comprehensive guides to tango scenes worldwide. Find venues, schools, and insider tips for every major tango city.",
    icon: MapPin,
    href: "/city-guides"
  }
];

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 ocean-gradient opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4" data-testid="badge-demos-header">
                <Zap className="h-3 w-3 mr-1" />
                Interactive Demos
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold ocean-gradient-text"
              data-testid="text-demos-title"
            >
              Experience Mundo Tango
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground"
              data-testid="text-demos-subtitle"
            >
              Explore our platform features through interactive demos. 
              See how Mundo Tango connects the global tango community.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20" data-testid="section-demo-grid">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {demos.map((demo, index) => (
              <motion.div key={demo.title} variants={fadeInUp}>
                <DemoCard {...demo} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-muted/30" data-testid="section-cta">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center max-w-2xl mx-auto space-y-6"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold"
              data-testid="text-cta-heading"
            >
              Ready to Join the Community?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-muted-foreground"
            >
              Start your 7-day free trial and experience everything Mundo Tango has to offer.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="ocean-gradient text-white" data-testid="button-start-trial">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" data-testid="button-view-pricing">
                  View Pricing
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
