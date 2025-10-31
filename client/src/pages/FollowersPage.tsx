import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function FollowersPage() {
  const { data: followers, isLoading } = useQuery({
    queryKey: ["/api/followers"],
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Followers</h1>
          <p className="text-muted-foreground">
            People who follow you
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : followers && Array.isArray(followers) && followers.length > 0 ? (
          <div className="space-y-3">
            {followers.map((user: any) => (
              <Card key={user.id} data-testid={`user-${user.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                    </div>
                    <Button size="sm" data-testid={`button-follow-${user.id}`}>
                      Follow Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No followers yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
