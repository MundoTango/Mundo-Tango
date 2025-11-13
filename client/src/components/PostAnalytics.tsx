import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Share2, Heart, TrendingUp, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface PostAnalyticsProps {
  postId: number;
}

interface AnalyticsData {
  views?: number;
  shares?: number;
  engagementRate?: number;
  likes?: number;
  topCountries?: { name: string; views: number }[];
}

function PostAnalyticsComponent({ postId }: PostAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/post', postId],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const metrics = [
    {
      label: "Views",
      value: analytics.views || 0,
      icon: Eye,
      change: "+12% vs avg",
    },
    {
      label: "Shares",
      value: analytics.shares || 0,
      icon: Share2,
      change: "+5 today",
    },
    {
      label: "Engagement Rate",
      value: `${((analytics.engagementRate || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      change: "Above average",
    },
    {
      label: "Likes",
      value: analytics.likes || 0,
      icon: Heart,
      change: "+8 today",
    },
  ];

  return (
    <Card data-testid="card-post-analytics">
      <CardHeader>
        <CardTitle className="text-lg">Post Analytics</CardTitle>
        <p className="text-sm text-muted-foreground">
          Only visible to you
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-1" data-testid={`metric-${metric.label.toLowerCase()}`}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <metric.icon className="w-4 h-4" />
                {metric.label}
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </div>
          ))}
        </div>

        {analytics.topCountries && analytics.topCountries.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <MapPin className="w-4 h-4" />
              Top Countries
            </div>
            <div className="space-y-2">
              {analytics.topCountries.slice(0, 3).map((country: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{country.name}</span>
                  <span className="text-muted-foreground">{country.views} views</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const PostAnalytics = memo(PostAnalyticsComponent);
