import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UnifiedLocationPicker, extractCityCountry } from "@/components/input/UnifiedLocationPicker";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Plus,
  ChevronRight,
  Send,
  BadgeCheck,
  Music,
  Video,
  Book,
  Image,
  Headphones,
  Zap,
  Heart,
  Play,
} from "lucide-react";
import {
  TANGO_ROLES,
  getRoleByValue,
  type TangoRole,
} from "@/lib/tangoRoles";
import {
  calculateYearsInRole,
  formatRoleExperience,
  type TangoRoleExperience,
} from "@shared/utils/roleExperience";

interface ProfileTabProProps {
  userId: number;
  isOwner: boolean;
  tangoRoles: string[];
  tangoRoleExperience?: TangoRoleExperience[] | null;
  tangoStartYear?: number | null;
  yearsOfDancing?: number | null;
  viewMode?: 'dashboard' | 'customer';
}

interface ProRoleStats {
  role: string;
  totalEvents: number;
  upcomingEvents: number;
  avgRating: number;
  reviewCount: number;
  monthlyRevenue?: number;
  portfolioItems: number;
}

interface ProEventHistoryItem {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity?: string;
  role: string;
  status: "confirmed" | "pending" | "declined";
  customTitle?: string;
  isPubliclyListed: boolean;
}

interface ProBookingRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterImage?: string;
  role: string;
  eventTitle: string;
  eventDate: string;
  duration: string;
  proposedFee?: number;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

function getProRoles(tangoRoles: string[]): TangoRole[] {
  return tangoRoles
    .map((role) => getRoleByValue(role))
    .filter((role): role is TangoRole => 
      role !== undefined && 
      (role.category === "professional" || role.category === "creative")
    );
}

interface PortfolioItem {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  stats?: string[];
}

function getRolePortfolioTitle(roleValue: string): string {
  const portfolioTitles: Record<string, string> = {
    "dj": "DJ Sets",
    "teacher": "Teaching Materials",
    "performer": "Performance Videos",
    "photographer": "Photography & Videos",
    "musician": "Music Recordings",
    "organizer": "Events Organized",
    "venue-owner": "Venue Highlights",
    "coach": "Coaching Programs",
    "mc": "MC Appearances",
    "community-builder": "Community Projects",
    "business": "Business Services",
    "artist": "Artwork & Design",
    "journalist": "Articles & Blog Posts",
  };
  return portfolioTitles[roleValue] || "Portfolio";
}

