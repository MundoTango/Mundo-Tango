import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { extractApiError } from "@/lib/apiErrorHandler";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import heroImage from "@assets/stock_images/global_world_map_con_854a9c2d.jpg";

interface SelectedCity {
  display_name: string;
  name: string;
  country: string;
}

export default function CitySelectionPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<SelectedCity | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      // Already onboarded - redirect based on waitlist status
      if ((user as any).waitlist) {
        navigate("/waitlist-success");
      } else {
        navigate("/feed");
      }
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!selectedCity) {
      toast({
        title: "City required",
        description: "Please select a city to continue",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          city: selectedCity.name,
          country: selectedCity.country,
          formStatus: 1,
        }),
      });

      if (!response.ok) {
        const errorMessage = await extractApiError(response, { context: "City selection" });
        throw new Error(errorMessage);
      }

      const autoJoinResponse = await fetch("/api/communities/auto-join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cityName: selectedCity.name,
          country: selectedCity.country,
        }),
      });

      if (!autoJoinResponse.ok) {
        const errorMessage = await extractApiError(autoJoinResponse, { context: "Community auto-join" });
        throw new Error(errorMessage);
      }

      navigate("/onboarding/step-2");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save city";
      toast({
        title: "City Selection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="OnboardingCitySelection" fallbackRoute="/onboarding/welcome">
      <>
        <SEO title="Select Your City - Mundo Tango" description="Choose your city and join your local tango community" />
      
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
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-1">
              Step 1 of 5
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
              Where Are You Based?
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Connect with your local tango community
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-background">
        <div className="container mx-auto max-w-2xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Your City</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We'll automatically connect you with your local tango community and nearby events
                </p>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-medium">Search for your city</Label>
                  <UnifiedLocationPicker
                    mode="city"
                    value={citySearch}
                    onChange={(loc, coords, parsed) => {
                      setSelectedCity({
                        display_name: loc,
                        name: parsed?.city || '',
                        country: parsed?.country || ''
                      });
                      setCitySearch(loc);
                    }}
                    placeholder="Search for your city..."
                  />

                  {selectedCity && selectedCity.name && (
                    <motion.div 
                      className="flex items-center gap-2 p-4 rounded-xl bg-primary/10 border border-primary/20"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{selectedCity.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedCity.country}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-8 bg-muted/20 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate("/onboarding/welcome")}
                  disabled={isLoading}
                  data-testid="button-back"
                >
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isLoading || !selectedCity}
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
              <div className="h-2 w-16 rounded-full bg-muted"></div>
              <div className="h-2 w-16 rounded-full bg-muted"></div>
              <div className="h-2 w-16 rounded-full bg-muted"></div>
            </div>
          </motion.div>
        </div>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
