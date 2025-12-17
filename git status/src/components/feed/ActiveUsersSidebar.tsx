import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    </Card>
  );
}
