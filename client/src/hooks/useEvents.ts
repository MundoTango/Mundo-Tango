import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  getEvents,
  getEventById,
  createEvent,
  deleteEvent,
  getRSVPsByEventId,
  createOrUpdateRSVP,
  getEventAttendance,
  type EventFilters,
} from "@/lib/supabaseQueries";
import type { EventWithProfile, InsertEvent, InsertRSVP, RSVP } from "@shared/supabase-types";

export function useEvents(filters?: EventFilters) {
  return useQuery<EventWithProfile[]>({
    queryKey: ["events", filters],
    queryFn: () => getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery<EventWithProfile>({
    queryKey: ["events", id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
}

export function useEventAttendance(eventId: string) {
  return useQuery<{ attending: number; capacity: number | null; waitlist: number }>({
    queryKey: ["event-attendance", eventId],
    queryFn: () => getEventAttendance(eventId),
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<InsertEvent, "user_id">) => {
      if (!user) throw new Error("Must be logged in");
      return createEvent({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useEventRSVPs(eventId: string) {
  return useQuery({
    queryKey: ["rsvps", eventId],
    queryFn: () => getRSVPsByEventId(eventId),
    enabled: !!eventId,
  });
}

export function useRSVPEvent(eventId: string) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userRSVP } = useQuery<RSVP | null>({
    queryKey: ["user-rsvp", eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return useMutation({
    mutationFn: async (data: { eventId: string; status: "going" | "maybe" | "not_going" }) => {
      if (!user) throw new Error("Must be logged in");

      const attendance = await getEventAttendance(data.eventId);
      const { attending, capacity } = attendance;

      if (data.status === "going" && capacity && attending >= capacity) {
        toast({
          title: "You're on the waitlist",
          description: "This event is at capacity. You've been added to the waitlist.",
        });
      } else if (data.status === "going") {
        toast({
          title: "RSVP confirmed",
          description: "You're attending this event!",
        });
      } else if (data.status === "not_going") {
        toast({
          title: "RSVP cancelled",
          description: "Your RSVP has been cancelled.",
        });
      }

      return createOrUpdateRSVP({
        user_id: user.id,
        event_id: data.eventId,
        status: data.status,
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["rsvps", variables.eventId] });
      await queryClient.cancelQueries({ queryKey: ["event-attendance", variables.eventId] });
      await queryClient.cancelQueries({ queryKey: ["user-rsvp", variables.eventId] });

      const previousRsvps = queryClient.getQueryData(["rsvps", variables.eventId]);
      const previousAttendance = queryClient.getQueryData(["event-attendance", variables.eventId]);
      const previousUserRsvp = queryClient.getQueryData(["user-rsvp", variables.eventId, user?.id]);

      const oldStatus = userRSVP?.status;
      const newStatus = variables.status;
      const delta = (newStatus === "going" ? 1 : 0) - (oldStatus === "going" ? 1 : 0);

      queryClient.setQueryData(["event-attendance", variables.eventId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          attending: Math.max(0, old.attending + delta),
        };
      });

      return { previousRsvps, previousAttendance, previousUserRsvp };
    },
    onError: (err, variables, context) => {
      if (context?.previousRsvps) {
        queryClient.setQueryData(["rsvps", variables.eventId], context.previousRsvps);
      }
      if (context?.previousAttendance) {
        queryClient.setQueryData(["event-attendance", variables.eventId], context.previousAttendance);
      }
      if (context?.previousUserRsvp !== undefined) {
        queryClient.setQueryData(["user-rsvp", variables.eventId, user?.id], context.previousUserRsvp);
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rsvps", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-attendance", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["user-rsvp", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
