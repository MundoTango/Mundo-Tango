/**
 * Invite Sender Component
 * UI for generating and sending Facebook Messenger invites
 */

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Send, Sparkles, AlertCircle, CheckCircle2, Clock, ExternalLink, Clipboard, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteSenderProps {
  onSendComplete?: () => void;
}

export function InviteSender({ onSendComplete }: InviteSenderProps) {
  const { toast } = useToast();
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [message, setMessage] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get rate limit status
  const { data: progressData } = useQuery({
    queryKey: ['/api/facebook/invites/progress'],
  });

  const rateLimit = progressData?.rateLimit;

  // Generate invite mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { friendName: string; friendEmail?: string }) => {
      return apiRequest('/api/facebook/generate-invite', {
        method: 'POST',
        body: JSON.stringify({
          friendName: data.friendName,
          friendEmail: data.friendEmail,
          relationship: 'Close friend',
          sharedInterests: ['Tango dancing']
        })
      });
    },
    onSuccess: (data) => {
      setGeneratedMessage(data.message);
      setMessage(data.message);
      setWordCount(data.wordCount);
      toast({
        title: "Message Generated",
        description: `AI generated a ${data.wordCount}-word personalized invitation.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate message",
        variant: "destructive",
      });
    },
  });

  // Send invite mutation
  const sendMutation = useMutation({
    mutationFn: async (data: { friendName: string; friendEmail: string; message: string }) => {
      return apiRequest('/api/facebook/send-invite', {
        method: 'POST',
        body: JSON.stringify({
          friendName: data.friendName,
          friendEmail: data.friendEmail,
          message: data.message,
          closenessScore: 80
        })
      });
    },
    onSuccess: (data) => {
      // Check if automation succeeded or needs manual fallback
      if (data.requiresManualFallback) {
        setShowManualFallback(true);
        toast({
          title: "Manual Action Required",
          description: "Facebook blocked automation. Please follow manual steps.",
          variant: "default",
        });
      } else {
        toast({
          title: "Invite Sent!",
          description: "Your invitation has been sent successfully.",
        });
        // Clear form
        setFriendName("");
        setFriendEmail("");
        setMessage("");
        setGeneratedMessage("");
        setWordCount(0);
      }
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/invites/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/invites/history'] });
      onSendComplete?.();
    },
    onError: (error: any) => {
      // Show manual fallback on any error
      setShowManualFallback(true);
      toast({
        title: "Automation Blocked",
        description: "Please use manual workflow instead.",
        variant: "default",
      });
    },
  });

  const handleGenerate = () => {
    if (!friendName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your friend's name",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      friendName: friendName.trim(),
      friendEmail: friendEmail.trim() || undefined
    });
  };

  const handleSend = () => {
    if (!friendName.trim() || !friendEmail.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (wordCount < 50 || wordCount > 200) {
      toast({
        title: "Message Length Issue",
        description: "Message should be between 50-200 words",
        variant: "destructive",
      });
      return;
    }

    sendMutation.mutate({
      friendName: friendName.trim(),
      friendEmail: friendEmail.trim(),
      message: message.trim()
    });
  };

  const updateWordCount = (text: string) => {
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(count);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const handleManualComplete = async () => {
    try {
      // Record manual completion to database
      await apiRequest('/api/facebook/record-manual-action', {
        method: 'POST',
        body: JSON.stringify({
          recipientName: friendName,
          recipientEmail: friendEmail,
          message: message,
          actionType: 'manual_facebook_message',
          completedAt: new Date().toISOString()
        })
      });

      toast({
        title: "Action Recorded!",
        description: "Manual send recorded for Mr. Blue learning",
      });

      // Clear form
      setFriendName("");
      setFriendEmail("");
      setMessage("");
      setGeneratedMessage("");
      setWordCount(0);
      setShowManualFallback(false);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/invites/progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/facebook/invites/history'] });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Could not record manual action",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card data-testid="card-invite-sender">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Send AI-Powered Invitation
        </CardTitle>
        <CardDescription>
          Generate personalized invitations with AI that sound authentic to your voice
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rate Limit Warning */}
        {rateLimit && !rateLimit.canSend && (
          <Alert data-testid="alert-rate-limit">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Daily limit reached ({rateLimit.invitesUsedToday}/{rateLimit.dailyLimit}).
              Resets at midnight.
            </AlertDescription>
          </Alert>
        )}

        {/* Rate Limit Status */}
        {rateLimit && rateLimit.canSend && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid="div-rate-status">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>
                {rateLimit.dailyLimit - rateLimit.invitesUsedToday} invites remaining today
              </span>
            </div>
            <Badge variant="outline">
              {rateLimit.invitesUsedToday}/{rateLimit.dailyLimit}
            </Badge>
          </div>
        )}

        {/* Friend Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="friendName">Friend's Name *</Label>
            <Input
              id="friendName"
              data-testid="input-friend-name"
              placeholder="e.g., Lee Angelica Litas"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              disabled={sendMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="friendEmail">Friend's Email *</Label>
            <Input
              id="friendEmail"
              data-testid="input-friend-email"
              type="email"
              placeholder="e.g., sboddye@gmail.com"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              disabled={sendMutation.isPending}
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !friendName.trim()}
          className="w-full"
          variant="outline"
          data-testid="button-generate"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Personalized Message
            </>
          )}
        </Button>

        {/* Message Editor */}
        {(message || generatedMessage) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Invitation Message *</Label>
              <Badge variant={wordCount >= 100 && wordCount <= 150 ? "default" : "secondary"}>
                {wordCount} words
              </Badge>
            </div>
            <Textarea
              id="message"
              data-testid="textarea-message"
              placeholder="Your personalized invitation message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                updateWordCount(e.target.value);
              }}
              disabled={sendMutation.isPending}
              rows={8}
              className="resize-none"
            />
            {wordCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {wordCount < 100 && "Consider adding more detail (ideal: 100-150 words)"}
                {wordCount >= 100 && wordCount <= 150 && "Perfect length! ✓"}
                {wordCount > 150 && "Consider shortening the message (ideal: 100-150 words)"}
              </p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSend}
          disabled={sendMutation.isPending || !message.trim() || !rateLimit?.canSend}
          className="w-full"
          data-testid="button-send"
        >
          {sendMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </>
          )}
        </Button>
      </CardFooter>
    </Card>

    {/* Manual Fallback Dialog */}
    <Dialog open={showManualFallback} onOpenChange={setShowManualFallback}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎯 Manual Workflow - Computer Use Training
          </DialogTitle>
          <DialogDescription>
            Facebook blocked automation. Complete this manually so Mr. Blue can learn from your actions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Why Manual?</strong> Facebook detects automation tools. By completing this manually, 
              you'll create training data for Mr. Blue's "Computer Use" feature to automate this in the future.
            </AlertDescription>
          </Alert>

          {/* Step-by-Step Guide */}
          <div className="space-y-4">
            <div className="font-semibold text-lg">📋 Step-by-Step Instructions:</div>

            {/* Step 1 */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Badge>1</Badge>
                <span>Open Facebook Messenger</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Go to{' '}
                <a 
                  href="https://www.facebook.com/messages" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  facebook.com/messages
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            {/* Step 2 */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Badge>2</Badge>
                <span>Search for: {friendName}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Use the search box to find {friendName} in Messenger
              </p>
            </div>

            {/* Step 3 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium">
                <Badge>3</Badge>
                <span>Copy & Send Message</span>
              </div>
              <div className="ml-7 space-y-2">
                <div className="bg-muted p-3 rounded-lg text-sm max-h-40 overflow-y-auto">
                  {message}
                </div>
                <Button
                  onClick={handleCopyMessage}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 mr-2" /> Copied!</>
                  ) : (
                    <><Clipboard className="w-4 h-4 mr-2" /> Copy Message</>
                  )}
                </Button>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Badge>4</Badge>
                <span>Paste and send the message</span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                Paste the copied message into the conversation and hit Send
              </p>
            </div>

            {/* Learning Component */}
            <Alert>
              <Sparkles className="w-4 h-4" />
              <AlertDescription>
                <strong>🧠 Mr. Blue is Learning:</strong> When you complete this manual workflow, 
                Mr. Blue records your actions and builds training data for future automation using 
                computer vision and browser automation.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowManualFallback(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleManualComplete}
            data-testid="button-mark-complete"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            I've Sent It - Record Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
