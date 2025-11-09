import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, 
  MapPin, Tag, Globe, Users, Lock 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to like post');
      return response.json();
    },
    onMutate: async () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    },
    onError: () => {
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const visibilityIcons = {
    public: Globe,
    friends: Users,
    private: Lock,
  };

  const VisibilityIcon = visibilityIcons[post.visibility as keyof typeof visibilityIcons] || Globe;

  return (
    <div 
      className="rounded-xl border p-6 space-y-4"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(64, 224, 208, 0.15)',
      }}
      data-testid={`post-${post.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3 flex-1">
          <Link href={`/profile/${post.user?.username || post.userId}`}>
            <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-offset-2 ring-cyan-200">
              <AvatarImage src={post.user?.profileImage} />
              <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0 0%, #1E90FF 100%)', color: 'white' }}>
                {post.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${post.user?.username || post.userId}`}>
              <div className="font-semibold hover:underline cursor-pointer">
                {post.user?.name || 'Unknown User'}
              </div>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              <span>•</span>
              <VisibilityIcon className="w-3 h-3" />
            </div>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <p className="whitespace-pre-wrap text-foreground">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, idx: number) => (
              <Badge 
                key={idx}
                variant="outline"
                className="text-xs"
                style={{
                  background: 'rgba(64, 224, 208, 0.1)',
                  borderColor: 'rgba(64, 224, 208, 0.3)',
                  color: '#1E40AF',
                }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Location (for recommendations) */}
        {post.location && (
          <div className="flex items-center gap-2 text-sm" style={{ color: '#F59E0B' }}>
            <MapPin className="w-4 h-4" />
            <span>{post.location}</span>
            {post.priceRange && (
              <Badge 
                variant="outline"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderColor: 'rgba(251, 191, 36, 0.3)',
                  color: '#F59E0B',
                }}
              >
                {post.priceRange}
              </Badge>
            )}
          </div>
        )}

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className={`grid gap-2 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.mediaUrls.map((url: string, idx: number) => (
              <img
                key={idx}
                src={url}
                alt={`Post media ${idx + 1}`}
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '400px' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'rgba(64, 224, 208, 0.15)' }}>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => likeMutation.mutate()}
          data-testid={`button-like-${post.id}`}
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
            style={isLiked ? { color: '#EF4444' } : {}}
          />
          <span className="text-sm">{likeCount > 0 ? likeCount : ''}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setShowComments(!showComments)}
          data-testid={`button-comment-${post.id}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.commentsCount || ''}</span>
        </Button>

        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="sm" className="ml-auto">
          <Bookmark className="w-5 h-5" />
        </Button>
      </div>

      {/* Comments Section (Placeholder) */}
      {showComments && (
        <div 
          className="pt-4 border-t text-center text-sm text-muted-foreground"
          style={{ borderColor: 'rgba(64, 224, 208, 0.15)' }}
        >
          Comments coming soon...
        </div>
      )}
    </div>
  );
}
