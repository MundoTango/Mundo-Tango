import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Heart, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_29e89c1e.jpg";

const TANGO_ROLES = [
  { id: "dancer-leader", emoji: "🕺", name: "Dancer (Leader)", description: "I lead in tango dancing" },
  { id: "dancer-follower", emoji: "💃", name: "Dancer (Follower)", description: "I follow in tango dancing" },
  { id: "teacher", emoji: "🎓", name: "Teacher", description: "I teach tango" },
  { id: "dj", emoji: "🎵", name: "DJ", description: "I DJ tango music" },
  { id: "performer", emoji: "🎭", name: "Performer", description: "I perform tango shows" },
  { id: "organizer", emoji: "📅", name: "Organizer", description: "I organize tango events" },
  { id: "venue-owner", emoji: "🏢", name: "Venue Owner", description: "I own/manage a tango venue" },
  { id: "photographer", emoji: "🎬", name: "Photographer/Videographer", description: "I capture tango moments" },
  { id: "artist", emoji: "🎨", name: "Designer/Artist", description: "I create tango art/graphics" },
  { id: "business", emoji: "💼", name: "Business/Vendor", description: "I run a tango-related business" },
  { id: "mc", emoji: "🎤", name: "MC/Host", description: "I host/MC tango events" },
  { id: "journalist", emoji: "✍️", name: "Journalist/Blogger", description: "I write about tango" },
  { id: "historian", emoji: "📚", name: "Historian", description: "I study tango history" },
  { id: "coach", emoji: "🎯", name: "Coach/Mentor", description: "I coach/mentor tango dancers" },
  { id: "clothing-designer", emoji: "👔", name: "Clothing/Shoe Designer", description: "I design tango clothing/shoes" },
  { id: "community-builder", emoji: "🌍", name: "Community Builder", description: "I build tango communities" },
  { id: "musician", emoji: "🎼", name: "Musician", description: "I play tango music" },
  { id: "fan", emoji: "👀", name: "Fan/Enthusiast", description: "I'm a tango enthusiast" },
  { id: "other", emoji: "❤️", name: "Other", description: "My tango role is unique" },
];

export default function TangoRolesPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/feed");
    }
  }, [user, navigate]);

  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(r => r !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Select at least one role",
        description: "Please select at least one role that describes you",
        variant: "destructive",
      });
      return;
    }

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
          tangoRoles: selectedRoles,
          formStatus: 3,
        }),
      });

      navigate("/onboarding/step-4");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="Tango Roles" fallbackRoute="/">
      <PageLayout title="TangoRoles" showBreadcrumbs>
<>
      <SEO title="Your Tango Roles - Mundo Tango" description="Tell us what you do in the tango community" />
      
      {/* Hero Section */}
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
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-3">
              Step 3 of 4
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
              What Do You Do in Tango?
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Select all that apply - express your passion
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-background">
        <div className="container mx-auto max-w-5xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Your Tango Roles</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Choose all the ways you participate in tango - minimum 1 required
                </p>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {TANGO_ROLES.map((role, index) => (
                    <motion.button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover-elevate active-elevate-2 ${
                        selectedRoles.includes(role.id)
                          ? "border-primary bg-primary/10"
                          : "border-muted"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      data-testid={`role-${role.id}`}
                    >
                      {selectedRoles.includes(role.id) && (
                        <motion.div 
                          className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                      <span className="text-4xl">{role.emoji}</span>
                      <span className="text-sm font-medium text-center leading-tight">
                        {role.name}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {selectedRoles.length > 0 && (
                  <motion.div 
                    className="border-t pt-6 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-sm font-medium mb-3">Selected roles ({selectedRoles.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoles.map((roleId) => {
                        const role = TANGO_ROLES.find(r => r.id === roleId);
                        return (
                          <Badge key={roleId} variant="secondary" className="gap-1 text-base py-1.5 px-3">
                            <span>{role?.emoji}</span>
                            <span>{role?.name}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </CardContent>

              <CardFooter className="p-8 bg-muted/20 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/onboarding/step-2")}
                  disabled={isLoading}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isLoading || selectedRoles.length === 0}
                  className="gap-2"
                  data-testid="button-continue"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="h-2 w-16 rounded-full bg-primary"></div>
              <div className="h-2 w-16 rounded-full bg-primary"></div>
              <div className="h-2 w-16 rounded-full bg-primary"></div>
              <div className="h-2 w-16 rounded-full bg-muted"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
