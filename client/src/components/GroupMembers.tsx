import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Crown, Shield, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectGroupMember } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface GroupMembersProps {
  members: SelectGroupMember[];
  onUpdateRole?: (userId: number, role: string) => void;
  onRemoveMember?: (userId: number) => void;
  onBanMember?: (userId: number) => void;
  currentUserId?: number;
  currentUserRole?: string;
  groupId: number;
}

export function GroupMembers({ 
  members, 
  onUpdateRole,
  onRemoveMember,
  onBanMember,
  currentUserId,
  currentUserRole,
  groupId 
}: GroupMembersProps) {
  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" }> = {
      owner: { label: "Owner", icon: Crown, variant: "default" },
      admin: { label: "Admin", icon: Shield, variant: "secondary" },
      moderator: { label: "Moderator", icon: Shield, variant: "secondary" },
      member: { label: "Member", icon: null, variant: "secondary" as const },
    };
    return roles[role] || { label: role, icon: null, variant: "secondary" as const };
  };

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <Card data-testid={`card-group-members-${groupId}`}>
      <CardHeader>
        <CardTitle>Members ({members.length})</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => {
            const roleBadge = getRoleBadge(member.role || 'member');
            const RoleIcon = roleBadge.icon;
            
            return (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                data-testid={`member-item-${member.userId}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      U{member.userId}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" data-testid={`text-member-name-${member.userId}`}>
                        User {member.userId}
                      </span>
                      <Badge variant={roleBadge.variant} className="gap-1" data-testid={`badge-role-${member.userId}`}>
                        {RoleIcon && <RoleIcon className="h-3 w-3" />}
                        {roleBadge.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground" data-testid={`text-member-joined-${member.userId}`}>
                      Joined {formatDistanceToNow(new Date(member.joinedAt || Date.now()), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {canManage && member.userId !== currentUserId && member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-member-menu-${member.userId}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {currentUserRole === 'owner' && (
                        <>
                          {member.role !== 'admin' && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateRole?.(member.userId, 'admin')}
                              data-testid={`menu-make-admin-${member.userId}`}
                            >
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {member.role !== 'moderator' && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateRole?.(member.userId, 'moderator')}
                              data-testid={`menu-make-moderator-${member.userId}`}
                            >
                              Make Moderator
                            </DropdownMenuItem>
                          )}
                          {member.role !== 'member' && (
                            <DropdownMenuItem 
                              onClick={() => onUpdateRole?.(member.userId, 'member')}
                              data-testid={`menu-make-member-${member.userId}`}
                            >
                              Change to Member
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuItem 
                        onClick={() => onRemoveMember?.(member.userId)}
                        data-testid={`menu-remove-${member.userId}`}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove from Group
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onBanMember?.(member.userId)} 
                        className="text-destructive"
                        data-testid={`menu-ban-${member.userId}`}
                      >
                        Ban Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
