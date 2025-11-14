import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

type Story = {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  expiresAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string | null;
  };
};

type GroupedStories = {
  userId: number;
  userName: string;
  userImage?: string | null;
  stories: Story[];
  hasUnviewed?: boolean;
};

export function StoriesCarousel() {
  const { user } = useAuth();
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<GroupedStories | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const { data: stories = [], isLoading } = useQuery<Story[]>({
    queryKey: ["/api/posts/stories"],
  });

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.userId;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName: story.user?.name || "Unknown",
        userImage: story.user?.profileImage,
        stories: [],
        hasUnviewed: true,
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {} as Record<number, GroupedStories>);

  const storyGroups = Object.values(groupedStories);

  const handleStoryClick = (group: GroupedStories) => {
    setSelectedStoryGroup(group);
    setCurrentStoryIndex(0);
  };

  const handleNext = () => {
    if (!selectedStoryGroup) return;
    
    if (currentStoryIndex < selectedStoryGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Move to next user's stories
      const currentGroupIndex = storyGroups.findIndex(g => g.userId === selectedStoryGroup.userId);
      if (currentGroupIndex < storyGroups.length - 1) {
        setSelectedStoryGroup(storyGroups[currentGroupIndex + 1]);
        setCurrentStoryIndex(0);
      } else {
        setSelectedStoryGroup(null);
      }
    }
  };

  const handlePrevious = () => {
    if (!selectedStoryGroup) return;
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Move to previous user's stories
      const currentGroupIndex = storyGroups.findIndex(g => g.userId === selectedStoryGroup.userId);
      if (currentGroupIndex > 0) {
        const prevGroup = storyGroups[currentGroupIndex - 1];
        setSelectedStoryGroup(prevGroup);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const handleClose = () => {
    setSelectedStoryGroup(null);
    setCurrentStoryIndex(0);
  };

  if (isLoading || storyGroups.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-4 mb-6 overflow-hidden" data-testid="stories-carousel">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Add Story Button (for current user) */}
          <button
            onClick={() => {/* TODO: Open story creation modal */}}
            className="flex flex-col items-center gap-2 min-w-[80px] group"
            data-testid="button-create-story"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={user?.profileImage || undefined} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1">
                <Plus className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs font-medium text-center line-clamp-1">Your Story</span>
          </button>

          {/* Stories from other users */}
          {storyGroups.map((group) => (
            <button
              key={group.userId}
              onClick={() => handleStoryClick(group)}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
              data-testid={`story-avatar-${group.userId}`}
            >
              <div className="relative">
                <div className={`rounded-full p-0.5 ${
                  group.hasUnviewed 
                    ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" 
                    : "bg-muted"
                }`}>
                  <Avatar className="h-16 w-16 border-2 border-background">
                    <AvatarImage src={group.userImage || undefined} />
                    <AvatarFallback>{group.userName[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs font-medium text-center line-clamp-1">{group.userName}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Story Viewer Dialog */}
      <AnimatePresence>
        {selectedStoryGroup && (
          <Dialog open={true} onOpenChange={handleClose}>
            <DialogContent className="max-w-md p-0 gap-0 bg-black border-0" data-testid="story-viewer">
              <div className="relative h-[80vh]">
                {/* Progress bars */}
                <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
                  {selectedStoryGroup.stories.map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full bg-white transition-all duration-300 ${
                          idx < currentStoryIndex
                            ? "w-full"
                            : idx === currentStoryIndex
                            ? "w-full animate-progress"
                            : "w-0"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Story header */}
                <div className="absolute top-4 left-0 right-0 z-50 flex items-center justify-between px-4 pt-8">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-white">
                      <AvatarImage src={selectedStoryGroup.userImage || undefined} />
                      <AvatarFallback>{selectedStoryGroup.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold text-sm">{selectedStoryGroup.userName}</p>
                      <p className="text-white/70 text-xs">
                        {new Date(selectedStoryGroup.stories[currentStoryIndex].createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20"
                    data-testid="button-close-story"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Story content */}
                <motion.div
                  key={currentStoryIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full flex items-center justify-center bg-black"
                >
                  {selectedStoryGroup.stories[currentStoryIndex].imageUrl ? (
                    <img
                      src={selectedStoryGroup.stories[currentStoryIndex].imageUrl || ""}
                      alt="Story"
                      className="max-h-full max-w-full object-contain"
                      data-testid="story-image"
                    />
                  ) : selectedStoryGroup.stories[currentStoryIndex].videoUrl ? (
                    <video
                      src={selectedStoryGroup.stories[currentStoryIndex].videoUrl || ""}
                      className="max-h-full max-w-full object-contain"
                      autoPlay
                      playsInline
                      onEnded={handleNext}
                      data-testid="story-video"
                    />
                  ) : (
                    <div className="text-white text-center p-8">
                      <p className="text-lg">{selectedStoryGroup.stories[currentStoryIndex].content}</p>
                    </div>
                  )}
                </motion.div>

                {/* Navigation areas */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                  data-testid="button-previous-story"
                />
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                  data-testid="button-next-story"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
