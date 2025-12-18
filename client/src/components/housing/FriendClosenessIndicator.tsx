import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Heart, Users, Star, UserCheck } from "lucide-react";

export interface FriendClosenessData {
  isFriend: boolean;
  isOwn?: boolean;
  closeness: {
    friendName: string;
    closenessScore: number;
    tier: number;
    tierLabel: string;
    mutualFriends?: number;
    sharedEvents?: number;
    lastInteraction?: string;
  } | null;
  hostName?: string;
}

interface FriendClosenessIndicatorProps {
  data: FriendClosenessData | null | undefined;
  compact?: boolean;
}

const tierConfig: Record<string, { 
  label: string; 
  icon: typeof Heart;
  className: string;
  description: string;
}> = {
  close_friend: {
    label: "Close Friend",
    icon: Heart,
    className: "bg-primary/90 text-primary-foreground border-primary",
    description: "You have a close friendship with this host"
  },
  friend: {
    label: "Friend",
    icon: Users,
    className: "bg-secondary text-secondary-foreground border-secondary",
    description: "You know this host as a friend"
  },
  acquaintance: {
    label: "Acquaintance",
    icon: UserCheck,
    className: "bg-muted text-muted-foreground border-muted",
    description: "You've connected with this host before"
  }
};

export function FriendClosenessIndicator({ data, compact = false }: FriendClosenessIndicatorProps) {
  if (!data || !data.isFriend || !data.closeness) {
    return null;
  }

  const { closeness } = data;
  const config = tierConfig[closeness.tierLabel] || tierConfig.acquaintance;
  const Icon = config.icon;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`gap-1 ${config.className} backdrop-blur-sm`}
            data-testid={`badge-closeness-${closeness.tierLabel}`}
          >
            <Icon className="h-3 w-3" />
            <span className="text-xs">{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{closeness.friendName}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            {closeness.mutualFriends && closeness.mutualFriends > 0 && (
              <p className="text-xs text-muted-foreground">
                {closeness.mutualFriends} mutual friend{closeness.mutualFriends > 1 ? "s" : ""}
              </p>
            )}
            {closeness.sharedEvents && closeness.sharedEvents > 0 && (
              <p className="text-xs text-muted-foreground">
                {closeness.sharedEvents} shared event{closeness.sharedEvents > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
      data-testid={`closeness-indicator-${closeness.tierLabel}`}
    >
      <div className={`p-1.5 rounded-full ${config.className}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {closeness.friendName}
        </p>
      </div>
      {(closeness.mutualFriends || closeness.sharedEvents) && (
        <div className="text-right text-xs text-muted-foreground">
          {closeness.mutualFriends && closeness.mutualFriends > 0 && (
            <div>{closeness.mutualFriends} mutual</div>
          )}
          {closeness.sharedEvents && closeness.sharedEvents > 0 && (
            <div>{closeness.sharedEvents} events</div>
          )}
        </div>
      )}
    </div>
  );
}
