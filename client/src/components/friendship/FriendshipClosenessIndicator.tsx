import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Users, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type FriendshipTier = "close_friend" | "friend" | "acquaintance" | "none";

export interface FriendshipClosenessData {
  tier: FriendshipTier;
  closenessScore: number;
  mutualFriends?: number;
  sharedEvents?: number;
  lastInteraction?: string;
  mutualFriendPreviews?: Array<{
    id: number;
    name: string;
    avatarUrl?: string;
  }>;
}

interface FriendshipClosenessIndicatorProps {
  hostId: number;
  hostName?: string;
  variant?: "badge" | "compact" | "detailed";
  showTooltip?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  close_friend: {
    label: "Close Friend",
    icon: Heart,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    description: "You've connected deeply through tango",
  },
  friend: {
    label: "Friend",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "You've danced and connected together",
  },
  acquaintance: {
    label: "Acquaintance",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "You've crossed paths in the community",
  },
  none: {
    label: "Not Connected",
    icon: Users,
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    borderColor: "border-muted/30",
    description: "No connection yet",
  },
};

export function FriendshipClosenessIndicator({
  hostId,
  hostName,
  variant = "badge",
  showTooltip = true,
  className,
}: FriendshipClosenessIndicatorProps) {
  const { data: closenessData, isLoading } = useQuery<FriendshipClosenessData>({
    queryKey: ["/api/housing/closeness", hostId],
    enabled: !!hostId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return variant === "compact" ? (
      <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
    ) : (
      <Badge variant="outline" className={cn("animate-pulse", className)}>
        <div className="w-12 h-3 bg-muted rounded" />
      </Badge>
    );
  }

  if (!closenessData || closenessData.tier === "none") {
    return null;
  }

  const config = TIER_CONFIG[closenessData.tier];
  const IconComponent = config.icon;

  if (variant === "compact") {
    const content = (
      <div
        className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded-full",
          config.bgColor,
          config.borderColor,
          "border",
          className
        )}
        data-testid={`friendship-indicator-compact-${hostId}`}
      >
        <IconComponent className={cn("w-3.5 h-3.5", config.color)} />
      </div>
    );

    if (!showTooltip) return content;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "detailed") {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 cursor-pointer",
              config.bgColor,
              config.borderColor,
              className
            )}
            data-testid={`friendship-indicator-detailed-${hostId}`}
          >
            <IconComponent className={cn("w-3.5 h-3.5", config.color)} />
            <span className={config.color}>{config.label}</span>
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-72" align="start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full",
                  config.bgColor,
                  config.borderColor,
                  "border"
                )}
              >
                <IconComponent className={cn("w-5 h-5", config.color)} />
              </div>
              <div>
                <p className="font-semibold">{config.label}</p>
                <p className="text-sm text-muted-foreground">
                  {hostName ? `with ${hostName}` : config.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {closenessData.mutualFriends !== undefined &&
                closenessData.mutualFriends > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {closenessData.mutualFriends} mutual friend
                      {closenessData.mutualFriends !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

              {closenessData.sharedEvents !== undefined &&
                closenessData.sharedEvents > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {closenessData.sharedEvents} shared event
                      {closenessData.sharedEvents !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
            </div>

            {closenessData.mutualFriendPreviews &&
              closenessData.mutualFriendPreviews.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Mutual friends include:
                  </p>
                  <div className="flex -space-x-2">
                    {closenessData.mutualFriendPreviews
                      .slice(0, 5)
                      .map((friend) => (
                        <Avatar
                          key={friend.id}
                          className="w-8 h-8 border-2 border-background"
                        >
                          <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                          <AvatarFallback className="text-xs">
                            {friend.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    {closenessData.mutualFriendPreviews.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                        +{closenessData.mutualFriendPreviews.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Connection strength</span>
                <span className={cn("font-medium", config.color)}>
                  {Math.round((closenessData.closenessScore / 1000) * 100)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", config.color.replace("text-", "bg-"))}
                  style={{
                    width: `${(closenessData.closenessScore / 1000) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5",
        config.bgColor,
        config.borderColor,
        className
      )}
      data-testid={`friendship-indicator-${hostId}`}
    >
      <IconComponent className={cn("w-3.5 h-3.5", config.color)} />
      <span className={config.color}>{config.label}</span>
    </Badge>
  );

  if (!showTooltip) return badgeContent;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            {closenessData.mutualFriends !== undefined &&
              closenessData.mutualFriends > 0 && (
                <p className="text-xs">
                  {closenessData.mutualFriends} mutual friend
                  {closenessData.mutualFriends !== 1 ? "s" : ""}
                </p>
              )}
            {closenessData.sharedEvents !== undefined &&
              closenessData.sharedEvents > 0 && (
                <p className="text-xs">
                  {closenessData.sharedEvents} event
                  {closenessData.sharedEvents !== 1 ? "s" : ""} together
                </p>
              )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BatchFriendshipIndicatorProps {
  hostIds: number[];
  onDataLoaded?: (data: Record<number, FriendshipClosenessData>) => void;
}

export function useBatchFriendshipCloseness(hostIds: number[]) {
  return useQuery<Record<number, FriendshipClosenessData>>({
    queryKey: ["/api/housing/closeness/batch", hostIds.join(",")],
    queryFn: async () => {
      if (hostIds.length === 0) return {};
      const response = await fetch("/api/housing/closeness/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostIds }),
      });
      if (!response.ok) return {};
      return response.json();
    },
    enabled: hostIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function getTierFromScore(score: number): FriendshipTier {
  if (score >= 700) return "close_friend";
  if (score >= 400) return "friend";
  if (score >= 100) return "acquaintance";
  return "none";
}

export function getTierConfig(tier: FriendshipTier) {
  return TIER_CONFIG[tier];
}
