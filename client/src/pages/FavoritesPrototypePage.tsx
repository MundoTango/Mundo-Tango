import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MapPin, Calendar, Users, Music, Building2, Star, Trash2 } from "lucide-react";

const SAVED_POSTS = [
  {
    id: 1,
    type: "post",
    author: "Marco DJ",
    content: "Amazing night at La Ideal! Thanks everyone who came 💃",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&auto=format&fit=crop&q=80",
    savedDate: "2 days ago",
  },
];

const SAVED_EVENTS = [
  {
    id: 2,
    title: "Buenos Aires Tango Festival 2025",
    type: "festival",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    date: "Dec 1, 2025",
    location: "Buenos Aires",
    savedDate: "1 week ago",
  },
];

const SAVED_VENUES = [
  {
    id: 3,
    name: "Café Tortoni",
    type: "venue",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80",
    location: "Buenos Aires",
    rating: 4.8,
    savedDate: "3 days ago",
  },
];

const SAVED_MUSIC = [
  {
    id: 4,
    title: "La Cumparsita",
    artist: "Carlos Gardel",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80",
    duration: "3:45",
    savedDate: "5 days ago",
  },
];

export default function FavoritesPrototypePage() {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-serif font-bold">Favorites</h1>
          </div>
          <p className="text-muted-foreground">Your saved content and collections</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold mb-1">{SAVED_POSTS.length}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold mb-1">{SAVED_EVENTS.length}</div>
              <div className="text-sm text-muted-foreground">Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Building2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold mb-1">{SAVED_VENUES.length}</div>
              <div className="text-sm text-muted-foreground">Venues</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Music className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
              <div className="text-2xl font-bold mb-1">{SAVED_MUSIC.length}</div>
              <div className="text-sm text-muted-foreground">Music</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {SAVED_POSTS.map((post, index) => (
              <SavedPostCard key={post.id} post={post} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {SAVED_EVENTS.map((event, index) => (
                <SavedEventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="venues" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {SAVED_VENUES.map((venue, index) => (
                <SavedVenueCard key={venue.id} venue={venue} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music" className="space-y-4">
            {SAVED_MUSIC.map((track, index) => (
              <SavedMusicCard key={track.id} track={track} index={index} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SavedPostCard({ post, index }: { post: typeof SAVED_POSTS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <img src={post.image} alt="" className="w-full h-full object-cover" />
          </div>
          <CardContent className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline">Post</Badge>
                <span className="text-sm text-muted-foreground">Saved {post.savedDate}</span>
              </div>
              <p className="font-medium mb-2">{post.author}</p>
              <p className="text-sm text-muted-foreground">{post.content}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1">View Post</Button>
              <Button variant="outline" size="icon">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

function SavedEventCard({ event, index }: { event: typeof SAVED_EVENTS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Badge className="mb-2 capitalize bg-white/20 border-white/30 text-white">{event.type}</Badge>
            <h3 className="text-xl font-serif font-bold">{event.title}</h3>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Saved {event.savedDate}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">View Event</Button>
            <Button variant="outline" size="icon">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SavedVenueCard({ venue, index }: { venue: typeof SAVED_VENUES[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">{venue.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin className="w-4 h-4" />
                {venue.location}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{venue.rating}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Saved {venue.savedDate}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">View Venue</Button>
            <Button variant="outline" size="icon">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SavedMusicCard({ track, index }: { track: typeof SAVED_MUSIC[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover-elevate">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <img src={track.image} alt={track.title} className="w-16 h-16 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{track.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>
            <span className="text-sm text-muted-foreground">{track.duration}</span>
            <span className="text-sm text-muted-foreground">Saved {track.savedDate}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Play</Button>
              <Button variant="outline" size="icon">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
