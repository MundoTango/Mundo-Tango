import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineEntry {
  weekNumber: number;
  autonomyPercentage: number;
  capabilities: string[];
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

interface TimelineData {
  timeline: TimelineEntry[];
}

export function AutonomyTimeline() {
  const { data, isLoading } = useQuery<TimelineData>({
    queryKey: ["/api/gamification/autonomy/timeline"],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading timeline...</div>;
  }

  const currentEntry = data?.timeline.find(e => e.isCurrent);
  const currentLevel = currentEntry?.autonomyPercentage || 0;

  return (
    <div className="space-y-6" data-testid="autonomy-timeline">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Mr. Blue Autonomy Progress</h3>
          <Badge variant="secondary" className="text-lg font-bold">
            {currentLevel}%
          </Badge>
        </div>
        <Progress value={currentLevel} className="h-3" />
        <p className="text-sm text-muted-foreground">
          {currentEntry ? (
            <>
              Week {currentEntry.weekNumber} • {" "}
              {new Date(currentEntry.startDate).toLocaleDateString()} - {new Date(currentEntry.endDate).toLocaleDateString()}
            </>
          ) : (
            "Timeline not started"
          )}
        </p>
      </div>

      <div className="space-y-4">
        {data?.timeline.map((entry, index) => (
          <Card
            key={entry.weekNumber}
            className={`p-4 ${
              entry.isCurrent
                ? "bg-primary/5 border-primary"
                : entry.isCompleted
                ? "opacity-60"
                : ""
            }`}
            data-testid={`timeline-week-${entry.weekNumber}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {entry.isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                ) : entry.isCurrent ? (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <Circle className="w-5 h-5 text-primary fill-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Week {entry.weekNumber}</h4>
                  <Badge variant={entry.isCurrent ? "default" : "secondary"}>
                    {entry.autonomyPercentage}%
                  </Badge>
                  {entry.isCurrent && (
                    <Badge variant="outline" className="bg-primary/10">
                      Current
                    </Badge>
                  )}
                </div>

                <ul className="space-y-1 text-sm">
                  {entry.capabilities.map((capability, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span className={entry.isCompleted ? "text-muted-foreground" : ""}>
                        {capability}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted-foreground">
                  {new Date(entry.startDate).toLocaleDateString()} - {new Date(entry.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
