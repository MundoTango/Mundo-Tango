import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SelectEvent, InsertEvent } from "@shared/schema";

interface EventFilters {
  city?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
}

export function useEvents(filters?: EventFilters) {
  const params = new URLSearchParams();
  if (filters?.city) params.append("city", filters.city);
  if (filters?.eventType) params.append("eventType", filters.eventType);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = queryString ? `/api/events?${queryString}` : "/api/events";

  return useQuery<SelectEvent[]>({
    queryKey: ["/api/events", filters],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      return data.events || [];
    },
  });
}

export function useEvent(id: number) {
  return useQuery<SelectEvent>({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch event");
      return res.json();
    },
  });
}

export function useCreateEvent() {
  return useMutation({
    mutationFn: async (data: Omit<InsertEvent, "userId">) => {
      const res = await apiRequest("POST", "/api/events", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });
}

export function useRsvpEvent(eventId: number) {
  return useMutation({
    mutationFn: async (status: "going" | "interested" | "maybe") => {
      const res = await apiRequest("POST", `/api/events/${eventId}/rsvp`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
    },
  });
}
