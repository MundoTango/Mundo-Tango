import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  Share2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { safeDateDistance } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";

interface AnalyticsDetail {
  id: number;
  type: string;
  title: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  uniqueUsers: number;
  avgEngagementRate: number;
  createdAt: Date;
  lastActivity: Date;
  topLocations: { city: string; count: number }[];
  dailyStats: { date: string; views: number; engagement: number }[];
}

export default function AdminAnalyticsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState("7d");

  const { data: analytics, isLoading } = useQuery<AnalyticsDetail>({
    queryKey: ["/api/admin/analytics", id, timeRange],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto max-w-7xl py-8 px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="container mx-auto max-w-7xl py-8 px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Analytics data not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      icon: Eye,
      label: "Total Views",
      value: analytics.totalViews.toLocaleString(),
      color: "text-blue-500",
    },
    {
      icon: Heart,
      label: "Total Likes",
      value: analytics.totalLikes.toLocaleString(),
      color: "text-red-500",
    },
    {
      icon: MessageSquare,
      label: "Comments",
      value: analytics.totalComments.toLocaleString(),
      color: "text-green-500",
    },
    {
      icon: Share2,
      label: "Shares",
      value: analytics.totalShares.toLocaleString(),
      color: "text-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <SEO
        title={`Analytics - ${analytics.title}`}
        description="Detailed analytics dashboard with engagement metrics, user statistics, and performance insights"
        ogImage="/og-image.png"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold text-foreground flex items-center gap-3"
              data-testid="text-analytics-title"
            >
              <BarChart3 className="h-10 w-10 text-primary" />
              Analytics Detail
            </h1>
            <p className="text-muted-foreground mt-2">
              {analytics.title}
            </p>
            <div className="flex gap-2 mt-4">
              <Badge variant="outline">{analytics.type}</Badge>
              <Badge variant="outline">
                Created {safeDateDistance(analytics.createdAt)} ago
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p
                        className="text-3xl font-bold"
                        data-testid={`stat-${stat.label.toLowerCase().replace(" ", "-")}`}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={`h-10 w-10 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Engagement & Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Engagement Rate
                </CardTitle>
                <CardDescription>Average user engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary mb-2">
                  {(analytics.avgEngagementRate * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on likes, comments, and shares relative to views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Unique Users
                </CardTitle>
                <CardDescription>Individual user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary mb-2">
                  {analytics.uniqueUsers.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  Unique users who engaged with this content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Locations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Top Locations
              </CardTitle>
              <CardDescription>
                Geographic distribution of engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topLocations.map((location, index) => (
                  <div
                    key={location.city}
                    className="flex items-center justify-between"
                    data-testid={`location-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium">{location.city}</span>
                    </div>
                    <Badge variant="outline">
                      {location.count.toLocaleString()} views
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Daily Statistics
              </CardTitle>
              <CardDescription>
                Daily breakdown of views and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.dailyStats.map((stat) => (
                  <div
                    key={stat.date}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    data-testid={`daily-stat-${stat.date}`}
                  >
                    <span className="font-medium">{stat.date}</span>
                    <div className="flex gap-4">
                      <span className="text-sm text-muted-foreground">
                        {stat.views} views
                      </span>
                      <span className="text-sm text-primary">
                        {(stat.engagement * 100).toFixed(1)}% engagement
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
