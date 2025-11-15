import { useState } from "react";
import { Pencil, Trash2, SmilePlus, Bookmark, Share2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MessageActionsProps {
  messageId: string;
  isOwnMessage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReactionAdded?: () => void;
}

const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "👏"];

export function MessageActions({ 
  messageId, 
  isOwnMessage, 
  onEdit, 
  onDelete,
  onReactionAdded 
}: MessageActionsProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReact = async (emoji: string) => {
    try {
      await apiRequest(`/api/mrblue/messages/${messageId}/react`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      });

      setShowEmojiPicker(false);
      
      if (onReactionAdded) {
        onReactionAdded();
      }
    } catch (error) {
      console.error('[MessageActions] React error:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await apiRequest(`/api/mrblue/messages/${messageId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const action = (response as any)?.action || 'added';
      
      toast({
        title: action === 'added' ? "Bookmarked" : "Bookmark removed",
        description: action === 'added' 
          ? "Message saved to your bookmarks" 
          : "Message removed from bookmarks",
      });
    } catch (error) {
      console.error('[MessageActions] Bookmark error:', error);
      toast({
        title: "Error",
        description: "Failed to bookmark message",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const response = await apiRequest(`/api/mrblue/messages/${messageId}/share`, {
        method: 'POST',
      });

      const url = (response as any)?.url;
      
      if (url) {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('[MessageActions] Share error:', error);
      toast({
        title: "Error",
        description: "Failed to copy share link",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await apiRequest(`/api/mrblue/messages/${messageId}`, {
        method: 'DELETE',
      });

      onDelete();
      
      toast({
        title: "Message deleted",
        description: "Your message has been deleted",
      });
    } catch (error) {
      console.error('[MessageActions] Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Emoji Reaction */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost"
            className="h-6 w-6"
            data-testid={`button-react-${messageId}`}
          >
            <SmilePlus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {commonEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-lg"
                onClick={() => handleReact(emoji)}
                data-testid={`button-emoji-${emoji}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Bookmark */}
      <Button 
        size="icon" 
        variant="ghost"
        className="h-6 w-6"
        onClick={handleBookmark}
        data-testid={`button-bookmark-${messageId}`}
      >
        <Bookmark className="h-3 w-3" />
      </Button>

      {/* Share */}
      <Button 
        size="icon" 
        variant="ghost"
        className="h-6 w-6"
        onClick={handleShare}
        data-testid={`button-share-${messageId}`}
      >
        <Share2 className="h-3 w-3" />
      </Button>

      {/* Edit (only for own messages) */}
      {isOwnMessage && onEdit && (
        <Button 
          size="icon" 
          variant="ghost"
          className="h-6 w-6"
          onClick={onEdit}
          data-testid={`button-edit-${messageId}`}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}

      {/* Delete (only for own messages) */}
      {isOwnMessage && onDelete && (
        <Button 
          size="icon" 
          variant="ghost"
          className="h-6 w-6"
          onClick={handleDelete}
          disabled={isDeleting}
          data-testid={`button-delete-${messageId}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
