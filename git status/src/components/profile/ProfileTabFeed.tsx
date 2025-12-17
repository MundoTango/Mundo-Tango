import { useState } from "react";
import { UnifiedMemoriesFeed } from "@/components/feed/UnifiedMemoriesFeed";
import { queryClient } from "@/lib/queryClient";

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  visibility: string;
  createdAt: string;
  likes: number;
  comments: number;
  isSaved?: boolean;
  currentReaction?: string | null;
  reactions?: Record<string, number>;
  tags?: string[] | null;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    friendshipStatus?: 'accepted' | 'pending' | 'none' | null;
    tangoRoles?: string[] | null;
  };
}

interface ProfileTabFeedProps {
  posts: Post[];
  isLoading: boolean;
  isOwnProfile: boolean;
  userId: number;
}

export default function ProfileTabFeed({ posts, isLoading, isOwnProfile, userId }: ProfileTabFeedProps) {
  const [editingPost, setEditingPost] = useState<number | null>(null);

  const handleEdit = (postId: number) => {
    setEditingPost(postId);
  };

  const handleDelete = (postId: number) => {
    // Handled by PostItem component
  };

  return (
    <UnifiedMemoriesFeed
      posts={posts}
      isLoading={isLoading}
      context={{ type: 'profile', id: userId }}
      showFilters={false}
      ownerId={userId}
      onPostCreated={() => queryClient.invalidateQueries({ queryKey: ['/api/posts/user', userId] })}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
