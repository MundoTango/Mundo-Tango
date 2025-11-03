import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, MessageSquare, ThumbsUp, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectGroupPost } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface GroupPostCardProps {
  post: SelectGroupPost;
  authorName?: string;
  authorAvatar?: string;
  onPin?: (postId: number) => void;
  onUnpin?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number) => void;
  isGroupAdmin?: boolean;
}

export function GroupPostCard({ 
  post, 
  authorName, 
  authorAvatar,
  onPin,
  onUnpin,
  onDelete,
  onEdit,
  isGroupAdmin 
}: GroupPostCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-group-post-${post.id}`}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {authorName?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" data-testid={`text-post-author-${post.id}`}>
                  {authorName || 'Unknown'}
                </span>
                {post.isPinned && (
                  <Badge variant="secondary" className="gap-1" data-testid={`badge-pinned-${post.id}`}>
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground" data-testid={`text-post-time-${post.id}`}>
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          {(isGroupAdmin || post.authorId) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-post-menu-${post.id}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isGroupAdmin && (
                  <>
                    {post.isPinned ? (
                      <DropdownMenuItem onClick={() => onUnpin?.(post.id)} data-testid={`menu-unpin-${post.id}`}>
                        Unpin Post
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onPin?.(post.id)} data-testid={`menu-pin-${post.id}`}>
                        Pin Post
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuItem onClick={() => onEdit?.(post.id)} data-testid={`menu-edit-${post.id}`}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-destructive" data-testid={`menu-delete-${post.id}`}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {post.title && (
          <h4 className="font-semibold text-base" data-testid={`text-post-title-${post.id}`}>
            {post.title}
          </h4>
        )}
        
        <div className="prose prose-sm max-w-none" data-testid={`text-post-content-${post.id}`}>
          {post.content}
        </div>
        
        {post.media && post.media.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.media.slice(0, 4).map((url, idx) => (
              <img 
                key={idx}
                src={url} 
                alt={`Post media ${idx + 1}`}
                className="rounded-md object-cover w-full h-48"
                data-testid={`img-post-media-${post.id}-${idx}`}
              />
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button variant="ghost" size="sm" className="gap-2" data-testid={`button-like-post-${post.id}`}>
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likeCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" data-testid={`button-comment-post-${post.id}`}>
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount || 0}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
