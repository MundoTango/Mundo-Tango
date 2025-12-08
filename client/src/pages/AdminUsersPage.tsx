import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Loader2, Search, UserCheck, Mail, Target, ListFilter } from "lucide-react";
import { SelfHealingErrorBoundary } from '@/components/SelfHealingErrorBoundary';
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: number;
  name?: string;
  email: string;
  username?: string;
  displayName?: string;
  firstName?: string;
  profileImage?: string;
  avatarUrl?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

interface TalentMatch {
  id: number;
  seekerId: number;
  talentId: number;
  matchScore: number;
  matchReason?: string;
  status: string;
  createdAt: string;
  talent?: User;
}

interface Invitation {
  id: number;
  inviteeEmail?: string;
  inviteeId?: number;
  role: string;
  status: string;
  createdAt: string;
  inviter?: User;
  invitee?: User;
}

function UserRow({ user, index }: { user: User; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between py-3 border-b last:border-0"
      data-testid={`user-row-${user.id}`}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.avatarUrl || user.profileImage || ''} />
          <AvatarFallback>
            {(user.displayName || user.firstName || user.name || user.email || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold" data-testid={`text-username-${user.id}`}>
            {user.displayName || user.firstName || user.name || 'User'}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={user.role === "admin" ? "default" : "secondary"} data-testid={`badge-role-${user.id}`}>
          {user.role || 'User'}
        </Badge>
        <Badge variant={user.isActive !== false ? "default" : "destructive"} data-testid={`badge-status-${user.id}`}>
          {user.isActive !== false ? 'Active' : 'Inactive'}
        </Badge>
        {user.createdAt && (
          <span className="text-xs text-muted-foreground">
            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </span>
        )}
        <Button variant="outline" size="sm" data-testid={`button-edit-${user.id}`}>
          Edit
        </Button>
      </div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12" data-testid="loading-state">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground" data-testid="empty-state">
      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );
}

function ActiveUsersTab() {
  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ['/api/admin/users', { status: 'active' }],
  });

  const users = data?.users?.filter(u => u.isActive !== false) || [];

  if (isLoading) return <LoadingState />;
  if (users.length === 0) return <EmptyState message="No active users found" />;

  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <UserRow key={user.id} user={user} index={index} />
      ))}
    </div>
  );
}

