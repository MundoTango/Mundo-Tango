import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Calendar, MapPin, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_f6beef21.jpg";

export default function WelcomePage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.isOnboardingComplete) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const handleContinue = () => {
    navigate("/onboarding/step-1");
  };

  const features = [
    {
      icon: MapPin,
      title: "Choose Your City",
      description: "Connect with your local tango community"
    },
    {
      icon: Users,
      title: "Tell Us Your Roles",
      description: "Dancer, teacher, DJ, organizer, or all of the above?"
    },
    {
      icon: Calendar,
      title: "Discover Events",
      description: "Find milongas, classes, and festivals near you"
    },
    {
      icon: Sparkles,
      title: "Share Your Journey",
      description: "Post photos, videos, and connect with dancers worldwide"
    }
  ];

  return (
    <SelfHealingErrorBoundary pageName="OnboardingWelcome" fallbackRoute="/feed">
      <PageLayout title="Welcome" showBreadcrumbs>
        <>
      <SEO
        title="Welcome to Mundo Tango"
        description="Complete your profile and join the global tango community"
      />

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-welcome">
              Onboarding
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
              Welcome to Mundo Tango
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8">
              Your journey into the global tango community starts here
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button 
                onClick={handleContinue} 
                size="lg" 
                className="gap-2 px-8"
                data-testid="button-continue-onboarding"
              >
                <Sparkles className="h-5 w-5" />
                Let's Get Started
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-background">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Complete Your Profile in Minutes
            </h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to join the community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + (index * 0.1) }}
                >
                  <Card className="hover-elevate h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-serif font-bold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="inline-flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">Step 1 of 4</Badge>
              <span>•</span>
              <span>Takes 2-3 minutes</span>
            </div>
          </motion.div>
        </div>
      </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
