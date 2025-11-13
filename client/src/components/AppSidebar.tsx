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
  Layout,
} from "lucide-react";
import { useLocation, Link } from "wouter";
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

// Core Social Hub (3 items)
const socialItems = [
  { title: "Memories", url: "/memories", icon: Home },
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

// Admin (3 items - role-based)
const adminItems = [
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Platform", url: "/platform", icon: Server },
  { title: "Visual Editor", url: "/admin/visual-editor", icon: Layout },
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

        {/* Core Social Hub */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Social</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {socialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community & Connections */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Events & Calendar */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Events</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {eventsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tango Resources */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Tango Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tangoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourcesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI & Tools */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">AI & Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Personal */}
        <SidebarGroup className="border-b border-white/10 pb-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Personal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {personalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    data-active={location === item.url} 
                    data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "transition-all duration-200 rounded-lg",
                      location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                    )}
                    style={location === item.url ? { color: '#40E0D0' } : undefined}
                  >
                    <Link to={item.url}>
                      <>
                        <item.icon className="h-5 w-5 transition-colors duration-200" />
                        <span className="font-medium">{item.title}</span>
                      </>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin (role-based visibility) */}
        {isAdmin && (
          <>
            <SidebarSeparator className="bg-white/10" />
            <SidebarGroup className="border-b border-white/10 pb-4">
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        data-active={location === item.url} 
                        data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                        className={cn(
                          "transition-all duration-200 rounded-lg",
                          location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                        )}
                        style={location === item.url ? { color: '#40E0D0' } : undefined}
                      >
                        <Link to={item.url}>
                          <>
                            <item.icon className="h-5 w-5 transition-colors duration-200" />
                            <span className="font-medium">{item.title}</span>
                          </>
                        </Link>
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
          <SidebarGroup className="border-b border-white/10 pb-4">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider opacity-60">ESA Framework</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {esaItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      data-active={location === item.url} 
                      data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className={cn(
                        "transition-all duration-200 rounded-lg",
                        location === item.url && "bg-gradient-to-r from-[#40E0D0]/20 to-transparent border-l-2 border-[#40E0D0]"
                      )}
                      style={location === item.url ? { color: '#40E0D0' } : undefined}
                    >
                      <Link to={item.url}>
                        <>
                          <item.icon className="h-5 w-5 transition-colors duration-200" />
                          <span className="font-medium">{item.title}</span>
                        </>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
