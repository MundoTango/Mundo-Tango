import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Users, Plus, Search, MapPin, TrendingUp, Award, Heart, Activity, Filter, X } from "lucide-react";
import type { SelectGroup } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { GroupCreationModal } from "@/components/groups/GroupCreationModal";
import { GroupCategoryFilter } from "@/components/groups/GroupCategoryFilter";

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
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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

  const renderGroupCard = (group: SelectGroup & { healthScore: number; distance: number; isFeatured: boolean }) => (
    <Card key={group.id} className="overflow-hidden hover-elevate" data-testid={`card-group-${group.id}`}>
      {group.coverImage && (
        <div className="h-32 w-full overflow-hidden">
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg" data-testid="text-group-name">{group.name}</CardTitle>
          {group.isFeatured && (
            <Badge variant="default" className="shrink-0">
              <Award className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {group.memberCount || 0} members
          </span>
          {group.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {group.city}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {group.description}
        </p>
        
        {/* Health Score */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Health Score</span>
              <span className="font-semibold">{group.healthScore}/100</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${group.healthScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          {group.distance} km away
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/groups/${group.id}`} className="w-full">
          <Button className="w-full" data-testid={`button-view-group-${group.id}`}>
            View Group
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <SelfHealingErrorBoundary pageName="Groups" fallbackRoute="/feed">
      <PageLayout title="Tango Groups" showBreadcrumbs>
        <>
          <SEO 
            title="Tango Groups"
            description="Discover and join tango communities. Connect with dancers, find practice groups, and engage with the global tango community."
          />
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold">Tango Groups</h1>
                <p className="text-muted-foreground">Connect with communities around the world</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)} 
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button onClick={() => setIsCreating(true)} data-testid="button-create-group">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-groups"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Advanced Filters</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Members: {filters.minMembers}</Label>
                      <Slider
                        value={[filters.minMembers]}
                        onValueChange={([value]) => setFilters({ ...filters, minMembers: value })}
                        max={100}
                        step={5}
                        data-testid="slider-min-members"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Health Score: {filters.minHealthScore}</Label>
                      <Slider
                        value={[filters.minHealthScore]}
                        onValueChange={([value]) => setFilters({ ...filters, minHealthScore: value })}
                        max={100}
                        step={5}
                        data-testid="slider-min-health-score"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sort By</Label>
                      <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                        <SelectTrigger data-testid="select-sort-by">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="featured">Featured First</SelectItem>
                          <SelectItem value="members">Most Members</SelectItem>
                          <SelectItem value="health">Highest Health Score</SelectItem>
                          <SelectItem value="nearby">Nearest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Featured Groups Section */}
            {!isLoading && featuredGroups.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Featured Groups</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredGroups.map(renderGroupCard)}
                </div>
              </div>
            )}

            {/* Popular Near You Section */}
            {!isLoading && nearbyGroups.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Popular Near You</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {nearbyGroups.map(renderGroupCard)}
                </div>
              </div>
            )}

            {/* City Rankings */}
            {!isLoading && cityRankings.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Top Cities by Members</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cityRankings.map((city, index) => (
                      <div 
                        key={city.city} 
                        className="flex items-center gap-4 p-3 border rounded-lg hover-elevate"
                        data-testid={`city-rank-${index + 1}`}
                      >
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                          ${index === 0 ? 'bg-yellow-500 text-white' : ''}
                          ${index === 1 ? 'bg-gray-400 text-white' : ''}
                          ${index === 2 ? 'bg-amber-700 text-white' : ''}
                          ${index > 2 ? 'bg-muted text-muted-foreground' : ''}
                        `}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{city.city}</h4>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span>{city.members.toLocaleString()} members</span>
                            <span>{city.groups} groups</span>
                            <span>{city.events} events</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Groups */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">All Groups</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <Skeleton className="h-32 w-full rounded-t-xl" />
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredGroups && filteredGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredGroups.map(renderGroupCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No groups found. Try adjusting your filters or be the first to create one!
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Create Group Modal */}
            <GroupCreationModal open={isCreating} onOpenChange={setIsCreating} />
          </div>
        </>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
