import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { LoadingFallback } from "@/components/LoadingFallback";
import { Users, Calendar, MessageCircle, Heart, MapPin, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const closenessColor = 
    (friendshipStats?.closenessScore || 0) >= 75 ? '#10B981' : 
    (friendshipStats?.closenessScore || 0) >= 50 ? '#F59E0B' : 
    '#6B7280';

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #40E0D0, #1E90FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Friendship with {friend?.name}
          </h1>
          <p className="text-muted-foreground">
            Your connection in the tango community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Closeness Score */}
          <Card 
            className="p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.05))',
              borderColor: 'rgba(64, 224, 208, 0.3)',
            }}
            data-testid="card-closeness-score"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: closenessColor }} />
                <h3 className="font-semibold">Closeness Score</h3>
              </div>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: closenessColor,
                  color: closenessColor,
                }}
              >
                {friendshipStats?.closenessScore || 0}/100
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on shared events, mutual friends, and interactions
            </p>
          </Card>

          {/* Time as Friends */}
          <Card 
            className="p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.05))',
              borderColor: 'rgba(64, 224, 208, 0.3)',
            }}
            data-testid="card-friendship-duration"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" style={{ color: '#40E0D0' }} />
              <h3 className="font-semibold">Friends Since</h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#40E0D0' }}>
              {friendshipStats?.daysSinceFriendship || 0} days
            </p>
            {friendshipStats?.lastInteraction && (
              <p className="text-xs text-muted-foreground mt-2">
                Last interaction {formatDistanceToNow(new Date(friendshipStats.lastInteraction), { addSuffix: true })}
              </p>
            )}
          </Card>

          {/* Shared Events */}
          <Card 
            className="p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.05))',
              borderColor: 'rgba(64, 224, 208, 0.3)',
            }}
            data-testid="card-shared-events"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" style={{ color: '#1E90FF' }} />
              <h3 className="font-semibold">Shared Events</h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#1E90FF' }}>
              {friendshipStats?.sharedEvents || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Milongas and workshops attended together
            </p>
          </Card>

          {/* Mutual Friends */}
          <Card 
            className="p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.05))',
              borderColor: 'rgba(64, 224, 208, 0.3)',
            }}
            data-testid="card-mutual-friends"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" style={{ color: '#14B8A6' }} />
              <h3 className="font-semibold">Mutual Friends</h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#14B8A6' }}>
              {mutualFriends?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Friends you both know
            </p>
          </Card>
        </div>

        {/* Mutual Friends List */}
        {mutualFriends && mutualFriends.length > 0 && (
          <Card 
            className="p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(30, 144, 255, 0.05))',
              borderColor: 'rgba(64, 224, 208, 0.2)',
            }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" style={{ color: '#14B8A6' }} />
              Mutual Friends
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mutualFriends.map((mutualFriend: any) => (
                <div 
                  key={mutualFriend.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover-elevate"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                  data-testid={`mutual-friend-${mutualFriend.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mutualFriend.profileImage || ""} />
                    <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0, #1E90FF)' }}>
                      {mutualFriend.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mutualFriend.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{mutualFriend.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            className="hover-elevate gap-2"
            style={{
              borderColor: 'rgba(64, 224, 208, 0.5)',
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.05))',
            }}
            data-testid="button-send-message"
          >
            <MessageCircle className="w-4 h-4" />
            Send Message
          </Button>
          <Button
            variant="outline"
            className="hover-elevate gap-2"
            style={{
              borderColor: 'rgba(64, 224, 208, 0.5)',
              background: 'linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(30, 144, 255, 0.05))',
            }}
            data-testid="button-view-profile"
          >
            <Users className="w-4 h-4" />
            View Profile
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
