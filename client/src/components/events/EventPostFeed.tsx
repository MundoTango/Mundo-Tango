import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import type { PostItemData } from "@/components/feed/PostItem";
import { Badge } from "@/components/ui/badge";
import { Star, Mic, Music, Camera, Ticket, Users, UserCheck } from "lucide-react";

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

  const canPost = permissions?.canPost || permissions?.canComment || false;
  const userRole = permissions?.role;
  const isRsvpd = permissions?.isRsvpd ?? false;

  const getRoleIcon = (role: string | null | undefined) => {
    switch (role) {
      case "organizer":
      case "co-organizer":
        return <Star className="h-3 w-3" />;
      case "dj":
        return <Music className="h-3 w-3" />;
      case "teacher":
      case "performer":
        return <Mic className="h-3 w-3" />;
      case "photographer":
        return <Camera className="h-3 w-3" />;
      case "host":
        return <UserCheck className="h-3 w-3" />;
      case "attendee":
      case "guest":
        return <Ticket className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string | null | undefined): "default" | "secondary" | "outline" => {
    switch (role) {
      case "organizer":
      case "co-organizer":
        return "default";
      case "dj":
      case "teacher":
      case "performer":
      case "host":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatRoleName = (role: string | null | undefined): string => {
    if (!role) return "";
    return role.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join("-");
  };

  return (
    <div className="space-y-4" data-testid="event-post-feed">
      {(userRole || isRsvpd) && (
        <div className="flex items-center gap-2 px-1">
          <Badge variant={getRoleBadgeVariant(userRole)} className="gap-1 text-xs">
            {getRoleIcon(userRole)}
            {userRole ? formatRoleName(userRole) : "RSVP'd"}
          </Badge>
          {!canPost && !isRsvpd && (
            <span className="text-xs text-muted-foreground">
              {permissions?.reason || "RSVP to join the discussion"}
            </span>
          )}
        </div>
      )}
      <UnifiedMemoriesFeed
        posts={transformedPosts}
        isLoading={isLoading}
        context={{ type: 'event', id: eventId, name: eventName }}
        showPostCreator={canPost}
        showFilters={true}
        onPostCreated={handlePostCreated}
        emptyMessage={canPost 
          ? `No posts about ${eventName} yet. Share your experience!`
          : `No posts about ${eventName} yet.`
        }
      />
    </div>
  );
}

export const EventPostFeed = memo(EventPostFeedComponent);
