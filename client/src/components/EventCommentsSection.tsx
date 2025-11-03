import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Reply, MoreVertical, Trash, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectEventComment } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface EventCommentsSectionProps {
  comments: SelectEventComment[];
  onAddComment?: (content: string, parentId?: number) => void;
  onEditComment?: (commentId: number, content: string) => void;
  onDeleteComment?: (commentId: number) => void;
  currentUserId?: number;
  eventId: number;
}

export function EventCommentsSection({ 
  comments, 
  onAddComment, 
  onEditComment,
  onDeleteComment,
  currentUserId,
  eventId 
}: EventCommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const { toast } = useToast();

  const topLevelComments = comments.filter(c => !c.parentCommentId);
  
  const getReplies = (parentId: number) => {
    return comments.filter(c => c.parentCommentId === parentId);
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment?.(newComment, replyToId || undefined);
    setNewComment("");
    setReplyToId(null);
    toast({ title: "Comment posted" });
  };

  const handleEdit = (commentId: number) => {
    if (!editContent.trim()) return;
    onEditComment?.(commentId, editContent);
    setEditingId(null);
    setEditContent("");
    toast({ title: "Comment updated" });
  };

  const handleDelete = (commentId: number) => {
    onDeleteComment?.(commentId);
    toast({ title: "Comment deleted" });
  };

  const renderComment = (comment: SelectEventComment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`space-y-3 ${isReply ? 'ml-12 mt-3' : ''}`}
      data-testid={`comment-${comment.id}`}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={""} />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm" data-testid={`text-comment-author-${comment.id}`}>
                User {comment.userId}
              </span>
              
              {comment.userId === currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" data-testid={`button-comment-menu-${comment.id}`}>
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      data-testid={`menu-edit-comment-${comment.id}`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(comment.id)} 
                      className="text-destructive"
                      data-testid={`menu-delete-comment-${comment.id}`}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            {editingId === comment.id ? (
              <div className="space-y-2">
                <Textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px]"
                  data-testid={`textarea-edit-comment-${comment.id}`}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(comment.id)} data-testid={`button-save-edit-${comment.id}`}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    data-testid={`button-cancel-edit-${comment.id}`}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm" data-testid={`text-comment-content-${comment.id}`}>
                {comment.content}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span data-testid={`text-comment-time-${comment.id}`}>
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs hover:text-primary"
                onClick={() => setReplyToId(comment.id)}
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {comment.isEdited && (
              <span className="italic">(edited)</span>
            )}
          </div>
        </div>
      </div>
      
      {getReplies(comment.id).map(reply => renderComment(reply, true))}
      
      {replyToId === comment.id && (
        <div className="ml-12 mt-3 space-y-2">
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-[80px]"
            data-testid={`textarea-reply-${comment.id}`}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} size="sm" data-testid={`button-submit-reply-${comment.id}`}>
              Reply
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setReplyToId(null);
                setNewComment("");
              }}
              data-testid={`button-cancel-reply-${comment.id}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card data-testid={`card-event-comments-${eventId}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add new comment */}
        <div className="space-y-3">
          <Textarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px]"
            data-testid={`textarea-new-comment-${eventId}`}
          />
          <Button onClick={handleSubmit} data-testid={`button-post-comment-${eventId}`}>
            Post Comment
          </Button>
        </div>
        
        {/* Comments list */}
        <div className="space-y-4 border-t pt-4">
          {topLevelComments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            topLevelComments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
