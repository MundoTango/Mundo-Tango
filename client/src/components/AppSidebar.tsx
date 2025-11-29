import { memo } from "react";
import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Server,
  UserCircle,
  UserPlus,
  Bell,
  Compass,
  GraduationCap,
  MapPin,
  Brain,
  ShoppingBag,
  ShoppingCart,
  Package,
  Store,
  Bot,
  Shield,
  Sparkles,
  Globe,
  Star,
  ListChecks,
  Network,
  Layout,
  LayoutDashboard,
  Briefcase,
  Building2,
  TrendingUp,
  Plane,
  PlaneTakeoff,
  Heart,
  PlusCircle,
  Folder,
  FileText,
  Files,
  BookTemplate,
  PenTool,
  Music,
  Camera,
  Drama,
  PenLine,
  Palette,
  Piano,
  Shirt,
  BookOpen,
  Target,
  Mic,
  Trophy,
  Home as HousingIcon,
  Award,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const socialItems = [
  { title: "Memories", url: "/feed", icon: Home },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Discover", url: "/discover", icon: Compass },
];

const communityItems = [
  { title: "Friends", url: "/friends-list", icon: UserPlus },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const eventsItems = [
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Calendar", url: "/calendar", icon: Calendar },
];

const travelItems = [
  { title: "Dashboard", url: "/travel", icon: Plane },
  { title: "Plan Trip", url: "/travel/planner", icon: PlaneTakeoff },
  { title: "My Trips", url: "/travel", icon: MapPin },
];

const proDiscoveryItems = [
  { title: "Learning", url: "/pro/learning", icon: GraduationCap, color: "#10B981" },
  { title: "Music", url: "/pro/music", icon: Music, color: "#8B5CF6" },
  { title: "Media Gallery", url: "/pro/media", icon: Camera, color: "#EF4444" },
  { title: "Performances", url: "/pro/performances", icon: Drama, color: "#F59E0B" },
  { title: "Venues", url: "/pro/venues", icon: Building2, color: "#6B7280" },
  { title: "Organizers", url: "/pro/organizers", icon: Calendar, color: "#3B82F6" },
  { title: "Stories & Blog", url: "/pro/stories", icon: PenLine, color: "#14B8A6" },
  { title: "Artists", url: "/pro/artists", icon: Palette, color: "#EC4899" },
  { title: "Musicians", url: "/pro/musicians", icon: Piano, color: "#A855F7" },
  { title: "Fashion", url: "/pro/fashion", icon: Shirt, color: "#EC4899" },
  { title: "Coaches", url: "/pro/coaches", icon: Target, color: "#10B981" },
  { title: "Hosts & MCs", url: "/pro/hosts", icon: Mic, color: "#F97316" },
  { title: "Vendors", url: "/pro/vendors", icon: Briefcase, color: "#6366F1" },
  { title: "Community Leaders", url: "/pro/community", icon: Globe, color: "#40E0D0" },
  { title: "Talent Match", url: "/talent-match", icon: Sparkles, color: "#1E90FF" },
];

const resourcesItems = [
  { title: "Community Map", url: "/community-world-map", icon: Globe },
  { title: "Top Contributors", url: "/leaderboard", icon: Trophy },
];

const toolsItems = [
  { title: "Life CEO", url: "/life-ceo", icon: Brain },
  { title: "Mr Blue AI", url: "/mr-blue", icon: Bot },
];

const marketplaceItems = [
  { title: "Browse Products", url: "/marketplace", icon: ShoppingBag },
  { title: "Cart", url: "/marketplace/cart", icon: ShoppingCart },
  { title: "My Orders", url: "/marketplace/orders", icon: Package },
  { title: "Seller Dashboard", url: "/marketplace/seller", icon: Store },
];

const housingItems = [
  { title: "Browse Housing", url: "/housing", icon: HousingIcon },
  { title: "My Listings", url: "/housing/my-listings", icon: Building2 },
];

const crowdfundingItems = [
  { title: "Discover", url: "/crowdfunding", icon: Heart },
  { title: "Create Campaign", url: "/crowdfunding/create", icon: PlusCircle },
  { title: "My Campaigns", url: "/crowdfunding/my", icon: Folder },
];

const financialItems = [
  { title: "Dashboard", url: "/financial", icon: LayoutDashboard },
  { title: "Portfolios", url: "/financial/portfolios", icon: Briefcase },
  { title: "Accounts", url: "/financial/accounts", icon: Building2 },
  { title: "Trading", url: "/financial/trading", icon: TrendingUp },
  { title: "Insights", url: "/financial/insights", icon: Brain },
];

const legalItems = [
  { title: "Dashboard", url: "/legal", icon: FileText },
  { title: "Documents", url: "/legal/documents", icon: Files },
  { title: "Templates", url: "/legal/templates", icon: BookTemplate },
  { title: "Pending Signatures", url: "/legal/documents?filter=pending", icon: PenTool },
];

const personalItems = [
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Platform", url: "/platform", icon: Server },
  { title: "Visual Editor", url: "/admin/visual-editor", icon: Layout },
];

const esaItems = [
  { title: "ESA Framework", url: "/platform/esa", icon: Brain },
  { title: "ESA Tasks", url: "/platform/esa/tasks", icon: ListChecks },
  { title: "ESA Comms", url: "/platform/esa/communications", icon: Network },
];

function AppSidebarComponent() {
  const [location] = useLocation();
  const { user, profile, logout } = useAuth();

  const displayName = profile?.name || user?.email?.split('@')[0] || "User";
  const username = profile?.username || user?.email?.split('@')[0] || "user";
  const avatarUrl = profile?.profileImage;

  const isAdmin = user?.role === 'admin' || user?.role === 'god';
  const isGodAdmin = user?.role === 'god';

  const renderMenuItem = (item: { title: string; url: string; icon: React.ElementType; color?: string }, isActive: boolean) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton 
        asChild 
        data-active={isActive} 
        data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
        className={cn(
          "transition-all duration-200 rounded-lg",
          isActive && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
        )}
        style={isActive ? { color: item.color || '#40E0D0' } : undefined}
      >
        <Link to={item.url}>
          <>
            <item.icon 
              className="h-5 w-5 transition-colors duration-200" 
              style={item.color ? { color: item.color } : undefined}
            />
            <span className="font-medium">{item.title}</span>
          </>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  const renderGroup = (label: string, items: typeof socialItems) => (
    <SidebarGroup className="border-b border-white/10 pb-4">
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => renderMenuItem(item, location === item.url || location.startsWith(item.url + '/')))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
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

        {renderGroup("Social", socialItems)}
        {renderGroup("Community", communityItems)}
        {renderGroup("Events", eventsItems)}
        {renderGroup("Travel", travelItems)}

        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">
            PRO Discovery
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {proDiscoveryItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + '/');
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      data-active={isActive} 
                      data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className={cn(
                        "transition-all duration-200 rounded-lg",
                        isActive && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2"
                      )}
                      style={{
                        ...(isActive ? { color: item.color, borderColor: item.color } : {}),
                      }}
                    >
                      <Link to={item.url}>
                        <>
                          <item.icon 
                            className="h-5 w-5 transition-colors duration-200" 
                            style={{ color: item.color }}
                          />
                          <span className="font-medium">{item.title}</span>
                        </>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {renderGroup("Resources", resourcesItems)}
        {renderGroup("AI & Tools", toolsItems)}
        {renderGroup("Marketplace", marketplaceItems)}
        {renderGroup("Housing", housingItems)}
        {renderGroup("Crowdfunding", crowdfundingItems)}
        {renderGroup("Financial", financialItems)}
        {renderGroup("Legal", legalItems)}
        {renderGroup("Personal", personalItems)}

        {isAdmin && (
          <>
            <SidebarSeparator className="bg-white/10" />
            {renderGroup("Admin", adminItems)}
          </>
        )}

        {isGodAdmin && renderGroup("ESA Framework", esaItems)}
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
