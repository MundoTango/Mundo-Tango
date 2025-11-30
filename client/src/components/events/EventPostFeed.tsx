import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import type { PostItemData } from "@/components/feed/PostItem";

interface EventPost {
  id: number;
  userId: number;
  eventId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  visibility: string;
  likes: number;
  comments: number;
  createdAt: string;
  tags?: string[];
  location?: string | null;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
}

interface EventPermissions {
  canPost: boolean;
  canComment: boolean;
  role: string | null;
  isRsvpd: boolean;
  reason?: string;
}

interface EventPostFeedProps {
  eventId: number;
  eventName?: string;
}

function EventPostFeedComponent({ eventId, eventName = "Event" }: EventPostFeedProps) {
  const { data: permissions } = useQuery<EventPermissions>({
    queryKey: ["/api/events", eventId, "permissions"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/permissions`, { credentials: "include" });
      if (!res.ok) return { canPost: false, canComment: false, role: null, isRsvpd: false };
      return res.json();
    },
  });

  const { data: posts, isLoading } = useQuery<EventPost[]>({
    queryKey: ["/api/events", eventId, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const transformedPosts: PostItemData[] = useMemo(() => {
    if (!posts) return [];
    
    return posts
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .map((post) => ({
        id: post.id,
        userId: post.userId,
        content: post.content,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        visibility: post.visibility || "public",
        likes: post.likes || 0,
        comments: post.comments || 0,
        createdAt: post.createdAt || new Date().toISOString(),
        isSaved: false,
        currentReaction: null,
        reactions: {},
        tags: post.tags || [],
        location: post.location,
        user: post.user ? {
          id: post.user.id,
          name: post.user.name || `User #${post.userId}`,
          username: post.user.username || `user${post.userId}`,
          profileImage: post.user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
        } : {
          id: post.userId,
          name: `User #${post.userId}`,
          username: `user${post.userId}`,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
        },
      }));
  }, [posts]);

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "posts"] });
  };

  // Allow posting if user can post OR comment (RSVPd users can participate)
  const canParticipate = permissions?.canPost || permissions?.canComment || false;

  return (
    <UnifiedMemoriesFeed
      posts={transformedPosts}
      isLoading={isLoading}
      context={{ type: 'event', id: eventId, name: eventName }}
      showPostCreator={canParticipate}
      showFilters={true}
      onPostCreated={handlePostCreated}
      emptyMessage={canParticipate 
        ? `No posts about ${eventName} yet. Share your experience!`
        : `No posts about ${eventName} yet. RSVP to join the discussion.`
      }
    />
  );
}

export const EventPostFeed = memo(EventPostFeedComponent);
