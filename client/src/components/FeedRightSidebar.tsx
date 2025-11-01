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
      title: "Milan Tango Festival 2025",
      type: "milonga",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: "Milan, Italy",
      attendees: 127,
      isGoing: false,
    },
    {
      id: 2,
      title: "Barcelona Milonga Night",
      type: "milonga",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: "Barcelona, Spain",
      attendees: 89,
      isGoing: true,
    },
    {
      id: 3,
      title: "Toronto Practica",
      type: "práctica",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      location: "Toronto, Canada",
      attendees: 34,
      isGoing: false,
    },
    {
      id: 4,
      title: "Beginner Tango Workshop",
      type: "workshop",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      location: "Paris, France",
      attendees: 56,
      isGoing: false,
    },
    {
      id: 5,
      title: "Weekly Milonga at Salon",
      type: "milonga",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "Buenos Aires, Argentina",
      attendees: 203,
      isGoing: true,
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
          {upcomingEvents.slice(0, 5).map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div
                className="p-3 rounded-lg hover-elevate cursor-pointer border"
                data-testid={`event-${event.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm flex-1">{event.title}</h4>
                  <Badge 
                    variant="secondary" 
                    className="text-xs capitalize"
                    data-testid={`badge-event-type-${event.id}`}
                  >
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(event.date, { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span data-testid={`text-attendees-${event.id}`}>{event.attendees} attending</span>
                  </div>
                  {event.isGoing && (
                    <Badge 
                      variant="default" 
                      className="text-xs bg-primary"
                      data-testid={`badge-going-${event.id}`}
                    >
                      You're going
                    </Badge>
                  )}
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
