import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RoleIcon } from "@/components/RoleIcon";
import { getRoleByValue, getRoleLabel } from "@/lib/tangoRoles";
import { Link } from "wouter";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserIdentityHeaderProps {
  user: {
    id?: number;
    name?: string;
    username?: string;
    profileImage?: string;
    tangoRoles?: string[];
  };
  timestamp?: Date | string | null;
  showSeeFriendship?: boolean;
  isFriend?: boolean;
  currentUserId?: number;
  connectionDegree?: number | null;
  closenessScore?: number | null;
  size?: "sm" | "md" | "lg";
  showRoles?: boolean;
  showTimestamp?: boolean;
  className?: string;
  testIdPrefix?: string;
}

function safeDateDistance(date: Date | string | null | undefined, options?: { addSuffix?: boolean }) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return formatDistanceToNow(d, options);
  } catch {
    return '';
  }
}

export function UserIdentityHeader({
  user,
  timestamp,
  showSeeFriendship = false,
  isFriend = false,
  currentUserId,
  connectionDegree,
  closenessScore,
  size = "md",
  showRoles = true,
  showTimestamp = true,
  className = "",
  testIdPrefix = "user",
}: UserIdentityHeaderProps) {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const nameSizes = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  };

  const isOwnProfile = user.id === currentUserId;

  return (
    <div className={`flex items-start gap-3 flex-1 ${className}`} data-testid={`${testIdPrefix}-identity-header`}>
      <Avatar className={avatarSizes[size]}>
        <AvatarImage src={user.profileImage || ""} />
        <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0, #1E90FF)' }}>
          {user.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {user.username ? (
            <Link href={`/profile/${user.username}`}>
              <span className={`font-semibold ${nameSizes[size]} hover:underline cursor-pointer`} data-testid={`${testIdPrefix}-name`}>
                {user.name || "Unknown"}
              </span>
            </Link>
          ) : (
            <span className={`font-semibold ${nameSizes[size]}`} data-testid={`${testIdPrefix}-name`}>
              {user.name || "Unknown"}
            </span>
          )}
          
          <span className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-username`}>
            @{user.username || "unknown"}
          </span>

          {connectionDegree !== undefined && connectionDegree !== null && (
            <Badge variant="secondary" className="text-xs" data-testid={`${testIdPrefix}-degree`}>
              {connectionDegree === 1 ? '1st' : connectionDegree === 2 ? '2nd' : '3rd'}
            </Badge>
          )}

          {closenessScore !== undefined && closenessScore !== null && (
            <Badge variant="outline" className="text-xs" data-testid={`${testIdPrefix}-closeness`}>
              {closenessScore}/100
            </Badge>
          )}

          {showRoles && user.tangoRoles && user.tangoRoles.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap" data-testid={`${testIdPrefix}-roles`}>
              {user.tangoRoles.slice(0, 3).map((role) => {
                const roleData = getRoleByValue(role);
                return (
                  <Tooltip key={role}>
                    <TooltipTrigger asChild>
                      <span 
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                        style={{ 
                          backgroundColor: `${roleData?.color}20`,
                          color: roleData?.color
                        }}
                      >
                        <RoleIcon role={role} size={12} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs" sideOffset={8}>
                      {getRoleLabel(role)}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {user.tangoRoles.length > 3 && (
                <span className="text-xs text-muted-foreground">+{user.tangoRoles.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {showTimestamp && timestamp && (
          <p className="text-xs text-muted-foreground" data-testid={`${testIdPrefix}-timestamp`}>
            {safeDateDistance(timestamp, { addSuffix: true })}
          </p>
        )}
      </div>

      {showSeeFriendship && isFriend && user.id && !isOwnProfile && (
        <Button
          variant="ghost"
          size="sm"
          className="hover-elevate gap-2"
          asChild
          data-testid={`button-see-friendship-${user.id}`}
        >
          <Link href={`/friendship/${user.id}`}>
            <Users className="w-4 h-4" style={{ color: '#14B8A6' }} />
            <span className="text-xs hidden sm:inline">See Friendship</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