function FoundUsersTab() {
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ['/api/admin/users', { search }],
    enabled: search.length >= 2,
  });

  const users = data?.users || [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-found-users"
        />
      </div>
      
      {search.length < 2 ? (
        <div className="text-center py-12 text-muted-foreground" data-testid="search-prompt">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter at least 2 characters to search for users</p>
        </div>
      ) : isLoading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState message={`No users found matching "${search}"`} />
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Found {users.length} users</p>
          {users.map((user, index) => (
            <UserRow key={user.id} user={user} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

function InvitedUsersTab() {
  const { data, isLoading } = useQuery<Invitation[]>({
    queryKey: ['/api/admin/invitations'],
  });

  const invitations = data || [];
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (isLoading) return <LoadingState />;
  if (pendingInvitations.length === 0) return <EmptyState message="No pending invitations" />;

  return (
    <div className="space-y-2">
      {pendingInvitations.map((invitation, index) => (
        <motion.div
          key={invitation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center justify-between py-3 border-b last:border-0"
          data-testid={`invitation-row-${invitation.id}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {invitation.invitee?.displayName || invitation.inviteeEmail || 'Pending User'}
              </p>
              <p className="text-sm text-muted-foreground">
                Invited {invitation.createdAt ? formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true }) : 'recently'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" data-testid={`badge-invited-role-${invitation.id}`}>
              {invitation.role}
            </Badge>
            <Badge variant="outline" data-testid={`badge-invited-status-${invitation.id}`}>
              Pending
            </Badge>
            <Button variant="outline" size="sm" data-testid={`button-resend-${invitation.id}`}>
              Resend
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TalentMatchTab() {
  const { data, isLoading } = useQuery<TalentMatch[]>({
    queryKey: ['/api/admin/talent-matches'],
  });

  const matches = data || [];

  if (isLoading) return <LoadingState />;
  if (matches.length === 0) return <EmptyState message="No talent matches found" />;

  return (
    <div className="space-y-2">
      {matches.map((match, index) => (
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center justify-between py-3 border-b last:border-0"
          data-testid={`talent-match-row-${match.id}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold">
                {match.talent?.displayName || match.talent?.name || `Talent #${match.talentId}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {match.matchReason || 'Match based on skills and preferences'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" data-testid={`badge-match-score-${match.id}`}>
              {Math.round(match.matchScore * 100)}% Match
            </Badge>
            <Badge 
              variant={match.status === 'accepted' ? 'default' : match.status === 'rejected' ? 'destructive' : 'secondary'}
              data-testid={`badge-match-status-${match.id}`}
            >
              {match.status}
            </Badge>
            <Button variant="outline" size="sm" data-testid={`button-view-match-${match.id}`}>
              View
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AllUsersTab() {
  const { data, isLoading } = useQuery<{ users: User[]; total: number }>({
    queryKey: ['/api/admin/users'],
  });

  const users = data?.users || [];

  if (isLoading) return <LoadingState />;
  if (users.length === 0) return <EmptyState message="No users found" />;

  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <UserRow key={user.id} user={user} index={index} />
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const { data: usersData } = useQuery<{ users: User[]; total: number }>({
    queryKey: ['/api/admin/users'],
  });

  const totalUsers = usersData?.total || usersData?.users?.length || 0;

  return (
    <SelfHealingErrorBoundary pageName="Admin Users" fallbackRoute="/admin">
      <SEO 
        title="Platform Users"
        description="Browse and manage all user accounts, roles, and permissions across the Mundo Tango platform"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-background">
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
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
                Browse and manage all {totalUsers > 0 ? totalUsers.toLocaleString() : ''} user accounts on the platform
              </p>
            </motion.div>
          </div>
        </div>

        <div className="bg-background py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-serif flex items-center gap-2">
                    <ListFilter className="h-5 w-5" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 mb-6" data-testid="user-tabs">
                      <TabsTrigger value="active" className="flex items-center gap-1" data-testid="tab-active-users">
                        <UserCheck className="h-4 w-4" />
                        <span className="hidden sm:inline">Active Users</span>
                        <span className="sm:hidden">Active</span>
                      </TabsTrigger>
                      <TabsTrigger value="found" className="flex items-center gap-1" data-testid="tab-found-users">
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Found Users</span>
                        <span className="sm:hidden">Found</span>
                      </TabsTrigger>
                      <TabsTrigger value="invited" className="flex items-center gap-1" data-testid="tab-invited-users">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Invited Users</span>
                        <span className="sm:hidden">Invited</span>
                      </TabsTrigger>
                      <TabsTrigger value="talent" className="flex items-center gap-1" data-testid="tab-talent-match">
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Talent Match</span>
                        <span className="sm:hidden">Talent</span>
                      </TabsTrigger>
                      <TabsTrigger value="all" className="flex items-center gap-1" data-testid="tab-all-users">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">All Users</span>
                        <span className="sm:hidden">All</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" data-testid="content-active-users">
                      <ActiveUsersTab />
                    </TabsContent>

                    <TabsContent value="found" data-testid="content-found-users">
                      <FoundUsersTab />
                    </TabsContent>

                    <TabsContent value="invited" data-testid="content-invited-users">
                      <InvitedUsersTab />
                    </TabsContent>

                    <TabsContent value="talent" data-testid="content-talent-match">
                      <TalentMatchTab />
                    </TabsContent>

                    <TabsContent value="all" data-testid="content-all-users">
                      <AllUsersTab />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </SelfHealingErrorBoundary>
  );
}
