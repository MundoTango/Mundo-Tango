import { useState, useRef } from "react";
import { usePosts, useCreatePost, useToggleLike, useComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Globe, Users, Lock, X, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";

export default function FeedPage() {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "friends" | "private">("public");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { data: posts, isLoading } = usePosts();
  const createPost = useCreatePost();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsUploading(true);
    let imageUrl: string | null = null;

    try {
      if (selectedFile) {
        const fileName = `${Date.now()}-${selectedFile.name}`;
        const { data, error: uploadError } = await supabase
          .storage
          .from('posts')
          .upload(fileName, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase
          .storage
          .from('posts')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      await createPost.mutateAsync({
        content: content.trim(),
        visibility: visibility,
        image_url: imageUrl,
      });

      setContent("");
      setVisibility("public");
      handleRemoveImage();
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <SEO
        title="Home Feed"
        description="Connect with the tango community. Share your dance moments, discover events, and engage with fellow tango enthusiasts from around the world."
      />
      <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none border-0 text-base focus-visible:ring-0"
            data-testid="input-post-content"
          />
          
          {imagePreview && (
            <div className="relative" data-testid="image-preview-container">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg w-full object-cover max-h-96"
                data-testid="image-preview"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover-elevate active-elevate-2"
                data-testid="button-remove-image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="hover-elevate active-elevate-2"
                data-testid="button-upload-image"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                <SelectTrigger className="w-36 hover-elevate" data-testid="select-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public" data-testid="option-visibility-public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="friends" data-testid="option-visibility-friends">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Friends</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private" data-testid="option-visibility-private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              disabled={!content.trim() || isUploading}
              className="hover-elevate active-elevate-2"
              data-testid="button-create-post"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <Card className="p-6">
            <div className="text-center text-muted-foreground" data-testid="text-empty-state">
              No posts yet. Share your tango journey!
            </div>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}

function PostCard({ post }: { post: any }) {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const toggleLike = useToggleLike();
  const { data: comments, isLoading: commentsLoading } = useComments(post.id);
  const createComment = useCreateComment();
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      await toggleLike.mutateAsync(post.id);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      await createComment.mutateAsync({
        postId: post.id,
        content: commentContent.trim(),
      });
      setCommentContent("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      toast({
        title: "Failed to add comment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-post-${post.id}`}>
      <div className="flex items-start gap-4">
        <Avatar data-testid={`avatar-${post.id}`}>
          <AvatarImage src={post.profiles?.avatar_url || undefined} />
          <AvatarFallback>{post.profiles?.full_name?.charAt(0) || post.profiles?.username?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-foreground" data-testid={`text-post-author-${post.id}`}>
              {post.profiles?.full_name || post.profiles?.username || "Unknown User"}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`text-post-username-${post.id}`}>
              @{post.profiles?.username}
            </span>
            {post.created_at && (
              <span className="text-sm text-muted-foreground" data-testid={`text-post-timestamp-${post.id}`}>
                · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-foreground whitespace-pre-wrap" data-testid={`text-post-content-${post.id}`}>
            {post.content}
          </p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className="mt-3 rounded-lg w-full object-cover max-h-96"
              data-testid={`image-post-${post.id}`}
            />
          )}
        </div>
      </div>
      
      <div className="flex gap-6 mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={toggleLike.isPending}
          className="hover-elevate active-elevate-2"
          data-testid={`button-like-${post.id}`}
        >
          <Heart className="h-4 w-4 mr-2" />
          <span data-testid={`text-like-count-${post.id}`}>{post.likes || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="hover-elevate active-elevate-2"
          data-testid={`button-comment-${post.id}`}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          <span data-testid={`text-comment-count-${post.id}`}>{comments?.length || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover-elevate active-elevate-2"
          data-testid={`button-share-${post.id}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-4" data-testid={`section-comments-${post.id}`}>
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-16 resize-none"
              data-testid={`input-comment-${post.id}`}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!commentContent.trim() || createComment.isPending}
              className="hover-elevate active-elevate-2"
              data-testid={`button-submit-comment-${post.id}`}
            >
              {createComment.isPending ? "..." : "Post"}
            </Button>
          </form>

          <div className="space-y-3">
            {commentsLoading ? (
              <>
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <CommentItem key={comment.id} comment={comment} postId={post.id} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4" data-testid={`text-no-comments-${post.id}`}>
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function CommentItem({ comment, postId }: { comment: any; postId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const { toast } = useToast();

  const isOwner = user?.id === comment.user_id;

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        content: editContent.trim(),
        postId,
      });
      setIsEditing(false);
      toast({
        title: "Comment updated!",
        description: "Your comment has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to update comment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync({
        commentId: comment.id,
        postId,
      });
      toast({
        title: "Comment deleted!",
        description: "Your comment has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete comment",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-3" data-testid={`comment-${comment.id}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
          <AvatarFallback>
            {comment.profiles?.full_name?.charAt(0) || comment.profiles?.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground" data-testid={`text-comment-author-${comment.id}`}>
                {comment.profiles?.full_name || comment.profiles?.username || "Unknown User"}
              </span>
              {comment.created_at && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              )}
            </div>
            {isOwner && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover-elevate active-elevate-2"
                    data-testid={`button-comment-menu-${comment.id}`}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    data-testid={`button-edit-comment-${comment.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                    data-testid={`button-delete-comment-${comment.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-16 text-sm resize-none"
                data-testid={`input-edit-comment-${comment.id}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateComment.isPending || !editContent.trim()}
                  className="hover-elevate active-elevate-2"
                  data-testid={`button-save-comment-${comment.id}`}
                >
                  {updateComment.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={updateComment.isPending}
                  className="hover-elevate active-elevate-2"
                  data-testid={`button-cancel-edit-${comment.id}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground" data-testid={`text-comment-content-${comment.id}`}>
              {comment.content}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid={`dialog-delete-comment-${comment.id}`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid={`button-cancel-delete-${comment.id}`}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-testid={`button-confirm-delete-${comment.id}`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
