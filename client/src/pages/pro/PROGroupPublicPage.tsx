import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Users, Star, MapPin, Calendar, Briefcase, ArrowRight,
  GraduationCap, Music, Camera, Drama, Building2, PenLine, Palette,
  Piano, Shirt, BookOpen, Target, Mic, Globe, Heart, Eye, User, MessageSquare
} from "lucide-react";
import { TANGO_ROLES, getRoleByValue, type TangoRole } from "@/lib/tangoRoles";
import { PostCreator } from "@/components/universal/PostCreator";
import { GroupPostFeed } from "@/components/groups/GroupPostFeed";

interface PROGroupPublicPageProps {
  roleSlug: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface Professional {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  city?: string;
  country?: string;
  bio?: string;
  tangoRoles: string[];
  rating?: number;
  reviewCount?: number;
  eventCount?: number;
  yearsExperience?: number;
}

export function PROGroupPublicPage({ roleSlug, title, description, icon: Icon, color }: PROGroupPublicPageProps) {
  const { t } = useTranslation(["pages", "common"]);
  const [, navigate] = useLocation();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const { data: professionals, isLoading } = useQuery<Professional[]>({
    queryKey: ['/api/users/professionals', roleSlug],
  });

  const { data: groupInfo } = useQuery({
    queryKey: ['/api/users/pro-groups', roleSlug],
  });

  const isMember = profile?.tangoRoles?.includes(roleSlug) || professionals?.some(p => p.id === user?.id);
  const searchPlaceholder = t('pages:proGroupPublic.searchPlaceholder', 'Search professionals...');

  const filteredProfessionals = professionals?.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" || p.city === cityFilter;
    return matchesSearch && matchesCity;
  }).sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "reviews") return (b.reviewCount || 0) - (a.reviewCount || 0);
    if (sortBy === "experience") return (b.yearsExperience || 0) - (a.yearsExperience || 0);
    return 0;
  });

  const cities = [...new Set(professionals?.map(p => p.city).filter(Boolean) || [])];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, rgba(10, 24, 40, 0.98) 0%, rgba(30, 144, 255, 0.08) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div 
          className="rounded-2xl p-8 mb-8"
          style={{
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            border: `1px solid ${color}30`,
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-4 rounded-xl"
              style={{ background: `${color}20` }}
            >
              <Icon className="w-8 h-8" style={{ color }} />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color }}
              >
                {title}
              </h1>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{professionals?.length || 0} professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Verified PRO network</span>
            </div>
          </div>

          {isMember ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge 
                className="px-3 py-1"
                style={{ background: `${color}30`, color }}
              >
                You are a {title}
              </Badge>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile?tab=pro')}
                data-testid="button-view-pro-tab"
                style={{ borderColor: color, color }}
              >
                View Your PRO Tab
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/profile?tab=about')}
                data-testid="button-become-pro"
                style={{ background: color }}
                className="text-white"
              >
                Become a {title}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Add this role to your profile to join the PRO network
              </p>
            </div>
          )}
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-background/50 border border-white/10 w-max md:w-auto">
              <TabsTrigger value="discover" data-testid="tab-discover" className="whitespace-nowrap">
                Discover Professionals
              </TabsTrigger>
              <TabsTrigger value="featured" data-testid="tab-featured" className="whitespace-nowrap">
                Featured
              </TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming" className="whitespace-nowrap">
                Upcoming Events
              </TabsTrigger>
              {isMember && (
                <TabsTrigger 
                  value="discussion" 
                  data-testid="tab-discussion"
                  className="relative whitespace-nowrap"
                  style={{
                    background: `${color}15`,
                    borderColor: color,
                    color: color,
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discussion
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${title.toLowerCase()}s by name or city...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                  data-testid="input-search-professionals"
                />
              </div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-white/10" data-testid="select-city-filter">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city || "unknown"}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-white/10" data-testid="select-sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-background/50 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfessionals?.length === 0 ? (
              <Card className="bg-background/50 border-white/10">
                <CardContent className="p-12 text-center">
                  <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color }} />
                  <h3 className="text-lg font-semibold mb-2">No {title}s Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search criteria" : "Be the first to join this PRO network!"}
                  </p>
                  {!isMember && (
                    <Button 
                      onClick={() => navigate('/profile?tab=about')}
                      style={{ background: color }}
                      className="text-white"
                      data-testid="button-be-first"
                    >
                      Become a {title}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessionals?.map((pro) => (
                  <Card 
                    key={pro.id} 
                    className="bg-background/50 border-white/10 hover-elevate cursor-pointer transition-all"
                    onClick={() => navigate(`/profile/${pro.id}`)}
                    data-testid={`card-professional-${pro.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2" style={{ borderColor: `${color}50` }}>
                          <AvatarImage src={pro.profileImage} />
                          <AvatarFallback style={{ background: `${color}30`, color }}>
                            {pro.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{pro.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">@{pro.username}</p>
                          {pro.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{pro.city}, {pro.country}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {pro.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {pro.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          {pro.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{pro.rating.toFixed(1)}</span>
                              {pro.reviewCount && (
                                <span className="text-muted-foreground">({pro.reviewCount})</span>
                              )}
                            </div>
                          )}
                          {pro.yearsExperience !== undefined && pro.yearsExperience !== null && pro.yearsExperience > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="w-4 h-4" />
                              <span>{pro.yearsExperience}y</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          style={{ color }}
                          data-testid={`button-view-profile-${pro.id}`}
                        >
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <Card className="bg-background/50 border-white/10">
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-semibold mb-2">Featured {title}s Coming Soon</h3>
                <p className="text-muted-foreground">
                  Top-rated professionals will be showcased here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card className="bg-background/50 border-white/10">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color }} />
                <h3 className="text-lg font-semibold mb-2">Upcoming {title} Events</h3>
                <p className="text-muted-foreground mb-4">
                  Workshops, masterclasses, and performances by {title.toLowerCase()}s
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/events')}
                  data-testid="button-browse-events"
                >
                  Browse All Events
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isMember && groupInfo?.id && (
            <TabsContent value="discussion" className="space-y-6">
              {/* Discussion Header */}
              <Card className="bg-background/50 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="w-6 h-6" style={{ color }} />
                    <div>
                      <h3 className="text-lg font-semibold">{title} Discussion</h3>
                      <p className="text-sm text-muted-foreground">
                        Share experiences, ask questions, and connect with fellow {title.toLowerCase()}s
                      </p>
                    </div>
                  </div>
                  
                  {/* Post Creator */}
                  <PostCreator 
                    context={{ type: 'group', id: String(groupInfo.id), name: `${title} Community` }}
                    className="mt-4"
                  />
                </CardContent>
              </Card>
              
              {/* Posts Feed */}
              <GroupPostFeed 
                groupId={groupInfo.id} 
                groupName={`${title} Community`}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export function LearningPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="teacher"
      title="Teachers"
      description="Discover tango teachers and educators from around the world"
      icon={GraduationCap}
      color="#10B981"
    />
  );
}

export function MusicPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="dj"
      title="DJs & Musicians"
      description="Find talented tango DJs and musicians for your events"
      icon={Music}
      color="#8B5CF6"
    />
  );
}

export function MediaGalleryPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="photographer"
      title="Photographers & Videographers"
      description="Professional tango photographers and videographers"
      icon={Camera}
      color="#EF4444"
    />
  );
}

export function PerformancesPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="performer"
      title="Performers"
      description="World-class tango performers and show artists"
      icon={Drama}
      color="#F59E0B"
    />
  );
}

export function VenuesPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="venue-owner"
      title="Venue Owners"
      description="Tango venues, milongas, and dance spaces worldwide"
      icon={Building2}
      color="#6B7280"
    />
  );
}

export function OrganizersPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="organizer"
      title="Event Organizers"
      description="Professional tango event organizers and promoters"
      icon={Calendar}
      color="#3B82F6"
    />
  );
}

export function StoriesBlogPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="journalist"
      title="Journalists & Bloggers"
      description="Tango writers, bloggers, and content creators"
      icon={PenLine}
      color="#14B8A6"
    />
  );
}

export function ArtistsPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="artist"
      title="Designers & Artists"
      description="Tango visual artists, graphic designers, and creatives"
      icon={Palette}
      color="#EC4899"
    />
  );
}

export function MusiciansPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="musician"
      title="Musicians"
      description="Live tango musicians and orchestras"
      icon={Piano}
      color="#A855F7"
    />
  );
}

export function ClothingDesignersPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="clothing-designer"
      title="Clothing & Shoe Designers"
      description="Tango fashion designers and shoemakers"
      icon={Shirt}
      color="#EC4899"
    />
  );
}

export function HistoriansPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="historian"
      title="Historians"
      description="Tango history scholars and researchers"
      icon={BookOpen}
      color="#8B5CF6"
    />
  );
}

export function CoachesPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="coach"
      title="Coaches & Mentors"
      description="Personal tango coaches and mentors"
      icon={Target}
      color="#10B981"
    />
  );
}

export function HostsMCsPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="mc"
      title="MCs & Hosts"
      description="Professional tango event hosts and MCs"
      icon={Mic}
      color="#F97316"
    />
  );
}

export function VendorsPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="business"
      title="Vendors & Businesses"
      description="Tango-related businesses and service providers"
      icon={Briefcase}
      color="#6366F1"
    />
  );
}

export function CommunityBuildersPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="community-builder"
      title="Community Builders"
      description="Tango community leaders and ambassadors"
      icon={Globe}
      color="#40E0D0"
    />
  );
}

export function TaxiDancersPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="taxi-dancer"
      title="Taxi Dancers"
      description="Professional taxi dancers available at milongas"
      icon={Users}
      color="#F97316"
    />
  );
}

export function DancersPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [, navigate] = useLocation();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  // Fetch both dancer-leader and dancer-follower
  const { data: leaders, isLoading: loadingLeaders } = useQuery<Professional[]>({
    queryKey: ['/api/users/professionals', 'dancer-leader'],
  });

  const { data: followers, isLoading: loadingFollowers } = useQuery<Professional[]>({
    queryKey: ['/api/users/professionals', 'dancer-follower'],
  });

  const isLoading = loadingLeaders || loadingFollowers;

  // Merge and deduplicate by id
  const professionals = useMemo(() => {
    const combined = [...(leaders || []), ...(followers || [])];
    const uniqueMap = new Map<number, Professional>();
    combined.forEach(p => uniqueMap.set(p.id, p));
    return Array.from(uniqueMap.values());
  }, [leaders, followers]);

  const isMember = profile?.tangoRoles?.some(r => r.includes('dancer')) || 
    professionals?.some(p => p.id === user?.id);

  const filteredProfessionals = professionals?.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === "all" || p.city === cityFilter;
    return matchesSearch && matchesCity;
  }).sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "reviews") return (b.reviewCount || 0) - (a.reviewCount || 0);
    if (sortBy === "experience") return (b.yearsExperience || 0) - (a.yearsExperience || 0);
    return 0;
  }) || [];

  const cities = [...new Set(professionals?.map(p => p.city).filter(Boolean) || [])];

  const color = "#1E90FF";
  const title = "Dancers";
  const description = "Discover tango dancers from around the world";
  const Icon = Users;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, rgba(10, 24, 40, 0.98) 0%, rgba(30, 144, 255, 0.08) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div 
          className="rounded-2xl p-8 mb-8"
          style={{
            background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
            border: `1px solid ${color}30`,
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-4 rounded-xl"
              style={{ background: `${color}20` }}
            >
              <Icon className="w-8 h-8" style={{ color }} />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{ color }}
              >
                {title}
              </h1>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{professionals?.length || 0} dancers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>All skill levels welcome</span>
            </div>
          </div>

          {isMember ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge 
                className="px-3 py-1"
                style={{ background: `${color}30`, color }}
              >
                You are a Dancer
              </Badge>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile?tab=pro')}
                data-testid="button-view-pro-tab"
                style={{ borderColor: color, color }}
              >
                View Your PRO Tab
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/profile?tab=about')}
                data-testid="button-become-pro"
                style={{ background: color }}
                className="text-white"
              >
                Add Dancer to Your Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Add dancer role to your profile to join the community
              </p>
            </div>
          )}
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="bg-background/50 border border-white/10">
            <TabsTrigger value="discover" data-testid="tab-discover">
              Discover Dancers
            </TabsTrigger>
            <TabsTrigger value="featured" data-testid="tab-featured">
              Featured
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search dancers by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                  data-testid="input-search-professionals"
                />
              </div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-white/10" data-testid="select-city-filter">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city || "unknown"}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-white/10" data-testid="select-sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="experience">Most Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="bg-background/50 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfessionals?.length === 0 ? (
              <Card className="bg-background/50 border-white/10">
                <CardContent className="p-12 text-center">
                  <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color }} />
                  <h3 className="text-lg font-semibold mb-2">No Dancers Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search criteria" : "Be the first to join the dancer community!"}
                  </p>
                  {!isMember && (
                    <Button 
                      onClick={() => navigate('/profile?tab=about')}
                      style={{ background: color }}
                      className="text-white"
                      data-testid="button-be-first"
                    >
                      Add Dancer Role
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessionals?.map((pro) => (
                  <Card 
                    key={pro.id} 
                    className="bg-background/50 border-white/10 hover-elevate cursor-pointer transition-all"
                    onClick={() => navigate(`/profile/${pro.id}`)}
                    data-testid={`card-professional-${pro.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-16 w-16 ring-2" style={{ borderColor: `${color}50` }}>
                          <AvatarImage src={pro.profileImage} />
                          <AvatarFallback style={{ background: `${color}30`, color }}>
                            {pro.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{pro.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">@{pro.username}</p>
                          {pro.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{pro.city}, {pro.country}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {pro.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {pro.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          {pro.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{pro.rating.toFixed(1)}</span>
                              {pro.reviewCount && (
                                <span className="text-muted-foreground">({pro.reviewCount})</span>
                              )}
                            </div>
                          )}
                          {pro.yearsExperience !== undefined && pro.yearsExperience !== null && pro.yearsExperience > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="w-4 h-4" />
                              <span>{pro.yearsExperience}y</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          style={{ color }}
                          data-testid={`button-view-profile-${pro.id}`}
                        >
                          View
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <Card className="bg-background/50 border-white/10">
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-semibold mb-2">Featured Dancers Coming Soon</h3>
                <p className="text-muted-foreground">
                  Top-rated dancers will be showcased here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function ResearchersPage() {
  const { t } = useTranslation(["pages", "common"]);
  return (
    <PROGroupPublicPage
      roleSlug="researcher"
      title="Researchers"
      description="Tango researchers exploring culture and traditions"
      icon={Search}
      color="#F97316"
    />
  );
}

export default PROGroupPublicPage;
