import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, MapPin, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { TANGO_ROLES } from "@/lib/tangoRoles";
import { UserIdentityHeader } from "@/components/UserIdentityHeader";

interface Friend {
  id: number;
  name: string;
  username: string;
  profileImage?: string;
  bio?: string;
  city?: string;
  closenessScore?: number;
  tangoRoles?: string[];
}

interface ProfileTabFriendsProps {
  profileId?: number;
  isOwnProfile?: boolean;
  isPublicView?: boolean;
}

export default function ProfileTabFriends({ 
  profileId, 
  isOwnProfile = false, 
  isPublicView = false 
}: ProfileTabFriendsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const canEdit = isOwnProfile && !isPublicView;

  const { data: friends = [], isLoading, error } = useQuery<Friend[]>({
    queryKey: profileId ? ["/api/users", profileId, "friends"] : ["/api/friends"],
    queryFn: async () => {
      const endpoint = profileId ? `/api/users/${profileId}/friends` : "/api/friends";
      const response = await fetch(endpoint, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch friends");
      }
      return response.json();
    },
    enabled: !!profileId || isOwnProfile,
  });

  const filteredFriends = friends.filter((friend) => {
    const query = searchQuery.toLowerCase();
    const name = (friend.name || "").toLowerCase();
    const username = (friend.username || "").toLowerCase();
    const city = (friend.city || "").toLowerCase();
    const matchesSearch = name.includes(query) || username.includes(query) || city.includes(query);
    
    const matchesRole = roleFilter === "all" || 
      (friend.tangoRoles && friend.tangoRoles.some(role => role.includes(roleFilter)));
    
    return matchesSearch && matchesRole;
  });


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Unable to load friends. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Friends
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friends.length}
                </Badge>
              )}
            </CardTitle>
          </div>
          {friends.length > 3 && (
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-xs max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                  data-testid="input-search-friends"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40 h-9" data-testid="select-role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {TANGO_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {friends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {isOwnProfile ? "You haven't added any friends yet." : "No friends to display."}
            </p>
            {isOwnProfile && (
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/friends">
                  Find Friends
                </Link>
              </Button>
            )}
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              No friends match your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredFriends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.username}`}
                className="block"
              >
                <div 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover-elevate active-elevate-2 transition-all"
                  data-testid={`card-friend-${friend.id}`}
                >
                  <UserIdentityHeader
                    user={{
                      id: friend.id,
                      name: friend.name,
                      username: friend.username,
                      profileImage: friend.profileImage,
                      tangoRoles: friend.tangoRoles,
                    }}
                    closenessScore={friend.closenessScore && friend.closenessScore > 0 ? friend.closenessScore : null}
                    size="md"
                    showRoles={true}
                    showTimestamp={false}
                    testIdPrefix={`friend-${friend.id}`}
                  />
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    {friend.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {friend.city}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/messages?user=${friend.id}`;
                        }}
                        data-testid={`button-message-${friend.id}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {friends.length > 0 && isOwnProfile && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/friends">
                Manage Friends
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
