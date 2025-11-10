import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, 
  UsersRound, 
  UserCheck, 
  MessageCircle, 
  Network, 
  Calendar, 
  Star, 
  Mail,
  X,
  Sparkles,
  MapPin,
  Image,
  Bookmark,
  GraduationCap,
  Building2,
  Dumbbell,
  ShoppingBag,
  Home,
  Radio,
  Music,
  BookOpen,
  MessageSquare,
  Trophy,
  CreditCard,
  Plane,
  Phone,
  MapPinned
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Format statistics numbers with locale support
const formatStatNumber = (value: number | undefined, defaultValue: string, locale: string) => {
  if (!value && value !== 0) return defaultValue;
  
  if (value >= 1000) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(value);
  }
  
  return new Intl.NumberFormat(locale).format(value);
};

// Dance role emoji display
function RoleEmojiDisplay({ tangoRoles, leaderLevel, followerLevel }: any) {
  if (!tangoRoles || tangoRoles.length === 0) return null;
  
  return (
    <>
      {tangoRoles.includes('leader') && (
        <span title={`Leader Level: ${leaderLevel || 0}/10`}>👔</span>
      )}
      {tangoRoles.includes('follower') && (
        <span title={`Follower Level: ${followerLevel || 0}/10`}>👗</span>
      )}
    </>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: SidebarProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();

  // Use external state if provided, otherwise use internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  // Fetch global statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/community/global-stats'],
    queryFn: async () => {
      const response = await fetch('/api/community/global-stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const stats = statsData;

  // Main Navigation (Core Features)
  const mainRoutes = [
    { icon: Heart, title: t('navigation.memories'), link: "/" },
    { icon: UsersRound, title: t('navigation.tangoCommunity'), link: "/community-world-map" },
    { icon: Network, title: t('navigation.groups'), link: "/groups" },
    { icon: Calendar, title: t('navigation.events'), link: "/events" },
    { icon: MessageCircle, title: t('navigation.messages'), link: "/messages" },
    { icon: UserCheck, title: t('navigation.friends'), link: "/friends-list" },
  ];

  // Discover Section
  const discoverRoutes = [
    { icon: Star, title: "Stories", link: "/stories" },
    { icon: Image, title: "Media Gallery", link: "/media" },
    { icon: Bookmark, title: "Saved Posts", link: "/saved" },
  ];

  // Professional Services
  const professionalRoutes = [
    { icon: GraduationCap, title: "Teachers", link: "/teachers" },
    { icon: Building2, title: "Venues", link: "/venues" },
    { icon: Dumbbell, title: "Workshops", link: "/workshops" },
    { icon: MapPinned, title: "Venue Recommendations", link: "/venue-recommendations" },
  ];

  // Marketplace & Services
  const marketplaceRoutes = [
    { icon: ShoppingBag, title: "Marketplace", link: "/marketplace" },
    { icon: Home, title: "Housing", link: "/host-homes" },
    { icon: Radio, title: "Live Streams", link: "/live-streams" },
  ];

  // Resources & Community
  const resourceRoutes = [
    { icon: Music, title: "Music Library", link: "/music" },
    { icon: BookOpen, title: "Blog", link: "/blog" },
    { icon: MessageSquare, title: "Reviews", link: "/reviews" },
    { icon: Trophy, title: "Leaderboard", link: "/leaderboard" },
  ];

  // Account & Support
  const accountRoutes = [
    { icon: CreditCard, title: "Subscriptions", link: "/subscriptions" },
    { icon: Plane, title: "Travel Planner", link: "/travel-planner" },
    { icon: Phone, title: "Contact", link: "/contact" },
    { icon: Mail, title: t('navigation.roleInvitations'), link: "/invitations" },
    { icon: Star, title: t('navigation.recommendations'), link: "/recommendations" },
  ];

  // Global statistics (4 stats)
  const globalStats = [
    {
      title: t('community.globalDancers'),
      count: formatStatNumber(stats?.totalUsers, "3.2K", i18n.language),
      icon: Sparkles,
    },
    {
      title: t('community.activeEvents'), 
      count: formatStatNumber(stats?.totalEvents, "945", i18n.language),
      icon: Calendar,
    },
    {
      title: t('community.communities'),
      count: formatStatNumber(stats?.totalGroups, "6.8K", i18n.language),
      icon: UsersRound,
    },
    {
      title: t('community.yourCity'),
      count: formatStatNumber(stats?.userCityMembers, "184", i18n.language),
      icon: MapPin,
    },
  ];

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // Scroll sidebar to top when it opens
  useEffect(() => {
    if (isOpen) {
      const sidebarContent = document.querySelector('[data-testid="sidebar"] .overflow-y-auto');
      if (sidebarContent) {
        sidebarContent.scrollTop = 0;
      }
    }
  }, [isOpen]);

  // Check if route is active
  const isActive = (path: string) => location === path;

  // Use profile data for display
  const displayName = profile?.name || user?.email?.split('@')[0] || "User";
  const username = profile?.username || user?.email?.split('@')[0] || "user";
  const avatarUrl = profile?.profileImage;
  const tangoRoles = (profile as any)?.tangoRoles || [];
  const leaderLevel = (profile as any)?.leaderLevel || 0;
  const followerLevel = (profile as any)?.followerLevel || 0;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-30 w-64
          transform transition-transform duration-300 ease-in-out
          border-r flex flex-col flex-shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          height: 'calc(100vh - 4rem)',
          background: 'linear-gradient(180deg, rgba(64, 224, 208, 0.08) 0%, rgba(30, 144, 255, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(64, 224, 208, 0.2)',
        }}
        data-testid="sidebar"
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* User Profile Card */}
          <Link href={`/profile/${user?.username || username}`}>
            <div 
              className="p-3 rounded-xl hover:scale-[1.02] transition-all cursor-pointer border shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(64, 224, 208, 0.25)',
              }}
              data-testid="sidebar-profile-card"
            >
              <div className="flex items-center gap-3 mb-2">
                {/* Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                  }}
                >
                  {avatarUrl ? (
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* User Info */}
                  <div 
                    className="text-sm font-semibold truncate"
                    style={{ color: '#1E40AF' }}
                  >
                    {displayName}
                  </div>
                  <div 
                    className="text-xs truncate"
                    style={{ color: '#64748B' }}
                  >
                    @{username}
                  </div>
                </div>
              </div>
              
              {/* Dance Role Emojis */}
              {tangoRoles.length > 0 && (
                <div className="flex gap-2 text-lg">
                  <RoleEmojiDisplay 
                    tangoRoles={tangoRoles}
                    leaderLevel={leaderLevel}
                    followerLevel={followerLevel}
                  />
                </div>
              )}
            </div>
          </Link>

          {/* Helper function to render nav items */}
          {(() => {
            const renderNavItem = (item: any) => {
              const active = isActive(item.link);
              
              return (
                <div
                  key={item.link}
                  className="group flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all cursor-pointer border"
                  style={{
                    background: active 
                      ? 'rgba(64, 224, 208, 0.15)' 
                      : 'transparent',
                    borderColor: active
                      ? 'rgba(64, 224, 208, 0.3)'
                      : 'transparent',
                    color: active
                      ? '#1E90FF'
                      : '#64748B',
                  }}
                  onClick={(e) => {
                    if (active) {
                      e.preventDefault();
                      if (window.innerWidth < 1024) {
                        setIsOpen(false);
                      }
                      return;
                    }
                    window.location.href = item.link;
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  data-testid={`sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(64, 224, 208, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(64, 224, 208, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div className="transition-transform group-hover:scale-110">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-medium">
                    {item.title}
                  </div>
                </div>
              );
            };

            const renderSection = (title: string, routes: any[]) => (
              <div key={title} className="space-y-1">
                {title && (
                  <div 
                    className="text-xs font-semibold uppercase tracking-wide px-3 pt-3 pb-1"
                    style={{ color: '#64748B' }}
                  >
                    {title}
                  </div>
                )}
                {routes.map(renderNavItem)}
              </div>
            );

            return (
              <>
                {/* Main Navigation */}
                {renderSection("", mainRoutes)}
                
                {/* Discover */}
                {renderSection("Discover", discoverRoutes)}
                
                {/* Professional Services */}
                {renderSection("Professional", professionalRoutes)}
                
                {/* Marketplace & Services */}
                {renderSection("Marketplace", marketplaceRoutes)}
                
                {/* Resources & Community */}
                {renderSection("Resources", resourceRoutes)}
                
                {/* Account & Support */}
                {renderSection("Account", accountRoutes)}
              </>
            );
          })()}

          {/* Global Statistics */}
          <div className="pt-4">
            <div 
              className="text-xs font-semibold uppercase tracking-wide mb-3 px-3"
              style={{ color: '#64748B' }}
            >
              {t('community.globalStatistics')}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {globalStats.map((item, index) => (
                <button 
                  key={index}
                  className="p-3 rounded-lg hover:scale-105 transition-all border text-left shadow-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(8px)',
                    borderColor: 'rgba(64, 224, 208, 0.2)',
                  }}
                  data-testid={`stat-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {/* Icon */}
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{
                      background: 'rgba(64, 224, 208, 0.15)',
                    }}
                  >
                    <item.icon 
                      className="w-4 h-4" 
                      style={{ color: '#1E90FF' }}
                    />
                  </div>
                  
                  {/* Title */}
                  <div 
                    className="text-xs mb-1"
                    style={{ color: '#64748B' }}
                  >
                    {item.title}
                  </div>
                  
                  {/* Count */}
                  <div 
                    className="text-lg font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {item.count}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl text-center bg-footer-brand border border-footer-border">
            <div className="text-xs font-semibold text-gray-800 dark:text-ocean">
              Mundo Tango
            </div>
            <div className="text-xs text-gray-600 dark:text-ocean-muted">
              {t('community.globalCommunity')}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
