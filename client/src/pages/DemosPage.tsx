import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicNavbar } from "@/components/PublicNavbar";
import { DemoModal } from "@/components/marketing/DemoModal";
import { motion } from "framer-motion";
import { 
  Bot, 
  Calendar, 
  Users, 
  MapPin, 
  Music, 
  Plane, 
  BookOpen, 
  Play,
  ArrowRight,
  Sparkles
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

interface DemoCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof Bot;
  color: string;
  features: string[];
  image: string;
  route?: string;
}

const demoCategories: DemoCategory[] = [
  {
    id: "mr-blue",
    title: "Mr. Blue AI Assistant",
    description: "Your personal AI companion with 10 expressive emotional states. Get personalized tango recommendations, travel tips, and dance advice 24/7.",
    icon: Bot,
    color: "from-blue-500 to-cyan-500",
    features: ["Natural language chat", "10 emotional expressions", "Personalized recommendations", "24/7 availability"],
    image: "/demos/mr-blue-chat.png",
    route: "/mr-blue"
  },
  {
    id: "3d-avatar",
    title: "3D Avatar Experience",
    description: "Watch Mr. Blue come to life with real-time 3D animations. Our Pixar-inspired avatar responds to conversations with authentic emotional expressions.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    features: ["Real-time 3D rendering", "7 emotional states", "Smooth animations", "Interactive responses"],
    image: "/demos/profile-view.png",
    route: "/mr-blue-avatar-demo"
  },
  {
    id: "events",
    title: "Events Discovery",
    description: "Find milongas, festivals, and workshops worldwide. Filter by date, location, style, and connect with dancers going to the same events.",
    icon: Calendar,
    color: "from-orange-500 to-red-500",
    features: ["Global event calendar", "Interactive map view", "RSVP tracking", "Personalized suggestions"],
    image: "/demos/events-discovery.png",
    route: "/events"
  },
  {
    id: "community",
    title: "Community Groups",
    description: "Join city-based and professional tango communities. Discuss, share, and connect with dancers who share your passion.",
    icon: Users,
    color: "from-green-500 to-emerald-500",
    features: ["City groups", "Professional networks", "Discussion forums", "Member directories"],
    image: "/demos/tango-map.png",
    route: "/groups"
  },
  {
    id: "talent-match",
    title: "Talent Match AI",
    description: "Our intelligent matching algorithm connects you with dancers who complement your level, style, and goals. Find your perfect dance partner.",
    icon: Users,
    color: "from-rose-500 to-pink-500",
    features: ["Skill-based matching", "Style preferences", "Location awareness", "Availability sync"],
    image: "/demos/profile-view.png",
    route: "/talent-match"
  },
  {
    id: "travel",
    title: "Travel Planner",
    description: "Plan your tango journeys with AI-powered recommendations. Find the best milongas, teachers, and housing in any city you visit.",
    icon: Plane,
    color: "from-sky-500 to-blue-500",
    features: ["City recommendations", "Event scheduling", "Housing options", "Local contacts"],
    image: "/demos/tango-map.png",
    route: "/travel"
  },
  {
    id: "music",
    title: "Music Library",
    description: "Explore classic and modern tango music. Create playlists, discover orchestras, and learn about the rich history of tango music.",
    icon: Music,
    color: "from-violet-500 to-purple-500",
    features: ["Orchestra catalogs", "Playlist creation", "Music history", "Dancing tips"],
    image: "/demos/mr-blue-chat.png",
    route: "/music"
  },
  {
    id: "guides",
    title: "City Guides",
    description: "Comprehensive guides to tango scenes worldwide. Find the best milongas, schools, and communities in cities across the globe.",
    icon: BookOpen,
    color: "from-amber-500 to-orange-500",
    features: ["Growing city coverage", "Local recommendations", "Community reviews", "Updated regularly"],
    image: "/demos/tango-map.png",
    route: "/city-guides"
  }
];

export default function DemosPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="relative py-16 md:py-24 overflow-hidden" data-testid="demos-hero">
        <div className="absolute inset-0 ocean-gradient opacity-90" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-white/20 text-white border-0">
                {t('pages:demos.badge', 'Platform Demos')}
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white"
              data-testid="text-demos-heading"
            >
              {t('pages:demos.title', 'Experience Mundo Tango')}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              {t('pages:demos.subtitle', 'Explore interactive demos of our powerful features. See how Mundo Tango can transform your tango journey.')}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => setDemoModalOpen(true)}
                data-testid="button-watch-demo"
              >
                <Play className="mr-2 h-5 w-5" />
                {t('pages:demos.watchDemo', 'Watch Interactive Demo')}
              </Button>
              <Link href="/register">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  data-testid="button-start-trial"
                >
                  {t('pages:demos.startTrial', 'Join Now')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24" data-testid="demos-grid">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl md:text-4xl font-bold ocean-gradient-text"
              >
                {t('pages:demos.featureDemos', 'Feature Demos')}
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t('pages:demos.featureDemosSubtitle', 'Click on any feature to explore it in detail or watch the interactive demo.')}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demoCategories.map((demo, index) => {
                const IconComponent = demo.icon;
                return (
                  <motion.div key={demo.id} variants={fadeInUp}>
                    <Card 
                      className="h-full overflow-hidden hover-elevate cursor-pointer group"
                      data-testid={`demo-card-${demo.id}`}
                    >
                      <div className={`h-40 bg-gradient-to-br ${demo.color} relative overflow-hidden`}>
                        {demo.image && (
                          <img 
                            src={demo.image} 
                            alt={demo.title}
                            className="absolute inset-0 w-full h-full object-cover object-top opacity-60 group-hover:opacity-80 transition-opacity"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white">{demo.title}</h3>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {demo.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {demo.features.slice(0, 2).map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        {demo.route && (
                          <Link href={demo.route}>
                            <Button variant="ghost" size="sm" className="w-full mt-4">
                              {t('pages:demos.explore', 'Explore')}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30" data-testid="demos-cta">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl font-bold"
            >
              {t('pages:demos.ctaTitle', 'Ready to Start Your Tango Journey?')}
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground"
            >
              {t('pages:demos.ctaSubtitle', 'Join thousands of dancers worldwide. Start your tango journey today.')}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="ocean-gradient text-white" data-testid="button-join-free">
                  {t('pages:demos.joinFree', 'Join Free')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" data-testid="button-view-pricing">
                  {t('pages:demos.viewPricing', 'View Pricing')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <DemoModal open={demoModalOpen} onOpenChange={setDemoModalOpen} />
    </div>
  );
}
