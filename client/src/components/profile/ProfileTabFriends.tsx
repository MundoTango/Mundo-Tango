import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, EyeOff } from "lucide-react";

interface ProfileTabFriendsProps {
  profileId?: number;
  isOwnProfile?: boolean;
  isPublicView?: boolean;
}

export default function ProfileTabFriends({ 
  profileId, 
  isOwnProfile = false, 
  isPublicView = false 
}: ProfileTabFriendsProps) {
  const canEdit = isOwnProfile && !isPublicView;
  
  if (isPublicView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground italic">
            <EyeOff className="w-4 h-4" />
            <span>Friends list is private.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Friends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Friends list will be displayed here.
        </p>
      </CardContent>
    </Card>
  );
}
