import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  LogOut,
  UserCircle,
  UserPlus,
  GraduationCap,
  MapPin,
  MapPinHouse,
  MapPinPlus,
  Brain,
  ShoppingBag,
  Globe,
  Sparkles,
  Building2,
  Music,
  Camera,
  Drama,
  PenLine,
  Palette,
  Piano,
  Shirt,
  Target,
  Trophy,
  Home as HousingIcon,
  Briefcase,
  List,
  Map,
  Star,
  Search,
  User,
  Handshake,
  BookOpen,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TANGO_ROLES, type TangoRole, getRoleByValue, normalizeRole } from "@/lib/tangoRoles";

const socialItems = [
  {
    titleKey: "sidebar.social.memories",
    titleFallback: "Memories",
    url: "/feed",
    icon: Home,
    tooltipKey: "sidebar.social.memoriesTooltip",
    tooltipFallback: "Your feed and memories",
  },
  {
    titleKey: "sidebar.social.profile",
    titleFallback: "Profile",
    url: "/profile",
    icon: UserCircle,
    tooltipKey: "sidebar.social.profileTooltip",
    tooltipFallback: "View your profile",
  },
  {
    titleKey: "sidebar.social.volunteer",
    titleFallback: "Volunteer",
    url: "/talent-match",
    icon: Sparkles,
    tooltipKey: "sidebar.social.volunteerTooltip",
    tooltipFallback: "Help create Mundo Tango",
  },
];

const communityItems = [
  {
    titleKey: "sidebar.community.communityMap",
    titleFallback: "Community Map",
    url: "/community-world-map",
    icon: Globe,
    tooltipKey: "sidebar.community.communityMapTooltip",
    tooltipFallback: "Explore the global tango community",
  },
  {
    titleKey: "sidebar.community.events",
    titleFallback: "Events",
    url: "/events",
    icon: Calendar,
    tooltipKey: "sidebar.community.eventsTooltip",
    tooltipFallback: "Browse events - list, calendar, or map view",
  },
  {
    titleKey: "sidebar.community.friends",
    titleFallback: "Friends",
    url: "/friends",
    icon: UserPlus,
    tooltipKey: "sidebar.community.friendsTooltip",
    tooltipFallback: "Manage your friends",
  },
  {
    titleKey: "sidebar.community.messages",
    titleFallback: "Messages",
    url: "/messages",
    icon: MessageSquare,
    tooltipKey: "sidebar.community.messagesTooltip",
    tooltipFallback: "Your conversations",
  },
  {
    titleKey: "sidebar.community.leaderboard",
    titleFallback: "Leaderboard",
    url: "/leaderboard",
    icon: Trophy,
    tooltipKey: "sidebar.community.leaderboardTooltip",
    tooltipFallback: "Top contributors",
  },
];

