import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Users, MessageSquare, Settings, Bookmark, TrendingUp, MapPin, Music } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function FeedLeftSidebar() {
  const { user } = useAuth();

  const quickLinks = [
    { icon: Home, label: "Feed", href: "/feed" },
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: Users, label: "Groups", href: "/groups" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Bookmark, label: "Saved", href: "/saved" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: MapPin, label: "Venues", href: "/venues" },
    { icon: Music, label: "Music", href: "/music-library" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-[280px] space-y-4" data-testid="feed-left-sidebar">
      {/* E30 - User Profile Card */}
      <Card className="p-4 glass-card" data-testid="card-user-profile">
        <Link href={`/profile/${user?.username}`}>
          <div className="flex items-center gap-3 mb-4 hover-elevate p-2 rounded-lg cursor-pointer">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.profileImage || undefined} />
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" data-testid="text-sidebar-user-name">
                {user?.name || user?.username}
              </p>
              <p className="text-sm text-muted-foreground truncate" data-testid="text-sidebar-user-username">
                @{user?.username}
              </p>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <Link href={`/profile/${user?.username}/followers`}>
            <div className="hover-elevate p-2 rounded cursor-pointer" data-testid="link-followers">
              <p className="font-bold">847</p>
              <p className="text-muted-foreground text-xs">Followers</p>
            </div>
          </Link>
          <Link href={`/profile/${user?.username}/following`}>
            <div className="hover-elevate p-2 rounded cursor-pointer" data-testid="link-following">
              <p className="font-bold">1.2K</p>
              <p className="text-muted-foreground text-xs">Following</p>
            </div>
          </Link>
          <Link href="/friends">
            <div className="hover-elevate p-2 rounded cursor-pointer" data-testid="link-friends">
              <p className="font-bold">234</p>
              <p className="text-muted-foreground text-xs">Friends</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* E31 - Quick Links */}
      <Card className="p-3 glass-card" data-testid="card-quick-links">
        <nav className="space-y-1">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className="w-full justify-start hover-elevate"
                data-testid={`link-${link.label.toLowerCase()}`}
              >
                <link.icon className="h-4 w-4 mr-3" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
      </Card>
    </aside>
  );
}
