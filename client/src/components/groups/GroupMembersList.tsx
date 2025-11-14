import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield, UserCog, Users as UsersIcon, Ban } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateDistance } from "@/lib/safeDateFormat";
import type { SelectGroupMember } from "@shared/schema";

interface GroupMembersListProps {
  groupId: number;
  canModerate?: boolean;
  currentUserId?: number;
}

export function GroupMembersList({ groupId, canModerate = false, currentUserId }: GroupMembersListProps) {
  const { toast } = useToast();

  const { data: members, isLoading } = useQuery<Array<SelectGroupMember & { user?: { name: string; username: string; avatarUrl?: string } }>>({
    queryKey: ["/api/groups", groupId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await apiRequest("PUT", `/api/groups/${groupId}/members/${userId}`, { role });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      toast({
        title: "Role updated",
        description: `Member role changed to ${variables.role}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: error.message,
      });
    },
  });

  const banMember = useMutation({
    mutationFn: async ({ userId, reason }: { userId: number; reason?: string }) => {
      await apiRequest("POST", `/api/groups/${groupId}/members/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "members"] });
      toast({
        title: "Member banned",
        description: "The member has been removed from the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to ban member",
        description: error.message,
      });
    },
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      owner: { label: "Owner", variant: "default" as const, icon: Shield },
      admin: { label: "Admin", variant: "secondary" as const, icon: UserCog },
      moderator: { label: "Moderator", variant: "secondary" as const, icon: Shield },
      member: { label: "Member", variant: "outline" as const, icon: UsersIcon },
      pending: { label: "Pending", variant: "outline" as const, icon: UsersIcon },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedMembers = [...(members || [])].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3, pending: 4 };
    const roleA = roleOrder[a.role as keyof typeof roleOrder] ?? 5;
    const roleB = roleOrder[b.role as keyof typeof roleOrder] ?? 5;
    return roleA - roleB;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span data-testid="text-members-title">Members</span>
          <Badge variant="secondary" data-testid="text-member-count">
            {members?.length || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedMembers.length > 0 ? (
          <div className="space-y-3">
            {sortedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                data-testid={`member-item-${member.userId}`}
              >
                <Avatar>
                  <AvatarImage src={member.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} />
                  <AvatarFallback>
                    {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid={`member-name-${member.userId}`}>
                    {member.user?.name || `User #${member.userId}`}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{member.user?.username || `user${member.userId}`} · Joined{" "}
                    {member.joinedAt && safeDateDistance(member.joinedAt, { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.role && getRoleBadge(member.role)}
                  
                  {canModerate && member.userId !== currentUserId && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-member-menu-${member.userId}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateMemberRole.mutate({ userId: member.userId, role: "admin" })}
                          disabled={member.role === 'admin'}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateMemberRole.mutate({ userId: member.userId, role: "moderator" })}
                          disabled={member.role === 'moderator'}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Make Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateMemberRole.mutate({ userId: member.userId, role: "member" })}
                          disabled={member.role === 'member'}
                        >
                          <UsersIcon className="h-4 w-4 mr-2" />
                          Make Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => banMember.mutate({ userId: member.userId })}
                          className="text-destructive"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Ban Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-6">No members found</p>
        )}
      </CardContent>
    </Card>
  );
}
