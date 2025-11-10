import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Play, Eye, Clock, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: number;
  userId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'text';
  caption?: string | null;
  viewCount: number;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
}

export default function StoriesPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    mediaUrl: '',
    mediaType: 'image' as 'image' | 'video' | 'text',
    caption: ''
  });

  const { data: stories = [], isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: typeof newStory) => {
      return await apiRequest("POST", "/api/stories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({ title: "Story created successfully" });
      setIsCreateOpen(false);
      setNewStory({ mediaUrl: '', mediaType: 'image', caption: '' });
    },
    onError: () => {
      toast({ title: "Failed to create story", variant: "destructive" });
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      return await apiRequest("DELETE", `/api/stories/${storyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({ title: "Story deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete story", variant: "destructive" });
    },
  });

  const handleCreateStory = () => {
    if (!newStory.mediaUrl) {
      toast({ title: "Please provide a media URL", variant: "destructive" });
      return;
    }
    createStoryMutation.mutate(newStory);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <div className="container mx-auto max-w-7xl py-8 px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3" data-testid="text-stories-title">
                <Play className="h-10 w-10 text-primary" />
                Stories
              </h1>
              <p className="text-muted-foreground mt-2">
                Share moments that disappear in 24 hours
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2" data-testid="button-create-story">
                  <Plus className="h-5 w-5" />
                  Create Story
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mediaUrl">Media URL</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://example.com/image.jpg"
                      value={newStory.mediaUrl}
                      onChange={(e) => setNewStory({ ...newStory, mediaUrl: e.target.value })}
                      data-testid="input-media-url"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mediaType">Media Type</Label>
                    <Select
                      value={newStory.mediaType}
                      onValueChange={(value) => setNewStory({ ...newStory, mediaType: value as any })}
                    >
                      <SelectTrigger data-testid="select-media-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="caption">Caption (optional)</Label>
                    <Textarea
                      id="caption"
                      placeholder="Add a caption..."
                      value={newStory.caption}
                      onChange={(e) => setNewStory({ ...newStory, caption: e.target.value })}
                      data-testid="input-caption"
                    />
                  </div>

                  <Button
                    onClick={handleCreateStory}
                    disabled={createStoryMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-story"
                  >
                    {createStoryMutation.isPending ? "Creating..." : "Create Story"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stories Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="overflow-hidden hover-elevate"
                  data-testid={`story-${story.id}`}
                >
                  <div className="relative">
                    {story.mediaType === 'image' && (
                      <img
                        src={story.mediaUrl}
                        alt="Story"
                        className="w-full h-64 object-cover"
                        data-testid={`img-story-${story.id}`}
                      />
                    )}
                    {story.mediaType === 'video' && (
                      <video
                        src={story.mediaUrl}
                        className="w-full h-64 object-cover"
                        data-testid={`video-story-${story.id}`}
                      />
                    )}
                    {story.mediaType === 'text' && (
                      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center p-4">
                        <p className="text-lg text-foreground text-center">{story.caption}</p>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur gap-1">
                        <Eye className="h-3 w-3" />
                        {story.viewCount}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="space-y-2">
                    {story.caption && story.mediaType !== 'text' && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {story.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires {formatDistanceToNow(new Date(story.expiresAt), { addSuffix: true })}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteStoryMutation.mutate(story.id)}
                        data-testid={`button-delete-story-${story.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Play className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No active stories</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first story to share with the community
                </p>
                <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-story">
                  Create Your First Story
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
