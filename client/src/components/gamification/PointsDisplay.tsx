import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function PointsDisplay() {
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/gamification/points", user?.id],
    enabled: !!user?.id,
  });

  if (!user || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover-elevate active-elevate-2 rounded-md" data-testid="points-display">
      <Trophy className="w-4 h-4 text-primary" />
      <span className="text-sm font-semibold">{data?.points || 0}</span>
      <span className="text-xs text-muted-foreground">pts</span>
    </div>
  );
}
