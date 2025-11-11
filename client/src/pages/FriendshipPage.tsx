import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Users, Calendar, MessageCircle, Heart, MapPin, UserCheck, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import tangoHeroImage from "@assets/tango-professional-1.jpg";

export default function FriendshipPage() {
  const { userId } = useParams<{ userId: string }>();
  const friendId = parseInt(userId || "0");

  const { data: friendData, isLoading: isLoadingFriend } = useQuery({
    queryKey: ["/api/users", friendId],
    enabled: !!friendId,
  });

  const { data: mutualFriends, isLoading: isLoadingMutual } = useQuery({
    queryKey: ["/api/friends/mutual", friendId],
    enabled: !!friendId,
  });

  const { data: friendshipStats } = useQuery<{
    daysSinceFriendship: number;
    closenessScore: number;
    sharedEvents: number;
    sharedGroups: number;
    lastInteraction: string;
  }>({
    queryKey: ["/api/friends/friendship", friendId, "stats"],
    enabled: !!friendId,
  });

  if (isLoadingFriend || isLoadingMutual) {
    return (
      <AppLayout>
        <LoadingFallback />
      </AppLayout>
    );
  }

  const friend = friendData?.user;

  return (
    <AppLayout>
      {/* Editorial Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${tangoHeroImage}')` }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              Friendship
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="heading-page-title">
              {friend?.name}
            </h1>

            <p className="text-xl text-white/80 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Your connection in the tango community
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Closeness Score */}
            <Card className="overflow-hidden hover-elevate" data-testid="card-closeness-score">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-bold">Closeness Score</h3>
                  </div>
                  <Badge className="text-lg px-4 py-1">
                    {friendshipStats?.closenessScore || 0}/100
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on shared events, mutual friends, and interactions
                </p>
              </CardContent>
            </Card>

            {/* Time as Friends */}
            <Card className="overflow-hidden hover-elevate" data-testid="card-friendship-duration">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Friends Since</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">
                  {friendshipStats?.daysSinceFriendship || 0} days
                </p>
                {friendshipStats?.lastInteraction && (
                  <p className="text-xs text-muted-foreground">
                    Last interaction {formatDistanceToNow(new Date(friendshipStats.lastInteraction), { addSuffix: true })}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Shared Events */}
            <Card className="overflow-hidden hover-elevate" data-testid="card-shared-events">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Shared Events</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">
                  {friendshipStats?.sharedEvents || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Milongas and workshops attended together
                </p>
              </CardContent>
            </Card>

            {/* Mutual Friends */}
            <Card className="overflow-hidden hover-elevate" data-testid="card-mutual-friends">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-bold">Mutual Friends</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">
                  {mutualFriends?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Friends you both know
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mutual Friends List */}
          {mutualFriends && mutualFriends.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-primary" />
                  Mutual Friends
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mutualFriends.map((mutualFriend: any) => (
                    <motion.div
                      key={mutualFriend.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-4 p-4 border rounded-xl hover-elevate"
                      data-testid={`mutual-friend-${mutualFriend.id}`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mutualFriend.profileImage || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {mutualFriend.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{mutualFriend.name}</p>
                        <p className="text-sm text-muted-foreground truncate">@{mutualFriend.username}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="gap-2"
              data-testid="button-send-message"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              data-testid="button-view-profile"
            >
              <Users className="w-5 h-5" />
              View Profile
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
