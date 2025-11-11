import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Music, MessageCircle, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

const tourSteps = [
  {
    icon: Users,
    title: "Connect with Dancers",
    description: "Find and follow dancers in your area. Build your tango network and discover new practice partners.",
    color: "text-blue-500"
  },
  {
    icon: Calendar,
    title: "Discover Events",
    description: "Browse milongas, workshops, and festivals near you. RSVP to events and never miss a dance opportunity.",
    color: "text-purple-500"
  },
  {
    icon: Music,
    title: "Learn & Improve",
    description: "Access video tutorials, music playlists, and technique guides from expert teachers worldwide.",
    color: "text-green-500"
  },
  {
    icon: MessageCircle,
    title: "Stay Connected",
    description: "Chat with friends, join groups, and participate in the vibrant tango community discussions.",
    color: "text-orange-500"
  }
];

export default function WelcomeTourPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <SelfHealingErrorBoundary pageName="Welcome to Mundo Tango!" fallbackRoute="/">
      <PageLayout title="Welcome to Mundo Tango!" showBreadcrumbs>
        <>
          {/* Hero Section */}
          <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
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
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Quick Tour
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Welcome to Mundo Tango
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Your gateway to the global tango community
                </p>
              </motion.div>
            </div>
          </div>

          {/* Tour Content */}
          <div className="bg-background">
            <div className="container mx-auto max-w-5xl px-6 py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-12 md:p-16">
                    <div className="text-center space-y-8">
                      <motion.div 
                        className={`mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ${tourSteps[currentStep].color}`}
                        key={currentStep}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {(() => {
                          const IconComponent = tourSteps[currentStep].icon;
                          return <IconComponent className="h-12 w-12" />;
                        })()}
                      </motion.div>

                      <motion.div
                        key={`content-${currentStep}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                          {tourSteps[currentStep].title}
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                          {tourSteps[currentStep].description}
                        </p>
                      </motion.div>

                      <div className="flex justify-center gap-2 pt-6">
                        {tourSteps.map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === currentStep
                                ? "w-12 bg-primary"
                                : "w-2 bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="gap-2"
                    data-testid="button-prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep === tourSteps.length - 1 ? (
                    <Button 
                      onClick={() => window.location.href = "/feed"}
                      className="gap-2"
                      data-testid="button-finish"
                    >
                      Get Started
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(Math.min(tourSteps.length - 1, currentStep + 1))}
                      className="gap-2"
                      data-testid="button-next"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="text-center mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.href = "/feed"} 
                    data-testid="button-skip"
                  >
                    Skip Tour
                  </Button>
                </div>

                <div className="flex justify-center gap-2 mt-8">
                  <Badge variant="outline">Step {currentStep + 1} of {tourSteps.length}</Badge>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