function getRolePortfolioItems(roleValue: string): PortfolioItem[] {
  const portfolioMap: Record<string, PortfolioItem[]> = {
    "dj": [
      { title: "Golden Age Mix", subtitle: "60-minute set", icon: Headphones, stats: ["342 plays", "89 favorites"] },
      { title: "Neo-Tango Night", subtitle: "90-minute compilation", icon: Music, stats: ["567 plays", "156 favorites"] },
      { title: "Vals Collection", subtitle: "Pure instrumental", icon: Music, stats: ["234 plays", "67 favorites"] },
    ],
    "teacher": [
      { title: "Tango Fundamentals", subtitle: "8-week course", icon: Book, stats: ["24 students", "⭐ 5.0"] },
      { title: "Advanced Technique", subtitle: "Video lessons", icon: Video, stats: ["156 students", "⭐ 4.9"] },
      { title: "Choreography Workshop", subtitle: "Live sessions", icon: Book, stats: ["12 students", "⭐ 5.0"] },
    ],
    "performer": [
      { title: "Summer Festival 2024", subtitle: "Stage performance", icon: Video, stats: ["250 attendees", "⭐ 4.9"] },
      { title: "Showcase Reel", subtitle: "2-minute highlight", icon: Play, stats: ["1.2k views", "89 likes"] },
      { title: "Choreography Demo", subtitle: "Original routine", icon: Video, stats: ["567 views", "156 likes"] },
    ],
    "photographer": [
      { title: "Festival Highlights", subtitle: "120 high-res photos", icon: Image, stats: ["450 downloads", "⭐ 4.8"] },
      { title: "Event Coverage", subtitle: "Complete album", icon: Image, stats: ["234 downloads", "⭐ 5.0"] },
      { title: "Portrait Series", subtitle: "Professional shoots", icon: Image, stats: ["112 downloads", "⭐ 4.9"] },
    ],
    "musician": [
      { title: "Bandoneon Solos", subtitle: "15 recordings", icon: Music, stats: ["890 plays", "234 likes"] },
      { title: "Traditional Tangos", subtitle: "Arrangement album", icon: Music, stats: ["456 plays", "123 likes"] },
      { title: "Live Performance", subtitle: "Concert recording", icon: Music, stats: ["234 plays", "67 likes"] },
    ],
    "organizer": [
      { title: "Summer Tango Festival", subtitle: "500+ attendees", icon: Calendar, stats: ["5 events", "⭐ 4.9"] },
      { title: "Weekly Milongas", subtitle: "52 events/year", icon: Calendar, stats: ["2,500+ total attendees"] },
      { title: "Workshops Series", subtitle: "12 expert sessions", icon: Calendar, stats: ["480 attendees", "⭐ 4.8"] },
    ],
    "venue-owner": [
      { title: "Downtown Ballroom", subtitle: "200-seat capacity", icon: Briefcase, stats: ["52 events/year", "⭐ 4.9"] },
      { title: "Historic Theater", subtitle: "500-seat capacity", icon: Briefcase, stats: ["24 events/year", "⭐ 5.0"] },
      { title: "Garden Venue", subtitle: "Outdoor space", icon: Briefcase, stats: ["15 events/year", "⭐ 4.8"] },
    ],
    "coach": [
      { title: "1-on-1 Sessions", subtitle: "Personalized training", icon: Users, stats: ["45 clients", "⭐ 4.9"] },
      { title: "Group Classes", subtitle: "8-week programs", icon: Users, stats: ["120 students", "⭐ 4.8"] },
      { title: "Online Courses", subtitle: "Self-paced learning", icon: Book, stats: ["234 enrolled", "⭐ 4.7"] },
    ],
    "mc": [
      { title: "Festival Hosting", subtitle: "5 appearances", icon: Headphones, stats: ["500+ attendees", "⭐ 5.0"] },
      { title: "Weekly Show", subtitle: "52 episodes", icon: Headphones, stats: ["1,000+ regular listeners"] },
      { title: "Grand Opening", subtitle: "Special event", icon: Zap, stats: ["300 attendees", "⭐ 4.9"] },
    ],
    "community-builder": [
      { title: "Tango Meetup Group", subtitle: "450 members", icon: Users, stats: ["2,000+ total attendees"] },
      { title: "Mentorship Program", subtitle: "12 mentees", icon: Users, stats: ["⭐ 4.9 satisfaction"] },
      { title: "Community Blog", subtitle: "Monthly articles", icon: Book, stats: ["8,500 subscribers"] },
    ],
    "business": [
      { title: "Tango Apparel Line", subtitle: "Premium designs", icon: Image, stats: ["$5k+ revenue", "⭐ 4.8"] },
      { title: "Custom Shoes", subtitle: "Handcrafted", icon: Briefcase, stats: ["120 pairs sold", "⭐ 5.0"] },
      { title: "Consulting Services", subtitle: "Business growth", icon: Zap, stats: ["15 clients", "⭐ 4.9"] },
    ],
    "artist": [
      { title: "Tango Paintings", subtitle: "Oil on canvas", icon: Image, stats: ["12 sold", "⭐ 5.0"] },
      { title: "Abstract Series", subtitle: "Modern interpretation", icon: Image, stats: ["8 pieces", "⭐ 4.9"] },
      { title: "Design Portfolio", subtitle: "20+ projects", icon: Image, stats: ["450 favorites"] },
    ],
    "journalist": [
      { title: "Tango Culture Magazine", subtitle: "20+ articles", icon: Book, stats: ["15k subscribers", "⭐ 4.8"] },
      { title: "Interview Series", subtitle: "10 features", icon: Book, stats: ["2k average reads"] },
      { title: "Travel Blog", subtitle: "Tango around the world", icon: Book, stats: ["8k followers", "⭐ 4.9"] },
    ],
  };
  return portfolioMap[roleValue] || [];
}

