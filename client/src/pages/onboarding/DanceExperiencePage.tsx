import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Sparkles, Check, Palette } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";
import { 
  SiYoga,
} from "react-icons/si";
import { 
  Dumbbell, 
  Music, 
  Camera, 
  Palette as PaletteIcon, 
  BookOpen, 
  Plane, 
  UtensilsCrossed, 
  Wine, 
  Gamepad2, 
  Mountain, 
  Bike, 
  Waves, 
  TreePine, 
  Heart, 
  Film, 
  Mic2, 
  Guitar 
} from "lucide-react";

const HOBBIES = [
  { id: "fitness", label: "Fitness", icon: Dumbbell, color: "#EF4444" },
  { id: "yoga", label: "Yoga", icon: Heart, color: "#8B5CF6" },
  { id: "music", label: "Music", icon: Music, color: "#3B82F6" },
  { id: "photography", label: "Photography", icon: Camera, color: "#F59E0B" },
  { id: "art", label: "Art & Painting", icon: PaletteIcon, color: "#EC4899" },
  { id: "reading", label: "Reading", icon: BookOpen, color: "#10B981" },
  { id: "travel", label: "Travel", icon: Plane, color: "#06B6D4" },
  { id: "cooking", label: "Cooking", icon: UtensilsCrossed, color: "#F97316" },
  { id: "wine", label: "Wine Tasting", icon: Wine, color: "#7C3AED" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, color: "#6366F1" },
  { id: "hiking", label: "Hiking", icon: Mountain, color: "#059669" },
  { id: "cycling", label: "Cycling", icon: Bike, color: "#0EA5E9" },
  { id: "swimming", label: "Swimming", icon: Waves, color: "#0284C7" },
  { id: "nature", label: "Nature", icon: TreePine, color: "#16A34A" },
  { id: "movies", label: "Movies", icon: Film, color: "#DC2626" },
  { id: "singing", label: "Singing", icon: Mic2, color: "#A855F7" },
  { id: "instruments", label: "Instruments", icon: Guitar, color: "#CA8A04" },
];

export default function DanceExperiencePage() {
  const [, navigate] = useLocation();
  const { user, refreshCurrentUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/volunteer");
    }
  }, [user, navigate]);

  const toggleHobby = (hobbyId: string) => {
    if (selectedHobbies.includes(hobbyId)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobbyId));
    } else {
      setSelectedHobbies([...selectedHobbies, hobbyId]);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          hobbies: selectedHobbies,
          formStatus: 5,
          isOnboardingComplete: true,
        }),
      });

      await refreshCurrentUser();
      
      const isWaitlist = user?.waitlist === true;
      
      if (isWaitlist) {
        toast({
          title: "You're on the list!",
          description: "We'll notify you when your account is ready. In the meantime, explore volunteer opportunities!",
        });
        setTimeout(() => {
          navigate("/volunteer");
        }, 1500);
      } else {
        toast({
          title: "Welcome to Mundo Tango!",
          description: "Your profile is complete. Let's explore!",
        });
        navigate("/feed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="OtherHobbies" fallbackRoute="/">
      <PageLayout title="OtherHobbies" showBreadcrumbs>
        <>
          <SEO title="Your Hobbies - Mundo Tango" description="Tell us about your other interests" />
          
          <div className="relative h-[50vh] w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${heroImage}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-5">
                  Step 5 of 5 - Final Step!
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  What Else Do You Love?
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  Beyond tango, what are your other passions?
                </p>
              </motion.div>
            </div>
          </div>

          <div className="bg-background">
            <div className="container mx-auto max-w-4xl px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Palette className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">Other Hobbies</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Share your interests to connect with like-minded dancers (optional)
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {HOBBIES.map((hobby, index) => {
                        const IconComponent = hobby.icon;
                        const isSelected = selectedHobbies.includes(hobby.id);
                        return (
                          <motion.button
                            key={hobby.id}
                            onClick={() => toggleHobby(hobby.id)}
                            className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all hover-elevate active-elevate-2 ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-muted"
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            data-testid={`hobby-${hobby.id}`}
                          >
                            {isSelected && (
                              <motion.div 
                                className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              >
                                <Check className="h-3 w-3" />
                              </motion.div>
                            )}
                            <div className="p-3 rounded-full" style={{ backgroundColor: `${hobby.color}20` }}>
                              <IconComponent className="w-6 h-6" style={{ color: hobby.color }} />
                            </div>
                            <span className="text-xs font-medium text-center leading-tight">
                              {hobby.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {selectedHobbies.length > 0 && (
                      <motion.div 
                        className="border-t pt-6 mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm font-medium mb-3">Selected hobbies ({selectedHobbies.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedHobbies.map((hobbyId) => {
                            const hobby = HOBBIES.find(h => h.id === hobbyId);
                            if (!hobby) return null;
                            const IconComponent = hobby.icon;
                            return (
                              <Badge key={hobbyId} variant="secondary" className="gap-2 py-1.5 px-3">
                                <IconComponent className="w-4 h-4" style={{ color: hobby.color }} />
                                <span>{hobby.label}</span>
                              </Badge>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        This helps you connect with dancers who share similar interests outside of tango.
                        You can skip this step or update your hobbies anytime from your profile.
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/30 p-6 flex flex-wrap justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/onboarding/step-4")}
                      data-testid="button-back"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={isLoading}
                      size="lg"
                      data-testid="button-complete"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Finishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Complete Setup
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <div className="flex justify-center gap-2 mt-8">
                  <div className="h-2 w-12 rounded-full bg-primary"></div>
                  <div className="h-2 w-12 rounded-full bg-primary"></div>
                  <div className="h-2 w-12 rounded-full bg-primary"></div>
                  <div className="h-2 w-12 rounded-full bg-primary"></div>
                  <div className="h-2 w-12 rounded-full bg-primary"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
