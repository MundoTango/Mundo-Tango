import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, Search, MapPin, TrendingUp, Award, Heart, Activity, Filter, X, Globe, Star, MessageCircle, UserPlus, Calendar as CalendarIcon, Home, Building2, ChevronRight, Sparkles } from "lucide-react";
import type { SelectGroup } from "@shared/client-types";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupCreationModal } from "@/components/groups/GroupCreationModal";
import { GroupCategoryFilter } from "@/components/groups/GroupCategoryFilter";
import { useAuth } from "@/contexts/AuthContext";
import { getCityImageUrl } from "@/lib/cityImageMap";

// Health score calculation (mock)
const calculateHealthScore = (group: SelectGroup): number => {
  const memberScore = Math.min((group.memberCount || 0) / 10, 40);
  const activityScore = 30; // Mock activity level
  const engagementScore = 30; // Mock engagement
  return Math.round(memberScore + activityScore + engagementScore);
};

// Distance calculation (mock)
const calculateDistance = (city: string | null): number => {
  // Mock distance calculation
  return Math.floor(Math.random() * 500) + 10;
};

export default function GroupsPage() {
  const { t } = useTranslation(['pages', 'common']);
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-groups");
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    minMembers: 0,
    minHealthScore: 0,
    location: 'all',
    activityLevel: 'all',
    sortBy: 'featured'
  });

  const { data: groups, isLoading } = useQuery<SelectGroup[]>({
    queryKey: ["/api/groups"],
  });

  // Fetch user's actual group memberships with location awareness
  interface EnhancedGroupData {
    groups: Array<{
      group: SelectGroup;
      membership: { role: string; status: string; joinedAt: string };
      memberCount: number;
      eventCount: number;
      locationCategory: 'current' | 'previous' | 'professional' | 'other';
      locationBadge: string | null;
    }>;
    userProfile: {
      currentCity: string | null;
      currentCountry: string | null;
      tangoRoles: string[];
    };
    locationHistory: Array<{
      id: number;
      city: string;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
    }>;
  }

  const { data: myGroupsData, isLoading: isLoadingMyGroups } = useQuery<EnhancedGroupData>({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });

  // Calculate health scores and distances
  const enrichedGroups = useMemo(() => {
    return (groups || []).map(item => ({
      ...item.group,
      healthScore: calculateHealthScore(item.group),
      distance: calculateDistance(item.group.city),
      isFeatured: (item.group.memberCount || 0) > 20 && calculateHealthScore(item.group) > 70
    }));
  }, [groups]);

  // Apply filters and search FIRST (so cityGroups/professionalGroups can use it)
  const filteredGroups = useMemo(() => {
    let result = enrichedGroups.filter(group => {
      const matchesSearch = !searchQuery || 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilters =
        (group.memberCount || 0) >= filters.minMembers &&
        group.healthScore >= filters.minHealthScore;

      return matchesSearch && matchesFilters;
    });

    // Sort
    if (filters.sortBy === 'featured') {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } else if (filters.sortBy === 'members') {
      result.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    } else if (filters.sortBy === 'health') {
      result.sort((a, b) => b.healthScore - a.healthScore);
    } else if (filters.sortBy === 'nearby') {
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [enrichedGroups, searchQuery, filters]);

  // Separate City and Professional groups (from filtered results so search works)
  const cityGroups = useMemo(() => {
    return filteredGroups.filter(g => g.type === "city");
  }, [filteredGroups]);

  const professionalGroups = useMemo(() => {
    return filteredGroups.filter(g => g.type === "professional" || g.type === "role");
  }, [filteredGroups]);

  // My Groups - organized by location relevance (current city, previous cities, professional, other)
  const myGroups = useMemo(() => {
    if (!user || !myGroupsData?.groups) return [];
    return myGroupsData.groups.map(item => ({
      ...item.group,
      healthScore: calculateHealthScore(item.group),
      distance: calculateDistance(item.group.city),
      isFeatured: (item.memberCount || 0) > 20,
      memberCount: item.memberCount,
      eventCount: item.eventCount,
      membership: item.membership,
      locationCategory: item.locationCategory,
      locationBadge: item.locationBadge,
    }));
  }, [myGroupsData, user]);

  // Group myGroups by location category for organized display
  const groupedMyGroups = useMemo(() => {
    const current = myGroups.filter(g => g.locationCategory === 'current');
    const previous = myGroups.filter(g => g.locationCategory === 'previous');
    const professional = myGroups.filter(g => g.locationCategory === 'professional');
    const other = myGroups.filter(g => g.locationCategory === 'other');
    return { current, previous, professional, other };
  }, [myGroups]);

  // Featured groups (algorithm-selected)
  const featuredGroups = useMemo(() => {
    return enrichedGroups
      .filter(g => g.isFeatured)
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, 3);
  }, [enrichedGroups]);

  // Popular near you (location-based)
  const nearbyGroups = useMemo(() => {
    return enrichedGroups
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  }, [enrichedGroups]);

  // City rankings
  const cityRankings = useMemo(() => {
    const cityMap = new Map<string, { members: number; events: number; groups: number }>();
    
    enrichedGroups.forEach(group => {
      const city = group.city || "Other";
      const current = cityMap.get(city) || { members: 0, events: 0, groups: 0 };
      cityMap.set(city, {
        members: current.members + (group.memberCount || 0),
        events: current.events + Math.floor(Math.random() * 20), // Mock events
        groups: current.groups + 1
      });
    });

    return Array.from(cityMap.entries())
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.members - a.members)
      .slice(0, 5);
  }, [enrichedGroups]);

  // Check if user is a member of a group
  const isMemberOfGroup = (groupId: number): boolean => {
    return myGroups.some(g => g.id === groupId);
  };

  // Render City Group Card with editorial design
  const renderCityCard = (group: SelectGroup & { healthScore: number; distance: number }) => {
    const isMember = isMemberOfGroup(group.id);
    
    return (
      <motion.div
        key={group.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
      >
        <Card className="overflow-hidden hover-elevate h-full">
          {/* Cityscape Image - 16:9 */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <motion.img
              src={group.coverImage || getCityImageUrl(group.city)}
              alt={group.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-serif font-bold mb-1">{group.name}</h3>
              <p className="text-sm text-white/80">{group.city}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
            
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                <Users className="w-4 h-4 text-cyan-500" />
                <div className="font-semibold text-center">{(group.memberCount || 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground text-center">{t('pages:groups.cardLabels.members', 'Members')}</div>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                <CalendarIcon className="w-4 h-4 text-blue-500" />
                <div className="font-semibold text-center">{group.eventCount || 0}</div>
                <div className="text-xs text-muted-foreground text-center">{t('pages:groups.cardLabels.events', 'Events')}</div>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <div className="font-semibold text-center">{group.recommendationCount || 0}</div>
                <div className="text-xs text-muted-foreground text-center">{t('pages:groups.cardLabels.recs', 'Recs')}</div>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-muted/50 rounded-lg">
                <Home className="w-4 h-4 text-amber-500" />
                <div className="font-semibold text-center">{group.housingCount || 0}</div>
                <div className="text-xs text-muted-foreground text-center">{t('pages:groups.cardLabels.housing', 'Housing')}</div>
              </div>
            </div>

            <Link href={`/groups/${group.id}`} className="w-full">
              <Button className="w-full gap-2" data-testid={`button-view-group-${group.id}`}>
                <ChevronRight className="w-4 h-4" />
                {isMember ? t('pages:groups.viewDetails', 'View Details') : t('pages:groups.join', 'Join')}
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Render Professional Group Card with editorial design
  const renderProCard = (group: SelectGroup & { healthScore: number; distance: number; isFeatured: boolean }) => {
    const isMember = isMemberOfGroup(group.id);
    
    return (
      <motion.article
        key={group.id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="group mb-12"
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8">
          <motion.img
            src={group.coverImage || getCityImageUrl(group.city)}
            alt={group.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {t('pages:groups.professional', 'Professional')}
              </Badge>
              {group.isFeatured && (
                <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-white" />
                  <span>{t('pages:groups.featured', 'Featured')}</span>
                </div>
              )}
            </div>
            <h2 className="text-3xl font-serif font-bold">{group.name}</h2>
          </div>
        </div>

        <div className="space-y-6 px-2">
          <p className="text-lg leading-relaxed text-foreground/90">
            {group.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold">{(group.memberCount || 0).toLocaleString()}</span>
              <span className="text-muted-foreground">{t('pages:groups.members', 'members')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-500" />
              <span className="font-semibold">{group.city || "Global"}</span>
            </div>
          </div>

          <Link href={`/groups/${group.id}`}>
            <Button size="lg" className="gap-2" data-testid={`button-view-group-${group.id}`}>
              <ChevronRight className="w-5 h-5" />
              {isMember ? t('pages:groups.viewDetails', 'View Details') : t('pages:groups.joinCommunity', 'Join Community')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <Separator className="mt-12" />
      </motion.article>
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Groups" fallbackRoute="/feed">
      <PageLayout title="Tango Groups" showBreadcrumbs>
        <>
          <SEO 
            title={t('pages:groups.seoTitle', 'Tango Groups - Global Communities')}
            description={t('pages:groups.seoDescription', 'Connect with tango communities worldwide. Join city groups, professional networks, and build lasting friendships in the global tango community.')}
          />

          {/* Hero Section */}
          <div className="relative h-[50vh] w-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=2000&auto=format&fit=crop&q=80')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="max-w-4xl"
              >
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  {t('pages:groups.badge', 'Global Tango Communities')}
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  {t('pages:groups.heroTitle', 'Find Your Community')}
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  {t('pages:groups.heroSubtitle', 'Connect with local dancers, join professional networks, and build lasting friendships worldwide')}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-12">
              <div className="flex gap-12">
                {/* Main Column */}
                <div className="flex-1 max-w-5xl">
                  {/* Search */}
                  <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('pages:groups.searchPlaceholder', 'Search groups, cities, interests...')}
                      className="pl-12 h-12 text-base"
                      data-testid="input-search-groups"
                    />
                  </div>

                  {/* Tabs Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                      <TabsTrigger value="my-groups" className="text-base">
                        <Star className="w-4 h-4 mr-2" />
                        {t('pages:groups.tabs.myGroups', 'My Groups')}
                      </TabsTrigger>
                      <TabsTrigger value="cities" className="text-base">
                        <Building2 className="w-4 h-4 mr-2" />
                        {t('pages:groups.tabs.cities', 'Cities')}
                      </TabsTrigger>
                      <TabsTrigger value="professional" className="text-base">
                        <Globe className="w-4 h-4 mr-2" />
                        {t('pages:groups.tabs.professional', 'Professional')}
                      </TabsTrigger>
                    </TabsList>

                    {/* MY GROUPS Tab - Organized by Location */}
                    <TabsContent value="my-groups" className="space-y-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-3xl font-serif font-bold">{t('pages:groups.myGroupsTitle', 'My Groups')}</h2>
                          <p className="text-muted-foreground mt-2">
                            {t('pages:groups.myGroupsDescription', 'Organized by your current city, tango history, and professional roles')}
                          </p>
                        </div>
                      </div>

                      {isLoadingMyGroups ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full" />
                          ))}
                        </div>
                      ) : myGroups.length > 0 ? (
                        <div className="space-y-10">
                          {/* Current City Groups */}
                          {groupedMyGroups.current.length > 0 && (
                            <section>
                              <div className="flex items-center gap-2 mb-4">
                                <Home className="w-5 h-5 text-primary" />
                                <h3 className="text-xl font-semibold">{t('pages:groups.sections.currentCity', 'Current City')}</h3>
                                <Badge variant="default" className="ml-2">
                                  {myGroupsData?.userProfile?.currentCity || 'Your City'}
                                </Badge>
                              </div>
                              <div className="grid md:grid-cols-2 gap-6">
                                {groupedMyGroups.current.map((group) => (
                                  <div key={group.id} className="relative">
                                    {renderCityCard(group)}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Previous Cities Groups */}
                          {groupedMyGroups.previous.length > 0 && (
                            <section>
                              <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-cyan-500" />
                                <h3 className="text-xl font-semibold">{t('pages:groups.sections.previousCities', 'Previous Tango Cities')}</h3>
                              </div>
                              <div className="grid md:grid-cols-2 gap-6">
                                {groupedMyGroups.previous.map((group) => (
                                  <div key={group.id} className="relative">
                                    {group.locationBadge && (
                                      <Badge 
                                        variant="secondary" 
                                        className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm"
                                      >
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        {group.locationBadge}
                                      </Badge>
                                    )}
                                    {renderCityCard(group)}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Professional Groups */}
                          {groupedMyGroups.professional.length > 0 && (
                            <section>
                              <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-purple-500" />
                                <h3 className="text-xl font-semibold">{t('pages:groups.sections.professionalNetworks', 'Your Professional Networks')}</h3>
                              </div>
                              <div className="grid md:grid-cols-2 gap-6">
                                {groupedMyGroups.professional.map((group) => (
                                  <div key={group.id} className="relative">
                                    {group.locationBadge && (
                                      <Badge 
                                        variant="outline" 
                                        className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm border-purple-500/50"
                                      >
                                        {group.locationBadge}
                                      </Badge>
                                    )}
                                    {renderCityCard(group)}
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {/* Other Groups */}
                          {groupedMyGroups.other.length > 0 && (
                            <section>
                              <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-xl font-semibold">{t('pages:groups.sections.otherGroups', 'Other Groups')}</h3>
                              </div>
                              <div className="grid md:grid-cols-2 gap-6">
                                {groupedMyGroups.other.map((group) => renderCityCard(group))}
                              </div>
                            </section>
                          )}
                        </div>
                      ) : (
                        <Card className="p-8 text-center border-dashed">
                          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">{t('pages:groups.joinMore', 'Join More Communities')}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t('pages:groups.joinMoreDescription', 'Explore Cities and Professional groups to expand your network')}
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => setActiveTab("cities")}>
                              {t('pages:groups.browseCities', 'Browse Cities')}
                            </Button>
                            <Button onClick={() => setActiveTab("professional")}>
                              {t('pages:groups.professionalGroups', 'Professional Groups')}
                            </Button>
                          </div>
                        </Card>
                      )}
                    </TabsContent>

                    {/* CITIES Tab */}
                    <TabsContent value="cities" className="space-y-8">
                      <div className="mb-6">
                        <h2 className="text-3xl font-serif font-bold">{t('pages:groups.tangoCitiesTitle', 'Tango Cities Worldwide')}</h2>
                        <p className="text-muted-foreground mt-2">
                          {t('pages:groups.tangoCitiesDescription', 'Connect with dancers in cities around the globe')}
                        </p>
                      </div>

                      {isLoading ? (
                        <div className="grid grid-cols-2 gap-6">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-96 w-full" />
                          ))}
                        </div>
                      ) : cityGroups.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6">
                          {cityGroups.map((group) => renderCityCard(group))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center">
                          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">{t('pages:groups.noCityGroups', 'No City Groups Yet')}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t('pages:groups.noCityGroupsDescription', "City groups will appear here as they're created")}
                          </p>
                        </Card>
                      )}
                    </TabsContent>

                    {/* PROFESSIONAL Tab */}
                    <TabsContent value="professional" className="space-y-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-3xl font-serif font-bold">{t('pages:groups.professionalTitle', 'Professional Communities')}</h2>
                          <p className="text-muted-foreground mt-2">
                            {t('pages:groups.professionalDescription', 'Networks for teachers, DJs, organizers, and performers')}
                          </p>
                        </div>
                        <Button className="gap-2" onClick={() => setIsCreating(true)}>
                          <Plus className="w-4 h-4" />
                          {t('pages:groups.requestNewGroup', 'Request New Group')}
                        </Button>
                      </div>

                      {isLoading ? (
                        <div className="space-y-12">
                          {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-96 w-full" />
                          ))}
                        </div>
                      ) : professionalGroups.length > 0 ? (
                        <div className="space-y-12">
                          {professionalGroups.map((group) => renderProCard(group))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center">
                          <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">{t('pages:groups.noProGroups', 'No Professional Groups Yet')}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {t('pages:groups.noProGroupsDescription', 'Professional communities will appear here')}
                          </p>
                          <Button onClick={() => setIsCreating(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('pages:groups.createFirstGroup', 'Create First Group')}
                          </Button>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar */}
                <div className="w-96 space-y-6 sticky top-8 self-start hidden lg:block">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">{t('pages:groups.quickStats', 'Quick Stats')}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('pages:groups.stats.totalGroups', 'Total Groups')}</span>
                        <span className="font-bold">{enrichedGroups.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('pages:groups.stats.cityGroups', 'City Groups')}</span>
                        <span className="font-bold">{cityGroups.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('pages:groups.stats.professional', 'Professional')}</span>
                        <span className="font-bold">{professionalGroups.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('pages:groups.stats.myGroups', 'My Groups')}</span>
                        <span className="font-bold">{myGroups.length}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Create Group CTA */}
                  {!isCreating && (
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                      <h3 className="font-semibold mb-2">{t('pages:groups.startCommunity', 'Start a Community')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('pages:groups.startCommunityDescription', 'Create your own group and bring dancers together')}
                      </p>
                      <Button className="w-full" onClick={() => setIsCreating(true)} data-testid="button-create-group">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('pages:groups.createGroup', 'Create Group')}
                      </Button>
                    </Card>
                  )}
                </div>
              </div>
            </div>

            {/* Create Group Modal */}
            <GroupCreationModal open={isCreating} onOpenChange={setIsCreating} />
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
