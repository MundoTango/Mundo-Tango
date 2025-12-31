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

const HOBBIES_WITH_SUBCATEGORIES: HobbyCategory[] = [
  { 
    id: "fitness", 
    label: "Fitness & Sports", 
    icon: Dumbbell, 
    color: "#EF4444",
    subcategories: [
      { id: "fitness_gym", label: "Gym & Weights" },
      { id: "fitness_running", label: "Running" },
      { id: "fitness_crossfit", label: "CrossFit" },
      { id: "fitness_martial_arts", label: "Martial Arts" },
      { id: "fitness_tennis", label: "Tennis" },
      { id: "fitness_soccer", label: "Soccer/Football" },
      { id: "fitness_basketball", label: "Basketball" },
      { id: "fitness_fencing", label: "Fencing" },
    ]
  },
  {
    id: "tech",
    label: "Tech & Innovation",
    icon: Globe,
    color: "#3B82F6",
    subcategories: [
      { id: "tech_coding", label: "Coding & Dev" },
      { id: "tech_ai", label: "AI & Future Tech" },
      { id: "tech_crypto", label: "Web3 & Crypto" },
      { id: "tech_gaming", label: "Gaming Culture" },
    ]
  },
  {
    id: "spirituality",
    label: "Spirituality & Growth",
    icon: Moon,
    color: "#8B5CF6",
    subcategories: [
      { id: "spirit_meditation", label: "Meditation" },
      { id: "spirit_astrology", label: "Astrology" },
      { id: "spirit_philosophy", label: "Philosophy" },
      { id: "spirit_community", label: "Community Building" },
    ]
  },
  { 
    id: "yoga", 
    label: "Yoga & Wellness", 
    icon: Heart, 
    color: "#8B5CF6",
    subcategories: [
      { id: "yoga_hatha", label: "Hatha Yoga" },
      { id: "yoga_vinyasa", label: "Vinyasa Flow" },
      { id: "yoga_meditation", label: "Meditation" },
      { id: "yoga_pilates", label: "Pilates" },
      { id: "yoga_breathwork", label: "Breathwork" },
    ]
  },
  { 
    id: "music", 
    label: "Music", 
    icon: Music, 
    color: "#3B82F6",
    subcategories: [
      { id: "music_listening", label: "Music Listening" },
      { id: "music_concerts", label: "Live Concerts" },
      { id: "music_piano", label: "Piano" },
      { id: "music_guitar", label: "Guitar" },
      { id: "music_singing", label: "Singing" },
      { id: "music_dj", label: "DJing" },
      { id: "music_production", label: "Music Production" },
    ]
  },
  { 
    id: "photography", 
    label: "Photography & Video", 
    icon: Camera, 
    color: "#F59E0B",
    subcategories: [
      { id: "photo_portrait", label: "Portrait Photography" },
      { id: "photo_landscape", label: "Landscape Photography" },
      { id: "photo_street", label: "Street Photography" },
      { id: "photo_video", label: "Videography" },
      { id: "photo_editing", label: "Photo Editing" },
    ]
  },
  { 
    id: "art", 
    label: "Art & Creativity", 
    icon: PaletteIcon, 
    color: "#EC4899",
    subcategories: [
      { id: "art_painting", label: "Painting" },
      { id: "art_drawing", label: "Drawing" },
      { id: "art_sculpture", label: "Sculpture" },
      { id: "art_digital", label: "Digital Art" },
      { id: "art_crafts", label: "Crafts & DIY" },
      { id: "art_pottery", label: "Pottery" },
    ]
  },
  { 
    id: "reading", 
    label: "Reading & Writing", 
    icon: BookOpen, 
    color: "#10B981",
    subcategories: [
      { id: "reading_fiction", label: "Fiction" },
      { id: "reading_nonfiction", label: "Non-Fiction" },
      { id: "reading_poetry", label: "Poetry" },
      { id: "reading_writing", label: "Creative Writing" },
      { id: "reading_journals", label: "Journaling" },
    ]
  },
  { 
    id: "travel", 
    label: "Travel & Adventure", 
    icon: Plane, 
    color: "#06B6D4",
    subcategories: [
      { id: "travel_backpacking", label: "Backpacking" },
      { id: "travel_luxury", label: "Luxury Travel" },
      { id: "travel_cultural", label: "Cultural Tourism" },
      { id: "travel_road_trips", label: "Road Trips" },
      { id: "travel_solo", label: "Solo Travel" },
    ]
  },
  { 
    id: "cooking", 
    label: "Cooking & Food", 
    icon: UtensilsCrossed, 
    color: "#F97316",
    subcategories: [
      { id: "cooking_home", label: "Home Cooking" },
      { id: "cooking_baking", label: "Baking" },
      { id: "cooking_gourmet", label: "Gourmet Cuisine" },
      { id: "cooking_international", label: "International Cuisine" },
      { id: "cooking_healthy", label: "Healthy Eating" },
    ]
  },
  { 
    id: "wine", 
    label: "Wine & Beverages", 
    icon: Wine, 
    color: "#7C3AED",
    subcategories: [
      { id: "wine_tasting", label: "Wine Tasting" },
      { id: "wine_cocktails", label: "Cocktails" },
      { id: "wine_coffee", label: "Coffee Appreciation" },
      { id: "wine_tea", label: "Tea Culture" },
      { id: "wine_brewing", label: "Home Brewing" },
    ]
  },
  { 
    id: "gaming", 
    label: "Gaming", 
    icon: Gamepad2, 
    color: "#6366F1",
    subcategories: [
      { id: "gaming_video", label: "Video Games" },
      { id: "gaming_board", label: "Board Games" },
      { id: "gaming_card", label: "Card Games" },
      { id: "gaming_tabletop", label: "Tabletop RPGs" },
      { id: "gaming_esports", label: "eSports" },
    ]
  },
  { 
    id: "outdoors", 
    label: "Outdoor Activities", 
    icon: Mountain, 
    color: "#059669",
    subcategories: [
      { id: "outdoor_hiking", label: "Hiking" },
      { id: "outdoor_camping", label: "Camping" },
      { id: "outdoor_climbing", label: "Rock Climbing" },
      { id: "outdoor_fishing", label: "Fishing" },
      { id: "outdoor_kayaking", label: "Kayaking" },
      { id: "outdoor_surfing", label: "Surfing" },
    ]
  },
  { 
    id: "snow", 
    label: "Snow Sports", 
    icon: Sun, 
    color: "#38BDF8",
    subcategories: [
      { id: "snow_skiing", label: "Skiing" },
      { id: "snow_snowboard", label: "Snowboarding" },
      { id: "snow_crosscountry", label: "Cross-Country Skiing" },
      { id: "snow_ice_skating", label: "Ice Skating" },
      { id: "snow_sledding", label: "Sledding" },
      { id: "snow_snowshoeing", label: "Snowshoeing" },
    ]
  },
  { 
    id: "cycling", 
    label: "Cycling", 
    icon: Bike, 
    color: "#0EA5E9",
    subcategories: [
      { id: "cycling_road", label: "Road Cycling" },
      { id: "cycling_mountain", label: "Mountain Biking" },
      { id: "cycling_urban", label: "Urban Cycling" },
      { id: "cycling_touring", label: "Bike Touring" },
    ]
  },
  { 
    id: "water", 
    label: "Water Sports", 
    icon: Waves, 
    color: "#0284C7",
    subcategories: [
      { id: "water_swimming", label: "Swimming" },
      { id: "water_scuba", label: "Scuba Diving" },
      { id: "water_snorkel", label: "Snorkeling" },
      { id: "water_sailing", label: "Sailing" },
      { id: "water_paddleboard", label: "Paddleboarding" },
    ]
  },
  { 
    id: "nature", 
    label: "Nature & Gardening", 
    icon: TreePine, 
    color: "#16A34A",
    subcategories: [
      { id: "nature_gardening", label: "Gardening" },
      { id: "nature_birdwatching", label: "Bird Watching" },
      { id: "nature_botany", label: "Plant Collecting" },
      { id: "nature_wildlife", label: "Wildlife Photography" },
    ]
  },
  { 
    id: "movies", 
    label: "Movies & Entertainment", 
    icon: Film, 
    color: "#DC2626",
    subcategories: [
      { id: "movies_cinema", label: "Cinema" },
      { id: "movies_tv", label: "TV Series" },
      { id: "movies_documentary", label: "Documentaries" },
      { id: "movies_theater", label: "Theater" },
      { id: "movies_standup", label: "Stand-up Comedy" },
    ]
  },
  { 
    id: "pets", 
    label: "Pets & Animals", 
    icon: Dog, 
    color: "#A855F7",
    subcategories: [
      { id: "pets_dogs", label: "Dogs" },
      { id: "pets_cats", label: "Cats" },
      { id: "pets_exotic", label: "Exotic Pets" },
      { id: "pets_horses", label: "Horse Riding" },
      { id: "pets_rescue", label: "Animal Rescue" },
    ]
  },
  { 
    id: "social", 
    label: "Social & Community", 
    icon: Globe, 
    color: "#CA8A04",
    subcategories: [
      { id: "social_volunteering", label: "Volunteering" },
      { id: "social_meetups", label: "Meetups" },
      { id: "social_networking", label: "Networking" },
      { id: "social_languages", label: "Language Exchange" },
    ]
  },
];

export default function DanceExperiencePage() {
  const { t } = useTranslation(["pages", "common"]);
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
                          placeholder="Search communities or add a new one..."
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
