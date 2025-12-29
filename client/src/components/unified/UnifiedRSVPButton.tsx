import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, X, HelpCircle, Calendar, Users, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type RSVPStatus = "going" | "interested" | "maybe" | "not_going" | null;

interface UnifiedRSVPButtonProps {
  eventId: number;
  currentStatus?: RSVPStatus;
  variant?: "default" | "compact" | "badge" | "expanded";
  showCount?: boolean;
  attendeeCount?: number;
  maxAttendees?: number;
  onStatusChange?: (status: RSVPStatus) => void;
  disabled?: boolean;
  className?: string;
}

const statusConfig: Record<NonNullable<RSVPStatus>, { 
  label: string; 
  icon: typeof Check; 
  color: string;
  badgeVariant: "default" | "secondary" | "outline" | "destructive";
}> = {
  going: { 
    label: "Going", 
    icon: Check, 
    color: "text-green-600 bg-green-500/10 border-green-500/30 hover:bg-green-500/20",
    badgeVariant: "default"
  },
  interested: { 
    label: "Interested", 
    icon: Calendar, 
    color: "text-blue-600 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
    badgeVariant: "secondary"
  },
  maybe: { 
    label: "Maybe", 
    icon: HelpCircle, 
    color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20",
    badgeVariant: "outline"
  },
  not_going: { 
    label: "Not Going", 
    icon: X, 
    color: "text-muted-foreground bg-muted/50 border-muted hover:bg-muted",
    badgeVariant: "outline"
  },
};

