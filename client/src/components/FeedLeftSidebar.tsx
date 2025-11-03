import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Users, MessageSquare, Settings, Bookmark, TrendingUp, MapPin, Music, Globe } from "lucide-react";
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
    <aside className="w-[280px] flex flex-col space-y-4" data-testid="feed-left-sidebar">
      {/* E30 - User Profile Card */}
      <Card className="p-4 glass-card" data-testid="card-user-profile">
        <Link href={`/profile/${user?.username}`}>
          <div className="flex items-center gap-3 hover-elevate p-2 rounded-lg cursor-pointer">
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
      </Card>

      {/* E31 - Quick Links */}
      <Card className="p-3 glass-card flex-1" data-testid="card-quick-links">
        <h3 className="font-semibold mb-3 px-2">MENU</h3>
        <nav className="space-y-1">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className="w-full justify-start hover-elevate"
                data-testid={`link-${link.label.toLowerCase()}`}
              >
                <span className="flex items-center">
                  <link.icon className="h-4 w-4 mr-3" />
                  {link.label}
                </span>
              </Button>
            </Link>
          ))}
        </nav>
      </Card>

      {/* Global Statistics */}
      <Card className="p-4 glass-card" data-testid="card-global-stats">
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Global Statistics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Global Dancers</p>
                <p className="font-bold" data-testid="stat-global-dancers">3.2K</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Calendar className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Events</p>
                <p className="font-bold" data-testid="stat-active-events">945</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Globe className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Communities</p>
                <p className="font-bold" data-testid="stat-communities">6.8K</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your City</p>
                <p className="font-bold" data-testid="stat-your-city">184</p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/about">
          <Button 
            variant="outline" 
            className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90"
            data-testid="button-global-community"
          >
            <span className="flex items-center justify-center gap-2 flex-wrap">
              <span>Mundo Tango</span>
              <span className="text-xs">Global Tango Community</span>
            </span>
          </Button>
        </Link>
      </Card>
    </aside>
  );
}
