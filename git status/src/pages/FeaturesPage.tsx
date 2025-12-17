import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Video,
  Heart,
  Globe,
  Sparkles,
  Shield,
  TrendingUp,
  Music,
  GraduationCap
} from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Link } from "wouter";

const featureCategories = [
  {
    title: "Social Connection",
    description: "Connect with dancers worldwide",
    icon: Users,
    features: [
      {
        icon: Users,
        title: "Build Your Network",
        description: "Connect with dancers, teachers, and organizers from around the world. Create lasting friendships within the global tango community."
      },
      {
        icon: MessageCircle,
        title: "Real-Time Messaging",
        description: "Chat with friends, coordinate meetups, and stay connected with your tango community through our integrated messaging system."
      },
      {
        icon: Heart,
        title: "Find Your Partner",
        description: "Discover practice partners in your area or when traveling. Filter by dance level, style preferences, and availability."
      }
    ]
  },
  {
    title: "Events & Discovery",
    description: "Never miss a milonga",
    icon: Calendar,
    features: [
      {
        icon: Calendar,
        title: "Global Event Calendar",
        description: "Browse thousands of milongas, practicas, and festivals worldwide. Get personalized recommendations based on your preferences."
      },
      {
        icon: MapPin,
        title: "Interactive Map",
        description: "Explore tango venues on an interactive world map. Discover hotspots in your city or plan your next tango vacation."
      },
      {
        icon: TrendingUp,
        title: "Smart Recommendations",
        description: "AI-powered suggestions help you discover events and dancers that match your interests and skill level."
      }
    ]
  },
  {
    title: "Learning & Growth",
    description: "Master your craft",
    icon: GraduationCap,
    features: [
      {
        icon: Video,
        title: "Video Lessons",
        description: "Access a comprehensive library of video tutorials from world-class instructors. Learn at your own pace, anytime, anywhere."
      },
      {
        icon: GraduationCap,
        title: "Teacher Directory",
        description: "Find the perfect instructor for your learning style. Browse profiles, read reviews, and book private lessons or workshops."
      },
      {
        icon: Music,
        title: "Music Library",
        description: "Explore an extensive collection of tango music. Create playlists, discover new orchestras, and learn about the music you love."
      }
    ]
  },
  {
    title: "Community Tools",
    description: "Build and organize",
    icon: Globe,
    features: [
      {
        icon: Users,
        title: "Groups & Communities",
        description: "Join or create groups based on location, dance style, or interests. Organize meetups and share experiences with like-minded dancers."
      },
      {
        icon: Shield,
        title: "Safe & Welcoming",
        description: "Our community guidelines and safety features ensure a respectful, inclusive environment for all dancers."
      },
      {
        icon: Sparkles,
        title: "AI Assistant - Mr. Blue",
        description: "Get personalized help from our AI companion. Ask questions, get recommendations, and navigate the platform with ease."
      }
    ]
  }
];

export default function FeaturesPage() {
  return (
    <SelfHealingErrorBoundary pageName="Features" fallbackRoute="/">
      <PageLayout title="Platform Features" showBreadcrumbs>
        <PublicLayout>
          <SEO
            title="Features - Mundo Tango"
            description="Discover all the features that make Mundo Tango the ultimate platform for tango dancers worldwide. Connect, learn, discover events, and grow your tango journey."
          />

          {/* Hero Section */}
          <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1600&h=900&fit=crop&q=80')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge
                  variant="outline"
                  className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm"
                  data-testid="badge-category"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Platform Features
                </Badge>

                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6"
                  data-testid="text-page-title"
                >
                  Everything You Need
                  <br />
                  for Your Tango Journey
                </h1>

                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8" data-testid="text-page-subtitle">
                  From social connections to learning resources, discover all the tools
                  that make Mundo Tango the world's premier tango community platform
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="text-lg" data-testid="button-get-started">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                      data-testid="button-view-pricing"
                    >
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features Categories */}
          <div className="bg-background py-20 px-4">
            <div className="container mx-auto max-w-7xl space-y-24">
              {featureCategories.map((category, categoryIndex) => {
                const CategoryIcon = category.icon;
                return (
                  <div key={category.title} className="space-y-12">
                    {/* Category Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6 }}
                      className="text-center max-w-3xl mx-auto"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                        <CategoryIcon className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid={`text-category-${categoryIndex}`}>
                        {category.title}
                      </h2>
                      <p className="text-xl text-muted-foreground">
                        {category.description}
                      </p>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {category.features.map((feature, featureIndex) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: featureIndex * 0.1 }}
                          >
                            <Card className="h-full hover-elevate" data-testid={`card-feature-${categoryIndex}-${featureIndex}`}>
                              <CardHeader>
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                  <FeatureIcon className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-serif">
                                  {feature.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-muted-foreground">
                                  {feature.description}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                  Trusted by Dancers Worldwide
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of tango enthusiasts already using Mundo Tango
                </p>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { value: "50,000+", label: "Active Dancers" },
                  { value: "500+", label: "Cities" },
                  { value: "10,000+", label: "Events Monthly" },
                  { value: "1,000+", label: "Teachers" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                    data-testid={`stat-${index}`}
                  >
                    <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-background py-20 px-4">
            <div className="container mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                  <CardContent className="p-12 text-center space-y-6">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold">
                      Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Join the global tango community today. Connect with dancers,
                      discover events, and immerse yourself in the world of tango.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <Link href="/register">
                        <Button size="lg" className="text-lg" data-testid="button-cta-register">
                          Get Started Free
                        </Button>
                      </Link>
                      <Link href="/about">
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-lg"
                          data-testid="button-cta-learn-more"
                        >
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </PublicLayout>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
