import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
}: {
  isOpen: boolean;
  onClose: () => void;
  role?: TangoRole;
  onSubmit: (data: { title: string; subtitle: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ title, subtitle });
      setTitle("");
      setSubtitle("");
      onClose();
    }
  };

  const portfolioLabel = role ? getRolePortfolioTitle(role.value) : "Portfolio";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-add-portfolio">
        <DialogHeader>
          <DialogTitle>Add {portfolioLabel}</DialogTitle>
          <DialogDescription>
            {role ? `Add a new ${portfolioLabel.toLowerCase()} item to your ${role.label} portfolio.` : "Add a new portfolio item."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder={`e.g., My Awesome ${portfolioLabel.split(" ")[0]}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-portfolio-title"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe this item..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="resize-none"
              data-testid="textarea-portfolio-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-portfolio">
            Add {portfolioLabel.split(" ")[0]}
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

  const handleAddPortfolioItem = (data: { title: string; subtitle: string }) => {
    console.log("Adding portfolio item:", { role: selectedRoleForAdd?.value, ...data });
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
        <Button className="gap-2" data-testid="button-add-content">
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
              <Button size="sm" variant="outline" className="gap-1" data-testid={`button-add-${role.value}`}>
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
                  <Button size="sm" className="gap-2" data-testid={`button-create-${role.value}`}>
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
