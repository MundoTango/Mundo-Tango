import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { Link } from "wouter";
import { safeDateDistance } from "@/lib/safeDateFormat";

interface ActiveUser {
  id: number;
  name: string;
  username: string;
  profileImage?: string | null;
  lastActivityAt: string;
}

export function ActiveUsersSidebar() {
  const { data: users, isLoading } = useQuery<ActiveUser[]>({
    queryKey: ['active-users'],
    queryFn: async () => {
      const response = await fetch('/api/feed/active-users?limit=10');
      if (!response.ok) throw new Error('Failed to fetch active users');
      return response.json();
    },
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });

  return (
    <Card className="hidden lg:block sticky top-20" data-testid="active-users-sidebar">
      <CardHeader className="space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
          Recently Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </>
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <Link key={user.id} href={`/profile/${user.username}`}>
              <div 
                className="flex items-center gap-3 p-2 rounded-lg hover-elevate active-elevate-2 cursor-pointer transition-all"
                data-testid={`active-user-${user.id}`}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profileImage || undefined} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <Badge 
                    variant="secondary" 
                    className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full p-0 bg-green-500 border-2 border-background"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-foreground/60">
                    Active {safeDateDistance(user.lastActivityAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-foreground/60 text-center py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
}
