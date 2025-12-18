import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Check, 
  X, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Plane,
  Users,
  GraduationCap,
  UserPlus,
  Handshake,
  Loader2,
  ExternalLink
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export type RequestType = "travel" | "class" | "friend" | "collaboration" | "group" | "event";
export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "expired";

export interface UnifiedRequest {
  id: number;
  type: RequestType;
  requesterId: number;
  requesterName: string;
  requesterUsername?: string;
  requesterAvatar?: string;
  targetId: number;
  targetName?: string;
  message?: string;
  status: RequestStatus;
  createdAt: string;
  respondedAt?: string;
  metadata?: Record<string, any>;
}

interface UnifiedRequestCardProps {
  request: UnifiedRequest;
  variant?: "compact" | "expanded" | "inline";
  showActions?: boolean;
  showMessage?: boolean;
  apiEndpoint: string;
  queryKey: (string | number)[];
  onAccept?: (request: UnifiedRequest) => void;
  onReject?: (request: UnifiedRequest) => void;
  onMessage?: (request: UnifiedRequest) => void;
  className?: string;
}

const typeConfig: Record<RequestType, {
  label: string;
  icon: typeof Plane;
  color: string;
  actionLabel: string;
}> = {
  travel: {
    label: "Travel Companion",
    icon: Plane,
    color: "text-blue-600 bg-blue-500/10 border-blue-500/30",
    actionLabel: "join your trip",
  },
  class: {
    label: "Class Partner",
    icon: GraduationCap,
    color: "text-purple-600 bg-purple-500/10 border-purple-500/30",
    actionLabel: "be your class partner",
  },
  friend: {
    label: "Friend Request",
    icon: UserPlus,
    color: "text-green-600 bg-green-500/10 border-green-500/30",
    actionLabel: "connect with you",
  },
  collaboration: {
    label: "Collaboration",
    icon: Handshake,
    color: "text-orange-600 bg-orange-500/10 border-orange-500/30",
    actionLabel: "collaborate with you",
  },
  group: {
    label: "Group Join",
    icon: Users,
    color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/30",
    actionLabel: "join your group",
  },
  event: {
    label: "Event Request",
    icon: Clock,
    color: "text-pink-600 bg-pink-500/10 border-pink-500/30",
    actionLabel: "attend your event",
  },
};

const statusConfig: Record<RequestStatus, {
  label: string;
  color: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
}> = {
  pending: {
    label: "Pending",
    color: "text-yellow-600 bg-yellow-500/10",
    badgeVariant: "outline",
  },
  accepted: {
    label: "Accepted",
    color: "text-green-600 bg-green-500/10",
    badgeVariant: "default",
  },
  rejected: {
    label: "Declined",
    color: "text-red-600 bg-red-500/10",
    badgeVariant: "destructive",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-muted-foreground bg-muted/50",
    badgeVariant: "outline",
  },
  expired: {
    label: "Expired",
    color: "text-muted-foreground bg-muted/50",
    badgeVariant: "outline",
  },
};

