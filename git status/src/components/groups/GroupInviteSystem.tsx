import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Check, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { safeDateDistance } from "@/lib/safeDateFormat";
import type { SelectGroupInvite } from "@shared/schema";

interface GroupInviteSystemProps {
  groupId: number;
  canInvite?: boolean;
}

export function GroupInviteSystem({ groupId, canInvite = false }: GroupInviteSystemProps) {
  const { toast } = useToast();
  const [isInviting, setIsInviting] = useState(false);
  const [inviteeId, setInviteeId] = useState("");
  const [message, setMessage] = useState("");

  const { data: myInvites, isLoading } = useQuery<SelectGroupInvite[]>({
    queryKey: ["/api/groups/invites/my-invites"],
  });

  const sendInvite = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/groups/${groupId}/invites`, {
        inviteeId: parseInt(inviteeId),
        message,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/invites/my-invites"] });
      toast({
        title: "Invite sent",
        description: "The user has been invited to join the group.",
      });
      setIsInviting(false);
      setInviteeId("");
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to send invite",
        description: error.message,
      });
    },
  });

  const acceptInvite = useMutation({
    mutationFn: async (inviteId: number) => {
      await apiRequest("POST", `/api/groups/invites/${inviteId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/invites/my-invites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Invite accepted",
        description: "You've joined the group!",
      });
    },
  });

  const declineInvite = useMutation({
    mutationFn: async (inviteId: number) => {
      await apiRequest("POST", `/api/groups/invites/${inviteId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups/invites/my-invites"] });
      toast({
        title: "Invite declined",
        description: "The invitation has been declined.",
      });
    },
  });

  const pendingInvites = myInvites?.filter(inv => inv.status === 'pending') || [];

  return (
    <div className="space-y-4">
      {/* Send Invite Button */}
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Members
            </CardTitle>
            <CardDescription>
              Invite people to join this group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsInviting(true)}
              className="w-full"
              data-testid="button-open-invite-modal"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites Received */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-pending-invites-title">
              Pending Invitations ({pendingInvites.length})
            </CardTitle>
            <CardDescription>
              You've been invited to join these groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                  data-testid={`invite-item-${invite.id}`}
                >
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invite.inviterId}`} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      User #{invite.inviterId} invited you
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invite.sentAt && safeDateDistance(invite.sentAt, { addSuffix: true })}
                    </p>
                    {invite.message && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{invite.message}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInvite.mutate(invite.id)}
                      disabled={acceptInvite.isPending}
                      data-testid={`button-accept-invite-${invite.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineInvite.mutate(invite.id)}
                      disabled={declineInvite.isPending}
                      data-testid={`button-decline-invite-${invite.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <Dialog open={isInviting} onOpenChange={setIsInviting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="text-invite-modal-title">Invite User to Group</DialogTitle>
            <DialogDescription>
              Enter the user ID and an optional message to invite them to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="inviteeId" className="text-sm font-medium">
                User ID
              </label>
              <Input
                id="inviteeId"
                type="number"
                placeholder="123"
                value={inviteeId}
                onChange={(e) => setInviteeId(e.target.value)}
                data-testid="input-invitee-id"
              />
            </div>
            <div>
              <label htmlFor="message" className="text-sm font-medium">
                Personal Message (Optional)
              </label>
              <Textarea
                id="message"
                placeholder="I think you'd be a great fit for this group..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                data-testid="input-invite-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviting(false)}
              data-testid="button-cancel-invite"
            >
              Cancel
            </Button>
            <Button
              onClick={() => sendInvite.mutate()}
              disabled={!inviteeId || sendInvite.isPending}
              data-testid="button-send-invite"
            >
              {sendInvite.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
