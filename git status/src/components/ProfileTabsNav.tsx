import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plane, 
  Calendar, 
  Users, 
  Image, 
  Info,
  GraduationCap,
  Music,
  Camera,
  Briefcase,
  Theater,
  ShoppingBag,
  Mic,
  Palette,
  School,
  Hotel,
  Heart,
  MapPin,
  Building,
  Map,
  BookOpen,
  Lightbulb,
  Car
} from "lucide-react";

interface User {
  id: number;
  tangoRoles?: string[] | null;
  [key: string]: any;
}

interface ProfileTabsNavProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
}

// Tab configuration with icons and labels
const BASE_TABS = [
  { id: 'feed', label: 'Posts', icon: FileText },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'about', label: 'About', icon: Info },
];

// Conditional role-based tabs (from handoff doc A10.2)
const ROLE_TABS: Record<string, { id: string; label: string; icon: any }> = {
  'teacher': { id: 'classes', label: 'Classes', icon: GraduationCap },
  'dj': { id: 'music', label: 'Music', icon: Music },
  'photographer': { id: 'gallery', label: 'Gallery', icon: Camera },
  'organizer': { id: 'events-organized', label: 'Events', icon: Briefcase },
  'performer': { id: 'performances', label: 'Performances', icon: Theater },
  'vendor': { id: 'shop', label: 'Shop', icon: ShoppingBag },
  'musician': { id: 'orchestra', label: 'Orchestra', icon: Mic },
  'choreographer': { id: 'choreographies', label: 'Choreographies', icon: Palette },
  'tango_school': { id: 'school', label: 'School', icon: School },
  'tango_hotel': { id: 'accommodation', label: 'Accommodation', icon: Hotel },
  'wellness_provider': { id: 'wellness', label: 'Wellness', icon: Heart },
  'tour_operator': { id: 'tours', label: 'Tours', icon: MapPin },
  'host': { id: 'venue', label: 'Venue', icon: Building },
  'guide': { id: 'guide-services', label: 'Guide', icon: Map },
  'content_creator': { id: 'content', label: 'Content', icon: BookOpen },
  'learning_source': { id: 'resources', label: 'Resources', icon: Lightbulb },
  'taxi_dancer': { id: 'taxi-services', label: 'Taxi Services', icon: Car },
};

// Get visible tabs based on user's tango roles (from handoff doc A10.2)
export const getVisibleTabs = (user: User): Array<{ id: string; label: string; icon: any }> => {
  const allTabs = [...BASE_TABS];
  
  if (!user.tangoRoles || user.tangoRoles.length === 0) {
    return allTabs;
  }
  
  // Add role-specific tabs
  user.tangoRoles.forEach((role) => {
    const roleTab = ROLE_TABS[role];
    if (roleTab) {
      allTabs.push(roleTab);
    }
  });
  
  return allTabs;
};

export default function ProfileTabsNav({ user, activeTab, onTabChange, isOwnProfile }: ProfileTabsNavProps) {
  const visibleTabs = getVisibleTabs(user);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          {visibleTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === tab.id;
            const isRoleTab = !BASE_TABS.find(t => t.id === tab.id);
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`
                    relative gap-2 px-4 py-2 h-auto
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover-elevate'
                    }
                    transition-all duration-200
                  `}
                  data-testid={`button-tab-${tab.id}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  
                  {/* Role badge for professional tabs */}
                  {isRoleTab && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 text-[10px] px-1.5 py-0 h-4"
                      data-testid={`badge-role-${tab.id}`}
                    >
                      Pro
                    </Badge>
                  )}
                  
                  {/* Active tab underline */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  {/* Hover indicator */}
                  {!isActive && isHovered && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/50"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
