import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  Heart,
  MessageSquare,
  Clock,
  Check,
  X,
  Moon,
  ExternalLink,
  Users,
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FriendshipQuestionnaire } from './FriendshipQuestionnaire';

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  senderMessage?: string;
  danceLocation?: string;
  danceStory?: string;
  danceDate?: string;
  didWeDance?: boolean;
  sender?: {
    id: number;
    name: string;
    username?: string;
    profileImage?: string;
    city?: string;
    country?: string;
  };
}

interface FriendRequestReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FriendRequest | null;
  onActionComplete?: () => void;
}

export function FriendRequestReviewModal({
  open,
  onOpenChange,
  request,
  onActionComplete,
}: FriendRequestReviewModalProps) {
  const { toast } = useToast();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<{
    receiverMessage?: string;
    receiverPrivateNote?: string;
  } | null>(null);

  const { data: mutualFriends = [] } = useQuery({
    queryKey: ['/api/friends/mutual', request?.senderId],
    queryFn: async () => {
      if (!request?.senderId) return [];
      const res = await fetch(`/api/friends/mutual/${request.senderId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!request?.senderId && open,
  });

  const acceptMutation = useMutation({
    mutationFn: async (receiverData?: { receiverMessage?: string; receiverPrivateNote?: string }) => {
      if (!request) throw new Error('No request');
      return await apiRequest('POST', `/api/friends/requests/${request.id}/accept`, receiverData || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Friend request accepted!",
        description: `You are now friends with ${request?.sender?.name}`,
      });
      onOpenChange(false);
      onActionComplete?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to accept request",
        description: error.message || "Something went wrong",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async () => {
      if (!request) throw new Error('No request');
      return await apiRequest('POST', `/api/friends/requests/${request.id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Request declined",
        description: "The friend request has been declined",
      });
      onOpenChange(false);
      onActionComplete?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to decline request",
        description: error.message || "Something went wrong",
      });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: async (days: number) => {
      if (!request) throw new Error('No request');
      return await apiRequest('POST', `/api/friends/requests/${request.id}/snooze`, { days });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Request snoozed",
        description: "We'll remind you about this request in 7 days",
      });
      onOpenChange(false);
      onActionComplete?.();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to snooze request",
        description: error.message || "Something went wrong",
      });
    },
  });

  const handleAcceptWithQuestionnaire = (data: {
    whenWeMet?: Date;
    whereWeMet: string;
    ourStory: string;
    privateNote?: string;
  }) => {
    const receiverData = {
      receiverMessage: data.ourStory,
      receiverPrivateNote: data.privateNote,
    };
    acceptMutation.mutate(receiverData);
    setShowQuestionnaire(false);
  };

  const handleQuickAccept = () => {
    acceptMutation.mutate();
  };

  if (!request || !request.sender) {
    return null;
  }

  const sender = request.sender;

  return (
    <>
      <Dialog open={open && !showQuestionnaire} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-friend-request-review">
          <DialogHeader>
            <DialogTitle className="text-xl">Friend Request</DialogTitle>
            <DialogDescription>
              Review this friend request from {sender.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="border-0 bg-muted/30" data-testid="card-sender-profile">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Link href={`/profile/${sender.id}?tab=about`}>
                    <Avatar className="h-16 w-16 cursor-pointer hover-elevate">
                      <AvatarImage src={sender.profileImage} alt={sender.name} />
                      <AvatarFallback>{sender.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/profile/${sender.id}?tab=about`}>
                        <h3 className="font-semibold text-lg hover:underline cursor-pointer" data-testid="text-sender-name">
                          {sender.name}
                        </h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        asChild
                      >
                        <Link href={`/profile/${sender.id}?tab=about`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                    {sender.username && (
                      <p className="text-sm text-muted-foreground" data-testid="text-sender-username">
                        @{sender.username}
                      </p>
                    )}
                    {(sender.city || sender.country) && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{[sender.city, sender.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                    {mutualFriends.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Users className="h-3 w-3" />
                        <span>{mutualFriends.length} mutual friend{mutualFriends.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {(request.danceLocation || request.danceStory || request.senderMessage) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Their Story
                  </h4>

                  {request.didWeDance && (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="h-3 w-3" />
                      Danced Together
                    </Badge>
                  )}

                  {request.danceDate && (
                    <div className="flex items-center gap-2 text-sm" data-testid="text-dance-date">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Met on {format(new Date(request.danceDate), 'MMMM d, yyyy')}</span>
                    </div>
                  )}

                  {request.danceLocation && (
                    <div className="flex items-center gap-2 text-sm" data-testid="text-dance-location">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{request.danceLocation}</span>
                    </div>
                  )}

                  {(request.danceStory || request.senderMessage) && (
                    <Card className="bg-muted/20" data-testid="card-sender-message">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm leading-relaxed">
                            {request.danceStory || request.senderMessage}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-request-date">
              <Clock className="h-4 w-4" />
              <span>Request sent {format(new Date(request.createdAt), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => snoozeMutation.mutate(7)}
              disabled={snoozeMutation.isPending}
              className="gap-2"
              data-testid="button-snooze"
            >
              <Moon className="h-4 w-4" />
              Remind Later
            </Button>
            <Button
              variant="outline"
              onClick={() => declineMutation.mutate()}
              disabled={declineMutation.isPending}
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
              data-testid="button-decline"
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
            <Button
              onClick={() => setShowQuestionnaire(true)}
              disabled={acceptMutation.isPending}
              className="gap-2"
              data-testid="button-accept-with-story"
            >
              <Check className="h-4 w-4" />
              Accept & Share Your Story
            </Button>
          </DialogFooter>

          <div className="mt-2 text-center">
            <Button
              variant="link"
              size="sm"
              onClick={handleQuickAccept}
              disabled={acceptMutation.isPending}
              className="text-muted-foreground"
              data-testid="button-quick-accept"
            >
              Or accept without adding your story
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showQuestionnaire && request && (
        <FriendshipQuestionnaire
          open={showQuestionnaire}
          onOpenChange={(open) => {
            setShowQuestionnaire(open);
            if (!open) {
              onOpenChange(true);
            }
          }}
          friendName={sender.name}
          onSubmit={handleAcceptWithQuestionnaire}
          isLoading={acceptMutation.isPending}
          mode="accept"
        />
      )}
    </>
  );
}