export function UnifiedRequestCard({
  request,
  variant = "expanded",
  showActions = true,
  showMessage = true,
  apiEndpoint,
  queryKey,
  onAccept,
  onReject,
  onMessage,
  className,
}: UnifiedRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: async ({ status, message }: { status: "accepted" | "rejected"; message?: string }) => {
      const res = await apiRequest('PATCH', `${apiEndpoint}/${request.id}/respond`, { 
        status,
        responseMessage: message 
      });
      if (!res.ok) throw new Error('Failed to respond');
      return res.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: status === "accepted" ? "Request Accepted" : "Request Declined",
        description: status === "accepted" 
          ? `You've accepted ${request.requesterName}'s request.`
          : `You've declined ${request.requesterName}'s request.`,
      });
      if (status === "accepted") onAccept?.(request);
      if (status === "rejected") onReject?.(request);
    },
    onError: () => {
      toast({
        title: "Action Failed",
        description: "Could not process the request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAccept = () => {
    respondMutation.mutate({ status: "accepted" });
  };

  const handleReject = () => {
    respondMutation.mutate({ status: "rejected" });
  };

  const handleReply = () => {
    setShowReplyDialog(true);
  };

  const handleSendReply = () => {
    onMessage?.(request);
    setShowReplyDialog(false);
    setReplyMessage("");
  };

  const config = typeConfig[request.type];
  const status = statusConfig[request.status];
  const TypeIcon = config.icon;
  const isPending = respondMutation.isPending;
  const canAct = request.status === "pending" && showActions;

  if (variant === "inline") {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        className
      )} data-testid={`request-inline-${request.id}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={request.requesterAvatar} />
          <AvatarFallback>{request.requesterName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${request.requesterId}`}>
              <span className="font-medium hover:underline cursor-pointer" data-testid={`text-requester-${request.id}`}>
                {request.requesterName}
              </span>
            </Link>
            <Badge variant={status.badgeVariant} className="text-xs">
              {status.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            wants to {config.actionLabel}
          </p>
        </div>
        {canAct && (
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-green-600 hover:bg-green-500/10"
              onClick={handleAccept}
              disabled={isPending}
              data-testid={`button-accept-${request.id}`}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-red-600 hover:bg-red-500/10"
              onClick={handleReject}
              disabled={isPending}
              data-testid={`button-reject-${request.id}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={cn("overflow-hidden", className)} data-testid={`request-compact-${request.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.requesterAvatar} />
              <AvatarFallback>{request.requesterName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("gap-1", config.color)}>
                  <TypeIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
                <Badge variant={status.badgeVariant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
              <div className="mt-1">
                <Link href={`/profile/${request.requesterId}`}>
                  <span className="font-medium hover:underline cursor-pointer" data-testid={`text-requester-${request.id}`}>
                    {request.requesterName}
                  </span>
                </Link>
                <span className="text-muted-foreground"> wants to {config.actionLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {canAct && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="flex-1 gap-1"
                onClick={handleAccept}
                disabled={isPending}
                data-testid={`button-accept-${request.id}`}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1"
                onClick={handleReject}
                disabled={isPending}
                data-testid={`button-reject-${request.id}`}
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-testid={`request-expanded-${request.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={request.requesterAvatar} />
            <AvatarFallback className="text-lg">{request.requesterName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={cn("gap-1", config.color)}>
                <TypeIcon className="h-3 w-3" />
                {config.label}
              </Badge>
              <Badge variant={status.badgeVariant}>
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/profile/${request.requesterId}`}>
                <span className="font-semibold text-lg hover:underline cursor-pointer" data-testid={`text-requester-${request.id}`}>
                  {request.requesterName}
                </span>
              </Link>
              {request.requesterUsername && (
                <span className="text-muted-foreground">@{request.requesterUsername}</span>
              )}
            </div>
            <p className="text-muted-foreground">
              wants to {config.actionLabel}
              {request.targetName && <> for <strong>{request.targetName}</strong></>}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <Clock className="h-3 w-3 inline mr-1" />
              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
            </p>
          </div>
          <Link href={`/profile/${request.requesterId}`}>
            <Button size="icon" variant="ghost" data-testid={`button-view-profile-${request.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {showMessage && request.message && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-3 gap-1">
                <MessageCircle className="h-4 w-4" />
                {isExpanded ? "Hide Message" : "View Message"}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm" data-testid={`text-message-${request.id}`}>
                "{request.message}"
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      {canAct && (
        <CardFooter className="p-4 pt-0 gap-2">
          <Button
            className="flex-1 gap-1"
            onClick={handleAccept}
            disabled={isPending}
            data-testid={`button-accept-${request.id}`}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Accept
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-1"
            onClick={handleReject}
            disabled={isPending}
            data-testid={`button-reject-${request.id}`}
          >
            <X className="h-4 w-4" />
            Decline
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReply}
            disabled={isPending}
            data-testid={`button-message-${request.id}`}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}

      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {request.requesterName}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write a message..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            className="min-h-[100px]"
            data-testid={`textarea-reply-${request.id}`}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReply} data-testid={`button-send-reply-${request.id}`}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default UnifiedRequestCard;
