import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEO } from "@/components/SEO";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { PageLayout } from "@/components/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, MessageCircle, UserMinus, Ban, MapPin, Calendar, 
  Users, Clock, TrendingUp, Share2, Save, Lock, Eye, ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { safeDateDistance } from "@/lib/safeDateFormat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  createdAt: string;
  closenessScore: number;
  lastInteractionAt?: string;
  status: string;
  friend?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
    bio?: string | null;
    city?: string | null;
    country?: string | null;
    tangoRoles?: string[];
  };
  metrics?: {
    messageCount: number;
    sharedEvents: number;
    mutualFriends: number;
  };
  ourStory?: string;
  whenWeMet?: string;
  whereWeMet?: string;
}

interface Activity {
  id: number;
  activityType: string;
  createdAt: string;
  metadata?: any;
}

export default function FriendDetailPage() {
  const { friendId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [privateNote, setPrivateNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Fetch friendship details
  const { data: friendship, isLoading } = useQuery<Friendship>({
    queryKey: ['/api/friends', friendId, user?.id],
    enabled: !!friendId && !!user,
  });

  // Fetch friendship activities
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/friends', friendId, 'activities'],
    enabled: !!friendId,
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "Friend removed",
        description: "You are no longer friends with this person.",
      });
      navigate("/friends");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to remove friend",
        description: error.message || "Something went wrong",
      });
    },
  });

  // Save private note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      return await apiRequest('PATCH', `/api/friends/${friendId}/note`, { privateNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', friendId] });
      toast({
        title: "Note saved",
        description: "Your private note has been updated.",
      });
      setIsEditingNote(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to save note",
        description: error.message || "Something went wrong",
      });
    },
  });

  if (isLoading) {
    return (
      <PageLayout showBreadcrumbs>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-48" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!friendship || !friendship.friend) {
    return (
      <PageLayout showBreadcrumbs>
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Friend not found</h2>
          <Button onClick={() => navigate("/friends")} data-testid="button-back-to-friends">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Friends
          </Button>
        </div>
      </PageLayout>
    );
  }

  const friend = friendship.friend;
  const closenessPercent = Math.min(100, (friendship.closenessScore / 1000) * 100);
  const closenessColor = 
    friendship.closenessScore >= 800 ? "text-green-500" :
    friendship.closenessScore >= 500 ? "text-yellow-500" :
    "text-orange-500";

  const closenessLevel = 
    friendship.closenessScore >= 800 ? "Best Friends" :
    friendship.closenessScore >= 600 ? "Close Friends" :
    friendship.closenessScore >= 400 ? "Good Friends" :
    "Friends";

  return (
    <SelfHealingErrorBoundary pageName="Friend Details" fallbackRoute="/friends">
      <SEO
        title={`${friend.name} - Friend Details - Mundo Tango`}
        description={`View your friendship details with ${friend.name}`}
      />
      <PageLayout showBreadcrumbs>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
            <div className="container mx-auto px-4 py-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/friends")} 
                className="mb-4"
                data-testid="button-back"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Friends
              </Button>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={friend.profileImage || undefined} />
                  <AvatarFallback className="text-3xl">{friend.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2" data-testid="text-friend-name">
                    {friend.name}
                  </h1>
                  <p className="text-muted-foreground mb-4">@{friend.username}</p>
                  
                  {friend.bio && (
                    <p className="text-sm mb-4 max-w-2xl">{friend.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {friend.tangoRoles?.map((role) => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))}
                    {(friend.city || friend.country) && (
                      <Badge variant="secondary" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {[friend.city, friend.country].filter(Boolean).join(', ')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/messages/${friendId}`}>
                      <Button data-testid="button-message">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                    <Link href={`/profile/${friend.username}`}>
                      <Button variant="outline" data-testid="button-view-profile">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" data-testid="button-remove-friend">
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfriend
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove {friend.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {friend.name} from your friends list. You can send them a new friend request later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeFriendMutation.mutate()}
                            disabled={removeFriendMutation.isPending}
                          >
                            {removeFriendMutation.isPending ? 'Removing...' : 'Remove Friend'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Closeness & Metrics */}
              <div className="lg:col-span-1 space-y-6">
                {/* Closeness Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Closeness Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${closenessColor}`} data-testid="text-closeness-score">
                        {friendship.closenessScore}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        out of 1000
                      </div>
                      <Badge variant="secondary" className="mb-4">
                        {closenessLevel}
                      </Badge>
                      <Progress value={closenessPercent} className="h-3" />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span>Messages</span>
                        </div>
                        <span className="font-semibold" data-testid="text-message-count">
                          {friendship.metrics?.messageCount || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Share2 className="h-4 w-4 text-muted-foreground" />
                          <span>Shared Events</span>
                        </div>
                        <span className="font-semibold" data-testid="text-shared-events">
                          {friendship.metrics?.sharedEvents || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Mutual Friends</span>
                        </div>
                        <span className="font-semibold" data-testid="text-mutual-friends">
                          {friendship.metrics?.mutualFriends || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Last Interaction</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {friendship.lastInteractionAt 
                            ? safeDateDistance(friendship.lastInteractionAt)
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Friendship Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Friendship Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Friends since</span>
                      <span className="font-medium">
                        {safeDateDistance(friendship.createdAt)}
                      </span>
                    </div>

                    {friendship.whenWeMet && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Met on</span>
                        <span className="font-medium">
                          {new Date(friendship.whenWeMet).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {friendship.whereWeMet && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Met at</span>
                        <span className="font-medium">{friendship.whereWeMet}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Story & Activity */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="story" className="w-full">
                  <TabsList>
                    <TabsTrigger value="story" data-testid="tab-story">Our Story</TabsTrigger>
                    <TabsTrigger value="notes" data-testid="tab-notes">Private Notes</TabsTrigger>
                    <TabsTrigger value="activity" data-testid="tab-activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="story" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Our Story
                          <Badge variant="outline" className="ml-auto">
                            Both can see
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {friendship.ourStory ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap" data-testid="text-our-story">
                            {friendship.ourStory}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No story has been shared yet.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Private Notes
                          <Badge variant="secondary" className="ml-auto gap-1">
                            <Lock className="h-3 w-3" />
                            Only You
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isEditingNote ? (
                          <>
                            <Textarea
                              value={privateNote}
                              onChange={(e) => setPrivateNote(e.target.value)}
                              placeholder="Add private notes about your friendship..."
                              className="min-h-[200px] resize-none"
                              maxLength={500}
                              data-testid="textarea-private-note"
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {privateNote.length}/500
                              </span>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsEditingNote(false);
                                    setPrivateNote("");
                                  }}
                                  data-testid="button-cancel-note"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => saveNoteMutation.mutate(privateNote)}
                                  disabled={saveNoteMutation.isPending}
                                  data-testid="button-save-note"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  {saveNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap min-h-[100px]">
                              {privateNote || (
                                <span className="text-muted-foreground italic">
                                  No private notes yet. Click "Add Note" to create one.
                                </span>
                              )}
                            </p>
                            <Button 
                              onClick={() => setIsEditingNote(true)}
                              data-testid="button-edit-note"
                            >
                              {privateNote ? 'Edit Note' : 'Add Note'}
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activities.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No activity yet
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {activities.map((activity) => (
                              <div 
                                key={activity.id}
                                className="flex items-start gap-3 pb-4 border-b last:border-0"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {activity.activityType.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {safeDateDistance(activity.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
