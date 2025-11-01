import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, MessageSquare, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function FeedRightSidebar() {
  // TODO: Replace with real data from API
  const upcomingEvents = [
    {
      id: 1,
      title: "Milonga at Cafe Tortoni",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: "Buenos Aires, AR",
      attendees: 45,
    },
    {
      id: 2,
      title: "Tango Workshop: Sacadas",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: "Virtual",
      attendees: 23,
    },
    {
      id: 3,
      title: "Sunday Practica",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "New York, USA",
      attendees: 67,
    },
  ];

  const onlineUsers = [
    { id: 1, name: "Carlos Mendez", username: "carlos_tango", avatar: null, location: "Buenos Aires" },
    { id: 2, name: "Sofia Rodriguez", username: "sofia_dance", avatar: null, location: "Madrid" },
    { id: 3, name: "Marco Russo", username: "marco_milonga", avatar: null, location: "Rome" },
    { id: 4, name: "Elena Costa", username: "elena_tango", avatar: null, location: "Paris" },
    { id: 5, name: "Diego Silva", username: "diego_baila", avatar: null, location: "Lisbon" },
  ];

  const trendingTopics = [
    { tag: "#TangoFestival2025", posts: 1234 },
    { tag: "#MilongaMonday", posts: 856 },
    { tag: "#TangoTutorial", posts: 543 },
    { tag: "#NewTangoDancers", posts: 421 },
  ];

  return (
    <aside className="w-[320px] space-y-4" data-testid="feed-right-sidebar">
      {/* E39 - Upcoming Events Widget */}
      <Card className="p-4 glass-card" data-testid="card-upcoming-events">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Upcoming Events
          </h3>
          <Link href="/events">
            <Button variant="ghost" size="sm" data-testid="link-see-all-events">
              See all
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div
                className="p-3 rounded-lg hover-elevate cursor-pointer border"
                data-testid={`event-${event.id}`}
              >
                <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(event.date, { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {event.attendees} attending
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* E40 - Online Users / Who to Follow */}
      <Card className="p-4 glass-card" data-testid="card-online-users">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Who to Follow</h3>
          <Link href="/discover">
            <Button variant="ghost" size="sm" data-testid="link-discover">
              Discover
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {onlineUsers.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3" data-testid={`user-${user.id}`}>
              <Link href={`/profile/${user.username}`}>
                <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover-elevate p-1 rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.location}</p>
                  </div>
                </div>
              </Link>
              <Button size="sm" variant="outline" data-testid={`button-follow-${user.id}`}>
                Follow
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Topics */}
      <Card className="p-4 glass-card" data-testid="card-trending-topics">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending
        </h3>
        <div className="space-y-2">
          {trendingTopics.map((topic) => (
            <Link key={topic.tag} href={`/search?q=${encodeURIComponent(topic.tag)}`}>
              <div className="p-2 rounded hover-elevate cursor-pointer" data-testid={`trending-${topic.tag}`}>
                <p className="font-medium text-sm text-primary">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* E41 - Mr Blue AI Quick Access */}
      <Card className="p-4 glass-card ocean-gradient" data-testid="card-mr-blue">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-semibold">Mr Blue AI</h3>
          </div>
          <p className="text-sm mb-3 opacity-90">
            Your personal tango assistant is ready to help!
          </p>
          <Link href="/mr-blue">
            <Button
              variant="outline"
              className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
              data-testid="button-chat-mr-blue"
            >
              Start Chat
            </Button>
          </Link>
        </div>
      </Card>
    </aside>
  );
}
