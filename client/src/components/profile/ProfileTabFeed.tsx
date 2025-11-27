import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PostItem } from "@/components/feed/PostItem";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { PostCreator } from "@/components/universal/PostCreator";

interface ProfileTabFeedProps {
  userId?: number;
  isOwnProfile: boolean;
}

export default function ProfileTabFeed({ userId, isOwnProfile }: ProfileTabFeedProps) {
  const [editingPost, setEditingPost] = useState<number | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/posts?userId=${userId}&limit=50`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json();
    },
    enabled: !!userId,
  });

  const handleEdit = (postId: number) => {
    setEditingPost(postId);
  };

  const handleDelete = (postId: number) => {
    // Handled by PostItem component
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Creator - Only show on own profile */}
      {isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PostCreator />
        </motion.div>
      )}

      {/* No Posts Message */}
      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden" data-testid="card-no-posts">
            <CardContent className="py-16 text-center">
              <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">
                {isOwnProfile 
                  ? "You haven't posted anything yet. Share your tango journey!" 
                  : "No posts yet."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Posts List - Using PostItem component for full functionality */}
      {posts.map((post: any, index: number) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          data-testid={`post-item-${post.id}`}
        >
          <PostItem 
            post={post}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}
