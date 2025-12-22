import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, Calendar, Award } from "lucide-react";

interface MemoryStats {
  totalMemories: number;
  eventsAttended: number;
  milestones: number;
  thisYear: number;
}

export function MemoryStatsPage() {
  const { t } = useTranslation(["pages", "common"]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemoryStats = async () => {
      try {
        const response = await fetch('/api/memories/stats');
        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized');
            return;
          }
          throw new Error('Failed to fetch memory stats');
        }
        const data = await response.json();
        setMemoryStats(data);
      } catch (err) {
        console.error('Error fetching memory stats:', err);
        setError('Failed to load memory stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemoryStats();
  }, []);

  const statsCards = [
    {
      title: "Total Memories",
      value: memoryStats?.totalMemories ?? 0,
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Events Attended",
      value: memoryStats?.eventsAttended ?? 0,
      icon: Calendar,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Milestones",
      value: memoryStats?.milestones ?? 0,
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      title: "This Year",
      value: memoryStats?.thisYear ?? 0,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  return (
    <main data-testid="stats-page" className="stats-container p-6 space-y-6">
      <header className="mb-6">
        <h1 data-testid="stats-title" className="text-2xl font-bold text-foreground">
          Memory Statistics
        </h1>
        <p className="text-muted-foreground">
          Track your tango journey and memories
        </p>
      </header>

      {error ? (
        <Card data-testid="stats-error">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <div data-testid="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={stat.title} data-testid={`stats-card-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div data-testid={`stats-value-${index}`} className="text-2xl font-bold">
                    {stat.value}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading && (
        <p data-testid="stats-loading" className="text-muted-foreground">
          Loading memory stats...
        </p>
      )}
    </main>
  );
}

export default MemoryStatsPage;
