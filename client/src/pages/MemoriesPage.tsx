import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import { PostCreator } from "@/components/universal/PostCreator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Clock, MapPin, Heart, Star, Calendar, Users, Plane } from "lucide-react";
import { SEO } from "@/components/SEO";
import { queryClient } from "@/lib/queryClient";
import type { PostItemData } from "@/components/feed/PostItem";

const MEMORY_TAGS = [
  { id: "all", label: "All Memories", icon: Camera },
  { id: "milonga", label: "Milongas", icon: Star },
  { id: "festival", label: "Festivals", icon: Calendar },
  { id: "workshop", label: "Workshops", icon: Users },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "performance", label: "Performances", icon: Heart },
];

export default function MemoriesPage() {
  const { user } = useAuth();
  const [activeTag, setActiveTag] = useState("all");

  const { data: postsData, isLoading, refetch } = useQuery<{ posts: PostItemData[] }>({
    queryKey: ['/api/posts', { filter: 'memories', tag: activeTag }],
    enabled: !!user,
  });

  const posts = postsData?.posts || [];

  const handlePostCreated = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <SEO 
        title="Memories - Mundo Tango"
        description="Relive your tango journey through photos, videos, and stories. Share your milonga moments, festival highlights, and travel adventures."
      />

      <div className="mb-6">
        <h1 
          className="text-3xl font-bold mb-2"
          style={{
            background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 50%, #0047AB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Your Tango Memories
        </h1>
        <p className="text-muted-foreground">
          Document and share your journey through the world of tango
        </p>
      </div>

      <PostCreator 
        context={{ type: 'memory' }}
        onSuccess={handlePostCreated}
        className="mb-6"
      />

      <Tabs value={activeTag} onValueChange={setActiveTag} className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
          {MEMORY_TAGS.map((tag) => (
            <TabsTrigger 
              key={tag.id} 
              value={tag.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
              data-testid={`tab-memory-${tag.id}`}
            >
              <tag.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tag.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mt-4" />
              <Skeleton className="h-48 w-full mt-3 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : (
        <UnifiedMemoriesFeed
          posts={posts}
          isLoading={isLoading}
          context={{ type: 'memory' }}
          showPostCreator={false}
          emptyMessage="No memories yet. Start documenting your tango journey!"
          emptyIcon={Camera}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
