import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type EventFilters = {
  search?: string;
  category?: string;
  dateFilter?: 'upcoming' | 'past' | 'all';
};

interface Event {
  id: number;
  title: string;
  description: string | null;
  eventType: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  userId: number;
  maxAttendees: number | null;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface RSVP {
  id: number;
  eventId: number;
  userId: number;
  status: string;
  createdAt: string;
  event?: Event;
}

export function useEvents(filters?: EventFilters) {
  return useQuery<Event[]>({
    queryKey: ["/api/events", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category && filters.category.toLowerCase() !== 'all') {
        params.append('eventType', filters.category);
      }
      
      const queryString = params.toString();
      const url = `/api/events${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      return data.events || data || [];
    },
  });
}

export function useEvent(id: string | number) {
  return useQuery<Event>({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error('Failed to fetch event');
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useEventAttendance(eventId: string | number) {
  return useQuery<{ attending: number; capacity: number | null; waitlist: number }>({
    queryKey: ["/api/events", eventId, "attendance"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/attendees`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      return {
        attending: data.length || 0,
        capacity: null,
        waitlist: 0
      };
    },
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error("Must be logged in");
      const res = await apiRequest('POST', '/api/events', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEvent() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string | number) => {
      return await apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "Event has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });
}

export function useEventRSVPs(eventId: string | number) {
  return useQuery({
    queryKey: ["/api/events", eventId, "attendees"],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/attendees`);
      if (!res.ok) throw new Error('Failed to fetch RSVPs');
      return await res.json();
    },
    enabled: !!eventId,
  });
}

export function useMyRSVPs() {
  return useQuery<RSVP[]>({
    queryKey: ["/api/events/my-rsvps"],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/events/my-rsvps', {
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to fetch my RSVPs');
      return await res.json();
    },
  });
}

export function useRSVPEvent() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { eventId: string | number; status: "going" | "maybe" | "not_going" }) => {
      if (!user) throw new Error("Must be logged in");
      const res = await apiRequest('POST', `/api/events/${data.eventId}/rsvp`, { status: data.status });
      return await res.json();
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["/api/events", variables.eventId, "attendees"] });
      await queryClient.cancelQueries({ queryKey: ["/api/events/my-rsvps"] });

      const previousAttendees = queryClient.getQueryData(["/api/events", variables.eventId, "attendees"]);
      const previousMyRsvps = queryClient.getQueryData(["/api/events/my-rsvps"]);

      return { previousAttendees, previousMyRsvps };
    },
    onError: (err, variables, context) => {
      if (context?.previousAttendees) {
        queryClient.setQueryData(["/api/events", variables.eventId, "attendees"], context.previousAttendees);
      }
      if (context?.previousMyRsvps) {
        queryClient.setQueryData(["/api/events/my-rsvps"], context.previousMyRsvps);
      }
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId, "attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-rsvps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });

      if (variables.status === "going") {
        toast({
          title: "RSVP confirmed",
          description: "You're attending this event!",
        });
      } else if (variables.status === "maybe") {
        toast({
          title: "RSVP updated",
          description: "You might attend this event.",
        });
      } else if (variables.status === "not_going") {
        toast({
          title: "RSVP cancelled",
          description: "Your RSVP has been cancelled.",
        });
      }
    },
  });
}
