import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import PostCreator from "@/components/universal/PostCreator";

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  visibility: string;
  createdAt: string;
  likes: number;
  userName: string;
  userProfileImage?: string;
}

interface ProfileTabFeedProps {
  posts: Post[];
  isLoading: boolean;
  isOwnProfile: boolean;
}

export default function ProfileTabFeed({ posts, isLoading, isOwnProfile }: ProfileTabFeedProps) {
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
              <p className="text-lg text-muted-foreground">
                {isOwnProfile 
                  ? "You haven't posted anything yet. Share your tango journey!" 
                  : "No posts yet."}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Posts List */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover-elevate" data-testid={`card-post-${post.id}`}>
            {(post.imageUrl || post.videoUrl) && (
              <div className="relative aspect-[16/9] overflow-hidden">
                {post.imageUrl && (
                  <motion.img 
                    src={post.imageUrl} 
                    alt="Post image" 
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    data-testid={`img-post-${post.id}`}
                  />
                )}
                
                {post.videoUrl && (
                  <video 
                    src={post.videoUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    data-testid={`video-post-${post.id}`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
            )}
            
            <CardHeader className="p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.userProfileImage || undefined} />
                  <AvatarFallback>
                    {post.userName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base">{post.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 pb-6 space-y-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
                {post.content}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{post.likes || 0} likes</span>
                </div>
                <Badge variant="secondary" className="capitalize">{post.visibility}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
