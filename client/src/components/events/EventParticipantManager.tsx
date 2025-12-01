import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, Star, Music, Mic, Camera, Users, UserCheck, X, Search, 
  Check, Send, Crown, Loader2, ChevronDown
} from "lucide-react";
import { Link } from "wouter";

interface Participant {
  id: number;
  userId: number;
  eventId: number;
  role: string;
  status: string;
  customTitle?: string;
  notes?: string;
  isPubliclyListed: boolean;
  user?: {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    profileImage?: string;
    city?: string;
  };
}

interface SearchedUser {
  id: number;
  name: string;
  username: string;
  email?: string;
  profileImage?: string;
  city?: string;
}

interface EventParticipantManagerProps {
  eventId: number;
  isOrganizer: boolean;
}

const PARTICIPANT_ROLES = [
  { value: "co_organizer", label: "Co-Organizer", icon: Crown, color: "text-amber-500" },
  { value: "dj", label: "DJ", icon: Music, color: "text-blue-500" },
  { value: "teacher", label: "Teacher", icon: Users, color: "text-green-500" },
  { value: "performer", label: "Performer", icon: Mic, color: "text-purple-500" },
  { value: "photographer", label: "Photographer", icon: Camera, color: "text-pink-500" },
  { value: "host", label: "Host", icon: UserCheck, color: "text-teal-500" },
];

const getRoleIcon = (role: string) => {
  const roleConfig = PARTICIPANT_ROLES.find(r => r.value === role);
  if (!roleConfig) return Users;
  return roleConfig.icon;
};

const getRoleColor = (role: string) => {
  const roleConfig = PARTICIPANT_ROLES.find(r => r.value === role);
  return roleConfig?.color || "text-muted-foreground";
};

const formatRoleName = (role: string) => {
  return role.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
};

export function EventParticipantManager({ eventId, isOrganizer }: EventParticipantManagerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("dj");
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search query to reduce API calls
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const { data: participantsData, isLoading } = useQuery<{ participants: Record<string, Participant[]>, total: number }>({
    queryKey: ["/api/events", eventId, "participants"],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`/api/events/${eventId}/participants`, { 
        credentials: "include",
        headers,
      });
      if (!res.ok) return { participants: {}, total: 0 };
      return res.json();
    },
    enabled: !!localStorage.getItem('accessToken'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery<SearchedUser[]>({
    queryKey: ["/api/events", eventId, "search-team-members", selectedRole, debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) return [];
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(
        `/api/events/${eventId}/search-team-members?role=${encodeURIComponent(selectedRole)}&q=${encodeURIComponent(debouncedSearchQuery)}&limit=15`, 
        { 
          credentials: "include",
          headers,
        }
      );
      if (!res.ok) {
        console.error("Failed to search team members:", res.status, res.statusText);
        return [];
      }
      return res.json();
    },
    enabled: debouncedSearchQuery.length >= 2 && !!localStorage.getItem('accessToken'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const inviteParticipant = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest("POST", `/api/events/${eventId}/participants`, {
        userId,
        role,
        status: "confirmed",
        isPubliclyListed: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "participants"] });
      toast({
        title: "Participant added!",
        description: `${selectedUser?.name || "User"} has been added as ${formatRoleName(selectedRole)}`,
      });
      setSelectedUser(null);
      setSearchQuery("");
      setIsInviteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add participant",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const removeParticipant = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/events/${eventId}/participants/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "participants"] });
      toast({ title: "Participant removed" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove participant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const participants = participantsData?.participants || {};
  const totalParticipants = participantsData?.total || 0;

  const handleAddParticipant = () => {
    if (!selectedUser) return;
    inviteParticipant.mutate({ userId: selectedUser.id, role: selectedRole });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-muted animate-pulse rounded" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="pt-6 border-t"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold" data-testid="text-participants-header">
          Event Team {totalParticipants > 0 && `(${totalParticipants})`}
        </h3>
        
        {isOrganizer && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-add-participant">
                <UserPlus className="h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Search for a user to add as a participant with a specific role.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger data-testid="select-participant-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTICIPANT_ROLES.map(role => {
                        const Icon = role.icon;
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${role.color}`} />
                              {role.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search User</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-user"
                    />
                  </div>
                  
                  {debouncedSearchQuery.length >= 2 && (
                    <ScrollArea className="h-48 rounded-md border" data-testid="search-results-scroll">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-6" data-testid="search-loading">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground text-sm" data-testid="search-empty">
                          No users found
                        </div>
                      ) : (
                        <div className="p-2 space-y-1">
                          {searchResults.map(user => (
                            <div
                              key={user.id}
                              onClick={() => setSelectedUser(user)}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedUser?.id === user.id 
                                  ? "bg-primary/10 border border-primary/30" 
                                  : "hover:bg-muted"
                              }`}
                              data-testid={`user-option-${user.id}`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.profileImage || undefined} />
                                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              </div>
                              {selectedUser?.id === user.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.profileImage || undefined} />
                      <AvatarFallback>{selectedUser.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Will be added as {formatRoleName(selectedRole)}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedUser(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleAddParticipant}
                  disabled={!selectedUser || inviteParticipant.isPending}
                  data-testid="button-confirm-add-participant"
                >
                  {inviteParticipant.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Add to Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {totalParticipants === 0 ? (
        <div className="text-center py-8 rounded-lg border-2 border-dashed">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No team members yet</p>
          {isOrganizer && (
            <p className="text-sm text-muted-foreground">
              Add DJs, teachers, performers, and other team members
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(participants).map(([role, roleParticipants]) => {
            if (!roleParticipants || roleParticipants.length === 0) return null;
            
            const Icon = getRoleIcon(role);
            const color = getRoleColor(role);
            
            return (
              <div key={role} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm font-medium">{formatRoleName(role)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {roleParticipants.length}
                  </Badge>
                </div>
                
                <div className="grid gap-2 pl-6">
                  <AnimatePresence>
                    {roleParticipants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/profile/${participant.user?.username || participant.userId}`}>
                          <div 
                            className="flex items-center gap-3 p-2 rounded-lg hover-elevate cursor-pointer group"
                            data-testid={`participant-${participant.userId}`}
                          >
                            <Avatar className="h-10 w-10 border">
                              <AvatarImage src={participant.user?.profileImage || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {(participant.user?.name || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {participant.user?.name || "Unknown"}
                              </p>
                              {participant.customTitle && (
                                <p className="text-xs text-muted-foreground">
                                  {participant.customTitle}
                                </p>
                              )}
                            </div>
                            {isOrganizer && participant.role !== "organizer" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeParticipant.mutate(participant.userId);
                                }}
                                data-testid={`button-remove-${participant.userId}`}
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
