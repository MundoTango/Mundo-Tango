import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRoleBadges } from "@/components/UserRoleBadges";
import { Search, UserPlus, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface AddTravelerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  tripCity: string;
}

interface UserSearchResult {
  id: number;
  name: string;
  username: string;
  profileImage: string | null;
  city: string | null;
  country: string | null;
  tangoRoles: string[] | null;
}

export function AddTravelerDialog({ 
  open, 
  onOpenChange, 
  tripId,
  tripCity 
}: AddTravelerDialogProps) {
  const { t } = useTranslation(["pages", "common"]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [addingUserId, setAddingUserId] = useState<number | null>(null);

  const { data: searchResults, isLoading: isSearching } = useQuery<UserSearchResult[]>({
    queryKey: ["/api/travel/users/search", { q: searchQuery, tripId: String(tripId) }],
    enabled: searchQuery.length >= 2,
  });

  const addParticipantMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/travel/trips/${tripId}/participants`, {
        userId,
      });
      return response.json();
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/travel/trips", tripId, "participants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/travel/plans", String(tripId)] });
      toast({
        title: t("pages:travel.addTraveler.success_title", "Traveler added"),
        description: t("pages:travel.addTraveler.success_desc", "The traveler has been added to your trip."),
      });
      setAddingUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: t("pages:travel.addTraveler.error_title", "Failed to add traveler"),
        description: error.message || t("pages:travel.addTraveler.error_desc", "Please try again."),
        variant: "destructive",
      });
      setAddingUserId(null);
    },
  });

  const handleAddUser = (userId: number) => {
    setAddingUserId(userId);
    addParticipantMutation.mutate(userId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {t("pages:travel.addTraveler.title", "Add Travelers")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("pages:travel.addTraveler.subtitle", "Search for travelers to add to your trip to {{city}}", { city: tripCity })}
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("pages:travel.addTraveler.search_placeholder", "Search by name or username...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-travelers"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {searchQuery.length < 2 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("pages:travel.addTraveler.type_to_search", "Type at least 2 characters to search")}
              </p>
            )}

            {isSearching && (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("pages:travel.addTraveler.no_results", "No users found")}
              </p>
            )}

            {searchResults?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                data-testid={`user-search-result-${user.id}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.profileImage || undefined} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{user.name}</p>
                      <UserRoleBadges roles={user.tangoRoles} size="xs" maxDisplay={2} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>@{user.username}</span>
                      {user.city && (
                        <>
                          <span>-</span>
                          <span>{user.city}{user.country ? `, ${user.country}` : ""}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAddUser(user.id)}
                  disabled={addingUserId === user.id}
                  data-testid={`button-add-traveler-${user.id}`}
                >
                  {addingUserId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
