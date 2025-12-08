import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Bookmark, 
  Users, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Bell, 
  Settings,
  Heart,
  Home,
  Compass
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Saved Posts", href: "/saved", icon: Bookmark },
  { label: "Groups", href: "/groups", icon: Users },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Friends", href: "/friends", icon: Heart },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Community Map", href: "/community-map", icon: MapPin },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function FeedLeftSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <aside className="space-y-4" data-testid="feed-left-sidebar">
      <Card className="p-2" data-testid="card-quick-nav">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || 
              (item.href !== "/feed" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </Card>

      {user && (
        <Card className="p-4" data-testid="card-settings-link">
          <Link href="/settings">
            <Button variant="outline" className="w-full justify-start gap-3" data-testid="link-settings">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </Link>
        </Card>
      )}
    </aside>
  );
}
