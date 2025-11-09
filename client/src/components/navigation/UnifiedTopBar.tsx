import { useState, useEffect, useRef } from "react";
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
import { cn } from "@/lib/utils";

interface UnifiedTopBarProps {
  onMenuToggle: () => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  showMenuButton?: boolean;
}

// Pulse icon for notifications
function PulseIcon({ children, pulseColor }: { children: React.ReactNode; pulseColor?: string }) {
  return (
    <div className="relative">
      <div 
        className="absolute inset-0 rounded-full animate-ping opacity-75" 
        style={{ background: pulseColor || "rgba(239, 68, 68, 0.4)" }} 
      />
      {children}
    </div>
  );
}

export default function UnifiedTopBar({ 
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

  // Fetch notification count
  const { data: notificationCountData } = useQuery({
    queryKey: ['/api/notifications/count'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/count', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch notification count');
      const data = await response.json();
      return data.count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user,
  });

  const notificationCount = notificationCountData || 0;

  // Fetch message count
  const { data: messageCountData } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    queryFn: async () => {
      const response = await fetch('/api/messages/unread-count', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch message count');
      const data = await response.json();
      return data.count || 0;
    },
    refetchInterval: 30000,
    enabled: !!user,
  });

  const messageCount = messageCountData || 0;

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
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-xl",
        theme === 'light' 
          ? "bg-white/95 border-gray-200" 
          : "bg-slate-900/95 border-slate-800"
      )}
      data-testid="unified-topbar"
    >
      {/* Dark mode ocean overlay */}
      {theme === 'dark' && (
        <div className="absolute inset-0 overlay-ocean pointer-events-none" />
      )}

      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4 relative z-10">
        {/* Left Section - Menu & Brand */}
        <div className="flex items-center gap-4">
          {/* Menu button (mobile) */}
          {showMenuButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuToggle}
              className="lg:block"
              data-testid="button-menu-toggle"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          {/* Brand logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
              <div className="w-10 h-10 rounded-xl bg-brand-icon flex items-center justify-center">
                <span className="text-white font-bold text-lg">MT</span>
              </div>
              <span className="text-brand-gradient text-xl font-bold hidden sm:block">
                Mundo Tango
              </span>
            </div>
          </Link>
        </div>

        {/* Center Section - Global Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block" ref={searchRef}>
          <div className="relative rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
            {/* Search icon */}
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            
            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={t('navigation.search')}
              className="w-full pl-12 pr-4 py-2.5 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ocean-seafoam-400/50 rounded-full"
              data-testid="input-search"
            />
          </div>
          
          {/* Search results dropdown */}
          {showSearchResults && searchQuery.trim().length > 2 && (
            <div className="absolute w-full max-w-2xl mt-2 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden">
              {searchLoading ? (
                <div className="p-8 text-center text-gray-500">
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
                          <div className="text-sm hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded cursor-pointer">
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
                          <div className="text-sm hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded cursor-pointer">
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
                          <div className="flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded cursor-pointer">
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
                          <div className="text-sm hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded cursor-pointer">
                            {group.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
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

          {/* Messages */}
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-messages">
              <MessageSquare className="h-5 w-5" />
              {messageCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {messageCount > 9 ? '9+' : messageCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              {notificationCount > 0 ? (
                <PulseIcon>
                  <Bell className="h-5 w-5" />
                </PulseIcon>
              ) : (
                <Bell className="h-5 w-5" />
              )}
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </Link>

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
                  <Badge className="mt-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
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
                onClick={() => setLocation('/account/delete')}
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
