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

  return null;
}
