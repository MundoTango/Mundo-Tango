import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(['pages', 'common']);
  const [citySearch, setCitySearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<SelectedCity | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate("/volunteer");
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!selectedCity) {
      toast({
        title: t('pages:onboarding.city.errors.required', 'City required'),
        description: t('pages:onboarding.city.errors.selectCity', 'Please select a city to continue'),
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

      // Trigger location change effects (auto-join city group, create if needed)
      const autoJoinResponse = await fetch("/api/location/change-effects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          newCity: selectedCity.name,
          newCountry: selectedCity.country,
        }),
      });

      if (!autoJoinResponse.ok) {
        // Non-critical error - log but continue with onboarding
        console.warn("[CitySelection] Auto-join failed, continuing with onboarding");
      }

      navigate("/onboarding/photo");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('pages:onboarding.city.errors.saveFailed', 'Failed to save city');
      toast({
        title: t('pages:onboarding.city.errors.selectionFailed', 'City Selection Failed'),
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
        <SEO 
          title={t('pages:onboarding.city.seoTitle', 'Select Your City - Mundo Tango')} 
          description={t('pages:onboarding.city.seoDescription', 'Choose your city and join your local tango community')} 
        />
      
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
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-1">
              {t('pages:onboarding.city.step', 'Step 1 of 5')}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
              {t('pages:onboarding.city.title', 'Where Are You Based?')}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:onboarding.city.subtitle', 'Connect with your local tango community')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background">
        <div className="container mx-auto max-w-2xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-card p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">{t('pages:onboarding.city.cardTitle', 'Your City')}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('pages:onboarding.city.cardDescription', "We'll automatically connect you with your local tango community and nearby events")}
                </p>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="city" className="text-base font-medium">{t('pages:onboarding.city.searchLabel', 'Search for your city')}</Label>
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
                    placeholder={t('pages:onboarding.city.searchPlaceholder', 'Search for your city...')}
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
                  {t('common:buttons.back', 'Back')}
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
                      {t('common:buttons.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      {t('common:buttons.continue', 'Continue')}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="flex justify-center gap-2 mt-8">
              <div className="h-2 w-12 rounded-full bg-primary"></div>
              <div className="h-2 w-12 rounded-full bg-muted"></div>
              <div className="h-2 w-12 rounded-full bg-muted"></div>
              <div className="h-2 w-12 rounded-full bg-muted"></div>
              <div className="h-2 w-12 rounded-full bg-muted"></div>
            </div>
          </motion.div>
        </div>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
