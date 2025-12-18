import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type EventFilters = {
  search?: string;
  category?: string;
  dateFilter?: 'upcoming' | 'past' | 'all';
};

interface TeamMemberProfile {
  id: number | null;
  name: string;
  username: string | null;
  profileImage: string | null;
  bio: string | null;
}

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
  djText?: string | null;
  teacherText?: string | null;
  performerText?: string | null;
  organizerText?: string | null;
  djProfiles?: TeamMemberProfile[];
  teacherProfiles?: TeamMemberProfile[];
  performerProfiles?: TeamMemberProfile[];
  organizerProfiles?: TeamMemberProfile[];
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
      
      // Default to upcoming events unless specifically asking for past or all
      if (filters?.dateFilter === 'past') {
        // Past events - don't add upcoming filter
      } else if (filters?.dateFilter === 'all') {
        // All events - don't add upcoming filter  
      } else {
        // Default: show upcoming events first (startDate >= now)
        params.append('upcoming', 'true');
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
      const data = await res.json();
      // API returns {event: {...}, organizer: {...}} - extract the event object
      return data.event || data;
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

export function useEventRSVPs(eventId: string | number, statusFilter?: string) {
  // CRITICAL: Normalize eventId to number for consistent query key matching
  const numericEventId = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
  
  return useQuery({
    queryKey: ["/api/events", numericEventId, "attendees", statusFilter || "all"],
    queryFn: async () => {
      const status = statusFilter || "all";
      const res = await fetch(`/api/events/${numericEventId}/attendees?status=${status}`);
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

/**
 * UNIFIED HOOK: My Events (user's RSVP'd events)
 * Used by: EventsPage "My Events" tab, UpcomingEventsSidebar "My Events" tab
 * Endpoint: /api/events/my-rsvps
 */
export function useMyEvents(options?: { limit?: number; upcoming?: boolean; enabled?: boolean }) {
  const { limit = 20, upcoming = true, enabled = true } = options || {};
  
  return useQuery({
    queryKey: ["/api/events/my-rsvps", { limit, upcoming }],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return [];
      
      const params = new URLSearchParams();
      if (limit) params.append('limit', String(limit));
      if (upcoming) params.append('upcoming', 'true');
      
      const res = await fetch(`/api/events/my-rsvps?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes - reduces API calls
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
  });
}

/**
 * UNIFIED HOOK: Upcoming Events (smart personalized events)
 * Used by: EventsPage "Upcoming" tab, UpcomingEventsSidebar "Upcoming" tab
 * Endpoint: /api/events/smart
 * Returns events from: user's city + joined group cities + RSVP'd events
 */
export function useUpcomingEvents(options?: { limit?: number; offset?: number; enabled?: boolean }) {
  const { limit = 20, offset = 0, enabled = true } = options || {};
  
  return useQuery({
    queryKey: ["/api/events/smart", { limit, offset }],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return { events: [], filters: {} };
      
      const params = new URLSearchParams();
      params.append('limit', String(limit));
      params.append('offset', String(offset));
      
      const res = await fetch(`/api/events/smart?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return { events: [], filters: {} };
      return res.json();
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes cache - reduces API calls
    gcTime: 10 * 60 * 1000, // 10 minutes cache retention
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
      const eventId = typeof variables.eventId === 'string' ? parseInt(variables.eventId, 10) : variables.eventId;
      
      await queryClient.cancelQueries({ queryKey: ["/api/events", eventId, "attendees", "all"] });
      await queryClient.cancelQueries({ queryKey: ["/api/events/my-rsvps"] });

      const previousAttendees = queryClient.getQueryData(["/api/events", eventId, "attendees", "all"]);
      const previousMyRsvps = queryClient.getQueryData(["/api/events/my-rsvps"]);

      return { previousAttendees, previousMyRsvps, eventId };
    },
    onError: (err, variables, context) => {
      if (context?.previousAttendees) {
        queryClient.setQueryData(["/api/events", context.eventId, "attendees", "all"], context.previousAttendees);
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
      const eventId = typeof variables.eventId === 'string' ? parseInt(variables.eventId, 10) : variables.eventId;
      
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees", "all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees", "going"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees", "maybe"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "attendees", "not_going"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
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
