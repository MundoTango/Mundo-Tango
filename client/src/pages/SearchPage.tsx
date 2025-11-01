import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: results, isLoading } = useQuery({
    queryKey: ["/api/search", query],
    enabled: query.length > 2,
  });

  const filteredResults = results || {};
  const allResults = [
    ...(filteredResults.users || []),
    ...(filteredResults.events || []),
    ...(filteredResults.groups || []),
  ];

  return (
    <PageLayout title="Search" showBreadcrumbs>
<div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Search Header */}
        
        </div>

        {/* Results */}
        {query.length > 2 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all" data-testid="tab-all">
                All
                {allResults.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{allResults.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">
                <Users className="h-4 w-4 mr-2" />
                People
                {filteredResults.users && (
                  <Badge variant="secondary" className="ml-2">{filteredResults.users.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">
                <Calendar className="h-4 w-4 mr-2" />
                Events
                {filteredResults.events && (
                  <Badge variant="secondary" className="ml-2">{filteredResults.events.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="groups" data-testid="tab-groups">
                <MapPin className="h-4 w-4 mr-2" />
                Groups
                {filteredResults.groups && (
                  <Badge variant="secondary" className="ml-2">{filteredResults.groups.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* All Tab */}
            <TabsContent value="all">
              {isLoading ? (
                <div className="text-center py-12">Searching...</div>
              ) : allResults.length > 0 ? (
                <div className="space-y-4">
                  {allResults.map((result: any) => (
                    <ResultCard key={`${result.type}-${result.id}`} result={result} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No results found" />
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              {filteredResults.users && filteredResults.users.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.users.map((user: any) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No people found" />
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              {filteredResults.events && filteredResults.events.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.events.map((event: any) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No events found" />
              )}
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups">
              {filteredResults.groups && filteredResults.groups.length > 0 ? (
                <div className="space-y-4">
                  {filteredResults.groups.map((group: any) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No groups found" />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Enter at least 3 characters to search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </PageLayout>);
}

// Helper Components
function ResultCard({ result }: { result: any }) {
  if (result.type === "user") return <UserCard user={result} />;
  if (result.type === "event") return <EventCard event={result} />;
  if (result.type === "group") return <GroupCard group={result} />;
  return null;
}

function UserCard({ user }: { user: any }) {
  return (
    <Card className="hover-elevate" data-testid={`user-result-${user.id}`}>
      <CardContent className="flex items-center gap-4 pt-6">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.profileImage} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link href={`/profile/${user.username}`}>
            <h3 className="font-semibold hover:underline">{user.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
        <Badge variant="outline">Person</Badge>
      </CardContent>
    </Card>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Card className="hover-elevate" data-testid={`event-result-${event.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/events/${event.id}`}>
              <h3 className="font-semibold hover:underline">{event.title}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
          </div>
          <Badge variant="outline">Event</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCard({ group }: { group: any }) {
  return (
    <Card className="hover-elevate" data-testid={`group-result-${group.id}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/groups/${group.id}`}>
              <h3 className="font-semibold hover:underline">{group.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              {group.memberCount} members
            </p>
          </div>
          <Badge variant="outline">Group</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>{message}</p>
      </CardContent>
    </Card>
  );
}
