import { useState, useMemo } from "react";
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
import { Users, Plus, Search, MapPin, TrendingUp, Award, Heart, Activity, Filter, X, Globe, Star, MessageCircle, UserPlus, Calendar, Home, Building2, ChevronRight } from "lucide-react";
import type { SelectGroup } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupCreationModal } from "@/components/groups/GroupCreationModal";
import { GroupCategoryFilter } from "@/components/groups/GroupCategoryFilter";
import { useAuth } from "@/contexts/AuthContext";

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

  // Calculate health scores and distances
  const enrichedGroups = useMemo(() => {
    return (groups || []).map(group => ({
      ...group,
      healthScore: calculateHealthScore(group),
      distance: calculateDistance(group.city),
      isFeatured: (group.memberCount || 0) > 20 && calculateHealthScore(group) > 70
    }));
  }, [groups]);

  // Separate City and Professional groups
  const cityGroups = useMemo(() => {
    return enrichedGroups.filter(g => g.type === "city");
  }, [enrichedGroups]);

  const professionalGroups = useMemo(() => {
    return enrichedGroups.filter(g => g.type === "professional");
  }, [enrichedGroups]);

  // My Groups - automatically joined based on user's city/role
  const myGroups = useMemo(() => {
    if (!user) return [];
    return enrichedGroups.filter(g => {
      // City match
      if (g.type === "city" && g.city === user.city) return true;
      // Professional role match (mock - would need user.tangoRoles)
      if (g.type === "professional") return false; // Add logic when tangoRoles available
      return false;
    });
  }, [enrichedGroups, user]);

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

  // Apply filters
  const filteredGroups = useMemo(() => {
    let result = enrichedGroups.filter(group => {
      const matchesSearch = !searchQuery || 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  // Render City Group Card with editorial design
  const renderCityCard = (group: SelectGroup & { healthScore: number; distance: number }) => (
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
            src={group.coverImage || `https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80`}
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
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-500" />
              <div>
                <div className="font-semibold">{(group.memberCount || 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <div>
                <div className="font-semibold">{group.healthScore}/100</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </div>

          <Link href={`/groups/${group.id}`} className="w-full">
            <Button className="w-full gap-2" data-testid={`button-view-group-${group.id}`}>
              <UserPlus className="w-4 h-4" />
              Join {group.name}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );

  // Render Professional Group Card with editorial design
  const renderProCard = (group: SelectGroup & { healthScore: number; distance: number; isFeatured: boolean }) => (
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
          src={group.coverImage || `https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=1200&auto=format&fit=crop&q=80`}
          alt={group.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Professional
            </Badge>
            {group.isFeatured && (
              <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                <Star className="w-3 h-3 fill-white" />
                <span>Featured</span>
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
            <span className="text-muted-foreground">members</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-500" />
            <span className="font-semibold">{group.city || "Global"}</span>
          </div>
        </div>

        <Link href={`/groups/${group.id}`}>
          <Button size="lg" className="gap-2" data-testid={`button-view-group-${group.id}`}>
            <UserPlus className="w-5 h-5" />
            Join Community
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <Separator className="mt-12" />
    </motion.article>
  );

  return (
    <SelfHealingErrorBoundary pageName="Groups" fallbackRoute="/feed">
      <PageLayout title="Tango Groups" showBreadcrumbs>
        <>
          <SEO 
            title="Tango Groups - Global Communities"
            description="Connect with tango communities worldwide. Join city groups, professional networks, and build lasting friendships in the global tango community."
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
                  Global Tango Communities
                </Badge>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6">
                  Find Your Community
                </h1>
                
                <p className="text-xl text-white/80 max-w-2xl mx-auto">
                  Connect with local dancers, join professional networks, and build lasting friendships worldwide
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
                      placeholder="Search groups, cities, interests..."
                      className="pl-12 h-12 text-base"
                      data-testid="input-search-groups"
                    />
                  </div>

                  {/* Tabs Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                      <TabsTrigger value="my-groups" className="text-base">
                        <Star className="w-4 h-4 mr-2" />
                        My Groups
                      </TabsTrigger>
                      <TabsTrigger value="cities" className="text-base">
                        <Building2 className="w-4 h-4 mr-2" />
                        Cities
                      </TabsTrigger>
                      <TabsTrigger value="professional" className="text-base">
                        <Globe className="w-4 h-4 mr-2" />
                        Professional
                      </TabsTrigger>
                    </TabsList>

                    {/* MY GROUPS Tab */}
                    <TabsContent value="my-groups" className="space-y-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-3xl font-serif font-bold">My Groups</h2>
                          <p className="text-muted-foreground mt-2">
                            Automatically added based on your city and professional roles
                          </p>
                        </div>
                      </div>

                      {isLoading ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full" />
                          ))}
                        </div>
                      ) : myGroups.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {myGroups.map((group) => renderCityCard(group))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center border-dashed">
                          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">Join More Communities</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Explore Cities and Professional groups to expand your network
                          </p>
                          <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => setActiveTab("cities")}>
                              Browse Cities
                            </Button>
                            <Button onClick={() => setActiveTab("professional")}>
                              Professional Groups
                            </Button>
                          </div>
                        </Card>
                      )}
                    </TabsContent>

                    {/* CITIES Tab */}
                    <TabsContent value="cities" className="space-y-8">
                      <div className="mb-6">
                        <h2 className="text-3xl font-serif font-bold">Tango Cities Worldwide</h2>
                        <p className="text-muted-foreground mt-2">
                          Connect with dancers in cities around the globe
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
                          <h3 className="text-lg font-semibold mb-2">No City Groups Yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            City groups will appear here as they're created
                          </p>
                        </Card>
                      )}
                    </TabsContent>

                    {/* PROFESSIONAL Tab */}
                    <TabsContent value="professional" className="space-y-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-3xl font-serif font-bold">Professional Communities</h2>
                          <p className="text-muted-foreground mt-2">
                            Networks for teachers, DJs, organizers, and performers
                          </p>
                        </div>
                        <Button className="gap-2" onClick={() => setIsCreating(true)}>
                          <Plus className="w-4 h-4" />
                          Request New Group
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
                          <h3 className="text-lg font-semibold mb-2">No Professional Groups Yet</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Professional communities will appear here
                          </p>
                          <Button onClick={() => setIsCreating(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Group
                          </Button>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Sidebar */}
                <div className="w-96 space-y-6 sticky top-8 self-start hidden lg:block">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Groups</span>
                        <span className="font-bold">{enrichedGroups.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">City Groups</span>
                        <span className="font-bold">{cityGroups.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Professional</span>
                        <span className="font-bold">{professionalGroups.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">My Groups</span>
                        <span className="font-bold">{myGroups.length}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Create Group CTA */}
                  {!isCreating && (
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                      <h3 className="font-semibold mb-2">Start a Community</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your own group and bring dancers together
                      </p>
                      <Button className="w-full" onClick={() => setIsCreating(true)} data-testid="button-create-group">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
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