export function UnifiedRSVPButton({
  eventId,
  currentStatus,
  variant = "default",
  showCount = false,
  attendeeCount = 0,
  maxAttendees,
  onStatusChange,
  disabled = false,
  className,
}: UnifiedRSVPButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rsvpMutation = useMutation({
    mutationFn: async (status: RSVPStatus) => {
      if (!status) {
        const res = await apiRequest('DELETE', `/api/events/${eventId}/rsvp`);
        return res.ok ? null : res.json();
      }
      const res = await apiRequest('POST', `/api/events/${eventId}/rsvp`, { status });
      return res.json();
    },
    onSuccess: async (_, status) => {
      // CRITICAL: Normalize eventId to number for consistent query key matching
      const numericEventId = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
      
      // Invalidate ALL attendees queries (with different status filters)
      // This matches useEventRSVPs query key: ["/api/events", eventId, "attendees", statusFilter || "all"]
      await queryClient.invalidateQueries({ queryKey: ["/api/events", numericEventId, "attendees"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/events", String(eventId), "attendees"] });
      
      // Refetch the specific "all" query that EventCard uses
      await queryClient.refetchQueries({ queryKey: ["/api/events", numericEventId, "attendees", "all"] });
      
      // Invalidate permissions and event data
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericEventId, "permissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", numericEventId] });
      
      // UNIFIED CACHE INVALIDATION: Ensure all components using RSVP data stay in sync
      // This is the single source of truth for RSVP cache invalidation
      // MB.MD Fix: Use predicate to invalidate ALL my-rsvps queries including those with params
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey[0] === "/api/events/my-rsvps";
        }
      }); // useMyRSVPs, useMyEvents (with limit/upcoming params)
      queryClient.invalidateQueries({ queryKey: ["/api/events/smart"] }); // useUpcomingEvents
      queryClient.invalidateQueries({ queryKey: ["/api/events/search"] }); // Discover tab
      queryClient.invalidateQueries({ queryKey: ["/api/events"] }); // useEvents
      queryClient.invalidateQueries({ queryKey: ["/api/events", "sidebar"] }); // Legacy sidebar queries
      
      onStatusChange?.(status);
      
      const statusLabel = status ? statusConfig[status].label : "Removed";
      toast({
        title: `RSVP ${status ? "Updated" : "Removed"}`,
        description: status 
          ? `You're marked as "${statusLabel}" for this event.`
          : "Your RSVP has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "RSVP Failed",
        description: "Could not update your RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (status: RSVPStatus) => {
    if (status === currentStatus) {
      rsvpMutation.mutate(null);
    } else {
      rsvpMutation.mutate(status);
    }
    setIsOpen(false);
  };

  const isPending = rsvpMutation.isPending;
  const config = currentStatus ? statusConfig[currentStatus] : null;
  const StatusIcon = config?.icon || Calendar;

  if (variant === "badge") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild disabled={disabled || isPending}>
          <Badge 
            variant={config?.badgeVariant || "outline"}
            className={cn(
              "cursor-pointer gap-1 transition-colors",
              config?.color,
              className
            )}
            data-testid={`badge-rsvp-${eventId}`}
          >
            {isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <StatusIcon className="h-3 w-3" />
                {config?.label || "RSVP"}
              </>
            )}
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {(Object.keys(statusConfig) as RSVPStatus[]).filter(Boolean).map((status) => {
            if (!status) return null;
            const { label, icon: Icon, color } = statusConfig[status];
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                className={cn(
                  "gap-2 cursor-pointer",
                  currentStatus === status && "bg-accent"
                )}
                data-testid={`menu-rsvp-${status}-${eventId}`}
              >
                <Icon className={cn("h-4 w-4", color.split(" ")[0])} />
                {label}
                {currentStatus === status && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            );
          })}
          {currentStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(null)}
                className="gap-2 cursor-pointer text-muted-foreground"
                data-testid={`menu-rsvp-remove-${eventId}`}
              >
                <X className="h-4 w-4" />
                Remove RSVP
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild disabled={disabled || isPending}>
          <Button
            size="sm"
            variant={currentStatus ? "outline" : "default"}
            className={cn(
              "gap-1",
              config?.color,
              className
            )}
            data-testid={`button-rsvp-compact-${eventId}`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <StatusIcon className="h-4 w-4" />
                {config?.label || "RSVP"}
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {(Object.keys(statusConfig) as RSVPStatus[]).filter(Boolean).map((status) => {
            if (!status) return null;
            const { label, icon: Icon, color } = statusConfig[status];
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                className={cn(
                  "gap-2 cursor-pointer",
                  currentStatus === status && "bg-accent"
                )}
                data-testid={`menu-rsvp-${status}-${eventId}`}
              >
                <Icon className={cn("h-4 w-4", color.split(" ")[0])} />
                {label}
                {currentStatus === status && <Check className="h-4 w-4 ml-auto" />}
              </DropdownMenuItem>
            );
          })}
          {currentStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(null)}
                className="gap-2 cursor-pointer text-muted-foreground"
                data-testid={`menu-rsvp-remove-${eventId}`}
              >
                <X className="h-4 w-4" />
                Remove RSVP
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "expanded") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex gap-2">
          {(["going", "interested", "maybe"] as RSVPStatus[]).map((status) => {
            if (!status) return null;
            const { label, icon: Icon, color } = statusConfig[status];
            const isActive = currentStatus === status;
            return (
              <Button
                key={status}
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "flex-1 gap-1",
                  isActive && color
                )}
                onClick={() => handleStatusChange(status)}
                disabled={disabled || isPending}
                data-testid={`button-rsvp-${status}-${eventId}`}
              >
                {isPending && currentStatus === status ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {label}
              </Button>
            );
          })}
        </div>
        {showCount && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span data-testid={`text-attendee-count-${eventId}`}>
              {attendeeCount} attending
              {maxAttendees && ` / ${maxAttendees} max`}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild disabled={disabled || isPending}>
        <Button
          variant={currentStatus ? "outline" : "default"}
          className={cn(
            "gap-2 min-w-[120px]",
            config?.color,
            className
          )}
          data-testid={`button-rsvp-${eventId}`}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <StatusIcon className="h-4 w-4" />
              {config?.label || "RSVP"}
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(statusConfig) as RSVPStatus[]).filter(Boolean).map((status) => {
          if (!status) return null;
          const { label, icon: Icon, color } = statusConfig[status];
          return (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status)}
              className={cn(
                "gap-2 cursor-pointer",
                currentStatus === status && "bg-accent"
              )}
              data-testid={`menu-rsvp-${status}-${eventId}`}
            >
              <Icon className={cn("h-4 w-4", color.split(" ")[0])} />
              {label}
              {currentStatus === status && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          );
        })}
        {currentStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleStatusChange(null)}
              className="gap-2 cursor-pointer text-muted-foreground"
              data-testid={`menu-rsvp-remove-${eventId}`}
            >
              <X className="h-4 w-4" />
              Remove RSVP
            </DropdownMenuItem>
          </>
        )}
        {showCount && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {attendeeCount} attending
              {maxAttendees && ` / ${maxAttendees}`}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UnifiedRSVPButton;
