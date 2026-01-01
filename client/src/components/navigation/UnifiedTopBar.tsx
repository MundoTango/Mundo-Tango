import { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  Heart,
  Moon,
  Sun,
  User,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
  ArrowRight,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  Star,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { InlineSearchInput } from "@/components/navigation/InlineSearchInput";
import { FeedbackButton } from "@/components/qa/FeedbackButton";
import { cn } from "@/lib/utils";

interface UnifiedTopBarProps {
  onMenuToggle?: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  showMenuButton?: boolean;
}

// Pulse icon for notifications with turquoise ocean theme
function PulseIcon({ children, pulseColor }: { children: React.ReactNode; pulseColor?: string }) {
  return (
    <div className="relative">
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-75" 
        style={{ background: pulseColor || "rgba(64, 224, 208, 0.5)" }} 
      />
      {children}
    </div>
  );
}

// Get notification icon based on type
function getNotificationIcon(type: string) {
  const iconClass = "h-4 w-4 flex-shrink-0";
  const iconStyle = { color: '#40E0D0' };
  
  switch (type) {
    case 'role_change':
      return <Briefcase className={iconClass} style={iconStyle} />;
    case 'location_change':
      return <MapPin className={iconClass} style={iconStyle} />;
    case 'group_join':
    case 'group_leave':
      return <Users className={iconClass} style={iconStyle} />;
    case 'event_invite':
    case 'event_update':
    case 'event_rsvp':
      return <Calendar className={iconClass} style={iconStyle} />;
    case 'friend_request':
      return <UserPlus className={iconClass} style={iconStyle} />;
    case 'like':
    case 'favorite':
      return <Star className={iconClass} style={iconStyle} />;
    default:
      return <Bell className={iconClass} style={iconStyle} />;
  }
}

function UnifiedTopBar({ 
  onMenuToggle: externalMenuToggle, 
  theme: externalTheme, 
  onThemeToggle: externalThemeToggle,
  showMenuButton = true 
}: UnifiedTopBarProps) {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { theme: internalTheme, setTheme: setInternalTheme } = useTheme();
  const queryClient = useQueryClient();
  
  // Use shadcn sidebar toggle if available, fallback to external prop
  let sidebarToggle: (() => void) | undefined;
  try {
    const sidebar = useSidebar();
    sidebarToggle = sidebar?.toggleSidebar;
  } catch {
    // useSidebar throws if not inside SidebarProvider, fallback to external
  }
  const onMenuToggle = sidebarToggle || externalMenuToggle || (() => {});

  // Use external theme if provided, otherwise use internal
  const theme = externalTheme || internalTheme;
  const toggleTheme = externalThemeToggle || (() => {
    setInternalTheme(theme === 'light' ? 'dark' : 'light');
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Check if user has admin access
  const hasAdminAccess = user?.role && ['god', 'super_admin', 'admin', 'moderator'].includes(user.role);

  // Fetch notification count - uses default queryFn which includes auth headers
  const { data: notificationData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user,
  });

  const notificationCount = notificationData?.count || 0;

  // Fetch recent notifications (most recent 10) - uses proper auth headers
  const { data: recentNotifications = [], refetch: refetchNotifications } = useQuery<any[]>({
    queryKey: ['/api/notifications', { limit: 10 }],
    refetchInterval: 60000, // Auto-refresh every 60 seconds (was 5s, too aggressive)
    enabled: !!user,
  });

  // Mark notifications as read when dropdown opens
  const handleNotificationDropdownOpen = async (open: boolean) => {
    if (open && recentNotifications.length > 0 && notificationCount > 0) {
      try {
        const token = localStorage.getItem('accessToken');
        await fetch('/api/notifications/mark-all-read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        // Invalidate with exact key structure
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications', { limit: 10 }] });
        console.log('[Notifications] Marked all as read');
      } catch (error) {
        console.error('[Notifications] Failed to mark as read:', error);
      }
    }
  };

  // Handle individual notification click - navigate and close dropdown
  const handleNotificationClick = async (notif: any) => {
    let url = notif.actionUrl || notif.link;
    
    if (url) {
      // For friend request notifications, add the reviewRequest param to auto-open the modal
      if (notif.type === 'friend_request' && url.includes('/profile/')) {
        url = url + (url.includes('?') ? '&' : '?') + 'reviewRequest=true';
      }
      
      // Mark individual notification as read if not already read (isRead is the Drizzle mapped field name)
      if (!notif.isRead && notif.id) {
        try {
          const token = localStorage.getItem('accessToken');
          await fetch(`/api/notifications/${notif.id}/read`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          queryClient.invalidateQueries({ queryKey: ['/api/notifications/count'] });
          queryClient.invalidateQueries({ queryKey: ['/api/notifications', { limit: 10 }] });
        } catch (error) {
          console.error('[Notifications] Failed to mark as read:', error);
        }
      }
      // Navigate to the notification target
      setLocation(url);
    }
  };

  // Fetch message count - uses default queryFn which includes auth headers
  const { data: messageData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const messageCount = messageData?.count || 0;

  // Fetch pending friend request count (separate from notifications - shows even if notifs are read)
  const { data: friendRequestsData = [] } = useQuery<any[]>({
    queryKey: ['/api/friends/requests/received'],
    refetchInterval: 60000, // Refresh every 60 seconds
    enabled: !!user,
  });
  
  const pendingFriendRequestCount = friendRequestsData?.filter(req => req.status === 'pending')?.length || 0;

  // Global search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['/api/user/global-search', searchQuery],
    queryFn: async () => {
      const response = await fetch(
        `/api/user/global-search?q=${encodeURIComponent(searchQuery)}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: !!searchQuery.trim() && searchQuery.length > 2,
  });

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Note: Real-time updates via polling (refetchInterval in queries above)
  // WebSocket could be added later with native WebSocket API if needed

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length > 2) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/login');
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.12) 0%, rgba(30, 144, 255, 0.08) 100%)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 4px 24px rgba(64, 224, 208, 0.12)',
      }}
      data-testid="unified-topbar"
    >
      {/* Enhanced ocean gradient overlay with glassmorphic effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'linear-gradient(90deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.06) 50%, rgba(64, 224, 208, 0.08) 100%)',
        }}
      />

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 relative z-10">
        {/* Left Section - Menu & Brand */}
        <div className="flex items-center gap-4">
          {/* Menu button (mobile) - MT Ocean styled */}
          {showMenuButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuToggle}
              className="lg:block hover-elevate transition-all duration-200"
              style={{
                color: '#40E0D0',
              }}
              data-testid="button-menu-toggle"
            >
              <Menu className="h-5 w-5 transition-colors duration-200" />
            </Button>
          )}
          
          {/* Brand logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                }}
              >
                <span className="text-white font-bold text-lg">MT</span>
              </div>
              <span 
                className="text-xl font-bold hidden sm:block"
                style={{
                  background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Mundo Tango
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section - Global Search (Desktop) */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center justify-center">
          <InlineSearchInput />
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Search - Mobile Only */}
          <Link href="/search" className="md:hidden">
            <Button variant="ghost" size="icon" data-testid="button-search-mobile">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* UX-003 FIX: Feedback Button - Now visible on all devices */}
          <FeedbackButton />

          {/* Favorites - Desktop Only */}
          <Link href="/favorites" className="hidden md:block">
            <Button variant="ghost" size="icon" data-testid="button-favorites">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Friend Requests - MT Ocean Badge */}
          <Link href="/friend-requests">
            <Button variant="ghost" size="icon" className="relative transition-all duration-200" data-testid="button-friend-requests">
              <UserPlus className="h-5 w-5 transition-colors duration-200" style={{ color: pendingFriendRequestCount > 0 ? '#40E0D0' : 'currentColor' }} />
              {pendingFriendRequestCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg animate-pulse pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                  }}
                >
                  {pendingFriendRequestCount > 9 ? '9+' : pendingFriendRequestCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Messages - MT Ocean Badge */}
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative transition-all duration-200" data-testid="button-messages">
              <MessageSquare className="h-5 w-5 transition-colors duration-200" style={{ color: messageCount > 0 ? '#40E0D0' : 'currentColor' }} />
              {messageCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg animate-pulse pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                    boxShadow: '0 2px 8px rgba(64, 224, 208, 0.4)',
                  }}
                >
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Notifications Dropdown - MT Ocean Badge */}
          <DropdownMenu onOpenChange={handleNotificationDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative transition-all duration-200" data-testid="button-notifications">
                {notificationCount > 0 ? (
                  <PulseIcon pulseColor="rgba(64, 224, 208, 0.6)">
                    <Bell className="h-5 w-5 transition-colors duration-200" style={{ color: '#40E0D0' }} />
                  </PulseIcon>
                ) : (
                  <Bell className="h-5 w-5 transition-colors duration-200" />
                )}
                {notificationCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                      boxShadow: '0 2px 8px rgba(64, 224, 208, 0.4)',
                    }}
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-96 max-h-96 overflow-y-auto md:w-96 sm:w-80">
              {recentNotifications.length > 0 ? (
                <>
                  <div className="px-4 py-2 font-semibold text-sm border-b">
                    Recent Alerts
                  </div>
                  {recentNotifications.map((notif, idx) => (
                    <DropdownMenuItem
                      key={notif.id || idx}
                      onClick={() => handleNotificationClick(notif)}
                      className="cursor-pointer flex items-start gap-3 px-4 py-3 border-b last:border-0 hover:bg-accent/50"
                      data-testid={`notification-item-${idx}`}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                        {notif.createdAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {!notif.isRead && (
                        <div 
                          className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                          style={{ background: '#40E0D0' }}
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setLocation('/notifications')}
                    className="cursor-pointer justify-between"
                    data-testid="menu-item-see-all-notifications"
                  >
                    <span>See All Notifications</span>
                    <ArrowRight className="h-4 w-4" />
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => setLocation('/notifications')}
                    className="cursor-pointer justify-between"
                    data-testid="menu-item-see-all-notifications-empty"
                  >
                    <span>See All Notifications</span>
                    <ArrowRight className="h-4 w-4" />
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>


          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 md:gap-2" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profileImage || user?.profileImage || undefined} />
                  <AvatarFallback className="bg-avatar-light dark:bg-avatar-dark">
                    {profile?.name?.charAt(0) || user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b">
                <p className="font-semibold" data-testid="text-user-name">
                  {profile?.name || user?.name || user?.email}
                </p>
                <p className="text-sm text-gray-500" data-testid="text-user-username">
                  @{profile?.username || user?.username || user?.email?.split('@')[0]}
                </p>
                {hasAdminAccess && (
                  <Badge 
                    className="mt-2 font-semibold border-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.2) 0%, rgba(30, 144, 255, 0.2) 100%)',
                      color: '#40E0D0',
                    }}
                  >
                    {t('common:admin', 'Admin')}
                  </Badge>
                )}
              </div>
              
              {/* Profile Actions */}
              <DropdownMenuItem onClick={() => setLocation('/profile')} data-testid="menu-item-profile">
                <User className="mr-3 h-4 w-4" />
                {t('navigation:profile')}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-item-settings">
                <Settings className="mr-3 h-4 w-4" />
                {t('navigation:settings')}
              </DropdownMenuItem>
              
              {hasAdminAccess && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/admin')} data-testid="menu-item-admin">
                    <Shield className="mr-3 h-4 w-4" />
                    {t('navigation:adminAccess', 'Admin Access')}
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Help & Support */}
              <DropdownMenuItem onClick={() => setLocation('/help')} data-testid="menu-item-help">
                <HelpCircle className="mr-3 h-4 w-4" />
                {t('navigation:help')}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Logout */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                data-testid="menu-item-logout"
              >
                <LogOut className="mr-3 h-4 w-4" />
                {t('navigation:logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default memo(UnifiedTopBar);
