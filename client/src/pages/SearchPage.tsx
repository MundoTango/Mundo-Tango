import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: results, isLoading } = useQuery<{
    users?: any[];
    events?: any[];
    groups?: any[];
  }>({
    queryKey: ["/api/search", { query }],
    enabled: query.length > 2,
  });

  const filteredResults = results || { users: [], events: [], groups: [] };
  const allResults = [
    ...(filteredResults.users || []),
    ...(filteredResults.events || []),
    ...(filteredResults.groups || []),
  ];

  return (
    <SelfHealingErrorBoundary pageName="Search" fallbackRoute="/">
      <PageLayout title="Search" showBreadcrumbs>
      <div className="min-h-screen bg-background">
        {/* Editorial Hero Section - 16:9 */}
        <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2784&auto=format&fit=crop')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full max-w-2xl"
            >
              <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
                Discover
              </Badge>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-8">
                Search
              </h1>
              
              {/* Search Input in Hero */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <Input
                  type="text"
                  placeholder="Search for people, events, or groups..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/10 backdrop-blur-md border-white/30 text-white placeholder:text-white/60"
                  data-testid="input-search"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Editorial Content Layout */}
        <div className="container mx-auto max-w-4xl px-6 py-16">
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">Searching...</p>
                </motion.div>
              ) : allResults.length > 0 ? (
                <div className="space-y-6">
                  {allResults.map((result: any, index: number) => (
                    <motion.div
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <ResultCard result={result} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No results found" />
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              {filteredResults.users && filteredResults.users.length > 0 ? (
                <div className="space-y-6">
                  {filteredResults.users.map((user: any, index: number) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <UserCard user={user} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No people found" />
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              {filteredResults.events && filteredResults.events.length > 0 ? (
                <div className="space-y-6">
                  {filteredResults.events.map((event: any, index: number) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No events found" />
              )}
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups">
              {filteredResults.groups && filteredResults.groups.length > 0 ? (
                <div className="space-y-6">
                  {filteredResults.groups.map((group: any, index: number) => (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <GroupCard group={group} />
                    </motion.div>
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
    </PageLayout>
    </SelfHealingErrorBoundary>
  );
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
    <Card className="hover-elevate overflow-hidden group" data-testid={`user-result-${user.id}`}>
      <CardContent className="flex items-center gap-6 p-6">
        <Avatar className="h-16 w-16 ring-2 ring-border">
          <AvatarImage src={user.profileImage} />
          <AvatarFallback className="text-lg font-serif">{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.username}`}>
            <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors mb-1">{user.name}</h3>
          </Link>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        <Badge variant="outline" className="shrink-0">Person</Badge>
      </CardContent>
    </Card>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Card className="hover-elevate overflow-hidden group" data-testid={`event-result-${event.id}`}>
      <div className="flex flex-col md:flex-row">
        {event.imageUrl && (
          <div className="relative w-full md:w-64 aspect-[16/9] md:aspect-square overflow-hidden">
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}
        <CardContent className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link href={`/events/${event.id}`}>
                <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors mb-2">{event.title}</h3>
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <p className="text-sm">{event.location}</p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">Event</Badge>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function GroupCard({ group }: { group: any }) {
  return (
    <Card className="hover-elevate overflow-hidden group" data-testid={`group-result-${group.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/groups/${group.id}`}>
              <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors mb-2">{group.name}</h3>
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <p className="text-sm">{group.memberCount} members</p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">Group</Badge>
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