const proDiscoveryItems = [
  {
    titleKey: "sidebar.proDiscovery.learning",
    titleFallback: "Learning",
    url: "/pro/learning",
    icon: GraduationCap,
    color: "#10B981",
    tooltipKey: "sidebar.proDiscovery.learningTooltip",
    tooltipFallback: "Classes and workshops",
  },
  {
    titleKey: "sidebar.proDiscovery.music",
    titleFallback: "Music",
    url: "/pro/music",
    icon: Music,
    color: "#8B5CF6",
    tooltipKey: "sidebar.proDiscovery.musicTooltip",
    tooltipFallback: "Tango music and DJs",
  },
  {
    titleKey: "sidebar.proDiscovery.media",
    titleFallback: "Media",
    url: "/pro/media",
    icon: Camera,
    color: "#EF4444",
    tooltipKey: "sidebar.proDiscovery.mediaTooltip",
    tooltipFallback: "Photos and videos",
  },
  {
    titleKey: "sidebar.proDiscovery.performances",
    titleFallback: "Performances",
    url: "/pro/performances",
    icon: Drama,
    color: "#F59E0B",
    tooltipKey: "sidebar.proDiscovery.performancesTooltip",
    tooltipFallback: "Show performances",
  },
  {
    titleKey: "sidebar.proDiscovery.venues",
    titleFallback: "Venues",
    url: "/pro/venues",
    icon: Building2,
    color: "#6B7280",
    tooltipKey: "sidebar.proDiscovery.venuesTooltip",
    tooltipFallback: "Dance venues",
  },
  {
    titleKey: "sidebar.proDiscovery.organizers",
    titleFallback: "Organizers",
    url: "/pro/organizers",
    icon: Calendar,
    color: "#3B82F6",
    tooltipKey: "sidebar.proDiscovery.organizersTooltip",
    tooltipFallback: "Event organizers",
  },
  {
    titleKey: "sidebar.proDiscovery.stories",
    titleFallback: "Stories",
    url: "/pro/stories",
    icon: PenLine,
    color: "#14B8A6",
    tooltipKey: "sidebar.proDiscovery.storiesTooltip",
    tooltipFallback: "Blog and stories",
  },
  {
    titleKey: "sidebar.proDiscovery.artists",
    titleFallback: "Artists",
    url: "/pro/artists",
    icon: Palette,
    color: "#EC4899",
    tooltipKey: "sidebar.proDiscovery.artistsTooltip",
    tooltipFallback: "Visual artists",
  },
  {
    titleKey: "sidebar.proDiscovery.musicians",
    titleFallback: "Musicians",
    url: "/pro/musicians",
    icon: Piano,
    color: "#A855F7",
    tooltipKey: "sidebar.proDiscovery.musiciansTooltip",
    tooltipFallback: "Live musicians",
  },
  {
    titleKey: "sidebar.proDiscovery.fashion",
    titleFallback: "Fashion",
    url: "/pro/fashion",
    icon: Shirt,
    color: "#EC4899",
    tooltipKey: "sidebar.proDiscovery.fashionTooltip",
    tooltipFallback: "Tango fashion",
  },
  {
    titleKey: "sidebar.proDiscovery.coaches",
    titleFallback: "Coaches",
    url: "/pro/coaches",
    icon: Target,
    color: "#10B981",
    tooltipKey: "sidebar.proDiscovery.coachesTooltip",
    tooltipFallback: "Personal coaches",
  },
  {
    titleKey: "sidebar.proDiscovery.vendors",
    titleFallback: "Vendors",
    url: "/pro/vendors",
    icon: Briefcase,
    color: "#6366F1",
    tooltipKey: "sidebar.proDiscovery.vendorsTooltip",
    tooltipFallback: "Tango vendors",
  },
  {
    titleKey: "sidebar.proDiscovery.leaders",
    titleFallback: "Leaders",
    url: "/pro/community",
    icon: Globe,
    color: "#40E0D0",
    tooltipKey: "sidebar.proDiscovery.leadersTooltip",
    tooltipFallback: "Community leaders",
  },
  {
    titleKey: "sidebar.proDiscovery.dancers",
    titleFallback: "Dancers",
    url: "/pro/dancers",
    icon: Users,
    color: "#1E90FF",
    tooltipKey: "sidebar.proDiscovery.dancersTooltip",
    tooltipFallback: "Find dance partners",
  },
  {
    titleKey: "sidebar.proDiscovery.researchers",
    titleFallback: "Researchers",
    url: "/pro/researchers",
    icon: Search,
    color: "#F97316",
    tooltipKey: "sidebar.proDiscovery.researchersTooltip",
    tooltipFallback: "Tango researchers",
  },
  {
    titleKey: "sidebar.proDiscovery.historians",
    titleFallback: "Historians",
    url: "/pro/historians",
    icon: BookOpen,
    color: "#8B5CF6",
    tooltipKey: "sidebar.proDiscovery.historiansTooltip",
    tooltipFallback: "Tango history experts",
  },
  {
    titleKey: "sidebar.proDiscovery.taxiDancers",
    titleFallback: "Taxi Dancers",
    url: "/pro/taxi-dancers",
    icon: Handshake,
    color: "#F97316",
    tooltipKey: "sidebar.proDiscovery.taxiDancersTooltip",
    tooltipFallback: "Professional taxi dancers",
  },
  {
    titleKey: "sidebar.proDiscovery.marketplace",
    titleFallback: "Marketplace",
    url: "/marketplace",
    icon: ShoppingBag,
    color: "#F59E0B",
    tooltipKey: "sidebar.proDiscovery.marketplaceTooltip",
    tooltipFallback: "Browse products and services",
  },
  {
    titleKey: "sidebar.proDiscovery.housing",
    titleFallback: "Housing",
    url: "/housing",
    icon: HousingIcon,
    color: "#10B981",
    tooltipKey: "sidebar.proDiscovery.housingTooltip",
    tooltipFallback: "Find tango-friendly accommodations",
  },
];

const servicesItems = [
  {
    titleKey: "sidebar.services.lifeCeo",
    titleFallback: "Life CEO",
    url: "/life-ceo",
    icon: Brain,
    tooltipKey: "sidebar.services.lifeCeoTooltip",
    tooltipFallback: "AI-powered life management",
  },
];

