import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { SelectGroupPost } from "@shared/client-types";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import type { PostItemData } from "@/components/feed/PostItem";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Eye, Lock } from "lucide-react";

interface GroupPermissions {
  canPost: boolean;
  canComment: boolean;
  role: string | null;
  reason?: string;
}

interface GroupPostFeedProps {
  groupId: number;
  groupName?: string;
}

function GroupPostFeedComponent({ groupId, groupName = "Group" }: GroupPostFeedProps) {
  const { data: permissions } = useQuery<GroupPermissions>({
    queryKey: ["/api/groups", groupId, "permissions"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/permissions`, { credentials: "include" });
      if (!res.ok) return { canPost: false, canComment: false, role: null };
      return res.json();
    },
  });

  const { data: posts, isLoading } = useQuery<SelectGroupPost[]>({
    queryKey: ["/api/groups", groupId, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const transformedPosts: PostItemData[] = useMemo(() => {
    if (!posts) return [];
    
    return posts
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .map((post: any) => {
        // Build display name from firstName + lastName, fallback to name, then username
        const getDisplayName = (user: any, fallbackId: number): string => {
          if (!user) return `User #${fallbackId}`;
          if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
          if (user.firstName) return user.firstName;
          if (user.name) return user.name;
          if (user.username) return user.username;
          return `User #${fallbackId}`;
        };
        
        const userId = post.userId || post.authorId;
        
        return {
          id: post.id,
          userId: userId,
          content: post.content,
          imageUrl: null,
          videoUrl: null,
          visibility: "public",
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          createdAt: post.createdAt || new Date().toISOString(),
          isSaved: false,
          currentReaction: null,
          reactions: {},
          tags: [],
          user: post.user ? {
            id: post.user.id,
            name: getDisplayName(post.user, userId),
            username: post.user.username || `user${userId}`,
            profileImage: post.user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          } : {
            id: userId,
            name: `User #${userId}`,
            username: `user${userId}`,
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          },
        };
      });
  }, [posts]);

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
  };

  const canPost = permissions?.canPost ?? false;
  const userRole = permissions?.role;

  const getRoleIcon = (role: string | null | undefined) => {
    switch (role) {
      case "admin":
      case "creator":
        return <Shield className="h-3 w-3" />;
      case "moderator":
        return <Shield className="h-3 w-3" />;
      case "member":
        return <Users className="h-3 w-3" />;
      case "follower":
        return <Eye className="h-3 w-3" />;
      default:
        return <Lock className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string | null | undefined) => {
    switch (role) {
      case "admin":
      case "creator":
        return "default";
      case "moderator":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4" data-testid="group-post-feed">
      {userRole && (
        <div className="flex items-center gap-2 px-1">
          <Badge variant={getRoleBadgeVariant(userRole)} className="gap-1 text-xs">
            {getRoleIcon(userRole)}
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
          {!canPost && (
            <span className="text-xs text-muted-foreground">
              {permissions?.reason || "Members can post in discussions"}
            </span>
          )}
        </div>
      )}
      <UnifiedMemoriesFeed
        posts={transformedPosts}
        isLoading={isLoading}
        context={{ type: 'group', id: groupId, name: groupName }}
        showPostCreator={canPost}
        showFilters={true}
        onPostCreated={handlePostCreated}
        emptyMessage={canPost 
          ? `No posts in ${groupName} yet. Be the first to share!`
          : `No posts in ${groupName} yet.`
        }
      />
    </div>
  );
}

export const GroupPostFeed = memo(GroupPostFeedComponent);
