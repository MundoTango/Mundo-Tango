import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Server,
  Rss,
  UserCircle,
  UserPlus,
  Bell,
  Compass,
  GraduationCap,
  MapPin,
  PlayCircle,
  Brain,
  ShoppingBag,
  Bot,
  Bookmark,
  Shield,
  Sparkles,
  Globe,
  Star,
  ListChecks,
  Network,
} from "lucide-react";
import { useLocation } from "wouter";
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
import { PredictiveLink } from "@/components/PredictiveLink";

// Core Social Hub (4 items)
const socialItems = [
  { title: "Memories", url: "/memories", icon: Home },
  { title: "Feed", url: "/feed", icon: Rss },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Discover", url: "/discover", icon: Compass },
];

// Community & Connections (6 items)
const communityItems = [
  { title: "Friends", url: "/friends-list", icon: UserPlus },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Invitations", url: "/invitations", icon: UserPlus },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

// Events & Calendar (2 items)
const eventsItems = [
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Calendar", url: "/calendar", icon: Calendar },
];

// Tango Resources (3 items)
const tangoItems = [
  { title: "Teachers", url: "/teachers", icon: GraduationCap },
  { title: "Venues", url: "/venues", icon: MapPin },
  { title: "Tutorials", url: "/tutorials", icon: PlayCircle },
];

// Resources (1 item)
const resourcesItems = [
  { title: "Community Map", url: "/community-world-map", icon: Globe },
];

// AI & Tools (3 items)
const toolsItems = [
  { title: "Life CEO", url: "/life-ceo", icon: Brain },
  { title: "Mr Blue AI", url: "/mr-blue-chat", icon: Bot },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag },
];

// Personal (3 items)
const personalItems = [
  { title: "Saved Posts", url: "/saved-posts", icon: Bookmark },
  { title: "Favorites", url: "/favorites", icon: Star },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Admin (2 items - role-based)
const adminItems = [
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Platform", url: "/platform", icon: Server },
];

// ESA Framework (3 items - God/Super Admin only)
const esaItems = [
  { title: "ESA Framework", url: "/platform/esa", icon: Brain },
  { title: "ESA Tasks", url: "/platform/esa/tasks", icon: ListChecks },
  { title: "ESA Comms", url: "/platform/esa/communications", icon: Network },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, profile, logout } = useAuth();

  // Use profile data for display, fallback to user email
  const displayName = profile?.name || user?.email?.split('@')[0] || "User";
  const username = profile?.username || user?.email?.split('@')[0] || "user";
  const avatarUrl = profile?.profileImage;

  // Check if user is admin (role === 'admin' or 'god')
  const isAdmin = user?.role === 'admin' || user?.role === 'god';
  // Check if user is God/Super Admin (only 'god' role for ESA access)
  const isGodAdmin = user?.role === 'god';

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-serif font-bold text-foreground">
            Mundo Tango
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Core Social Hub */}
        <SidebarGroup>
          <SidebarGroupLabel>Social</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community & Connections */}
        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Events & Calendar */}
        <SidebarGroup>
          <SidebarGroupLabel>Events</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {eventsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tango Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>Tango Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tangoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI & Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>AI & Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Personal */}
        <SidebarGroup>
          <SidebarGroupLabel>Personal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url}
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <PredictiveLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </PredictiveLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin (role-based visibility) */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        data-active={location === item.url}
                        data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <PredictiveLink to={item.url}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </PredictiveLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* ESA Framework (God/Super Admin only) */}
        {isGodAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>ESA Framework</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {esaItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      data-active={location === item.url}
                      data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <PredictiveLink to={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </PredictiveLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback>{displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-username">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{username}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full"
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
