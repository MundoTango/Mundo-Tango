import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plane, 
  Calendar, 
  Users, 
  Image, 
  Info,
  Briefcase,
  MessageSquare,
  UserPlus,
  UserCheck,
  HeartHandshake
} from "lucide-react";

interface User {
  id: number;
  tangoRoles?: string[] | null;
  [key: string]: any;
}

interface FriendshipState {
  isFriend: boolean;
  hasPendingRequest: boolean;
  hasIncomingRequest: boolean;
}

interface ProfileTabsNavProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
  isPublicView?: boolean;
  friendshipState?: FriendshipState;
  onAddFriend?: () => void;
  onReviewRequest?: () => void;
  isAddingFriend?: boolean;
}

const PROFESSIONAL_ROLES = [
  'teacher', 'dj', 'performer', 'organizer', 'photographer', 'musician',
  'choreographer', 'content_creator', 'tango_guide', 'taxi_dancer', 
  'tour_operator', 'host_venue', 'tango_school', 'tango_hotel', 'vendor',
  'wellness', 'learning_resource', 'host', 'guide', 'wellness_provider',
  'learning_source', 'venue-owner', 'coach', 'mc', 'business', 'artist',
  'journalist', 'historian', 'clothing-designer'
];

export function hasProfessionalRoles(roles: string[] | null | undefined): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some(role => PROFESSIONAL_ROLES.includes(role.toLowerCase()));
}

const BASE_TABS = [
  { id: 'feed', label: 'Posts', icon: FileText },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'about', label: 'About', icon: Info },
];

const PRO_TAB = { id: 'pro', label: 'PRO', icon: Briefcase };

export const getVisibleTabs = (user: User): Array<{ id: string; label: string; icon: any }> => {
  const allTabs = [...BASE_TABS];
  
  if (hasProfessionalRoles(user.tangoRoles)) {
    allTabs.push(PRO_TAB);
  }
  
  return allTabs;
};

export default function ProfileTabsNav({ 
  user, 
  activeTab, 
  onTabChange, 
  isOwnProfile, 
  isPublicView,
  friendshipState,
  onAddFriend,
  onReviewRequest,
  isAddingFriend
}: ProfileTabsNavProps) {
  const visibleTabs = getVisibleTabs(user);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between gap-2 py-2">
          {/* Left: Tab buttons */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
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
                  
                  {/* Active tab underline */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground"
                      initial={false as any}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Hover indicator */}
                  {!isActive && isHovered && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/50"
                      initial={{ scaleX: 0 } as any}
                      animate={{ scaleX: 1 } as any}
                      exit={{ scaleX: 0 } as any}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
          </div>
          
          {/* Right: Friend/Message Buttons (only on other profiles) */}
          {!isOwnProfile && friendshipState && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Message Button */}
              <Link href={`/messages/direct/${user.id}`}>
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-testid={`button-message-${user.id}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
              </Link>
              
              {/* Friend Status Button */}
              {friendshipState.isFriend ? (
                <Link href={`/friendship/${user.id}`}>
                  <Button 
                    size="sm"
                    className="gap-2"
                    data-testid={`button-see-friendship-${user.id}`}
                  >
                    <HeartHandshake className="h-4 w-4" />
                    See Friendship
                  </Button>
                </Link>
              ) : friendshipState.hasIncomingRequest ? (
                <Button 
                  size="sm"
                  className="gap-2"
                  onClick={onReviewRequest}
                  data-testid={`button-review-request-${user.id}`}
                >
                  <UserCheck className="h-4 w-4" />
                  Review Request
                </Button>
              ) : friendshipState.hasPendingRequest ? (
                <Button 
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled
                  data-testid="button-request-pending"
                >
                  <UserCheck className="h-4 w-4" />
                  Request Sent
                </Button>
              ) : (
                <Button 
                  size="sm"
                  className="gap-2"
                  onClick={onAddFriend}
                  disabled={isAddingFriend}
                  data-testid={`button-add-friend-${user.id}`}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Friend
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
