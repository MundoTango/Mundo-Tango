import { useState, useEffect, useRef, memo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
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
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  ChevronDown,
  Download,
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
import { LanguageSelectorButton } from "@/components/LanguageSelector";
import { ConnectionStatusBadge } from "@/components/feed/ConnectionStatusBadge";
import { cn } from "@/lib/utils";

interface UnifiedTopBarProps {
  onMenuToggle: () => void;
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

function UnifiedTopBar({ 
  onMenuToggle, 
  theme: externalTheme, 
  onThemeToggle: externalThemeToggle,
  showMenuButton = true 
}: UnifiedTopBarProps) {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const { theme: internalTheme, setTheme: setInternalTheme } = useTheme();
  const queryClient = useQueryClient();

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

  // Fetch message count - uses default queryFn which includes auth headers
  const { data: messageData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const messageCount = messageData?.count || 0;

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

        {/* Center Section - Global Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block" ref={searchRef}>
          <div 
            className="relative rounded-full overflow-hidden border shadow-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.18) 0%, rgba(30, 144, 255, 0.15) 100%)',
              backdropFilter: 'blur(16px)',
              borderColor: 'rgba(64, 224, 208, 0.4)',
            }}
          >
            {/* Search icon */}
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" 
              style={{ color: '#64748B' }}
            />
            
            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('navigation.search')}
              className="w-full pl-12 pr-4 py-2.5 bg-transparent text-sm focus:outline-none rounded-full"
              style={{ color: '#1E40AF' }}
              data-testid="input-search"
            />
          </div>
          
          {/* Search results dropdown - MT Ocean Glassmorphic */}
          {showSearchResults && searchQuery.trim().length > 2 && (
            <div 
              className="absolute w-full max-w-2xl mt-2 rounded-xl overflow-hidden border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.15) 0%, rgba(30, 144, 255, 0.12) 100%)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 8px 32px rgba(64, 224, 208, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {searchLoading ? (
                <div className="p-8 text-center" style={{ color: '#40E0D0' }}>
                  {t('search.searching')}
                </div>
              ) : searchResults?.data ? (
                <div className="grid grid-cols-4 gap-4 p-4">
                  {/* Posts */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      {t('search.posts')}
                    </h3>
                    <div className="space-y-2">
                      {searchResults.data.posts?.slice(0, 5).map((post: any) => (
                        <Link key={post.id} href={`/post/${post.id}`}>
                          <div className="text-sm p-2 rounded cursor-pointer transition-all duration-200 hover-elevate" style={{ color: 'var(--foreground)' }}>
                            {post.content?.substring(0, 50)}...
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Events */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      {t('search.events')}
                    </h3>
                    <div className="space-y-2">
                      {searchResults.data.events?.slice(0, 5).map((event: any) => (
                        <Link key={event.id} href={`/events/${event.id}`}>
                          <div className="text-sm p-2 rounded cursor-pointer transition-all duration-200 hover-elevate" style={{ color: 'var(--foreground)' }}>
                            {event.title}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* People */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      People
                    </h3>
                    <div className="space-y-2">
                      {searchResults.data.users?.slice(0, 5).map((user: any) => (
                        <Link key={user.id} href={`/profile/${user.username}`}>
                          <div className="flex items-center gap-2 text-sm p-2 rounded cursor-pointer transition-all duration-200 hover-elevate" style={{ color: 'var(--foreground)' }}>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Groups */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      {t('search.groups')}
                    </h3>
                    <div className="space-y-2">
                      {searchResults.data.groups?.slice(0, 5).map((group: any) => (
                        <Link key={group.id} href={`/groups/${group.slug}`}>
                          <div className="text-sm p-2 rounded cursor-pointer transition-all duration-200 hover-elevate" style={{ color: 'var(--foreground)' }}>
                            {group.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center" style={{ color: 'var(--muted-foreground)' }}>
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LanguageSelectorButton />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Favorites */}
          <Link href="/favorites">
            <Button variant="ghost" size="icon" data-testid="button-favorites">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Messages - MT Ocean Badge */}
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative transition-all duration-200" data-testid="button-messages">
              <MessageSquare className="h-5 w-5 transition-colors duration-200" style={{ color: messageCount > 0 ? '#40E0D0' : 'currentColor' }} />
              {messageCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg animate-pulse"
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

          {/* Notifications - MT Ocean Badge */}
          <Link href="/notifications">
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
                  className="absolute -top-1 -right-1 h-5 w-5 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                    boxShadow: '0 2px 8px rgba(64, 224, 208, 0.4)',
                  }}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Connection Status Badge */}
          <ConnectionStatusBadge />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
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
                    {t('common.admin')}
                  </Badge>
                )}
              </div>
              
              {/* Profile Actions */}
              <DropdownMenuItem onClick={() => setLocation('/profile')} data-testid="menu-item-profile">
                <User className="mr-3 h-4 w-4" />
                {t('navigation.profile')}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-item-settings">
                <Settings className="mr-3 h-4 w-4" />
                {t('navigation.settings')}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/settings/security')} data-testid="menu-item-security">
                <Shield className="mr-3 h-4 w-4" />
                Security
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/settings/privacy-data')} data-testid="menu-item-privacy-data">
                <FileText className="mr-3 h-4 w-4" />
                Privacy & Data
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/settings/data-export')} data-testid="menu-item-data-export">
                <Download className="mr-3 h-4 w-4" />
                Data Export
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/settings/billing')} data-testid="menu-item-billing">
                <CreditCard className="mr-3 h-4 w-4" />
                {t('navigation.billing')}
              </DropdownMenuItem>
              
              {hasAdminAccess && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/admin')} data-testid="menu-item-admin">
                    <Shield className="mr-3 h-4 w-4" />
                    {t('navigation.adminAccess')}
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              {/* Help & Legal */}
              <DropdownMenuItem onClick={() => setLocation('/help')} data-testid="menu-item-help">
                <HelpCircle className="mr-3 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/privacy')} data-testid="menu-item-privacy">
                <FileText className="mr-3 h-4 w-4" />
                Privacy Policy
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => setLocation('/terms')} data-testid="menu-item-terms">
                <FileText className="mr-3 h-4 w-4" />
                Terms & Conditions
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Danger Zone */}
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                data-testid="menu-item-logout"
              >
                <LogOut className="mr-3 h-4 w-4" />
                {t('navigation.logout')}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setLocation('/settings/delete-account')}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                data-testid="menu-item-delete-account"
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default memo(UnifiedTopBar);
