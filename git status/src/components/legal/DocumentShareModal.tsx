import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Mail, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  onShare: (emails: string[], message: string) => Promise<void>;
}

export function DocumentShareModal({
  open,
  onOpenChange,
  documentTitle,
  onShare,
}: DocumentShareModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const addEmail = () => {
    const email = currentEmail.trim().toLowerCase();
    
    if (!email) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (emails.includes(email)) {
      toast({
        title: "Duplicate email",
        description: "This email has already been added",
        variant: "destructive",
      });
      return;
    }

    setEmails([...emails, email]);
    setCurrentEmail("");
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleShare = async () => {
    if (emails.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onShare(emails, message);
      toast({
        title: "Document shared",
        description: `Shared with ${emails.length} recipient${emails.length > 1 ? 's' : ''}`,
      });
      onOpenChange(false);
      setEmails([]);
      setMessage("");
    } catch (error) {
      toast({
        title: "Failed to share",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = () => {
    // Generate share link (placeholder)
    const shareLink = `${window.location.origin}/legal/shared/${documentTitle.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Share "{documentTitle}" with others via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email addresses</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                data-testid="input-participant-email"
              />
              <Button onClick={addEmail} variant="secondary">
                Add
              </Button>
            </div>
          </div>

          {/* Email List */}
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((email) => (
                <Badge key={email} variant="secondary" className="pr-1">
                  <Mail className="w-3 h-3 mr-1" />
                  {email}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 ml-1.5"
                    onClick={() => removeEmail(email)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Share Link */}
          <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
            <Label className="text-xs text-muted-foreground">
              Or copy share link
            </Label>
            <Button
              variant="outline"
              className="w-full"
              onClick={copyShareLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Share Link
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading || emails.length === 0}>
            {isLoading ? "Sharing..." : `Share with ${emails.length || 0} recipient${emails.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
