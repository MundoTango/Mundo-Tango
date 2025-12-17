import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface BadgeData {
  id: number;
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  awardedAt?: Date | null;
}

interface BadgeProgressData {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  progress: {
    current: number;
    required: number;
    percentage: number;
  };
}

export function BadgeGallery() {
  const { user } = useUser();

  const { data: earnedBadges } = useQuery<{ badges: BadgeData[] }>({
    queryKey: ["/api/gamification/badges", user?.id],
    enabled: !!user?.id,
  });

  const { data: badgeProgress } = useQuery<{ progress: BadgeProgressData[] }>({
    queryKey: ["/api/gamification/badges", user?.id, "progress"],
    enabled: !!user?.id,
  });

  if (!user) {
    return null;
  }

  const earnedBadgeIds = new Set(earnedBadges?.badges.map(b => b.badgeId) || []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4" data-testid="section-earned-badges">Earned Badges ({earnedBadges?.badges.length || 0})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {earnedBadges?.badges.map((badge) => (
            <Card key={badge.id} className="p-4 text-center hover-elevate" data-testid={`badge-earned-${badge.badgeId}`}>
              <div className="text-4xl mb-2">{badge.iconUrl}</div>
              <h4 className="font-semibold text-sm">{badge.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              {badge.awardedAt && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {new Date(badge.awardedAt).toLocaleDateString()}
                </Badge>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4" data-testid="section-locked-badges">Locked Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {badgeProgress?.progress
            .filter(b => !earnedBadgeIds.has(b.badgeId))
            .map((badge) => (
              <Card key={badge.badgeId} className="p-4 text-center opacity-60" data-testid={`badge-locked-${badge.badgeId}`}>
                <div className="relative">
                  <div className="text-4xl mb-2 filter grayscale">{badge.iconUrl}</div>
                  <Lock className="w-4 h-4 absolute top-0 right-0 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                <div className="mt-3 space-y-1">
                  <Progress value={badge.progress.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {badge.progress.current} / {badge.progress.required}
                  </p>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
