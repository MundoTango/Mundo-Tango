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

function ProDashboardView({
  userId,
  proRoles,
  userExperience,
}: {
  userId: number;
  proRoles: TangoRole[];
  userExperience: { tangoRoleExperience?: TangoRoleExperience[] | null; tangoStartYear?: number | null; yearsOfDancing?: number | null };
}) {
  const [selectedRole, setSelectedRole] = useState<string>(
    proRoles[0]?.value || ""
  );

  const selectedRoleInfo = useMemo(
    () => proRoles.find((r) => r.value === selectedRole),
    [proRoles, selectedRole]
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
    () => Array.isArray(statsData) ? statsData.find((s) => s.role === selectedRole) : undefined,
    [statsData, selectedRole]
  );

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

      {proRoles.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Role:</span>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[200px]" data-testid="select-role-trigger">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {proRoles.map((role) => {
                const IconComponent = role.icon;
                return (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    data-testid={`select-role-${role.value}`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className="w-4 h-4"
                        style={{ color: role.color }}
                      />
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <ProStatsGrid stats={currentStats} role={selectedRoleInfo} />

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
            events={Array.isArray(eventHistory) ? eventHistory : []}
            isLoading={eventsLoading}
            selectedRole={selectedRole}
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

  if (isOwner) {
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
