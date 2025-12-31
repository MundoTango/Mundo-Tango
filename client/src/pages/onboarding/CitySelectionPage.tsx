import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, ChevronRight, Globe, Check, Plus } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { extractApiError } from "@/lib/apiErrorHandler";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import heroImage from "@assets/stock_images/global_world_map_con_854a9c2d.jpg";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SelectedCity {
  display_name: string;
  name: string;
  country: string;
}

interface CityScrapers {
  websites: Array<{ id: number; websiteUrl: string }>;
  scrapers: Array<{ id: number; name: string; platform: string; url: string }>;
}

export default function CitySelectionPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(['pages', 'common']);
  const [favoriteCities, setFavoriteCities] = useState<SelectedCity[]>([]);
  const [citySearch, setCitySearch] = useState("");
  const [favoriteSearch, setFavoriteSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<SelectedCity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newUrl, setNewUrl] = useState("");

  // Combine scrapers for all cities
  const { data: allScrapers, isLoading: isLoadingScrapers } = useQuery({
    queryKey: ["/api/cities", "multi-scrapers", selectedCity?.name, favoriteCities.map(c => c.name)],
    queryFn: async () => {
      const citiesToFetch = [];
      if (selectedCity) citiesToFetch.push(selectedCity);
      citiesToFetch.push(...favoriteCities);

      const results = await Promise.all(
        citiesToFetch.map(city => 
          fetch(`/api/cities/${encodeURIComponent(city.name)}/scrapers?country=${encodeURIComponent(city.country)}`)
            .then(res => res.json())
        )
      );

      return {
        websites: results.flatMap(r => r.websites || []),
        scrapers: results.flatMap(r => r.scrapers || [])
      };
    },
    enabled: !!selectedCity || favoriteCities.length > 0,
  });

  const suggestMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/cities/suggest-source", {
        city: selectedCity?.name,
        country: selectedCity?.country,
        websiteUrl: url,
      });
      return res.json();
    },
    onSuccess: (data, submittedUrl) => {
      const isAutoApproved = data?.verification?.autoApproved;
      let hostname = "the site";
      try {
        hostname = new URL(submittedUrl).hostname;
      } catch (e) { /* fallback to generic text */ }
      
      toast({
        title: isAutoApproved ? "Source added!" : "Submitted for review",
        description: isAutoApproved 
          ? `We'll start tracking events from ${hostname}`
          : "Thank you! Your suggestion has been sent for review.",
      });
      setNewUrl("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to submit suggestion",
      });
    }
  });

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
      
      // Update primary city
      await fetch("/api/users/me", {
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

      // Follow all cities
      const citiesToFollow = [selectedCity, ...favoriteCities];
      await Promise.all(citiesToFollow.map(async (city) => {
        const cityRes = await fetch(`/api/cities/search?q=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}`);
        const cityData = await cityRes.json();
        const cityId = cityData[0]?.id;
        
        if (cityId) {
          await fetch(`/api/cities/${cityId}/follow`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        }
      }));

      // Trigger effects for primary
      await fetch("/api/location/change-effects", {
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

      navigate("/onboarding/social");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save cities",
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
          title={t('pages:onboarding.city.seoTitle', 'Connect with Cities - Mundo Tango')} 
          description={t('pages:onboarding.city.seoDescription', 'Connect with your tango cities and join the local community')} 
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
              {t('pages:onboarding.city.step', 'Step 1 of 6')}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
              {t('pages:onboarding.city.title', 'Which cities do you connect with?')}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {t('pages:onboarding.city.subtitle', 'Follow your local and favorite tango communities')}
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
                  <h2 className="text-2xl font-serif font-bold">{t('pages:onboarding.city.cardTitle', 'Your Cities')}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('pages:onboarding.city.cardDescription', "We'll connect you with your primary community and any other cities you follow.")}
                </p>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="city" className="text-base font-semibold">
                    {t('pages:onboarding.city.searchLabel', 'Search for the city you connect with the most')}
                  </Label>
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
                    placeholder={t('pages:onboarding.city.searchPlaceholder', 'Primary city...')}
                  />

                  {selectedCity && selectedCity.name && (
                    <motion.div 
                      className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{selectedCity.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedCity.country}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base font-semibold">My other favorite cities</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <UnifiedLocationPicker
                        mode="city"
                        value={favoriteSearch}
                        onChange={(loc, coords, parsed) => {
                          if (parsed?.city && !favoriteCities.some(c => c.name === parsed.city)) {
                            setFavoriteCities([...favoriteCities, {
                              display_name: loc,
                              name: parsed.city,
                              country: parsed.country || ''
                            }]);
                          }
                          setFavoriteSearch("");
                        }}
                        placeholder="Search for other cities..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {favoriteCities.map((city, idx) => (
                      <Badge 
                        key={`${city.name}-${idx}`} 
                        variant="outline" 
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-muted/30"
                      >
                        <MapPin className="h-3 w-3" />
                        {city.name}
                        <button 
                          onClick={() => setFavoriteCities(favoriteCities.filter((_, i) => i !== idx))}
                          className="ml-1 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {(selectedCity || favoriteCities.length > 0) && (
                  <motion.div 
                    className="space-y-6 pt-6 border-t border-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Globe className="h-4 w-4 text-primary" />
                        {t('pages:onboarding.city.eventSite.help', 'Local Event Sources')}
                      </div>
                      
                      {isLoadingScrapers ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking for sources...
                        </div>
                      ) : allScrapers && (allScrapers.scrapers.length > 0 || allScrapers.websites.length > 0) ? (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Collected sources from all selected cities:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {allScrapers.scrapers.map((s) => (
                              <a 
                                key={`s-${s.id}`}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{s.url || "Source"}</span>
                              </a>
                            ))}
                            {allScrapers.websites.map((w) => (
                              <a 
                                key={`w-${w.id}`} 
                                href={w.websiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                              >
                                <Globe className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{w.websiteUrl || "Source"}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
                          <p className="text-sm text-muted-foreground italic">
                            No event sources found for these cities yet.
                          </p>
                        </div>
                      )}

                      <div className="pt-4 space-y-4">
                        <Label htmlFor="event-site-url" className="text-sm font-medium">
                          Know a local tango website we should track?
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="event-site-url"
                            type="url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="https://local-tango-site.com"
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => suggestMutation.mutate(newUrl)}
                            disabled={!newUrl || suggestMutation.isPending}
                          >
                            {suggestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            <span className="ml-2">Submit</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
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
              <div className="h-2 w-10 rounded-full bg-primary"></div>
              <div className="h-2 w-10 rounded-full bg-muted"></div>
              <div className="h-2 w-10 rounded-full bg-muted"></div>
              <div className="h-2 w-10 rounded-full bg-muted"></div>
              <div className="h-2 w-10 rounded-full bg-muted"></div>
              <div className="h-2 w-10 rounded-full bg-muted"></div>
            </div>
          </motion.div>
        </div>
      </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
