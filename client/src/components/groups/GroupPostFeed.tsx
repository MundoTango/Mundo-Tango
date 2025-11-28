import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { SelectGroupPost } from "@shared/schema";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import type { PostItemData } from "@/components/feed/PostItem";

interface GroupPostFeedProps {
  groupId: number;
  groupName?: string;
  canPost?: boolean;
  canModerate?: boolean;
}

function GroupPostFeedComponent({ groupId, groupName = "Group", canPost = false, canModerate = false }: GroupPostFeedProps) {
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
      .map((post) => ({
        id: post.id,
        userId: post.authorId,
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
        user: {
          id: post.authorId,
          name: `User #${post.authorId}`,
          username: `user${post.authorId}`,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`,
        },
      }));
  }, [posts]);

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/groups", groupId, "posts"] });
  };

  return (
    <UnifiedMemoriesFeed
      posts={transformedPosts}
      isLoading={isLoading}
      context={{ type: 'group', id: groupId, name: groupName }}
      showPostCreator={canPost}
      showFilters={true}
      onPostCreated={handlePostCreated}
      emptyMessage={canPost ? `No posts in ${groupName} yet. Be the first to share!` : `No posts in ${groupName} yet.`}
      data-testid="group-post-feed"
    />
  );
}

export const GroupPostFeed = memo(GroupPostFeedComponent);
