import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItineraryTimeline } from "@/components/travel/ItineraryTimeline";
import { TripMapView } from "@/components/travel/TripMapView";
import { BudgetCalculator } from "@/components/travel/BudgetCalculator";
import { TravelDocumentUpload } from "@/components/travel/TravelDocumentUpload";
import { ParticipantAvatar } from "@/components/travel/ParticipantAvatar";
import { AddTravelerDialog } from "@/components/travel/AddTravelerDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, MapPin, Users, DollarSign, FileText, Map, ArrowLeft, Plus, X, LogOut } from "lucide-react";
import { safeDateFormat } from "@/lib/safeDateFormat";
import { SEO } from "@/components/SEO";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Participant {
  id: number;
  tripId: number;
  userId: number;
  role: string;
  status: string;
  createdAt: string;
  userName: string;
  userUsername: string;
  userProfileImage: string | null;
  userCity: string | null;
  userCountry: string | null;
  userTangoRoles: string[] | null;
}

export default function TravelItineraryPage() {
  const { t } = useTranslation(["pages", "common"]);
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("itinerary");
  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useQuery<any>({
    queryKey: ["/api/travel/plans", id],
    enabled: !!id,
  });

  const { data: participants = [], isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ["/api/travel/trips", id, "participants"],
    enabled: !!id,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("DELETE", `/api/travel/plans/${id}/destinations/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", id] });
      toast({
        title: t("pages:travel.itinerary.item_deleted_title", "Item deleted"),
        description: t("pages:travel.itinerary.item_deleted_desc", "Itinerary item has been removed."),
      });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/travel/trips/${id}/participants/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/trips", id, "participants"] });
      toast({
        title: t("pages:travel.participants.removed_title", "Traveler removed"),
        description: t("pages:travel.participants.removed_desc", "The traveler has been removed from this trip."),
      });
      setRemovingUserId(null);
    },
    onError: () => {
      toast({
        title: t("pages:travel.participants.remove_error_title", "Failed to remove"),
        description: t("pages:travel.participants.remove_error_desc", "Please try again."),
        variant: "destructive",
      });
      setRemovingUserId(null);
    },
  });

  const leaveTripMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/travel/trips/${id}/leave`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t("pages:travel.participants.left_title", "Left trip"),
        description: t("pages:travel.participants.left_desc", "You have left this trip."),
      });
      navigate("/travel");
    },
    onError: () => {
      toast({
        title: t("pages:travel.participants.leave_error_title", "Failed to leave"),
        description: t("pages:travel.participants.leave_error_desc", "Please try again."),
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t("pages:travel.itinerary.not_found", "Trip not found")}</p>
          <Button asChild className="mt-4">
            <Link href="/travel">{t("pages:travel.itinerary.back_to_dashboard", "Back to Dashboard")}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return safeDateFormat(dateString, "MMM dd, yyyy", dateString);
  };

  const items = trip.items || [];
  const locations = items.filter((item: any) => item.location).map((item: any) => ({
    id: item.id,
    name: item.title,
    address: item.location,
  }));

  const expenses = items.filter((item: any) => item.cost).map((item: any) => ({
    category: item.type,
    amount: item.cost,
  }));

  const isOwner = user?.id === trip.userId;
  const isParticipant = participants.some((p) => p.userId === user?.id);
  const totalParticipants = 1 + participants.length;

  return (
    <>
      <SEO
        title={`${trip.city} Trip - Itinerary`}
        description={`View your trip details and itinerary for ${trip.city}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/travel">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("pages:travel.itinerary.back_to_dashboard", "Back to Dashboard")}
              </Link>
            </Button>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-4xl font-serif font-bold">{trip.city}</h1>
                  {trip.status && (
                    <Badge variant="outline" className="capitalize">
                      {trip.status}
                    </Badge>
                  )}
                  {!isOwner && (
                    <Badge variant="secondary">
                      {t("pages:travel.itinerary.participant_badge", "Participant")}
                    </Badge>
                  )}
                </div>
                {trip.country && (
                  <p className="text-muted-foreground text-lg">{trip.country}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                  </div>
                  {trip.tripDuration && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{trip.tripDuration} {t("pages:travel.itinerary.days", "days")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {isOwner && (
                  <Button asChild data-testid="button-add-itinerary-item">
                    <Link href={`/travel/planner?id=${id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("pages:travel.itinerary.add_activity", "Add Activity")}
                    </Link>
                  </Button>
                )}
                {isParticipant && !isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => setShowLeaveConfirm(true)}
                    data-testid="button-leave-trip"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("pages:travel.itinerary.leave_trip", "Leave Trip")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="itinerary">
                <Calendar className="h-4 w-4 mr-2" />
                {t("pages:travel.itinerary.tab_itinerary", "Itinerary")}
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="h-4 w-4 mr-2" />
                {t("pages:travel.itinerary.tab_map", "Map")}
              </TabsTrigger>
              <TabsTrigger value="budget">
                <DollarSign className="h-4 w-4 mr-2" />
                {t("pages:travel.itinerary.tab_budget", "Budget")}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                {t("pages:travel.itinerary.tab_documents", "Documents")}
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TabsContent value="itinerary" className="mt-0">
                  <ItineraryTimeline
                    items={items}
                    onDelete={isOwner ? (itemId) => deleteItemMutation.mutate(itemId) : undefined}
                  />
                </TabsContent>

                <TabsContent value="map" className="mt-0">
                  <TripMapView locations={locations} />
                </TabsContent>

                <TabsContent value="budget" className="mt-0">
                  <BudgetCalculator
                    totalBudget={trip.budget || 0}
                    expenses={expenses}
                    participants={totalParticipants}
                  />
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <TravelDocumentUpload documents={[]} />
                </TabsContent>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      {t("pages:travel.itinerary.participants", "Participants")}
                      <Badge variant="secondary" className="ml-auto">
                        {totalParticipants}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <ParticipantAvatar
                        participant={{
                          id: trip.userId,
                          name: isOwner ? t("pages:travel.itinerary.you", "You") : (trip.ownerName || t("pages:travel.itinerary.organizer", "Organizer")),
                          profileImage: trip.ownerProfileImage,
                        }}
                        isOrganizer
                        showName
                      />

                      {participantsLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : (
                        participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between gap-2"
                            data-testid={`participant-${participant.userId}`}
                          >
                            <ParticipantAvatar
                              participant={{
                                id: participant.userId,
                                name: participant.userId === user?.id 
                                  ? t("pages:travel.itinerary.you", "You") 
                                  : participant.userName,
                                profileImage: participant.userProfileImage || undefined,
                                tangoRoles: participant.userTangoRoles || undefined,
                              }}
                              showName
                            />
                            {isOwner && participant.userId !== user?.id && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setRemovingUserId(participant.userId)}
                                data-testid={`button-remove-participant-${participant.userId}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}

                      {isOwner && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => setShowAddTraveler(true)}
                          data-testid="button-add-participant"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("pages:travel.itinerary.invite_travelers", "Invite Travelers")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {trip.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("pages:travel.itinerary.notes", "Notes")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {trip.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("pages:travel.itinerary.quick_stats", "Quick Stats")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("pages:travel.itinerary.total_activities", "Total Activities")}</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("pages:travel.itinerary.total_budget", "Total Budget")}</span>
                      <span className="font-medium">${trip.budget || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("pages:travel.itinerary.participants", "Participants")}</span>
                      <span className="font-medium">{totalParticipants}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      <AddTravelerDialog
        open={showAddTraveler}
        onOpenChange={setShowAddTraveler}
        tripId={parseInt(id || "0")}
        tripCity={trip.city}
      />

      <AlertDialog open={removingUserId !== null} onOpenChange={(open) => !open && setRemovingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pages:travel.participants.remove_confirm_title", "Remove Traveler")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pages:travel.participants.remove_confirm_desc", "Are you sure you want to remove this traveler from the trip? They will be notified.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingUserId && removeParticipantMutation.mutate(removingUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("pages:travel.participants.remove_button", "Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("pages:travel.participants.leave_confirm_title", "Leave Trip")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pages:travel.participants.leave_confirm_desc", "Are you sure you want to leave this trip? The organizer will be notified.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common:cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leaveTripMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("pages:travel.participants.leave_button", "Leave Trip")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
