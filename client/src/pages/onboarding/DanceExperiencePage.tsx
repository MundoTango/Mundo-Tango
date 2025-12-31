import { useTranslation } from "react-i18next";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Sparkles, Check, Palette, Search, ChevronDown, X } from "lucide-react";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@assets/stock_images/elegant_professional_e4da136e.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Guitar,
  Brush,
  Globe,
  Coffee,
  Dog,
  Cat,
  Leaf,
  Sun,
  Moon,
  Tent,
  Sailboat,
  type LucideIcon
} from "lucide-react";

interface SubHobby {
  id: string;
  label: string;
}

interface HobbyCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  subcategories: SubHobby[];
}

interface HobbyCategoryConfig {
  id: string;
  icon: LucideIcon;
  color: string;
  subcategoryIds: string[];
}

const HOBBY_CATEGORY_CONFIG: HobbyCategoryConfig[] = [
  { id: "fitness", icon: Dumbbell, color: "#EF4444", subcategoryIds: ["fitness_gym", "fitness_running", "fitness_crossfit", "fitness_martial_arts", "fitness_tennis", "fitness_soccer", "fitness_basketball", "fitness_fencing"] },
  { id: "tech", icon: Globe, color: "#3B82F6", subcategoryIds: ["tech_coding", "tech_ai", "tech_crypto", "tech_gaming"] },
  { id: "spirituality", icon: Moon, color: "#8B5CF6", subcategoryIds: ["spirit_meditation", "spirit_astrology", "spirit_philosophy", "spirit_community"] },
  { id: "yoga", icon: Heart, color: "#8B5CF6", subcategoryIds: ["yoga_hatha", "yoga_vinyasa", "yoga_meditation", "yoga_pilates", "yoga_breathwork"] },
  { id: "music", icon: Music, color: "#3B82F6", subcategoryIds: ["music_listening", "music_concerts", "music_piano", "music_guitar", "music_singing", "music_dj", "music_production"] },
  { id: "photography", icon: Camera, color: "#F59E0B", subcategoryIds: ["photo_portrait", "photo_landscape", "photo_street", "photo_video", "photo_editing"] },
  { id: "art", icon: PaletteIcon, color: "#EC4899", subcategoryIds: ["art_painting", "art_drawing", "art_sculpture", "art_digital", "art_crafts", "art_pottery"] },
  { id: "reading", icon: BookOpen, color: "#10B981", subcategoryIds: ["reading_fiction", "reading_nonfiction", "reading_poetry", "reading_writing", "reading_journals"] },
  { id: "travel", icon: Plane, color: "#06B6D4", subcategoryIds: ["travel_backpacking", "travel_luxury", "travel_cultural", "travel_road_trips", "travel_solo"] },
  { id: "cooking", icon: UtensilsCrossed, color: "#F97316", subcategoryIds: ["cooking_home", "cooking_baking", "cooking_gourmet", "cooking_international", "cooking_healthy"] },
  { id: "wine", icon: Wine, color: "#7C3AED", subcategoryIds: ["wine_tasting", "wine_cocktails", "wine_coffee", "wine_tea", "wine_brewing"] },
  { id: "gaming", icon: Gamepad2, color: "#6366F1", subcategoryIds: ["gaming_video", "gaming_board", "gaming_card", "gaming_tabletop", "gaming_esports"] },
  { id: "outdoors", icon: Mountain, color: "#059669", subcategoryIds: ["outdoor_hiking", "outdoor_camping", "outdoor_climbing", "outdoor_fishing", "outdoor_kayaking", "outdoor_surfing"] },
  { id: "snow", icon: Sun, color: "#38BDF8", subcategoryIds: ["snow_skiing", "snow_snowboard", "snow_crosscountry", "snow_ice_skating", "snow_sledding", "snow_snowshoeing"] },
  { id: "cycling", icon: Bike, color: "#0EA5E9", subcategoryIds: ["cycling_road", "cycling_mountain", "cycling_urban", "cycling_touring"] },
  { id: "water", icon: Waves, color: "#0284C7", subcategoryIds: ["water_swimming", "water_scuba", "water_snorkel", "water_sailing", "water_paddleboard"] },
  { id: "nature", icon: TreePine, color: "#16A34A", subcategoryIds: ["nature_gardening", "nature_birdwatching", "nature_botany", "nature_wildlife"] },
  { id: "movies", icon: Film, color: "#DC2626", subcategoryIds: ["movies_cinema", "movies_tv", "movies_documentary", "movies_theater", "movies_standup"] },
  { id: "pets", icon: Dog, color: "#A855F7", subcategoryIds: ["pets_dogs", "pets_cats", "pets_exotic", "pets_horses", "pets_rescue"] },
  { id: "social", icon: Globe, color: "#CA8A04", subcategoryIds: ["social_volunteering", "social_meetups", "social_networking", "social_languages"] },
];

