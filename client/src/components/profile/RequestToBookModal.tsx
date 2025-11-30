import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, MapPin, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface TripInfo {
  id: number;
  city: string;
  country?: string;
  startDate: string;
  endDate: string;
  ownerName: string;
  ownerUsername: string;
  ownerProfileImage?: string;
}

interface RequestToBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripInfo;
}

export function RequestToBookModal({ open, onOpenChange, trip }: RequestToBookModalProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const requestMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      const response = await apiRequest("POST", `/api/travel/trips/${trip.id}/request-join`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: `Your request to join ${trip.ownerName}'s trip to ${trip.city} has been sent!`,
      });
      setMessage("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/travel/my-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send join request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    requestMutation.mutate({ message: message.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="modal-request-to-book">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Request to Join Trip
          </DialogTitle>
          <DialogDescription>
            Send a request to join this travel companion's trip. They'll receive a notification and can accept or decline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={trip.ownerProfileImage} alt={trip.ownerName} />
              <AvatarFallback>{trip.ownerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{trip.ownerName}</p>
              <p className="text-xs text-muted-foreground">@{trip.ownerUsername}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{trip.city}{trip.country ? `, ${trip.country}` : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell them a bit about yourself and why you'd like to join their trip..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              data-testid="input-request-message"
            />
            <p className="text-xs text-muted-foreground">
              A friendly introduction helps your request stand out!
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-request"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={requestMutation.isPending}
            data-testid="button-send-request"
          >
            {requestMutation.isPending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
