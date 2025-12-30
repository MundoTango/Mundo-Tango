import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, Flame, Smile, Eye, Music, Lightbulb } from "lucide-react";

interface LikeUser {
  id: number;
  name: string;
  username: string;
  profileImage?: string | null;
  reactionType?: string | null;
}

interface WhoLikedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  totalLikes: number;
}

const REACTION_ICONS: Record<string, { icon: typeof Heart; color: string; label: string }> = {
  love: { icon: Heart, color: "#EF4444", label: "Love" },
  passion: { icon: Flame, color: "#F97316", label: "Passion" },
  joy: { icon: Smile, color: "#FBBF24", label: "Joy" },
  wow: { icon: Eye, color: "#3B82F6", label: "Wow" },
  music: { icon: Music, color: "#A855F7", label: "Music" },
  inspiration: { icon: Lightbulb, color: "#10B981", label: "Inspiration" },
};

export function WhoLikedModal({ open, onOpenChange, postId, totalLikes }: WhoLikedModalProps) {
  const { data: users, isLoading } = useQuery<LikeUser[]>({
    queryKey: ["/api/posts", postId, "likes"],
    enabled: open && totalLikes > 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="who-liked-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {totalLikes} {totalLikes === 1 ? "person" : "people"} reacted
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-1">
              {users.map((user) => {
                const reaction = REACTION_ICONS[user.reactionType || "love"] || REACTION_ICONS.love;
                const ReactionIcon = reaction.icon;
                
                return (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 hover-elevate"
                    asChild
                    data-testid={`like-user-${user.id}`}
                  >
                    <Link href={`/profile/${user.username}`} onClick={() => onOpenChange(false)}>
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImage || ""} />
                            <AvatarFallback style={{ background: 'linear-gradient(135deg, #40E0D0, #1E90FF)' }}>
                              {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div 
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: reaction.color }}
                          >
                            <ReactionIcon className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{user.name}</span>
                          <span className="text-xs text-muted-foreground">@{user.username}</span>
                        </div>
                      </div>
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No reactions yet
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