export default function DanceExperiencePage() {
  const { t } = useTranslation(["pages", "common"]);
  
  const HOBBIES_WITH_SUBCATEGORIES: HobbyCategory[] = useMemo(() => HOBBY_CATEGORY_CONFIG.map(config => ({
    id: config.id,
    label: t(`pages:onboarding.hobbies.categories.${config.id}.label`, config.id),
    icon: config.icon,
    color: config.color,
    subcategories: config.subcategoryIds.map(subId => ({
      id: subId,
      label: t(`pages:onboarding.hobbies.items.${subId}`, subId),
    })),
  })), [t]);
  const [, navigate] = useLocation();
  const { user, refreshCurrentUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.isOnboardingComplete) {
      navigate(user.waitlist ? "/onboarding/waitlist" : "/feed");
    }
  }, [user, navigate]);

  // Filter hobbies based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return HOBBIES_WITH_SUBCATEGORIES;
    
    const query = searchQuery.toLowerCase();
    return HOBBIES_WITH_SUBCATEGORIES.map(category => {
      const matchingSubcategories = category.subcategories.filter(
        sub => sub.label.toLowerCase().includes(query)
      );
      const categoryMatches = category.label.toLowerCase().includes(query);
      
      if (categoryMatches) {
        return category;
      }
      if (matchingSubcategories.length > 0) {
        return { ...category, subcategories: matchingSubcategories };
      }
      return null;
    }).filter(Boolean) as HobbyCategory[];
  }, [searchQuery]);

  // Auto-expand categories that match search
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingCategoryIds = filteredCategories.map(c => c.id);
      setExpandedCategories(matchingCategoryIds);
    }
  }, [searchQuery, filteredCategories]);

  const toggleSubHobby = (subHobbyId: string) => {
    if (selectedHobbies.includes(subHobbyId)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== subHobbyId));
    } else {
      setSelectedHobbies([...selectedHobbies, subHobbyId]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const category = HOBBIES_WITH_SUBCATEGORIES.find(c => c.id === categoryId);
    if (!category) return;
    
    const allSubIds = category.subcategories.map(s => s.id);
    const allSelected = allSubIds.every(id => selectedHobbies.includes(id));
    
    if (allSelected) {
      setSelectedHobbies(selectedHobbies.filter(h => !allSubIds.includes(h)));
    } else {
      const newSelected = [...selectedHobbies];
      allSubIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      setSelectedHobbies(newSelected);
    }
  };

  const getCategorySelectionCount = (categoryId: string): number => {
    const category = HOBBIES_WITH_SUBCATEGORIES.find(c => c.id === categoryId);
    if (!category) return 0;
    return category.subcategories.filter(s => selectedHobbies.includes(s.id)).length;
  };

  const getSelectedLabels = (): { category: string; label: string; id: string; color: string }[] => {
    const result: { category: string; label: string; id: string; color: string }[] = [];
    HOBBIES_WITH_SUBCATEGORIES.forEach(category => {
      category.subcategories.forEach(sub => {
        if (selectedHobbies.includes(sub.id)) {
          result.push({
            category: category.label,
            label: sub.label,
            id: sub.id,
            color: category.color
          });
        }
      });
    });
    return result;
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
          title: t('pages:onboarding.hobbies.success.waitlistTitle', "You're on the list!"),
          description: t('pages:onboarding.hobbies.success.waitlistDesc', "We'll notify you when your account is ready."),
        });
        setTimeout(() => {
          navigate("/onboarding/waitlist");
        }, 1500);
      } else {
        toast({
          title: t('pages:onboarding.hobbies.success.completeTitle', 'Welcome to Mundo Tango!'),
          description: t('pages:onboarding.hobbies.success.completeDesc', "Your profile is complete. Let's explore!"),
        });
        navigate("/feed");
      }
    } catch (error) {
      toast({
        title: t('common:errors.error', 'Error'),
        description: t('pages:onboarding.hobbies.errors.saveFailed', 'Failed to save. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SelfHealingErrorBoundary pageName="OtherHobbies" fallbackRoute="/">
      <PageLayout title={t('pages:onboarding.hobbies.pageTitle', 'OtherHobbies')} showBreadcrumbs>
        <>
          <SEO title={t('pages:onboarding.hobbies.seoTitle', 'Your Hobbies - Mundo Tango')} description={t('pages:onboarding.hobbies.seoDescription', 'Tell us about your other interests')} />
          
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
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-step-6">
                  {t('pages:onboarding.hobbies.step', 'Step 6 of 6 - Final Step!')}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6">
                  {t('pages:onboarding.hobbies.title', 'What Else Do You Love?')}
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:onboarding.hobbies.subtitle', 'Beyond tango, what are your other passions?')}
                </p>
              </motion.div>
            </div>
          </div>

          <div className="bg-background">
            <div className="container mx-auto max-w-4xl px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="bg-card p-8 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Palette className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-serif font-bold">Communities</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      What other communities do you belong to that you are as or more passionate than tango?
                    </p>
                  </CardHeader>

                  <CardContent className="p-8 space-y-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t('pages:onboarding.hobbies.searchPlaceholder', 'Search communities or add a new one...')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                          data-testid="input-hobby-search"
                        />
                      </div>
                      {searchQuery && !filteredCategories.some(c => c.subcategories.some(s => s.label.toLowerCase() === searchQuery.toLowerCase())) && (
                        <Button 
                          onClick={() => {
                            const newId = `custom_${searchQuery.toLowerCase().replace(/\s+/g, '_')}`;
                            toggleSubHobby(newId);
                            setSearchQuery("");
                          }}
                          className="shrink-0"
                        >
                          Add "{searchQuery}"
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCategories.map((category) => {
                        const IconComponent = category.icon;
                        const selectionCount = getCategorySelectionCount(category.id);
                        
                        return (
                          <div 
                            key={category.id}
                            className="group relative h-64 rounded-2xl border bg-card overflow-hidden transition-all cursor-default shadow-sm hover:shadow-xl"
                          >
                            {/* Static content */}
                            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center group-hover:opacity-0 transition-all duration-500 ease-in-out">
                              <div 
                                className="p-6 rounded-3xl mb-6 transform group-hover:scale-110 transition-transform duration-500" 
                                style={{ backgroundColor: `${category.color}15` }}
                              >
                                <IconComponent 
                                  className="h-12 w-12" 
                                  style={{ color: category.color }} 
                                />
                              </div>
                              <h3 className="text-2xl font-bold font-serif tracking-tight">{category.label}</h3>
                              {selectionCount > 0 && (
                                <Badge 
                                  className="mt-4 px-3 py-1 text-sm font-medium"
                                  style={{ backgroundColor: category.color }}
                                >
                                  {selectionCount} selected
                                </Badge>
                              )}
                            </div>

                            {/* Hover reveal content */}
                            <div className="absolute inset-0 p-6 bg-background/98 backdrop-blur-xl translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-in-out overflow-y-auto border-t-4" style={{ borderTopColor: category.color }}>
                              <div className="flex items-center justify-between mb-4 border-b pb-2">
                                <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">{category.label}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 px-2 text-[11px] font-bold hover:bg-muted"
                                  onClick={() => toggleCategory(category.id)}
                                >
                                  Select All
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {category.subcategories.map((sub) => {
                                  const isSelected = selectedHobbies.includes(sub.id);
                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => toggleSubHobby(sub.id)}
                                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                        isSelected 
                                          ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                                          : "bg-muted/30 hover:bg-muted/60 border-transparent hover:border-muted-foreground/20"
                                      }`}
                                    >
                                      {sub.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                            <AnimatePresence>
                              {selectedHobbies.length > 0 && (
                                <motion.div 
                                  className="border-t pt-6"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                >
                          <p className="text-sm font-medium mb-3">{t('pages:onboarding.hobbies.selectedCount', 'Selected hobbies ({{count}}):', { count: selectedHobbies.length })}</p>
                          <div className="flex flex-wrap gap-2">
                            {getSelectedLabels().map((item) => (
                              <Badge 
                                key={item.id} 
                                variant="secondary" 
                                className="gap-1.5 py-1.5 px-3 cursor-pointer hover-elevate"
                                onClick={() => toggleSubHobby(item.id)}
                              >
                                <span>{item.label}</span>
                                <X className="h-3 w-3 text-muted-foreground" />
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        {t('pages:onboarding.hobbies.helpText', 'This helps you connect with dancers who share similar interests outside of tango. You can skip this step or update your hobbies anytime from your profile.')}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="bg-muted/30 p-6 flex flex-wrap justify-between gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/onboarding/languages")}
                      data-testid="button-back"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {t('common:buttons.back', 'Back')}
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
                          {t('pages:onboarding.hobbies.finishing', 'Finishing...')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          {t('pages:onboarding.hobbies.completeSetup', 'Complete Setup')}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>

                <div className="flex justify-center gap-2 mt-8">
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                  <div className="h-2 w-10 rounded-full bg-primary"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