interface FormFieldDef {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

// Roles that auto-create events when portfolio items are submitted
const EVENT_CREATING_ROLES = ["organizer", "teacher", "coach", "performer", "musician", "mc", "venue-owner"];

// Mapping from role to event type
function getRoleEventType(roleValue: string): string {
  const roleEventTypeMap: Record<string, string> = {
    "teacher": "class",
    "organizer": "milonga",
    "coach": "workshop",
    "performer": "performance",
    "musician": "concert",
    "mc": "social",
    "venue-owner": "milonga",
  };
  return roleEventTypeMap[roleValue] || "milonga";
}

function getRoleFormFields(roleValue: string): FormFieldDef[] {
  // Standard event fields that all event-creating roles should have
  const eventFields = EVENT_CREATING_ROLES.includes(roleValue) ? [
    { name: "startDate", label: "Start Date & Time *", type: "text", placeholder: "e.g., 2024-12-15T19:00" },
    { name: "endDate", label: "End Date & Time", type: "text", placeholder: "e.g., 2024-12-15T23:00" },
    { name: "location", label: "Venue Name *", type: "text", placeholder: "e.g., La Catedral Club" },
    { name: "address", label: "Street Address", type: "text", placeholder: "123 Main Street" },
    { name: "city", label: "City *", type: "text", placeholder: "Buenos Aires" },
    { name: "country", label: "Country *", type: "text", placeholder: "Argentina" },
    { name: "price", label: "Price (if paid)", type: "text", placeholder: "0" },
    { name: "maxAttendees", label: "Max Attendees", type: "text", placeholder: "Leave blank for unlimited" },
  ] : [];

  const formFieldMap: Record<string, FormFieldDef[]> = {
    "dj": [
      ...eventFields,
      { name: "type", label: "Set Type *", type: "select", required: true, options: [
        { label: "60-minute set", value: "60-min" },
        { label: "90-minute compilation", value: "90-min" },
        { label: "Pure instrumental", value: "instrumental" },
      ]},
      { name: "duration", label: "Duration", type: "text", placeholder: "e.g., 60 minutes" },
    ],
    "teacher": [
      ...eventFields,
      { name: "type", label: "Teaching Format *", type: "select", required: true, options: [
        { label: "Structured course", value: "course" },
        { label: "Video lessons", value: "video" },
        { label: "Live sessions", value: "live" },
        { label: "Workshop", value: "workshop" },
      ]},
      { name: "level", label: "Level", type: "select", options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
      ]},
    ],
    "performer": [
      ...eventFields,
      { name: "type", label: "Performance Type *", type: "select", required: true, options: [
        { label: "Stage performance", value: "stage" },
        { label: "Showcase reel", value: "reel" },
        { label: "Choreography demo", value: "choreography" },
      ]},
    ],
    "photographer": [
      { name: "type", label: "Photography Type *", type: "select", required: true, options: [
        { label: "Event coverage", value: "event" },
        { label: "Portrait series", value: "portrait" },
        { label: "Festival highlights", value: "festival" },
      ]},
      { name: "title", label: "Album Title *", type: "text", placeholder: "e.g., Festival Highlights" },
      { name: "photoCount", label: "Number of Photos", type: "text", placeholder: "e.g., 120" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe your photography..." },
    ],
    "musician": [
      ...eventFields,
      { name: "type", label: "Recording Type *", type: "select", required: true, options: [
        { label: "Solo recordings", value: "solo" },
        { label: "Album/arrangement", value: "album" },
        { label: "Live performance", value: "live" },
      ]},
      { name: "instrument", label: "Primary Instrument", type: "text", placeholder: "e.g., Bandoneon, Guitar" },
    ],
    "organizer": [
      ...eventFields,
      { name: "type", label: "Event Type *", type: "select", required: true, options: [
        { label: "Major festival", value: "festival" },
        { label: "Regular series", value: "series" },
        { label: "Workshops", value: "workshops" },
      ]},
      { name: "frequency", label: "Frequency", type: "text", placeholder: "e.g., Annual, Weekly" },
    ],
    "venue-owner": [
      ...eventFields,
      { name: "type", label: "Venue Type *", type: "select", required: true, options: [
        { label: "Ballroom", value: "ballroom" },
        { label: "Theater", value: "theater" },
        { label: "Outdoor space", value: "outdoor" },
      ]},
      { name: "capacity", label: "Seating Capacity", type: "text", placeholder: "e.g., 200" },
    ],
    "coach": [
      ...eventFields,
      { name: "type", label: "Coaching Format *", type: "select", required: true, options: [
        { label: "1-on-1 sessions", value: "personal" },
        { label: "Group classes", value: "group" },
        { label: "Online courses", value: "online" },
      ]},
      { name: "level", label: "Level", type: "select", options: [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
      ]},
    ],
    "mc": [
      ...eventFields,
      { name: "type", label: "MC Activity *", type: "select", required: true, options: [
        { label: "Festival hosting", value: "festival" },
        { label: "Regular show", value: "show" },
        { label: "Special event", value: "special" },
      ]},
      { name: "frequency", label: "Frequency", type: "text", placeholder: "e.g., Monthly, Weekly" },
    ],
    "community-builder": [
      { name: "type", label: "Initiative Type *", type: "select", required: true, options: [
        { label: "Meetup group", value: "meetup" },
        { label: "Mentorship", value: "mentorship" },
        { label: "Content/blog", value: "content" },
      ]},
      { name: "reach", label: "Reach (members/followers)", type: "text", placeholder: "e.g., 450" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe your initiative..." },
    ],
    "business": [
      { name: "type", label: "Business Type *", type: "select", required: true, options: [
        { label: "Product line", value: "product" },
        { label: "Handcrafted goods", value: "craft" },
        { label: "Services", value: "services" },
      ]},
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe your business..." },
    ],
    "artist": [
      { name: "type", label: "Art Type *", type: "select", required: true, options: [
        { label: "Paintings", value: "painting" },
        { label: "Sculpture", value: "sculpture" },
        { label: "Design", value: "design" },
      ]},
      { name: "medium", label: "Medium/Technique", type: "text", placeholder: "e.g., Oil on canvas" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe your artwork..." },
    ],
    "journalist": [
      { name: "type", label: "Content Type *", type: "select", required: true, options: [
        { label: "Magazine/publication", value: "magazine" },
        { label: "Interview series", value: "interview" },
        { label: "Blog/column", value: "blog" },
      ]},
      { name: "frequency", label: "Frequency", type: "text", placeholder: "e.g., Monthly, Weekly" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Describe your content..." },
    ],
  };
  return formFieldMap[roleValue] || [];
}

function ProRoleCard({
  role,
  userExperience,
  eventCount,
  avgRating,
  reviewCount,
  isVerified,
  onClick,
}: {
  role: TangoRole;
  userExperience: { tangoRoleExperience?: TangoRoleExperience[] | null; tangoStartYear?: number | null; yearsOfDancing?: number | null };
  eventCount: number;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  onClick?: () => void;
}) {
  const IconComponent = role.icon;
  const experience = formatRoleExperience(userExperience, role.value);

  return (
    <Card
      className="hover-elevate cursor-pointer overflow-hidden"
      onClick={onClick}
      data-testid={`card-role-${role.value}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${role.color}20` }}
          >
            <IconComponent className="w-6 h-6" style={{ color: role.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold truncate">{role.label}</h4>
              {isVerified && (
                <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{experience} experience</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{eventCount} events</span>
              </div>
              {reviewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProStatsGrid({
  stats,
  role,
}: {
  stats: ProRoleStats | undefined;
  role: TangoRole | undefined;
}) {
  const IconComponent = role?.icon || Briefcase;

  const statItems = [
    {
      label: "Total Events",
      value: stats?.totalEvents ?? 0,
      icon: Calendar,
    },
    {
      label: "Upcoming",
      value: stats?.upcomingEvents ?? 0,
      icon: Clock,
    },
    {
      label: "Avg Rating",
      value: stats?.avgRating?.toFixed(1) ?? "N/A",
      icon: Star,
    },
    {
      label: "Reviews",
      value: stats?.reviewCount ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="hover-elevate" data-testid={`card-stat-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ProEventHistoryList({
  events,
  isLoading,
  selectedRole,
}: {
  events: ProEventHistoryItem[];
  isLoading: boolean;
  selectedRole?: string;
}) {
  const filteredEvents = selectedRole
    ? events.filter((e) => e.role === selectedRole)
    : events;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-medium mb-2">No Event History</h4>
          <p className="text-sm text-muted-foreground">
            {selectedRole
              ? "No events found for this role yet."
              : "Your event participations will appear here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredEvents.map((event, index) => {
        const roleInfo = getRoleByValue(event.role);
        const IconComponent = roleInfo?.icon || Briefcase;
        const eventDate = new Date(event.eventDate);
        const isPast = eventDate < new Date();

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className="hover-elevate"
              data-testid={`card-event-${event.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="p-2.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${roleInfo?.color || "#6B7280"}20` }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: roleInfo?.color || "#6B7280" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium truncate">
                          {event.customTitle || `${roleInfo?.label || event.role} at "${event.eventTitle}"`}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {eventDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {event.eventVenue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.eventVenue}
                              {event.eventCity && `, ${event.eventCity}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          event.status === "confirmed"
                            ? "default"
                            : event.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                        className="flex-shrink-0"
                      >
                        {event.status === "confirmed" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {event.status === "pending" && (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {event.status === "confirmed"
                          ? isPast
                            ? "Verified"
                            : "Confirmed"
                          : event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function ProBookingRequests({
  requests,
  isLoading,
  onAccept,
  onDecline,
}: {
  requests: ProBookingRequest[];
  isLoading: boolean;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
}) {
  const pendingRequests = requests.filter((r) => r.status === "pending");

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-medium mb-2">No Pending Requests</h4>
          <p className="text-sm text-muted-foreground">
            New booking requests will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.map((request, index) => {
        const roleInfo = getRoleByValue(request.role);

        return (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className="border-l-4"
              style={{ borderLeftColor: roleInfo?.color || "#3B82F6" }}
              data-testid={`card-booking-${request.id}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">
                        {request.requesterName} requests {roleInfo?.label || request.role}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        "{request.eventTitle}"
                      </p>
                    </div>
                    {request.proposedFee && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        ${request.proposedFee}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(request.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {request.duration}
                    </span>
                  </div>
                  {request.message && (
                    <p className="text-sm text-muted-foreground italic">
                      "{request.message}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onAccept?.(request.id)}
                      data-testid={`button-accept-${request.id}`}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDecline?.(request.id)}
                      data-testid={`button-decline-${request.id}`}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function AddPortfolioDialog({
  isOpen,
  onClose,
  role,
  onSubmit,
  availableRoles,
}: {
  isOpen: boolean;
  onClose: () => void;
  role?: TangoRole;
  onSubmit: (data: { title: string; subtitle: string; role: TangoRole; formData: Record<string, string> }) => Promise<void> | void;
  availableRoles: TangoRole[];
}) {
  const [selectedRole, setSelectedRole] = useState<TangoRole | undefined>(role);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | undefined>();

  // Sync role prop to state when dialog opens or role changes
  useEffect(() => {
    if (isOpen && role) {
      setSelectedRole(role);
    }
  }, [isOpen, role]);

  const roleFormFields = selectedRole ? getRoleFormFields(selectedRole.value) : [];
  const portfolioLabel = selectedRole ? getRolePortfolioTitle(selectedRole.value) : "Portfolio";
  const isEventCreatingRole = selectedRole && EVENT_CREATING_ROLES.includes(selectedRole.value);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleLocationChange = (location: string, coordinates: { lat: number; lng: number }) => {
    const { city, country } = extractCityCountry(location);
    setFormData((prev) => ({ 
      ...prev, 
      location: location,
      city: city || prev["city"] || "",
      country: country || prev["country"] || ""
    }));
    setLocationCoordinates(coordinates);
  };

  const handleRoleChange = (roleValue: string) => {
    const foundRole = availableRoles.find((r) => r.value === roleValue);
    setSelectedRole(foundRole);
    setFormData({});
    setLocationCoordinates(undefined);
  };

  const handleSubmit = async () => {
    const titleField = formData["title"] || "";
    if (titleField.trim() && selectedRole) {
      setIsSubmitting(true);
      try {
        await onSubmit({ 
          title: titleField, 
          subtitle: formData["description"] || "", 
          role: selectedRole,
          formData 
        });
        setFormData({});
        setSelectedRole(undefined);
        setLocationCoordinates(undefined);
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isValid = selectedRole && formData["title"]?.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-add-portfolio" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add {portfolioLabel}</DialogTitle>
          <DialogDescription>
            {selectedRole ? (
              <>
                Add a new {portfolioLabel.toLowerCase()} item to your {selectedRole.label} portfolio.
                {isEventCreatingRole && " This will also create an event linked to your portfolio."}
              </>
            ) : "Select a role and add a portfolio item."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role *</label>
            <Select value={selectedRole?.value || ""} onValueChange={handleRoleChange}>
              <SelectTrigger data-testid="select-portfolio-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEventCreatingRole && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary font-medium">Event Information</p>
              <p className="text-xs text-muted-foreground mt-1">
                Fill in event details below to auto-create and publish an event for your portfolio.
              </p>
            </div>
          )}

          {roleFormFields.map((field) => {
            // Render location picker for location field
            if (field.name === "location") {
              return (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  <UnifiedLocationPicker
                    mode="city"
                    value={formData["location"] || ""}
                    onChange={handleLocationChange}
                    placeholder={field.placeholder || "Search for a venue..."}
                  />
                </div>
              );
            }
            
            // Render address picker for address field
            if (field.name === "address") {
              return (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  <UnifiedLocationPicker
                    mode="address"
                    value={formData["address"] || ""}
                    onChange={(location, coordinates, parsed) => {
                      handleFieldChange("address", location);
                      if (parsed) {
                        if (parsed.city) handleFieldChange("city", parsed.city);
                        if (parsed.country) handleFieldChange("country", parsed.country);
                      }
                      setLocationCoordinates(coordinates);
                    }}
                    placeholder={field.placeholder || "Search for a street address..."}
                  />
                </div>
              );
            }
            
            // Skip city and country fields - handled by location picker
            if ((field.name === "city" || field.name === "country") && isEventCreatingRole) {
              return null;
            }

            // Render standard field types
            return (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium">{field.label}</label>
                {field.type === "text" && field.name !== "location" && (
                  <Input
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    data-testid={`input-${field.name}`}
                    type={field.name.includes("date") || field.name === "startDate" || field.name === "endDate" ? "datetime-local" : "text"}
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className="resize-none"
                    data-testid={`textarea-${field.name}`}
                  />
                )}
                {field.type === "select" && field.options && (
                  <Select value={formData[field.name] || ""} onValueChange={(value) => handleFieldChange(field.name, value)}>
                    <SelectTrigger data-testid={`select-${field.name}`}>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} data-testid="button-save-portfolio">
            {isSubmitting ? "Creating..." : `Add ${portfolioLabel.split(" ")[0]}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProDashboardView({
  userId,
  proRoles,
  userExperience,
}: {
  userId: number;
  proRoles: TangoRole[];
  userExperience: { tangoRoleExperience?: TangoRoleExperience[] | null; tangoStartYear?: number | null; yearsOfDancing?: number | null };
}) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    proRoles.map((r) => r.value)
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRoleForAdd, setSelectedRoleForAdd] = useState<TangoRole | undefined>();

  const selectedRolesInfo = useMemo(
    () => proRoles.filter((r) => selectedRoles.includes(r.value)),
    [proRoles, selectedRoles]
  );

  const { data: statsData, isLoading: statsLoading } = useQuery<ProRoleStats[]>({
    queryKey: ["/api/users", userId, "pro-stats"],
    enabled: !!userId,
  });

  const { data: eventHistory, isLoading: eventsLoading } = useQuery<ProEventHistoryItem[]>({
    queryKey: ["/api/users", userId, "event-history"],
    enabled: !!userId,
  });

  const { data: bookingRequests, isLoading: bookingsLoading } = useQuery<ProBookingRequest[]>({
    queryKey: ["/api/users", userId, "booking-requests"],
    enabled: !!userId,
  });

  const currentStats = useMemo(
    () => Array.isArray(statsData) ? statsData.filter((s) => selectedRoles.includes(s.role)) : [],
    [statsData, selectedRoles]
  );

  const filteredEventHistory = useMemo(
    () => Array.isArray(eventHistory) ? eventHistory.filter((e) => selectedRoles.includes(e.role)) : [],
    [eventHistory, selectedRoles]
  );

  const toggleRole = (roleValue: string) => {
    setSelectedRoles((prev) => 
      prev.includes(roleValue)
        ? prev.filter((r) => r !== roleValue)
        : [...prev, roleValue]
    );
  };

  const handleOpenAddDialog = (role?: TangoRole) => {
    setSelectedRoleForAdd(role);
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedRoleForAdd(undefined);
  };

  const { toast } = useToast();

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Record<string, any>) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "event-history"] });
      toast({
        title: "Event created!",
        description: "Your event has been published and added to your portfolio.",
      });
    },
    onError: (error: any) => {
      console.error("Event creation error:", error);
      toast({
        title: "Event creation failed",
        description: "The portfolio item was not created as an event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddPortfolioItem = async (data: { title: string; subtitle: string; role: TangoRole; formData: Record<string, string> }) => {
    console.log("Adding portfolio item:", { role: data.role.value, title: data.title, formData: data.formData });
    
    // If this role creates events, create an event
    if (EVENT_CREATING_ROLES.includes(data.role.value)) {
      const eventType = getRoleEventType(data.role.value);
      const startDateStr = data.formData["startDate"] || new Date().toISOString();
      
      const eventData = {
        title: data.title,
        description: data.subtitle || data.formData["description"] || "",
        eventType,
        category: eventType,
        location: data.formData["location"] || data.role.label,
        city: data.formData["city"] || "",
        country: data.formData["country"] || "",
        address: data.formData["address"] || "",
        startDate: startDateStr,
        endDate: data.formData["endDate"] || undefined,
        isPaid: data.formData["isPaid"] === "true" || false,
        price: data.formData["price"] ? parseFloat(data.formData["price"]) : 0,
        maxAttendees: data.formData["maxAttendees"] ? parseInt(data.formData["maxAttendees"]) : undefined,
        tags: [data.role.value, "portfolio"],
      };
      
      createEventMutation.mutate(eventData);
    }
    
    handleCloseAddDialog();
  };

  const handleAcceptBooking = (id: number) => {
    console.log("Accept booking:", id);
  };

  const handleDeclineBooking = (id: number) => {
    console.log("Decline booking:", id);
  };

  if (proRoles.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-serif font-bold mb-2">No Professional Roles</h3>
          <p className="text-muted-foreground mb-6">
            Add professional or creative roles to your profile to manage your tango career.
          </p>
          <Button className="gap-2" data-testid="button-add-role">
            <Plus className="w-4 h-4" />
            Add Role
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2
            className="text-3xl md:text-4xl font-serif font-bold mb-2"
            data-testid="text-pro-dashboard-title"
          >
            PRO Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your professional activities and bookings
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenAddDialog()} data-testid="button-add-content">
          <Plus className="w-4 h-4" />
          Add Content
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Roles:</span>
        <div className="flex gap-2 flex-wrap">
          {proRoles.map((role) => {
            const IconComponent = role.icon;
            const isSelected = selectedRoles.includes(role.value);
            return (
              <Button
                key={role.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRole(role.value)}
                className="gap-2"
                data-testid={`button-role-${role.value}`}
              >
                <IconComponent
                  className="w-4 h-4"
                  style={{ color: isSelected ? 'currentColor' : role.color }}
                />
                <span>{role.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {currentStats.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentStats.map((stat) => {
            const roleInfo = selectedRolesInfo.find((r) => r.value === stat.role);
            return roleInfo ? (
              <ProStatsGrid key={stat.role} stats={stat} role={roleInfo} />
            ) : null;
          })}
        </div>
      )}

      {selectedRolesInfo.map((role) => {
        const portfolioTitle = getRolePortfolioTitle(role.value);
        const portfolioItems = getRolePortfolioItems(role.value);
        
        return (
          <div key={role.value} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {role.icon && <role.icon className="w-5 h-5" style={{ color: role.color }} />}
                <h3 className="text-xl font-serif font-bold">{portfolioTitle}</h3>
              </div>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleOpenAddDialog(role)} data-testid={`button-add-${role.value}`}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
            
            {portfolioItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioItems.map((item, idx) => (
                  <Card key={idx} className="hover-elevate" data-testid={`card-portfolio-${role.value}-${idx}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {item.icon && <item.icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{item.title}</h4>
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                      </div>
                      {item.stats && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {item.stats.map((stat, i) => (
                            <span key={i}>{stat}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">No {portfolioTitle.toLowerCase()} added yet</p>
                  <Button size="sm" className="gap-2" onClick={() => handleOpenAddDialog(role)} data-testid={`button-create-${role.value}`}>
                    <Plus className="w-4 h-4" />
                    Create Your First {role.label} {portfolioTitle.split(' ')[0]}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold">Event History</h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              data-testid="button-view-all-events"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <ProEventHistoryList
            events={filteredEventHistory}
            isLoading={eventsLoading}
            selectedRole={selectedRoles[0] || ""}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold">
              Booking Requests
              {Array.isArray(bookingRequests) && bookingRequests.filter((r) => r.status === "pending").length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {bookingRequests.filter((r) => r.status === "pending").length}
                </Badge>
              )}
            </h3>
          </div>
          <ProBookingRequests
            requests={Array.isArray(bookingRequests) ? bookingRequests : []}
            isLoading={bookingsLoading}
            onAccept={handleAcceptBooking}
            onDecline={handleDeclineBooking}
          />
        </div>
      </div>

      <AddPortfolioDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        role={selectedRoleForAdd}
        onSubmit={handleAddPortfolioItem}
        availableRoles={proRoles}
      />
    </div>
  );
}

function ProPublicView({
  userId,
  proRoles,
  userExperience,
  userName,
}: {
  userId: number;
  proRoles: TangoRole[];
  userExperience: { tangoRoleExperience?: TangoRoleExperience[] | null; tangoStartYear?: number | null; yearsOfDancing?: number | null };
  userName?: string;
}) {
  const { data: statsData } = useQuery<ProRoleStats[]>({
    queryKey: ["/api/users", userId, "pro-stats"],
    enabled: !!userId,
  });

  const { data: eventHistory, isLoading: eventsLoading } = useQuery<ProEventHistoryItem[]>({
    queryKey: ["/api/users", userId, "event-history", "public"],
    enabled: !!userId,
  });

  const publicEvents = useMemo(
    () => (Array.isArray(eventHistory) ? eventHistory : []).filter((e) => e.isPubliclyListed && e.status === "confirmed"),
    [eventHistory]
  );

  if (proRoles.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-serif font-bold mb-2">No Professional Roles</h3>
          <p className="text-muted-foreground">
            This user hasn't added any professional or creative roles yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const bookableRoles = proRoles.filter((r) => r.bookable);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-3xl md:text-4xl font-serif font-bold mb-2"
          data-testid="text-pro-profile-title"
        >
          Professional Profile
        </h2>
        <p className="text-lg text-muted-foreground">
          {userName
            ? `${userName}'s professional tango roles and experience`
            : "Professional tango roles and experience"}
        </p>
      </motion.div>

      <div>
        <h3 className="text-xl font-serif font-bold mb-4">Active Roles</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proRoles.map((role, index) => {
            const roleStats = Array.isArray(statsData) ? statsData.find((s) => s.role === role.value) : undefined;
            return (
              <motion.div
                key={role.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProRoleCard
                  role={role}
                  userExperience={userExperience}
                  eventCount={roleStats?.totalEvents || 0}
                  avgRating={roleStats?.avgRating || 0}
                  reviewCount={roleStats?.reviewCount || 0}
                  isVerified={(roleStats?.totalEvents || 0) > 0}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {publicEvents.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold">Verified Event Portfolio</h3>
          </div>
          <ProEventHistoryList
            events={publicEvents.slice(0, 5)}
            isLoading={eventsLoading}
          />
          {publicEvents.length > 5 && (
            <Button
              variant="outline"
              className="w-full gap-2"
              data-testid="button-view-all-portfolio"
            >
              View All {publicEvents.length} Events
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {bookableRoles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold mb-1">Book This Professional</h4>
                  <p className="text-sm text-muted-foreground">
                    Available for: {bookableRoles.map((r) => r.label).join(", ")}
                  </p>
                </div>
                <Button className="gap-2" size="lg" data-testid="button-book-professional">
                  <Send className="w-4 h-4" />
                  Send Booking Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default function ProfileTabPro({
  userId,
  isOwner,
  tangoRoles,
  tangoRoleExperience,
  tangoStartYear,
  yearsOfDancing,
  viewMode = 'dashboard',
}: ProfileTabProProps) {
  const proRoles = useMemo(() => getProRoles(tangoRoles), [tangoRoles]);

  const userExperience = useMemo(
    () => ({
      tangoRoleExperience,
      tangoStartYear,
      yearsOfDancing,
    }),
    [tangoRoleExperience, tangoStartYear, yearsOfDancing]
  );

  // When viewing own profile, respect viewMode toggle. Otherwise always show public view
  const shouldShowDashboard = isOwner && viewMode === 'dashboard';

  if (shouldShowDashboard) {
    return (
      <ProDashboardView
        userId={userId}
        proRoles={proRoles}
        userExperience={userExperience}
      />
    );
  }

  return (
    <ProPublicView
      userId={userId}
      proRoles={proRoles}
      userExperience={userExperience}
    />
  );
}
