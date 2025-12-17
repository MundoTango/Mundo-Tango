import { useState, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Facebook, Twitter, Link, MessageCircle, Mail, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  postTitle: string;
}

function ShareModalComponent({ open, onOpenChange, postId, postTitle }: ShareModalProps) {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/posts/${postId}`;
  const [shareComment, setShareComment] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShareToWall = async () => {
    setIsSharing(true);
    try {
      await apiRequest({
        url: `/api/posts/${postId}/share`,
        method: "POST",
        data: {
          shareType: 'timeline',
          comment: shareComment || undefined,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });

      toast({
        title: "Shared to your wall!",
        description: "Post has been shared to your timeline",
      });
      
      setShareComment("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(postTitle);

    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="modal-share">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Share to My Wall - Primary Action */}
          <div className="space-y-2 pb-3 border-b">
            <Textarea
              placeholder="Add a comment (optional)..."
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value)}
              className="min-h-[80px]"
              data-testid="textarea-share-comment"
            />
            <Button
              className="w-full justify-start gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.9), rgba(30, 144, 255, 0.9))',
                color: 'white',
                border: '1px solid rgba(64, 224, 208, 0.5)',
              }}
              onClick={handleShareToWall}
              disabled={isSharing}
              data-testid="button-share-to-wall"
            >
              <Share className="w-5 h-5" />
              {isSharing ? "Sharing..." : "Share to My Wall"}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => handleShare('facebook')}
            data-testid="button-share-facebook"
          >
            <Facebook className="w-5 h-5 text-blue-600" />
            Share on Facebook
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => handleShare('twitter')}
            data-testid="button-share-twitter"
          >
            <Twitter className="w-5 h-5 text-sky-500" />
            Share on Twitter
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => handleShare('whatsapp')}
            data-testid="button-share-whatsapp"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            Share on WhatsApp
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => handleShare('email')}
            data-testid="button-share-email"
          >
            <Mail className="w-5 h-5" />
            Share via Email
          </Button>

          <div className="border-t pt-3">
            <Button
              variant="secondary"
              className="w-full justify-start gap-3"
              onClick={handleCopyLink}
              data-testid="button-copy-link"
            >
              <Link className="w-5 h-5" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const ShareModal = memo(ShareModalComponent);
