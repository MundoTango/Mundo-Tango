import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export default function BlockedUsersPage() {
  const blockedUsers = [
    { id: 1, name: "User 1", username: "@user1", avatar: "" },
    { id: 2, name: "User 2", username: "@user2", avatar: "" }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blocked Users</h1>
          <p className="text-muted-foreground">Users you've blocked from contacting you</p>
        </div>

        {blockedUsers.length > 0 ? (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <Card key={user.id} data-testid={`blocked-user-${user.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-unblock-${user.id}`}>
                      Unblock
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <UserX className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No blocked users</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
