import { memo } from "react";
import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  LogOut, 
  UserCircle,
  UserPlus,
  Compass,
  GraduationCap,
  MapPin,
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
  Mic,
  Trophy,
  Home as HousingIcon,
  Briefcase,
  List,
  Map,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const socialItems = [
  { title: "Memories", url: "/feed", icon: Home, tooltip: "Your feed and memories" },
  { title: "Profile", url: "/profile", icon: UserCircle, tooltip: "View your profile" },
  { title: "Discover", url: "/discover", icon: Compass, tooltip: "Discover new content" },
];

const communityItems = [
  { title: "Community Map", url: "/community-world-map", icon: Globe, tooltip: "Explore the global tango community" },
  { title: "Events", url: "/events", icon: Calendar, tooltip: "Browse events - list, calendar, or map view" },
  { title: "Groups", url: "/groups", icon: Users, tooltip: "Browse and join groups" },
  { title: "Friends", url: "/friends-list", icon: UserPlus, tooltip: "Manage your friends" },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles, tooltip: "Personalized recommendations" },
  { title: "Messages", url: "/messages", icon: MessageSquare, tooltip: "Your conversations" },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy, tooltip: "Top contributors" },
];

const proDiscoveryItems = [
  { title: "Learning", url: "/pro/learning", icon: GraduationCap, color: "#10B981", tooltip: "Classes and workshops" },
  { title: "Music", url: "/pro/music", icon: Music, color: "#8B5CF6", tooltip: "Tango music and DJs" },
  { title: "Media", url: "/pro/media", icon: Camera, color: "#EF4444", tooltip: "Photos and videos" },
  { title: "Performances", url: "/pro/performances", icon: Drama, color: "#F59E0B", tooltip: "Show performances" },
  { title: "Venues", url: "/pro/venues", icon: Building2, color: "#6B7280", tooltip: "Dance venues" },
  { title: "Organizers", url: "/pro/organizers", icon: Calendar, color: "#3B82F6", tooltip: "Event organizers" },
  { title: "Stories", url: "/pro/stories", icon: PenLine, color: "#14B8A6", tooltip: "Blog and stories" },
  { title: "Artists", url: "/pro/artists", icon: Palette, color: "#EC4899", tooltip: "Visual artists" },
  { title: "Musicians", url: "/pro/musicians", icon: Piano, color: "#A855F7", tooltip: "Live musicians" },
  { title: "Fashion", url: "/pro/fashion", icon: Shirt, color: "#EC4899", tooltip: "Tango fashion" },
  { title: "Coaches", url: "/pro/coaches", icon: Target, color: "#10B981", tooltip: "Personal coaches" },
  { title: "Hosts", url: "/pro/hosts", icon: Mic, color: "#F97316", tooltip: "Event hosts and MCs" },
  { title: "Vendors", url: "/pro/vendors", icon: Briefcase, color: "#6366F1", tooltip: "Tango vendors" },
  { title: "Leaders", url: "/pro/community", icon: Globe, color: "#40E0D0", tooltip: "Community leaders" },
  { title: "Talent Match", url: "/talent-match", icon: Sparkles, color: "#1E90FF", tooltip: "Find the perfect match" },
];

const servicesItems = [
  { title: "Life CEO", url: "/life-ceo", icon: Brain, tooltip: "AI-powered life management" },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag, tooltip: "Browse products and services" },
  { title: "Housing", url: "/housing", icon: HousingIcon, tooltip: "Find tango-friendly accommodations" },
];

function AppSidebarComponent() {
  const [location] = useLocation();
  const { user, profile, logout } = useAuth();

  const displayName = profile?.name || user?.email?.split('@')[0] || "User";
  const username = profile?.username || user?.email?.split('@')[0] || "user";
  const avatarUrl = profile?.profileImage;

  const isActive = (url: string) => location === url || location.startsWith(url + '/');

  const renderIconGridItem = (item: { title: string; url: string; icon: React.ElementType; color?: string; tooltip: string }) => (
    <Link to={item.url} key={item.title}>
      <div 
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg cursor-pointer transition-all duration-200",
          "hover:bg-[#40E0D0]/20",
          isActive(item.url) && "bg-gradient-to-r from-[#40E0D0]/30 to-transparent ring-1 ring-[#40E0D0]/50"
        )}
        data-testid={`sidebar-icon-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <item.icon 
          className="h-8 w-8" 
          style={{ color: item.color || (isActive(item.url) ? '#40E0D0' : 'currentColor') }}
        />
        <span className="text-xs font-medium text-center leading-tight">
          {item.title}
        </span>
      </div>
    </Link>
  );

  const renderSingleItem = (item: { title: string; url: string; icon: React.ElementType; tooltip: string }) => (
    <Tooltip key={item.title}>
      <TooltipTrigger asChild>
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            data-active={isActive(item.url)} 
            data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            className={cn(
              "transition-all duration-200 rounded-lg",
              isActive(item.url) && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
            )}
            style={isActive(item.url) ? { color: '#40E0D0' } : undefined}
          >
            <Link to={item.url}>
              <>
                <item.icon className="h-5 w-5 transition-colors duration-200" />
                <span className="font-medium">{item.title}</span>
              </>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
        <p className="text-xs text-slate-400">{item.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );

  const renderIconGrid = (items: Array<{ title: string; url: string; icon: React.ElementType; color?: string; tooltip: string }>) => (
    <div className="grid grid-cols-3 gap-2 px-2">
      {items.map(renderIconGridItem)}
    </div>
  );

  return (
    <Sidebar 
      className="border-r border-white/10"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 24, 40, 0.95) 0%, rgba(30, 144, 255, 0.12) 100%)',
        backdropFilter: 'blur(32px)',
      }}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel 
            className="text-xl font-serif font-bold py-4"
            style={{
              background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Mundo Tango
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Social</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(socialItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Community</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(communityItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">
            PRO Discovery
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(proDiscoveryItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Services</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderIconGrid(servicesItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter 
        className="p-4 border-t border-white/10"
        style={{
          background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.05) 100%)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 ring-2 ring-[#40E0D0]/30">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)', color: 'white' }}>
              {displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" data-testid="text-username">
              {displayName}
            </p>
            <p className="text-xs truncate opacity-60">
              @{username}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full font-medium transition-all duration-200"
          style={{
            borderColor: '#40E0D0',
            color: '#40E0D0',
          }}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export const AppSidebar = memo(AppSidebarComponent);