const roleToProDiscoveryMap: Record<string, string> = {
  teacher: "/pro/learning",
  dj: "/pro/music",
  photographer: "/pro/media",
  videographer: "/pro/media",
  performer: "/pro/performances",
  "venue-owner": "/pro/venues",
  organizer: "/pro/organizers",
  blogger: "/pro/stories",
  journalist: "/pro/stories",
  artist: "/pro/artists",
  musician: "/pro/musicians",
  "fashion-designer": "/pro/fashion",
  "clothing-designer": "/pro/fashion",
  coach: "/pro/coaches",
  vendor: "/pro/vendors",
  business: "/pro/vendors",
  "community-leader": "/pro/community",
  "community-builder": "/pro/community",
  "dancer-leader": "/pro/dancers",
  "dancer-follower": "/pro/dancers",
  researcher: "/pro/researchers",
  historian: "/pro/historians",
  "taxi-dancer": "/pro/taxi-dancers",
  fan: "/pro/community",
};

// Helper to generate city slug from name
function toCitySlug(cityName: string): string {
  return cityName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface FollowedCity {
  id: number;
  slug: string;
  name: string;
  country: string;
  membershipType: string;
  isResident: boolean;
}

function AppSidebarComponent() {
  const { t } = useTranslation(['navigation', 'common']);
  const [location] = useLocation();
  const { user, profile, logout } = useAuth();

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const username = profile?.username || user?.email?.split("@")[0] || "user";
  const avatarUrl = profile?.profileImage;
  // Read from user first (has authoritative data from API), fallback to profile
  const userCity = (user as any)?.city || profile?.city;
  const userTangoRoles = (user as any)?.tangoRoles || (profile as any)?.tangoRoles || [];

  // Fetch followed cities for "My Stuff" section
  const { data: followedCities = [] } = useQuery<FollowedCity[]>({
    queryKey: ["/api/cities/followed"],
    queryFn: async () => {
      const res = await fetch("/api/cities/followed", {
        credentials: "include",
      });
      if (!res.ok) {
        console.error("[AppSidebar] Failed to fetch followed cities:", res.status);
        return [];
      }
      return res.json();
    },
    enabled: !!user,
    staleTime: 60000, // Cache for 1 minute
  });

  const myStuffItems = useMemo(() => {
    const items: Array<{
      title: string;
      url: string;
      icon: React.ElementType;
      color?: string;
      tooltip: string;
    }> = [];

    // Track added URLs to prevent duplicates
    const addedUrls = new Set<string>();

    // Find home city from followed cities list (resident type) - uses canonical slug
    const homeCity = followedCities.find(city => city.isResident);
    
    if (homeCity) {
      // Use server-provided canonical slug
      const cityUrl = `/cities/${homeCity.slug}`;
      items.push({
        title: homeCity.name,
        url: cityUrl,
        icon: MapPinHouse,
        color: "#40E0D0", // Turquoise for home city
        tooltip: `Your home city: ${homeCity.name}`,
      });
      addedUrls.add(cityUrl);
    } else if (userCity) {
      // Fallback: show profile city with generated slug (may not link correctly)
      const citySlug = toCitySlug(userCity);
      const cityUrl = `/cities/${citySlug}`;
      items.push({
        title: userCity,
        url: cityUrl,
        icon: MapPinHouse,
        color: "#40E0D0",
        tooltip: `Your home city: ${userCity}`,
      });
      addedUrls.add(cityUrl);
    }

    // Add followed cities with MapPinPlus icon (use server-provided slug)
    followedCities.forEach((city) => {
      // Skip home city (already added above with MapPinHouse)
      if (city.isResident) return;
      
      // Use server-provided canonical slug
      const cityUrl = `/cities/${city.slug}`;
      // Skip if already added
      if (addedUrls.has(cityUrl)) return;
      
      addedUrls.add(cityUrl);
      items.push({
        title: city.name,
        url: cityUrl,
        icon: MapPinPlus,
        color: "#8B5CF6", // Purple for followed cities
        tooltip: `Following: ${city.name}`,
      });
    });

    // Add tango roles (PRO discovery links)
    userTangoRoles.forEach((roleValue: string) => {
      const role = getRoleByValue(roleValue);
      const normalizedValue = normalizeRole(roleValue);
      const proUrl = roleToProDiscoveryMap[normalizedValue];

      if (role && proUrl && !addedUrls.has(proUrl)) {
        addedUrls.add(proUrl);
        items.push({
          title: role.label,
          url: proUrl,
          icon: role.icon,
          color: role.color,
          tooltip: `Your PRO role: ${role.label}`,
        });
      }
    });

    return items;
  }, [userCity, userTangoRoles, followedCities]);

  const isActive = (url: string) =>
    location === url || location.startsWith(url + "/");

  const renderIconGridItem = (item: {
    titleKey?: string;
    titleFallback?: string;
    title?: string;
    url: string;
    icon: React.ElementType;
    color?: string;
    tooltipKey?: string;
    tooltipFallback?: string;
    tooltip?: string;
  }) => {
    const displayTitle = item.titleKey 
      ? t(`navigation:${item.titleKey}`, item.titleFallback || item.title || '') 
      : item.title || '';
    const displayTooltip = item.tooltipKey 
      ? t(`navigation:${item.tooltipKey}`, item.tooltipFallback || item.tooltip || '') 
      : item.tooltip || '';
    
    return (
      <Tooltip key={item.titleKey || item.title}>
        <TooltipTrigger asChild>
          <Link to={item.url}>
            <div
              className={cn(
                "flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-[#40E0D0]/20",
                isActive(item.url) &&
                  "bg-gradient-to-r from-[#40E0D0]/30 to-transparent ring-1 ring-[#40E0D0]/50",
              )}
              data-testid={`sidebar-icon-${displayTitle.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <item.icon
                className="h-8 w-8"
                style={{
                  color:
                    item.color ||
                    (isActive(item.url) ? "#40E0D0" : "#9CA3AF"),
                }}
              />
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 text-white border-slate-700 z-50"
        >
          <p className="font-medium">{displayTitle}</p>
          <p className="text-xs text-slate-400">{displayTooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderSingleItem = (item: {
    titleKey?: string;
    titleFallback?: string;
    title?: string;
    url: string;
    icon: React.ElementType;
    tooltipKey?: string;
    tooltipFallback?: string;
    tooltip?: string;
  }) => {
    const displayTitle = item.titleKey 
      ? t(`navigation:${item.titleKey}`, item.titleFallback || item.title || '') 
      : item.title || '';
    const displayTooltip = item.tooltipKey 
      ? t(`navigation:${item.tooltipKey}`, item.tooltipFallback || item.tooltip || '') 
      : item.tooltip || '';
    
    return (
      <Tooltip key={item.titleKey || item.title}>
        <TooltipTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              data-active={isActive(item.url)}
              data-testid={`sidebar-item-${displayTitle.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "transition-all duration-200 rounded-lg",
                isActive(item.url) &&
                  "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]",
              )}
              style={isActive(item.url) ? { color: "#40E0D0" } : undefined}
            >
              <Link to={item.url}>
                <>
                  <item.icon className="h-5 w-5 transition-colors duration-200" />
                  <span className="font-medium">{displayTitle}</span>
                </>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 text-white border-slate-700 z-50"
        >
          <p className="text-xs text-slate-400">{displayTooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderIconGrid = (
    items: Array<{
      titleKey?: string;
      titleFallback?: string;
      title?: string;
      url: string;
      icon: React.ElementType;
      color?: string;
      tooltipKey?: string;
      tooltipFallback?: string;
      tooltip?: string;
    }>,
  ) => (
    <div className="grid grid-cols-3 gap-2 px-2">
      {items.map(renderIconGridItem)}
    </div>
  );

  return (
    <Sidebar
      className="border-r border-white/10 z-50"
      style={{
        background:
          "linear-gradient(180deg, rgba(10, 24, 40, 0.95) 0%, rgba(30, 144, 255, 0.12) 100%)",
        backdropFilter: "blur(32px)",
      }}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-xl font-serif font-bold py-4"
            style={{
              background:
                "linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Mundo Tango
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {t('navigation:sidebar.sections.social', 'Social')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(socialItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60 flex items-center gap-1">
            <Star className="h-3 w-3" style={{ color: "#FFD700" }} />
            {t('navigation:sidebar.sections.myStuff', 'My Stuff')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {myStuffItems.length > 0 ? (
              renderIconGrid(myStuffItems)
            ) : (
              <div className="px-3 py-2 text-xs text-white/50">
                <Link to="/profile" className="hover:text-[#40E0D0] transition-colors">
                  {t('navigation:sidebar.setCityInProfile', 'Set your city in your profile')}
                </Link>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {t('navigation:sidebar.sections.community', 'Community')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(communityItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {t('navigation:sidebar.sections.proDiscovery', 'PRO Discovery')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(proDiscoveryItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {t('navigation:sidebar.sections.services', 'Services')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(servicesItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className="p-4 border-t border-white/10"
        style={{
          background:
            "linear-gradient(180deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.05) 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-[#40E0D0]/30">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback
              style={{
                background: "linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)",
                color: "white",
              }}
            >
              {displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              data-testid="text-username"
            >
              {displayName}
            </p>
            <p className="text-xs truncate opacity-60">@{username}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full font-medium transition-all duration-200"
          style={{
            borderColor: "#40E0D0",
            color: "#40E0D0",
          }}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t('common:logout', 'Logout')}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export const AppSidebar = AppSidebarComponent;
