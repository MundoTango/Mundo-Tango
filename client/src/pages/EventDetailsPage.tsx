import { useTranslation } from "react-i18next";
import { useRoute } from "wouter";
import DOMPurify from "dompurify";
import { useEvent } from "@/hooks/useEvents";
import { useQuery } from "@tanstack/react-query";
import { UnifiedRSVPButton, RSVPStatus } from "@/components/unified/UnifiedRSVPButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, DollarSign, Globe, Users, Check, ChevronRight, User, Ticket, Music, Tag, ExternalLink, Clock, Navigation, Camera, Image as ImageIcon, Loader2, Edit, Share2, MoreVertical, Trash2, Flag, Upload, Crown, UserCheck } from "lucide-react";
import { EventEditForm } from "@/components/events/EventEditForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { getTimezoneFromCity } from "@/lib/timezoneUtils";
import { getCurrencySymbol } from "@/lib/currencyUtils";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCityImageUrl } from "@/lib/cityImageMap";
import { toCitySlug } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventPostFeed } from "@/components/events/EventPostFeed";
import { EventParticipantManager } from "@/components/events/EventParticipantManager";
import { EventTeamCards } from "@/components/events/EventTeamCards";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { queryClient } from "@/lib/queryClient";
import { useRef, useState, useEffect } from "react";

interface EventPhoto {
  photo: {
    id: number;
    eventId: number;
    uploaderId: number;
    imageUrl: string;
    photoUrl?: string;
    caption?: string;
    createdAt: string;
    isOrganizer?: boolean;
  };
  uploader?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  isOrganizer?: boolean;
}

function EventPhotosTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation(['pages', 'common']);
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: photos, isLoading } = useQuery<EventPhoto[]>({
    queryKey: ['/api/events', eventId, 'photos'],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/photos`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: eventId > 0,
  });

  const { data: permissions } = useQuery<{ isOrganizer: boolean; isRsvpd: boolean }>({
    queryKey: ['/api/events', eventId, 'permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/events/${eventId}/permissions`, { 
        headers,
        credentials: 'include' 
      });
      if (!res.ok) return { isOrganizer: false, isRsvpd: false };
      return res.json();
    },
    enabled: eventId > 0,
  });

  const canUpload = permissions?.isOrganizer || permissions?.isRsvpd;

  const handleUploadClick = () => {
    if (!user) {
      toast({ title: "Please log in to upload photos", variant: "destructive" });
      return;
    }
    if (!canUpload) {
      toast({ title: "Only event attendees can upload photos", description: "RSVP to join the event first", variant: "destructive" });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/events/${eventId}/photos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Upload failed');
      }

      toast({ title: "Photo uploaded successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'photos'] });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const res = await fetch(`/api/events/${eventId}/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Delete failed');
      }

      toast({ title: "Photo deleted" });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'photos'] });
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const handleReportPhoto = async (photoId: number) => {
    try {
      const res = await fetch(`/api/events/${eventId}/photos/${photoId}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Inappropriate content' }),
      });

      if (!res.ok) throw new Error('Report failed');
      toast({ title: "Photo reported", description: "Our team will review it." });
    } catch (error) {
      toast({ title: "Report failed", variant: "destructive" });
    }
  };

  const organizerPhotos = photos?.filter(p => p.isOrganizer) || [];
  const participantPhotos = photos?.filter(p => !p.isOrganizer) || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  const renderPhotoGrid = (photoList: EventPhoto[], sectionTitle?: string, icon?: React.ReactNode) => (
    <div className="space-y-4">
      {sectionTitle && (
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-sm font-medium text-muted-foreground">{sectionTitle}</h4>
          <Badge variant="secondary" className="text-xs">{photoList.length}</Badge>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photoList.map((photo, index) => {
          const isOwner = user && photo.uploader?.id === user.id;
          const canDelete = isOwner || permissions?.isOrganizer;
          const photoUrl = photo.photo.imageUrl || photo.photo.photoUrl || '';

          return (
            <motion.div
              key={`${photo.isOrganizer ? 'org' : 'part'}-${photo.photo.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden border hover-elevate cursor-pointer"
              data-testid={`photo-${photo.photo.id}`}
            >
              <img 
                src={photoUrl}
                alt={photo.photo.caption || 'Event photo'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {photo.isOrganizer && (
                <Badge className="absolute top-2 left-2 gap-1 bg-primary/90 backdrop-blur-sm text-xs">
                  <Crown className="h-3 w-3" />
                  Organizer
                </Badge>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {user && photo.photo.id > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60"
                        data-testid={`button-photo-menu-${photo.photo.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canDelete && (
                        <DropdownMenuItem 
                          onClick={() => handleDeletePhoto(photo.photo.id)}
                          className="text-destructive focus:text-destructive"
                          data-testid={`button-delete-photo-${photo.photo.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                      {!isOwner && (
                        <DropdownMenuItem 
                          onClick={() => handleReportPhoto(photo.photo.id)}
                          data-testid={`button-report-photo-${photo.photo.id}`}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {photo.uploader && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-white/30">
                        <AvatarImage src={photo.uploader.profileImage} />
                        <AvatarFallback className="text-xs bg-white/20 text-white">
                          {photo.uploader.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white truncate">
                        {photo.uploader.name}
                      </span>
                    </div>
                  )}
                  {photo.photo.caption && (
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">
                      {photo.photo.caption}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const totalPhotos = (photos?.length || 0);

  if (totalPhotos === 0) {
    return (
      <div className="text-center py-16">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          data-testid="input-photo-file"
        />
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
          <Camera className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Photos Yet</h3>
        <p className="text-muted-foreground mb-6">
          Be the first to share photos from this event!
        </p>
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={handleUploadClick}
          disabled={isUploading}
          data-testid="button-upload-photo"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="input-photo-file"
      />
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{totalPhotos} Photos</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2" 
          onClick={handleUploadClick}
          disabled={isUploading}
          data-testid="button-upload-photo"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      
      {organizerPhotos.length > 0 && renderPhotoGrid(organizerPhotos, "Organizer Photos", <Crown className="h-4 w-4 text-primary" />)}
      {participantPhotos.length > 0 && renderPhotoGrid(participantPhotos, "Guest Photos", <UserCheck className="h-4 w-4 text-muted-foreground" />)}
    </div>
  );
}

interface EventPermissions {
  canPost: boolean;
  canComment: boolean;
  role: string | null;
  isRsvpd: boolean;
  isOrganizer: boolean;
  rsvpStatus: 'going' | 'interested' | 'maybe' | 'not_going' | null;
  reason?: string;
}

export default function EventDetailsPage() {
  const { t } = useTranslation(['pages', 'common']);
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const [rsvpStatusState, setRsvpStatusState] = useState<RSVPStatus>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    venue: '',
    address: '',
    city: '',
    country: '',
    startDate: '',
    startTime: '',
    price: '',
  });
  const eventId = parseInt(params?.id || "0");
  const { data: event, isLoading } = useEvent(eventId);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: attendees = [] } = useQuery<any[]>({
    queryKey: ["/api/events", eventId, "attendees"],
    enabled: eventId > 0,
  });

  const { data: permissions } = useQuery<EventPermissions>({
    queryKey: ["/api/events", eventId, "permissions"],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/events/${eventId}/permissions`, { 
        headers,
        credentials: "include" 
      });
      if (!res.ok) return { canPost: false, canComment: false, role: null, isRsvpd: false, isOrganizer: false, rsvpStatus: null };
      return res.json();
    },
    enabled: eventId > 0,
  });

  const isOrganizer = permissions?.isOrganizer || (event?.userId === user?.id);

  const buildFullAddress = () => {
    const parts = [];
    if (event?.venue) parts.push(event.venue);
    if (event?.address) parts.push(event.address);
    if (event?.city) parts.push(event.city);
    if (event?.country) parts.push(event.country);
    return parts.join(", ");
  };

  const eventTimezone = event?.city ? getTimezoneFromCity(event.city) : "UTC";

  const getDirectionsUrl = () => {
    const address = buildFullAddress();
    if (!address) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const handleRsvpStatusChange = async (status: RSVPStatus) => {
    setRsvpStatusState(status);
    // Permissions are already refetched by UnifiedRSVPButton, but ensure it's complete
    if (status) {
      await queryClient.refetchQueries({ queryKey: ["/api/events", eventId, "permissions"] });
    }
  };

  const handleSaveEdit = async (data: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          eventType: data.eventType,
          venue: data.location?.split(',')[0] || data.location,
          address: data.address,
          city: data.city,
          country: data.country,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          price: data.price || null,
          currency: data.currency,
          maxAttendees: data.maxAttendees || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Event updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId] });
      setIsEditing(false);
    } catch (error: any) {
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
        <>
          <SEO 
            title="Event Details"
            description="View event details, RSVP, and connect with attendees for this tango event."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Skeleton className="h-96 w-full rounded-2xl mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  if (!event) {
    return (
      <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
        <>
          <SEO 
            title="Event Details"
            description="View event details, RSVP, and connect with attendees for this tango event."
          />
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Event not found</p>
              </CardContent>
            </Card>
          </div>
        </>
      </SelfHealingErrorBoundary>
    );
  }

  return (
    <SelfHealingErrorBoundary pageName="Event Details" fallbackRoute="/events">
      <>
        <SEO 
          title={`${event.title} - Event Details`}
          description={event.description || "View event details, RSVP, and connect with attendees for this tango event."}
        />

        {/* Hero Section */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{
              backgroundImage: `url('${event.imageUrl || event.coverImage || getCityImageUrl(event.city)}')`
            }}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </motion.div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl w-full"
            >
              {event.eventType && (
                <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  {event.eventType}
                </Badge>
              )}
              
              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-6"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.title || "Event") }}
              />
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 mb-8">
                {(event.startDate || event.date) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{safeDateFormat(event.startDate || event.date, "EEEE, MMMM d, yyyy", "TBD")}</span>
                  </div>
                )}
                {(event.location || event.venue || event.city) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.location || event.venue || event.city}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <UnifiedRSVPButton
                  eventId={eventId}
                  currentStatus={rsvpStatusState ?? permissions?.rsvpStatus ?? null}
                  variant="expanded"
                  onStatusChange={handleRsvpStatusChange}
                  className="[&>div]:flex-1 [&>div>button]:text-base [&>div>button]:h-12"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-3xl font-serif">{event.title || 'Event'}</CardTitle>
              </CardHeader>
              <Tabs defaultValue="discussion" className="w-full">
                <TabsList className="grid w-full grid-cols-3 border-b rounded-none bg-transparent p-0">
                  <TabsTrigger value="discussion" className="rounded-none border-b-2 data-[state=active]:border-b-primary">
                    Discussion
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="rounded-none border-b-2 data-[state=active]:border-b-primary gap-2">
                    <Camera className="h-4 w-4" />
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="details" className="rounded-none border-b-2 data-[state=active]:border-b-primary">
                    Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discussion" className="p-8">
                  <EventPostFeed eventId={eventId} eventName={event.title} />
                </TabsContent>

                <TabsContent value="photos" className="p-8">
                  <EventPhotosTab eventId={eventId} />
                </TabsContent>

                <TabsContent value="details" className="p-8">
                  <div className="space-y-8">
                    {isEditing && isOrganizer ? (
                      <EventEditForm 
                        event={event}
                        onSave={handleSaveEdit}
                        onCancel={() => setIsEditing(false)}
                        isSaving={isSaving}
                      />
                    ) : isOrganizer ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-end gap-2"
                      >
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => setIsEditing(true)}
                          data-testid="button-edit-event"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Event
                        </Button>
                      </motion.div>
                    ) : null}

                {!isEditing && (
                <div className="grid gap-8 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold mb-2">Date & Time</p>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {(event.startDate || event.date) && (
                          <>
                            {format(new Date(event.startDate || event.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            {event.endDate && event.endDate !== event.startDate && (
                              <> - {format(new Date(event.endDate), "h:mm a")}</>
                            )}
                          </>
                        )}
                        {event.startTime && <> at {event.startTime}</>}
                        {event.endTime && <> - {event.endTime}</>}
                      </p>
                    </div>
                  </motion.div>

                  {(event.location || event.venue || event.city || event.address) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-semibold mb-2">Location</p>
                        <p className="text-base text-muted-foreground leading-relaxed mb-3" data-testid="text-event-address">
                          {event.venue && <span className="font-medium">{event.venue}</span>}
                          {event.address && <><br />{event.address}</>}
                          {!event.address && event.location && event.location !== event.venue && <><br />{event.location}</>}
                          {event.city && (
                            <>
                              <br />
                              <Link href={`/cities/${toCitySlug(event.city)}`} className="text-primary hover:underline font-medium">
                                {event.city}
                              </Link>
                              {event.country && `, ${event.country}`}
                            </>
                          )}
                        </p>
                        {getDirectionsUrl() && (
                          <a 
                            href={getDirectionsUrl()!}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="link-get-directions"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <Navigation className="h-4 w-4" />
                              Get Directions
                            </Button>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold mb-2" data-testid="text-price-label">Price</p>
                      <p className="text-base text-muted-foreground leading-relaxed" data-testid="text-event-price">
                        {event.price && event.price > 0 
                          ? `${getCurrencySymbol(event.currency as any) || '$'}${event.price}` 
                          : 'Free'}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold mb-2">Attendees</p>
                      <p className="text-base text-muted-foreground leading-relaxed" data-testid="text-attendee-count">
                        {attendees.length > 0 
                          ? `${attendees.length} ${attendees.length === 1 ? 'person' : 'people'} attending`
                          : 'Be the first to RSVP!'}
                      </p>
                    </div>
                  </motion.div>
                </div>
                )}

                {/* Attendees List Sidebar */}
                {attendees.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.62 }}
                    className="pt-6 border-t"
                  >
                    <h3 className="text-xl font-semibold mb-4" data-testid="text-attendees-header">Who's Going</h3>
                    <ScrollArea className="h-48 rounded-lg border p-4">
                      <div className="space-y-3">
                        {attendees.map((attendee: any) => (
                          <Link 
                            key={attendee.id}
                            href={`/profile/${attendee.username || attendee.userId}`}
                            data-testid={`link-attendee-${attendee.userId}`}
                          >
                            <div className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={attendee.profileImage} alt={attendee.name || 'Attendee'} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {(attendee.name || 'U').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attendee.name || 'Anonymous'}</p>
                                <p className="text-xs text-muted-foreground capitalize">{attendee.status || 'going'}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {event.organizer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="pt-6 border-t"
                  >
                    <h3 className="text-xl font-semibold mb-4" data-testid="text-organizer-header">Event Organizer</h3>
                    <Link 
                      href={`/profile/${event.organizer.username || event.organizer.id}`}
                      data-testid="link-organizer-profile"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-xl hover-elevate transition-colors cursor-pointer">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarImage 
                            src={event.organizer.profileImage} 
                            alt={event.organizer.name || 'Organizer'} 
                            data-testid="img-organizer-avatar"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(event.organizer.name || 'O').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-semibold truncate" data-testid="text-organizer-name">
                            {event.organizer.name || 'Unknown Organizer'}
                          </p>
                          {event.organizer.username && (
                            <p className="text-sm text-muted-foreground" data-testid="text-organizer-username">
                              @{event.organizer.username}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Additional Event Info Row */}
                {(event.musicStyle || event.level || event.dressCode) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6 border-t"
                  >
                    {event.musicStyle && (
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Music Style</p>
                          <p className="font-medium">{event.musicStyle}</p>
                        </div>
                      </div>
                    )}
                    {event.level && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Level</p>
                          <p className="font-medium capitalize">{event.level}</p>
                        </div>
                      </div>
                    )}
                    {event.dressCode && (
                      <div className="flex items-center gap-3">
                        <Tag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Dress Code</p>
                          <p className="font-medium">{event.dressCode}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.68 }}
                    className="pt-6 border-t"
                  >
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Event Team - Organizers, DJs, Teachers, Performers */}
                {(event.organizerText || event.djText || event.teacherText || event.performerText) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.69 }}
                  >
                    <EventTeamCards
                      djText={event.djText}
                      teacherText={event.teacherText}
                      performerText={event.performerText}
                      organizerText={event.organizerText && !event.organizer ? event.organizerText : undefined}
                      djProfiles={event.djProfiles}
                      teacherProfiles={event.teacherProfiles}
                      performerProfiles={event.performerProfiles}
                      organizerProfiles={event.organizerProfiles}
                    />
                  </motion.div>
                )}

                {/* Source Info + Last Updated Section */}
                {(event.sourceName || event.sourceUrl || (event.sourceUrls && event.sourceUrls.length > 0) || event.updatedAt) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.695 }}
                    className="pt-6 border-t"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {(event.sourceName || event.sourceUrl || (event.sourceUrls && event.sourceUrls.length > 0)) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Event Source</h4>
                          <div className="flex flex-wrap gap-3">
                            {event.sourceUrl && (
                              <a
                                href={event.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                data-testid="link-source-url"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {event.sourceName || new URL(event.sourceUrl).hostname.replace('www.', '')}
                              </a>
                            )}
                            {!event.sourceUrl && event.sourceName && (
                              <span className="text-sm text-muted-foreground" data-testid="text-source-name">
                                Source: {event.sourceName}
                              </span>
                            )}
                            {event.sourceUrls && event.sourceUrls.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {event.sourceUrls.map((url: string, index: number) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    data-testid={`link-source-${index}`}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {new URL(url).hostname.replace('www.', '')}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {(event.sourceUpdatedAt || event.updatedAt) && (
                        <div className="text-right">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {event.sourceUpdatedAt ? 'Source Last Updated' : 'Event Last Updated'}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end" data-testid="text-last-updated">
                            <Clock className="h-3 w-3" />
                            {safeDateFormat(event.sourceUpdatedAt || event.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {event.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="pt-8 border-t"
                  >
                    <h3 className="text-2xl font-serif font-bold mb-6">About This Event</h3>
                    <div 
                      className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed prose prose-lg dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–').replace(/&#038;/g, '&').replace(/&#8217;/g, "'")) }}
                    />
                  </motion.div>
                )}
                
                {/* Links Section */}
                {(event.websiteUrl || event.ticketUrl || event.ticketLink || event.facebookUrl || event.instagramUrl) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="pt-6 border-t"
                  >
                    <h4 className="text-lg font-semibold mb-4">Links & Tickets</h4>
                    <div className="flex flex-wrap gap-4">
                      {(event.ticketUrl || event.ticketLink) && (
                        <a 
                          href={event.ticketUrl || event.ticketLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid="link-tickets"
                        >
                          <Button variant="default" className="gap-2">
                            <Ticket className="h-4 w-4" />
                            Get Tickets
                          </Button>
                        </a>
                      )}
                      {event.websiteUrl && (
                        <a 
                          href={event.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                          data-testid="link-source"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Original Source
                        </a>
                      )}
                      {event.facebookUrl && (
                        <a 
                          href={event.facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Facebook Event
                        </a>
                      )}
                      {event.instagramUrl && (
                        <a 
                          href={event.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Instagram
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Event Team / Participants Manager - hidden until profiles are clickable */}
                {/* <EventParticipantManager eventId={eventId} isOrganizer={isOrganizer} /> */}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </>
    </SelfHealingErrorBoundary>
  );
}
