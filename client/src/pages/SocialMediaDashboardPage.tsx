import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlatformConnectionCard } from "@/components/social/PlatformConnectionCard";
import { SocialPostCard } from "@/components/social/SocialPostCard";
import { EngagementMetricsCard } from "@/components/social/EngagementMetricsCard";
import { Link } from "wouter";
import { PenSquare, Eye, Heart, Share2, MessageCircle, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SelectPlatformConnection, SelectSocialPost } from "@shared/schema";

export default function SocialMediaDashboardPage() {
  const { data: connections, isLoading: connectionsLoading } = useQuery<SelectPlatformConnection[]>({
    queryKey: ["/api/social/connections"],
  });

  const { data: posts, isLoading: postsLoading } = useQuery<SelectSocialPost[]>({
    queryKey: ["/api/social/posts"],
  });

  const { data: analytics } = useQuery<{
    totalReach: number;
    totalEngagement: number;
    totalShares: number;
    totalComments: number;
  }>({
    queryKey: ["/api/social/analytics", "week"],
  });

  const platformsData = [
    {
      platform: "facebook" as const,
      connection: connections?.find((c) => c.platform === "facebook"),
    },
    {
      platform: "instagram" as const,
      connection: connections?.find((c) => c.platform === "instagram"),
    },
    {
      platform: "linkedin" as const,
      connection: connections?.find((c) => c.platform === "linkedin"),
    },
    {
      platform: "twitter" as const,
      connection: connections?.find((c) => c.platform === "twitter"),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-serif font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Social Media Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your cross-platform presence in one place
            </p>
          </div>
          <Link href="/social/compose">
            <Button size="lg" data-testid="button-quick-compose">
              <PenSquare className="w-5 h-5 mr-2" />
              Quick Compose
            </Button>
          </Link>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EngagementMetricsCard
            title="Total Reach"
            value={analytics?.totalReach?.toLocaleString() || "0"}
            change={12}
            trend="up"
            icon={Eye}
          />
          <EngagementMetricsCard
            title="Engagement"
            value={analytics?.totalEngagement?.toLocaleString() || "0"}
            change={8}
            trend="up"
            icon={Heart}
          />
          <EngagementMetricsCard
            title="Shares"
            value={analytics?.totalShares?.toLocaleString() || "0"}
            change={-3}
            trend="down"
            icon={Share2}
          />
          <EngagementMetricsCard
            title="Comments"
            value={analytics?.totalComments?.toLocaleString() || "0"}
            change={15}
            trend="up"
            icon={MessageCircle}
          />
        </div>

        {/* Connected Platforms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-semibold">Connected Platforms</h2>
            <Link href="/social/connections">
              <Button variant="outline">Manage Connections</Button>
            </Link>
          </div>
          {connectionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformsData.map(({ platform, connection }) => (
                <PlatformConnectionCard
                  key={platform}
                  platform={platform}
                  isConnected={!!connection?.isActive}
                  username={connection?.platformUsername || undefined}
                  followerCount={Math.floor(Math.random() * 10000)}
                  lastPostDate={connection?.lastUsedAt?.toString()}
                  healthStatus="healthy"
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-semibold">Recent Posts</h2>
            <Link href="/social/compose">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </Link>
          </div>
          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.slice(0, 6).map((post) => (
                <SocialPostCard
                  key={post.id}
                  id={post.id}
                  content={post.content}
                  platforms={post.platforms || []}
                  status={post.status as any}
                  scheduledFor={post.scheduledFor || undefined}
                  publishedAt={post.publishedAt || undefined}
                  engagement={post.engagement as any}
                  mediaUrls={post.mediaUrls || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <PenSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="mb-4">Create your first cross-platform post</p>
              <Link href="/social/compose">
                <Button>
                  <PenSquare className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
