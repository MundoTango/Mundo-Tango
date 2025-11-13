import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, Clock, Trash2, Image as ImageIcon, Video, Type } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { SEO } from "@/components/SEO";
import { LazyVideo } from "@/components/LazyVideo";

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
    if ((newStory.mediaType === "image" || newStory.mediaType === "video") && !newStory.mediaUrl) {
      toast({ title: "Please provide a media URL for image/video stories", variant: "destructive" });
      return;
    }
    
    if (newStory.mediaType === "text" && !newStory.caption) {
      toast({ title: "Please provide content for your text story", variant: "destructive" });
      return;
    }
    
    createStoryMutation.mutate(newStory);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      default: return <ImageIcon className="w-4 h-4" />;
    }
  };

  const activeStories = stories.filter(s => s.isActive);

  return (
    <AppLayout>
      {/* Editorial Hero Section - 16:9 */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=2574&auto=format&fit=crop')`
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
              Ephemeral Content
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight mb-6" data-testid="text-stories-title">
              Stories
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Share fleeting moments that disappear in 24 hours
            </p>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20" 
                  data-testid="button-create-story"
                >
                  <Plus className="h-5 w-5" />
                  Create Story
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">Create New Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mediaType">Content Type</Label>
                    <Select
                      value={newStory.mediaType}
                      onValueChange={(value) => setNewStory({ ...newStory, mediaType: value as any })}
                    >
                      <SelectTrigger data-testid="select-media-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Image
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video
                          </div>
                        </SelectItem>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Text
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newStory.mediaType !== 'text' && (
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
                  )}

                  <div>
                    <Label htmlFor="caption">
                      {newStory.mediaType === 'text' ? 'Story Content' : 'Caption (optional)'}
                    </Label>
                    <Textarea
                      id="caption"
                      placeholder={newStory.mediaType === 'text' ? 'Write your story...' : 'Add a caption...'}
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
          </motion.div>
        </div>
      </div>

      {/* Editorial Grid Layout */}
      <div className="container mx-auto max-w-7xl px-6 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="relative aspect-[9/16] overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : activeStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover-elevate group" data-testid={`story-${story.id}`}>
                  {/* Story Preview - Portrait 9:16 for Stories */}
                  <div className="relative aspect-[9/16] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    {story.mediaType === 'image' && story.mediaUrl ? (
                      <motion.img
                        src={story.mediaUrl}
                        alt={story.caption || 'Story'}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                    ) : story.mediaType === 'video' && story.mediaUrl ? (
                      <LazyVideo
                        src={story.mediaUrl} 
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        showSkeleton={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-6 text-center">
                        <p className="text-lg font-serif leading-relaxed">
                          {story.caption}
                        </p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Story Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-white/30 bg-white/10 backdrop-blur-sm">
                          {getMediaIcon(story.mediaType)}
                          <span className="ml-1 capitalize">{story.mediaType}</span>
                        </Badge>
                        <Badge variant="outline" className="border-white/30 bg-white/10 backdrop-blur-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                        </Badge>
                      </div>
                      {story.caption && story.mediaType !== 'text' && (
                        <p className="text-sm text-white/90 line-clamp-2">{story.caption}</p>
                      )}
                    </div>
                  </div>

                  {/* Story Actions */}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{story.viewCount} views</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStoryMutation.mutate(story.id)}
                        disabled={deleteStoryMutation.isPending}
                        className="hover:text-destructive"
                        data-testid={`button-delete-${story.id}`}
                      >
                        <Trash2 className="h-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-2">No Stories Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first story to share a moment with the community
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Story
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
