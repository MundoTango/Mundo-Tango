import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Heart, Smile, Eye, Frown, Angry, 
  HandMetal, Flame, User, PartyPopper 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const REACTIONS = [
  { icon: Heart, name: "heart", label: "Love", color: "#EC4899" },
  { icon: Smile, name: "laugh", label: "Funny", color: "#FBBF24" },
  { icon: Eye, name: "wow", label: "Amazing", color: "#3B82F6" },
  { icon: Frown, name: "sad", label: "Sad", color: "#6B7280" },
  { icon: Angry, name: "angry", label: "Angry", color: "#EF4444" },
  { icon: HandMetal, name: "clap", label: "Appreciation", color: "#10B981" },
  { icon: Flame, name: "fire", label: "Hot", color: "#F97316" },
  { icon: User, name: "dance", label: "Tango!", color: "#A855F7" },
  { icon: PartyPopper, name: "party", label: "Celebrate", color: "#F59E0B" },
];

interface PostReactionsProps {
  postId: number;
  initialReactions?: Record<string, number>;
  userReaction?: string | null;
}

export function PostReactions({ postId, initialReactions = {}, userReaction }: PostReactionsProps) {
  const [open, setOpen] = useState(false);
  const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
  const [reactions, setReactions] = useState(initialReactions);
  const { toast } = useToast();

  const reactMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ reactionType }),
      });
      return await response.json();
    },
    onSuccess: (data: any, reactionType) => {
      setCurrentUserReaction(reactionType);
      setReactions(data.reactions || {});
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to react",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${postId}/react`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setCurrentUserReaction(null);
      setReactions(data.reactions || {});
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleReaction = (reactionType: string) => {
    if (currentUserReaction === reactionType) {
      removeReactionMutation.mutate();
    } else {
      reactMutation.mutate(reactionType);
    }
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(reactions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([_, count]) => count > 0);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="hover-elevate active-elevate-2 gap-2"
            data-testid={`button-reactions-${postId}`}
          >
            {currentUserReaction ? (
              (() => {
                const reaction = REACTIONS.find((r) => r.name === currentUserReaction);
                const IconComponent = reaction?.icon || Heart;
                return <IconComponent className="h-4 w-4" style={{ color: reaction?.color || '#EC4899' }} />;
              })()
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {totalReactions > 0 && (
              <span data-testid={`text-reaction-count-${postId}`}>{totalReactions}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {REACTIONS.map((reaction) => {
              const IconComponent = reaction.icon;
              return (
                <Button
                  key={reaction.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(reaction.name)}
                  className={`p-2 h-12 w-12 hover:scale-125 transition-transform ${
                    currentUserReaction === reaction.name ? "bg-muted" : ""
                  }`}
                  title={reaction.label}
                  data-testid={`button-reaction-${reaction.name}-${postId}`}
                >
                  <IconComponent className="w-6 h-6" style={{ color: reaction.color }} />
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Show top reactions */}
      {topReactions.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {topReactions.map(([reactionType, count]) => {
            const reaction = REACTIONS.find((r) => r.name === reactionType);
            const IconComponent = reaction?.icon || Heart;
            return (
              <span key={reactionType} className="flex items-center gap-0.5">
                <IconComponent className="w-4 h-4" style={{ color: reaction?.color || '#EC4899' }} />
                <span className="text-xs">{count}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
