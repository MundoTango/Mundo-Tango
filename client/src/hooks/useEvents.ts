import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import {
  getEvents,
  getEventById,
  createEvent,
  deleteEvent,
  getRSVPsByEventId,
  createOrUpdateRSVP,
} from "@/lib/supabaseQueries";
import type { EventWithProfile, InsertEvent, InsertRSVP } from "@shared/supabase-types";

export function useEvents() {
  return useQuery<EventWithProfile[]>({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });
}

export function useEvent(id: string) {
  return useQuery<EventWithProfile>({
    queryKey: ["events", id],
    queryFn: () => getEventById(id),
    enabled: !!id,
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

export function useRSVPEvent() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { eventId: string; status: "going" | "maybe" | "not_going" }) => {
      if (!user) throw new Error("Must be logged in");
      return createOrUpdateRSVP({
        user_id: user.id,
        event_id: data.eventId,
        status: data.status,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rsvps", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.eventId] });
    },
  });
}
