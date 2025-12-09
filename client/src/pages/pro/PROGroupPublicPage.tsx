import { useEffect, useState } from "react";
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
  Piano, Shirt, BookOpen, Target, Mic, Globe, Heart, Eye, User
} from "lucide-react";
import { TANGO_ROLES, getRoleByValue, type TangoRole } from "@/lib/tangoRoles";

interface PROGroupPublicPageProps {
  roleSlug: string;
  title: string;
  singularTitle?: string; // Singular form for "Become a Teacher" vs "Teachers"
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

export function PROGroupPublicPage({ roleSlug, title, singularTitle, description, icon: Icon, color }: PROGroupPublicPageProps) {
  const [, navigate] = useLocation();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [activeTab, setActiveTab] = useState("discover");

  // Use singularTitle if provided, otherwise derive from title by removing trailing 's'
  const singular = singularTitle || title.replace(/s$/, '');

  // tangoRoles is on user object, not profile
  const isMember = user?.tangoRoles?.includes(roleSlug);

  const { data: professionals, isLoading } = useQuery<Professional[]>({
    queryKey: ['/api/users/professionals', roleSlug],
  });

  const { data: groupInfo } = useQuery({
    queryKey: ['/api/users/pro-groups', roleSlug],
  });

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
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge 
                className="px-3 py-1"
                style={{ background: `${color}30`, color }}
              >
                You are a {singular}
              </Badge>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile?tab=pro')}
                data-testid="button-view-pro-tab"
                style={{ borderColor: color, color }}
              >
                Edit PRO Profile
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
                Become a {singular}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Add this role to your profile to join the PRO network
              </p>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="pro-tabs">
          <TabsList className="bg-background/50 border border-white/10">
            <TabsTrigger value="discover" data-testid="tab-discover">
              Discover Professionals
            </TabsTrigger>
            {isMember && (
              <TabsTrigger value="group" data-testid="tab-group" style={{ color }}>
                <Users className="w-4 h-4 mr-1" />
                PRO Group
              </TabsTrigger>
            )}
            <TabsTrigger value="featured" data-testid="tab-featured">
              Featured
            </TabsTrigger>
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${title.toLowerCase()} by name or city...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                  data-testid="input-search-professionals"
                />
              </div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-white/10" data-testid="select-city-filter">
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
                <SelectTrigger className="w-[180px] bg-background/50 border-white/10" data-testid="select-sort-by">
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
                  <h3 className="text-lg font-semibold mb-2">No {title} Found</h3>
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
                      Become a {singular}
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
                          {pro.yearsExperience && (
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

          {/* PRO Group Tab - Members Only */}
          {isMember && (
            <TabsContent value="group" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Group Welcome Card */}
                <Card className="md:col-span-2 bg-background/50 border-white/10">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ background: `${color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <div>
                        <CardTitle>{title} PRO Group</CardTitle>
                        <CardDescription>
                          Welcome to your exclusive {singular} community
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border border-dashed" style={{ borderColor: `${color}40` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4" style={{ color }} />
                        <span className="font-medium">Member Benefits</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                        <li>Connect with other {title.toLowerCase()} worldwide</li>
                        <li>Share tips, opportunities, and resources</li>
                        <li>Get featured in the PRO directory</li>
                        <li>Access exclusive group discussions</li>
                      </ul>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          document.getElementById("pro-discussions")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        data-testid="button-group-discussions"
                        style={{ borderColor: color, color }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Group Discussions
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/events/create')}
                        data-testid="button-create-event"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Stats Card */}
                <Card className="bg-background/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Group Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Members</span>
                      <span className="font-bold" style={{ color }}>{professionals?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Your Status</span>
                      <Badge style={{ background: `${color}30`, color }}>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium">Global</span>
                    </div>
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full text-white"
                        style={{ background: color }}
                        onClick={() => navigate('/profile?tab=pro')}
                        data-testid="button-edit-pro-profile"
                      >
                        Edit PRO Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fellow Members Section */}
              <Card className="bg-background/50 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Fellow {title}</CardTitle>
                    <Button variant="ghost" size="sm" style={{ color }}>
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {professionals && professionals.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {professionals.slice(0, 6).map((pro) => (
                        <div 
                          key={pro.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                          onClick={() => navigate(`/profile/${pro.username}`)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pro.profileImage} />
                            <AvatarFallback style={{ background: `${color}20`, color }}>
                              {pro.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{pro.name}</p>
                            {pro.city && (
                              <p className="text-xs text-muted-foreground truncate">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                {pro.city}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Be the first to join this PRO community!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* PRO Group Discussions Section */}
              <Card id="pro-discussions" className="bg-background/50 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" style={{ color }} />
                      <CardTitle>{title} Discussions</CardTitle>
                    </div>
                    <Button 
                      size="sm"
                      style={{ background: color }}
                      className="text-white"
                      data-testid="button-start-discussion"
                    >
                      Start Discussion
                    </Button>
                  </div>
                  <CardDescription>
                    Connect with fellow {title.toLowerCase()}, share tips, and discuss opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Placeholder for future discussions - will be populated from API */}
                    <div className="text-center py-8 border border-dashed rounded-lg" style={{ borderColor: `${color}30` }}>
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color }} />
                      <h4 className="font-medium mb-1">No discussions yet</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Be the first to start a conversation with other {title.toLowerCase()}!
                      </p>
                      <Button 
                        variant="outline"
                        size="sm"
                        style={{ borderColor: color, color }}
                        data-testid="button-first-discussion"
                      >
                        Start the First Discussion
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="featured" className="space-y-6">
            <Card className="bg-background/50 border-white/10">
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500/50" />
                <h3 className="text-lg font-semibold mb-2">No Featured {title} Yet</h3>
                <p className="text-muted-foreground">
                  Top-rated professionals with verified reviews will be showcased here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <Card className="bg-background/50 border-white/10">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color }} />
                <h3 className="text-lg font-semibold mb-2">Upcoming {singular} Events</h3>
                <p className="text-muted-foreground mb-4">
                  Workshops, masterclasses, and performances by {title.toLowerCase()}
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
        </Tabs>
      </div>
    </div>
  );
}

export function LearningPage() {
  return (
    <PROGroupPublicPage
      roleSlug="teacher"
      title="Teachers"
      singularTitle="Teacher"
      description="Discover tango teachers and educators from around the world"
      icon={GraduationCap}
      color="#10B981"
    />
  );
}

export function MusicPage() {
  return (
    <PROGroupPublicPage
      roleSlug="dj"
      title="DJs & Musicians"
      singularTitle="DJ/Musician"
      description="Find talented tango DJs and musicians for your events"
      icon={Music}
      color="#8B5CF6"
    />
  );
}

export function MediaGalleryPage() {
  return (
    <PROGroupPublicPage
      roleSlug="photographer"
      title="Photographers & Videographers"
      singularTitle="Photographer/Videographer"
      description="Professional tango photographers and videographers"
      icon={Camera}
      color="#EF4444"
    />
  );
}

export function PerformancesPage() {
  return (
    <PROGroupPublicPage
      roleSlug="performer"
      title="Performers"
      singularTitle="Performer"
      description="World-class tango performers and show artists"
      icon={Drama}
      color="#F59E0B"
    />
  );
}

export function VenuesPage() {
  return (
    <PROGroupPublicPage
      roleSlug="venue-owner"
      title="Venue Owners"
      singularTitle="Venue Owner"
      description="Tango venues, milongas, and dance spaces worldwide"
      icon={Building2}
      color="#6B7280"
    />
  );
}

export function OrganizersPage() {
  return (
    <PROGroupPublicPage
      roleSlug="organizer"
      title="Event Organizers"
      singularTitle="Event Organizer"
      description="Professional tango event organizers and promoters"
      icon={Calendar}
      color="#3B82F6"
    />
  );
}

export function StoriesBlogPage() {
  return (
    <PROGroupPublicPage
      roleSlug="journalist"
      title="Journalists & Bloggers"
      singularTitle="Journalist/Blogger"
      description="Tango writers, bloggers, and content creators"
      icon={PenLine}
      color="#14B8A6"
    />
  );
}

export function ArtistsPage() {
  return (
    <PROGroupPublicPage
      roleSlug="artist"
      title="Designers & Artists"
      singularTitle="Designer/Artist"
      description="Tango visual artists, graphic designers, and creatives"
      icon={Palette}
      color="#EC4899"
    />
  );
}

export function MusiciansPage() {
  return (
    <PROGroupPublicPage
      roleSlug="musician"
      title="Musicians"
      singularTitle="Musician"
      description="Live tango musicians and orchestras"
      icon={Piano}
      color="#A855F7"
    />
  );
}

export function ClothingDesignersPage() {
  return (
    <PROGroupPublicPage
      roleSlug="clothing-designer"
      title="Clothing & Shoe Designers"
      singularTitle="Clothing/Shoe Designer"
      description="Tango fashion designers and shoemakers"
      icon={Shirt}
      color="#EC4899"
    />
  );
}

export function HistoriansPage() {
  return (
    <PROGroupPublicPage
      roleSlug="historian"
      title="Historians"
      singularTitle="Historian"
      description="Tango history scholars and researchers"
      icon={BookOpen}
      color="#8B5CF6"
    />
  );
}

export function CoachesPage() {
  return (
    <PROGroupPublicPage
      roleSlug="coach"
      title="Coaches & Mentors"
      singularTitle="Coach/Mentor"
      description="Personal tango coaches and mentors"
      icon={Target}
      color="#10B981"
    />
  );
}

export function HostsMCsPage() {
  return (
    <PROGroupPublicPage
      roleSlug="mc"
      title="MCs & Hosts"
      singularTitle="MC/Host"
      description="Professional tango event hosts and MCs"
      icon={Mic}
      color="#F97316"
    />
  );
}

export function VendorsPage() {
  return (
    <PROGroupPublicPage
      roleSlug="business"
      title="Vendors & Businesses"
      singularTitle="Vendor/Business"
      description="Tango-related businesses and service providers"
      icon={Briefcase}
      color="#6366F1"
    />
  );
}

export function CommunityBuildersPage() {
  return (
    <PROGroupPublicPage
      roleSlug="community-builder"
      title="Community Builders"
      singularTitle="Community Builder"
      description="Tango community leaders and ambassadors"
      icon={Globe}
      color="#40E0D0"
    />
  );
}

export function TaxiDancersPage() {
  return (
    <PROGroupPublicPage
      roleSlug="taxi-dancer"
      title="Taxi Dancers"
      singularTitle="Taxi Dancer"
      description="Professional taxi dancers available at milongas"
      icon={Users}
      color="#F97316"
    />
  );
}

export default PROGroupPublicPage;
