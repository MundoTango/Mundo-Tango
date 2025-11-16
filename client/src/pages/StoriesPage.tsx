/**
 * StoriesPage - View Friends' Stories (24hr expiration)
 * 
 * Features:
 * - View friends' active stories
 * - Create new story
 * - View tracking
 * - Story highlights
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Plus, Eye, Clock, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Story {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaGallery?: any;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  hasViewed: boolean;
}

interface StoryGroup {
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  stories: Story[];
  hasUnviewed: boolean;
}

export default function StoriesPage() {
  const { toast } = useToast();
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryGroup | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    content: '',
    imageUrl: '',
    videoUrl: '',
  });

  // Fetch stories feed
  const { data: storiesFeed, isLoading } = useQuery({
    queryKey: ['/api/stories/feed'],
  });

  // Fetch user's own stories
  const { data: myStories } = useQuery({
    queryKey: ['/api/stories/my'],
  });

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories/my'] });
      setIsCreateDialogOpen(false);
      setNewStory({ content: '', imageUrl: '', videoUrl: '' });
      toast({
        title: 'Story created',
        description: 'Your story has been published',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create story',
        variant: 'destructive',
      });
    },
  });

  // Record story view mutation
  const recordViewMutation = useMutation({
    mutationFn: (storyId: number) => apiRequest(`/api/stories/${storyId}/view`, {
      method: 'POST',
    }),
  });

  const handleCreateStory = () => {
    if (!newStory.imageUrl && !newStory.videoUrl) {
      toast({
        title: 'Error',
        description: 'Please add an image or video',
        variant: 'destructive',
      });
      return;
    }

    createStoryMutation.mutate(newStory);
  };

  const handleViewStoryGroup = (group: StoryGroup) => {
    setSelectedStoryGroup(group);
    setCurrentStoryIndex(0);
    
    // Record view for first story
    if (!group.stories[0].hasViewed) {
      recordViewMutation.mutate(group.stories[0].id);
    }
  };

  const handleNextStory = () => {
    if (!selectedStoryGroup) return;
    
    const nextIndex = currentStoryIndex + 1;
    if (nextIndex < selectedStoryGroup.stories.length) {
      setCurrentStoryIndex(nextIndex);
      
      // Record view if not viewed
      if (!selectedStoryGroup.stories[nextIndex].hasViewed) {
        recordViewMutation.mutate(selectedStoryGroup.stories[nextIndex].id);
      }
    } else {
      // Move to next user's stories or close
      const currentGroupIndex = (storiesFeed as StoryGroup[]).findIndex(
        g => g.user.id === selectedStoryGroup.user.id
      );
      
      if (currentGroupIndex < (storiesFeed as StoryGroup[]).length - 1) {
        const nextGroup = (storiesFeed as StoryGroup[])[currentGroupIndex + 1];
        handleViewStoryGroup(nextGroup);
      } else {
        setSelectedStoryGroup(null);
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const currentStory = selectedStoryGroup?.stories[currentStoryIndex];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stories</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-story">
              <Plus className="w-4 h-4 mr-2" />
              Create Story
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Story</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Caption</label>
                <Textarea
                  placeholder="Add a caption..."
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  data-testid="input-story-content"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  placeholder="https://..."
                  value={newStory.imageUrl}
                  onChange={(e) => setNewStory({ ...newStory, imageUrl: e.target.value })}
                  data-testid="input-story-image"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Video URL</label>
                <Input
                  placeholder="https://..."
                  value={newStory.videoUrl}
                  onChange={(e) => setNewStory({ ...newStory, videoUrl: e.target.value })}
                  data-testid="input-story-video"
                />
              </div>
              <Button
                onClick={handleCreateStory}
                disabled={createStoryMutation.isPending}
                className="w-full"
                data-testid="button-submit-story"
              >
                {createStoryMutation.isPending ? 'Publishing...' : 'Publish Story'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Stories */}
      {myStories && (myStories as Story[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(myStories as Story[]).map((story) => (
                <div key={story.id} className="space-y-2" data-testid={`story-${story.id}`}>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover-elevate">
                    {story.imageUrl && (
                      <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
                    )}
                    {story.videoUrl && !story.imageUrl && (
                      <video src={story.videoUrl} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {story.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends' Stories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {(storiesFeed as StoryGroup[] || []).map((group) => (
          <div
            key={group.user.id}
            className="cursor-pointer space-y-2"
            onClick={() => handleViewStoryGroup(group)}
            data-testid={`story-group-${group.user.id}`}
          >
            <div
              className={`aspect-square rounded-lg overflow-hidden ${
                group.hasUnviewed ? 'ring-2 ring-primary' : 'ring-1 ring-border'
              } hover-elevate`}
            >
              {group.stories[0].imageUrl && (
                <img
                  src={group.stories[0].imageUrl}
                  alt={group.user.name}
                  className="w-full h-full object-cover"
                />
              )}
              {group.stories[0].videoUrl && !group.stories[0].imageUrl && (
                <video
                  src={group.stories[0].videoUrl}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={group.user.profileImage} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{group.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Dialog */}
      {selectedStoryGroup && currentStory && (
        <Dialog open={!!selectedStoryGroup} onOpenChange={() => setSelectedStoryGroup(null)}>
          <DialogContent className="max-w-2xl p-0">
            <div className="relative h-[80vh]">
              {/* Story Content */}
              <div className="absolute inset-0 bg-black">
                {currentStory.imageUrl && (
                  <img
                    src={currentStory.imageUrl}
                    alt="Story"
                    className="w-full h-full object-contain"
                  />
                )}
                {currentStory.videoUrl && (
                  <video
                    src={currentStory.videoUrl}
                    className="w-full h-full object-contain"
                    autoPlay
                    controls
                  />
                )}
              </div>

              {/* Story Info */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedStoryGroup.user.profileImage} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">{selectedStoryGroup.user.name}</p>
                    <p className="text-white/80 text-sm">
                      {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-1 mt-4">
                  {selectedStoryGroup.stories.map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-1 rounded-full bg-white/30"
                    >
                      {idx <= currentStoryIndex && (
                        <div className="h-full bg-white rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              {currentStory.content && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-center">{currentStory.content}</p>
                </div>
              )}

              {/* Navigation */}
              <button
                onClick={handleNextStory}
                className="absolute inset-0 bg-transparent"
                aria-label="Next story"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
