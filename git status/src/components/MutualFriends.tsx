import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface MutualFriendsProps {
  userId: number;
  currentUserId: number;
}

export function MutualFriends({ userId, currentUserId }: MutualFriendsProps) {
  const { data: mutualFriends = [] } = useQuery({
    queryKey: ["/api/friends/mutual", userId],
    enabled: userId !== currentUserId,
  });

  if (!mutualFriends.length) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Users className="h-4 w-4" />
      <div className="flex items-center gap-1">
        <div className="flex -space-x-2">
          {mutualFriends.slice(0, 3).map((friend: any) => (
            <Avatar key={friend.id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={friend.profileImage || ""} />
              <AvatarFallback className="text-xs">
                {friend.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span>
          {mutualFriends.length} mutual {mutualFriends.length === 1 ? "friend" : "friends"}
        </span>
      </div>
    </div>
  );
}
