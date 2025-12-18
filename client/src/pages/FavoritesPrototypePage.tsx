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
      {/* Editorial Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=2000&auto=format&fit=crop&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              Your Collection
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
              Favorites
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Your curated collection of tango moments, events, and inspirations
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        {/* Stats - Editorial Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="hover-elevate">
            <CardContent className="p-8 text-center">
              <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-serif font-bold mb-2">{SAVED_POSTS.length}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Posts</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-8 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-3 text-purple-500" />
              <div className="text-3xl font-serif font-bold mb-2">{SAVED_EVENTS.length}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Events</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-8 text-center">
              <Building2 className="w-8 h-8 mx-auto mb-3 text-green-500" />
              <div className="text-3xl font-serif font-bold mb-2">{SAVED_VENUES.length}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Venues</div>
            </CardContent>
          </Card>
          <Card className="hover-elevate">
            <CardContent className="p-8 text-center">
              <Music className="w-8 h-8 mx-auto mb-3 text-cyan-500" />
              <div className="text-3xl font-serif font-bold mb-2">{SAVED_MUSIC.length}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Music</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-12">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-8">
            {SAVED_POSTS.map((post, index) => (
              <SavedPostCard key={post.id} post={post} index={index} />
            ))}
          </TabsContent>

          <TabsContent value="events" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {SAVED_EVENTS.map((event, index) => (
                <SavedEventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="venues" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {SAVED_VENUES.map((venue, index) => (
                <SavedVenueCard key={venue.id} venue={venue} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <div className="grid md:grid-cols-[400px_1fr] gap-0">
          <div className="relative aspect-[16/9] md:aspect-auto overflow-hidden">
            <motion.img
              src={post.image}
              alt=""
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
          <CardContent className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline">Post</Badge>
                <span className="text-sm text-muted-foreground">Saved {post.savedDate}</span>
              </div>
              <h3 className="text-xl font-serif font-bold mb-3">{post.author}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{post.content}</p>
            </div>
            <div className="flex gap-3 mt-6">
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <Badge variant="outline" className="mb-3 capitalize border-white/30 bg-white/10 backdrop-blur-sm text-white">
              {event.type}
            </Badge>
            <h3 className="text-2xl md:text-3xl font-serif font-bold">{event.title}</h3>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Saved {event.savedDate}</span>
          </div>
          <div className="flex gap-3">
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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold mb-2">{venue.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <MapPin className="w-4 h-4" />
                {venue.location}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold text-lg">{venue.rating}</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Saved {venue.savedDate}</span>
          </div>
          <div className="flex gap-3">
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
      transition={{ delay: index * 0.05, duration: 0.6 }}
    >
      <Card className="hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-serif font-bold truncate mb-1">{track.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
            </div>
            <span className="text-sm text-muted-foreground">{track.duration}</span>
            <span className="text-sm text-muted-foreground hidden md:block">Saved {track.savedDate}</span>
            <div className="flex gap-2">
              <Button variant="outline">Play</Button>
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
