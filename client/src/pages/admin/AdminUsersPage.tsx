import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, ChevronLeft, ChevronRight, UserCheck, UserPlus, Clock, Globe } from "lucide-react";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type UserTab = "active" | "scraped" | "invited" | "waitlist";

interface User {
  id: number;
  name: string;
  email: string | null;
  username?: string | null;
  profileImage?: string | null;
  role: string;
  isActive?: boolean;
  suspended?: boolean;
  type?: string;
  profileType?: string;
  claimed?: boolean;
  scrapedAt?: string;
  invitedBy?: string;
  invitedById?: number;
  sentVia?: string;
  sentAt?: string;
  registered?: boolean;
  inviteCode?: string;
  waitlistDate?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

interface UserCounts {
  active: number;
  waitlist: number;
  scraped: number;
  invited: number;
}

export default function AdminUsersPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<UserTab>("active");
  const limit = 20;

  const { data: counts } = useQuery<UserCounts>({
    queryKey: ['/api/admin/users/counts'],
  });

  const { data: usersResponse, isLoading } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users', { search, page, limit, tab: activeTab }],
  });

  const users = usersResponse?.users || [];
  const total = usersResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserTab);
    setPage(1);
    setSearch('');
  };

  const getStatusBadge = (user: User) => {
    if (user.type === "scraped") {
      return user.claimed ? 
        <Badge variant="default">Claimed</Badge> : 
        <Badge variant="outline">Unclaimed</Badge>;
    }
    if (user.type === "invited") {
      return user.registered ? 
        <Badge variant="default">Registered</Badge> : 
        <Badge variant="outline">Pending</Badge>;
    }
    if (user.type === "waitlist") {
      return <Badge variant="secondary">Waitlisted</Badge>;
    }
    if (user.suspended) return <Badge variant="destructive">Suspended</Badge>;
    if (user.isActive === false) return <Badge variant="outline">Inactive</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  const getTabIcon = (tab: UserTab) => {
    switch (tab) {
      case "active": return <UserCheck className="w-4 h-4" />;
      case "scraped": return <Globe className="w-4 h-4" />;
      case "invited": return <UserPlus className="w-4 h-4" />;
      case "waitlist": return <Clock className="w-4 h-4" />;
    }
  };

  const getTabLabel = (tab: UserTab) => {
    const tabCounts = counts || { active: 0, waitlist: 0, scraped: 0, invited: 0 };
    switch (tab) {
      case "active": return `Active (${tabCounts.active})`;
      case "scraped": return `Found (${tabCounts.scraped})`;
      case "invited": return `Invited (${tabCounts.invited})`;
      case "waitlist": return `Waitlist (${tabCounts.waitlist})`;
    }
  };

  const getEmptyMessage = () => {
    if (search) return `No users found matching "${search}"`;
    switch (activeTab) {
      case "active": return "No active users found";
      case "scraped": return "No scraped profiles found. Profiles discovered through scraping will appear here.";
      case "invited": return "No invitations sent yet. Invite friends to see them here.";
      case "waitlist": return "No users on waitlist";
      default: return "No users found";
    }
  };

  const getProfileLink = (user: User): string => {
    if (user.type === "active" || user.type === "waitlist") {
      return `/admin/users/${user.id}`;
    }
    if (user.type === "scraped") {
      return `/profile/scraped/${user.id}`;
    }
    if (user.type === "invited") {
      return `/admin/invitations/${user.id}`;
    }
    return `/admin/users/${user.id}`;
  };

  const renderUserRow = (user: User) => {
    const isScraped = user.type === "scraped";
    const isInvited = user.type === "invited";

    return (
      <div
        key={`${user.type}-${user.id}`}
        className="flex items-center justify-between py-3 border-b last:border-0"
        data-testid={`user-row-${user.type}-${user.id}`}
      >
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.profileImage || ''} alt={user.name || 'User'} />
            <AvatarFallback>
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold" data-testid={`text-name-${user.type}-${user.id}`}>
              {user.name || 'Unknown'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isScraped && user.profileType && (
                <span className="capitalize">{user.profileType}</span>
              )}
              {isInvited && user.invitedBy && (
                <span>Invited by {user.invitedBy}</span>
              )}
              {!isScraped && !isInvited && user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isScraped && !isInvited && (
            <Badge 
              variant={user.role === "admin" ? "default" : "secondary"}
              data-testid={`badge-role-${user.type}-${user.id}`}
            >
              {user.role}
            </Badge>
          )}
          {isScraped && user.profileType && (
            <Badge variant="secondary" className="capitalize">
              {user.profileType}
            </Badge>
          )}
          {isInvited && user.sentVia && (
            <Badge variant="secondary" className="capitalize">
              via {user.sentVia}
            </Badge>
          )}
          {getStatusBadge(user)}
          <Link href={getProfileLink(user)}>
            <Button variant="outline" size="sm" data-testid={`button-view-${user.type}-${user.id}`}>
              View
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <SelfHealingErrorBoundary pageName="Admin Users" fallbackRoute="/admin">
      <SEO 
        title="Platform Users"
        description="Browse and manage all user accounts, roles, and permissions across the Mundo Tango platform"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-background">
        <div className="relative h-[40vh] md:h-[45vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop')`
          }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm" data-testid="badge-category">
                <Users className="w-3 h-3 mr-1.5" />
                User Directory
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-page-title">
                Platform Users
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Manage active users, discover scraped profiles, track invitations, and handle waitlist
              </p>
            </motion.div>
          </div>
        </div>

        <div className="bg-background py-8 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList className="grid w-full grid-cols-4 gap-2" data-testid="tabs-user-types">
                  {(["active", "scraped", "invited", "waitlist"] as UserTab[]).map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab}
                      className="flex items-center gap-2"
                      data-testid={`tab-${tab}`}
                    >
                      {getTabIcon(tab)}
                      <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                      <span className="sm:hidden">{counts?.[tab] || 0}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="text-2xl font-serif" data-testid="text-user-count">
                      {activeTab === "active" && "Active Users"}
                      {activeTab === "scraped" && "Found Profiles"}
                      {activeTab === "invited" && "Invited Users"}
                      {activeTab === "waitlist" && "Waitlist"}
                      {" "}({total})
                    </CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="pl-10"
                        data-testid="input-search-users"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="mb-4">
                        {getTabIcon(activeTab)}
                      </div>
                      <p>{getEmptyMessage()}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map(renderUserRow)}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground" data-testid="text-pagination">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">User Visibility Rules</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><span className="font-medium text-foreground">Active Users</span> - Can see and interact with other active users on the platform</li>
                  <li><span className="font-medium text-foreground">Found Profiles</span> - Discovered through scraping, only visible here until claimed</li>
                  <li><span className="font-medium text-foreground">Invited Users</span> - Pending invitations, only visible here until they register</li>
                  <li><span className="font-medium text-foreground">Waitlist</span> - Users awaiting platform access, only visible here</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
