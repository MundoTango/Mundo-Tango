import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserMinus, MessageCircle, MoreVertical, Users, UserCheck, Clock } from "lucide-react";

const tangoHeroImage = "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=2070&auto=format&fit=crop";

const FRIENDS = [
  {
    id: 1,
    name: "Marco DJ",
    username: "@marco_dj",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    role: "DJ",
    location: "Buenos Aires",
    mutualFriends: 12,
    status: "friends",
    online: true,
  },
  {
    id: 2,
    name: "Isabella Dance",
    username: "@isabella_tango",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80",
    role: "Teacher",
    location: "Barcelona",
    mutualFriends: 8,
    status: "friends",
    online: false,
  },
  {
    id: 3,
    name: "Carlos Teacher",
    username: "@carlos_maestro",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    role: "Teacher",
    location: "Paris",
    mutualFriends: 15,
    status: "friends",
    online: true,
  },
];

const REQUESTS = [
  {
    id: 4,
    name: "Sofia Rodriguez",
    username: "@sofia_performer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    role: "Performer",
    location: "Milan",
    mutualFriends: 3,
    status: "pending",
  },
  {
    id: 5,
    name: "Diego Organizer",
    username: "@diego_events",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    role: "Organizer",
    location: "Tokyo",
    mutualFriends: 6,
    status: "pending",
  },
];

const SUGGESTIONS = [
  {
    id: 6,
    name: "Maria Singer",
    username: "@maria_voz",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    role: "Singer",
    location: "Buenos Aires",
    mutualFriends: 9,
    status: "suggested",
  },
];

export default function FriendsPrototypePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
        data-testid="section-hero"
      >
        <div className="absolute inset-0 aspect-video">
          <img
            src={tangoHeroImage}
            alt="Tango dancers connecting"
            className="w-full h-full object-cover"
            data-testid="img-hero"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              Your Community
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6" data-testid="heading-page-title">
              Friends
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Connect with dancers worldwide
            </p>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-6 py-16">
        {/* Search */}
        <div className="relative max-w-2xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="pl-12 h-12 text-base"
          />
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold mb-1">{FRIENDS.length}</div>
              <div className="text-sm text-muted-foreground">Friends</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <div className="text-3xl font-bold mb-1">{REQUESTS.length}</div>
              <div className="text-sm text-muted-foreground">Pending Requests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <UserPlus className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-3xl font-bold mb-1">{SUGGESTIONS.length}</div>
              <div className="text-sm text-muted-foreground">Suggestions</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">
              All Friends ({FRIENDS.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({REQUESTS.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions ({SUGGESTIONS.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FRIENDS.map((friend, index) => (
                <FriendCard key={friend.id} friend={friend} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REQUESTS.map((request, index) => (
                <RequestCard key={request.id} request={request} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUGGESTIONS.map((suggestion, index) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FriendCard({ friend, index }: { friend: typeof FRIENDS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={friend.avatar} />
                <AvatarFallback>{friend.name[0]}</AvatarFallback>
              </Avatar>
              {friend.online && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{friend.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{friend.username}</p>
              <Badge variant="outline" className="mt-2">{friend.role}</Badge>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 mb-4">
            <div>{friend.location}</div>
            <div>{friend.mutualFriends} mutual friends</div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm">
              <UserMinus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RequestCard({ request, index }: { request: typeof REQUESTS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={request.avatar} />
              <AvatarFallback>{request.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{request.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{request.username}</p>
              <Badge variant="outline" className="mt-2">{request.role}</Badge>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 mb-4">
            <div>{request.location}</div>
            <div>{request.mutualFriends} mutual friends</div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" size="sm">
              <UserCheck className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button variant="outline" size="sm">
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SuggestionCard({ suggestion, index }: { suggestion: typeof SUGGESTIONS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={suggestion.avatar} />
              <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{suggestion.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{suggestion.username}</p>
              <Badge variant="outline" className="mt-2">{suggestion.role}</Badge>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 mb-4">
            <div>{suggestion.location}</div>
            <div>{suggestion.mutualFriends} mutual friends</div>
          </div>

          <Button className="w-full" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
