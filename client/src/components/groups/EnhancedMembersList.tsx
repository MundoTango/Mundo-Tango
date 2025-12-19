import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Shield, 
  UserCog, 
  Users as UsersIcon, 
  Ban,
  Search,
  UserCheck,
  Crown,
  Clock
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { UserRoleBadges } from "@/components/UserRoleBadges";
import { Link } from "wouter";

interface EnhancedMembersListProps {
  groupId: number;
  canModerate?: boolean;
  currentUserId?: number;
}

interface MemberData {
  membership: {
    id: number;
    groupId: number;
    userId: number;
    role: string;
    joinedAt: string;
    status?: string;
  };
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    tangoRoles?: string[] | null;
  } | null;
}

export function EnhancedMembersList({ groupId, canModerate = false, currentUserId }: EnhancedMembersListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  
  const { data: rawMembers, isLoading } = useQuery<MemberData[]>({
    queryKey: ["/api/groups", groupId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  const members = useMemo(() => {
    if (!rawMembers) return [];
    return rawMembers.map(item => ({
      ...item.membership,
      user: item.user ? {
        id: item.user.id,
        name: item.user.name,
        username: item.user.username,
        avatarUrl: item.user.profileImage,
        tangoRoles: item.user.tangoRoles
      } : undefined
    }));
  }, [rawMembers]);

  const filteredMembers = useMemo(() => {
    let result = [...members];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.user?.name?.toLowerCase().includes(query) ||
        m.user?.username?.toLowerCase().includes(query)
      );
    }
    
    if (roleFilter !== "all") {
      result = result.filter(m => m.role === roleFilter);
    }
    
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.user?.name || "").localeCompare(b.user?.name || ""));
    }
    
    return result;
  }, [members, searchQuery, roleFilter, sortBy]);

  const metrics = useMemo(() => {
    const total = members.length;
    const admins = members.filter(m => m.role === "admin" || m.role === "owner").length;
    const moderators = members.filter(m => m.role === "moderator").length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentJoins = members.filter(m => new Date(m.joinedAt) > thirtyDaysAgo).length;
    
    return { total, admins, moderators, recentJoins };
  }, [members]);

  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PUT", `/api/groups/${groupId}/members/${userId}`, { role });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      toast({ title: "Role updated", description: `Member role changed to ${variables.role}.` });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update role", description: error.message });
    },
  });

  const banMember = useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      await apiRequest("POST", `/api/groups/${groupId}/members/${userId}/ban`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      toast({ title: "Member banned", description: "The member has been removed." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to ban", description: error.message });
    },
  });

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof Shield }> = {
      owner: { label: "Owner", variant: "default", icon: Crown },
      admin: { label: "Admin", variant: "secondary", icon: Shield },
      moderator: { label: "Moderator", variant: "secondary", icon: UserCog },
      member: { label: "Member", variant: "outline", icon: UsersIcon },
    };
    const c = config[role] || config.member;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="enhanced-members-list">
      {/* Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{metrics.total}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <UsersIcon className="h-4 w-4" />
              Total Members
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-500">{metrics.admins}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-4 w-4" />
              Admins
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{metrics.moderators}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <UserCog className="h-4 w-4" />
              Moderators
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{metrics.recentJoins}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              New (30d)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-member-search"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]" data-testid="select-role-filter">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]" data-testid="select-sort">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">By Name</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredMembers.length} shown</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center gap-4 p-4 hover-elevate"
                data-testid={`member-row-${member.userId}`}
              >
                <Link href={`/profile/${member.user?.username || member.userId}`}>
                  <Avatar className="h-12 w-12 cursor-pointer">
                    <AvatarImage src={member.user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.user?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${member.user?.username || member.userId}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium hover:underline cursor-pointer">
                        {member.user?.name || "Unknown"}
                      </span>
                      {member.user?.tangoRoles && member.user.tangoRoles.length > 0 && (
                        <UserRoleBadges roles={member.user.tangoRoles} size="sm" />
                      )}
                    </div>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    @{member.user?.username} • Joined {safeDateDistance(member.joinedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  {canModerate && member.userId !== currentUserId && member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-member-menu-${member.userId}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateMemberRole.mutate({ userId: member.userId, role: "admin" })}>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateMemberRole.mutate({ userId: member.userId, role: "moderator" })}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Make Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateMemberRole.mutate({ userId: member.userId, role: "member" })}>
                          <UsersIcon className="h-4 w-4 mr-2" />
                          Set as Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => banMember.mutate({ userId: member.userId })}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Remove from Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No members found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
