import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
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
  Handshake,
  UserPlus,
  MessageCircle,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ComposeMessage } from "@/components/messages/ComposeMessage";

interface User {
  id: number;
  name?: string;
  username?: string;
  tangoRoles?: string[] | null;
  [key: string]: any;
}

interface ProfileTabsNavProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
  isPublicView?: boolean;
  isFriend?: boolean;
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

export default function ProfileTabsNav({ user, activeTab, onTabChange, isOwnProfile, isPublicView, isFriend }: ProfileTabsNavProps) {
  const visibleTabs = getVisibleTabs(user);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [showFriendRequestDialog, setShowFriendRequestDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  
  // Friend request form state
  const [requestData, setRequestData] = useState({
    message: "",
    didWeDance: false,
    danceLocation: "",
  });

  // Friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (data: { userId: number; message: string; didWeDance?: boolean; danceLocation?: string }) => {
      return apiRequest("POST", "/api/friends/request/" + data.userId, data);
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent!",
        description: `Your request has been sent to ${user.name || user.username}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      setShowFriendRequestDialog(false);
      setRequestData({ message: "", didWeDance: false, danceLocation: "" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description: error.message,
      });
    },
  });

  const submitRequest = async () => {
    if (!requestData.message) return;
    
    sendRequestMutation.mutate({
      userId: user.id,
      message: requestData.message,
      didWeDance: requestData.didWeDance,
      danceLocation: requestData.danceLocation,
    });
  };
  
  return (
    <>
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
            
            {/* Action Buttons Section - Right side */}
            <div className="ml-auto flex items-center gap-2">
              {/* See Friendship Button - Shows when viewing a friend's profile */}
              {isFriend && !isOwnProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: visibleTabs.length * 0.05 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/friendship/${user.id}`)}
                    className="gap-2 px-4 py-2 h-auto border-primary/30 text-primary hover-elevate"
                    data-testid={`button-see-friendship-tab-${user.id}`}
                  >
                    <Handshake className="w-4 h-4" />
                    <span className="font-medium">See Friendship</span>
                  </Button>
                </motion.div>
              )}
              
              {/* Friend Request Button - Shows when NOT friends and NOT own profile */}
              {!isFriend && !isOwnProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: visibleTabs.length * 0.05 }}
                >
                  <Button
                    onClick={() => setShowFriendRequestDialog(true)}
                    className="gap-2 px-5 py-2.5 h-auto text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                    data-testid="button-send-friend-request"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Add Friend</span>
                  </Button>
                </motion.div>
              )}
              
              {/* Message Button - Shows when NOT own profile */}
              {!isOwnProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: (visibleTabs.length + 1) * 0.05 }}
                >
                  <Button
                    onClick={() => setShowMessageDialog(true)}
                    variant="outline"
                    className="gap-2 px-5 py-2.5 h-auto text-base font-semibold border-2 border-primary/50 hover:border-primary hover:bg-primary/10 shadow-md hover:shadow-lg transition-all"
                    data-testid="button-send-message"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Message</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Friend Request Dialog */}
      <Dialog open={showFriendRequestDialog} onOpenChange={setShowFriendRequestDialog}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Send Friend Request to {user.name || user.username}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Your Message *</Label>
              <Textarea
                id="message"
                placeholder="Hi! Include your personal message and any memories about when you met..."
                value={requestData.message}
                onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                className="mt-1 min-h-24"
                data-testid="input-friend-request-message"
              />
              <p className="text-xs text-muted-foreground mt-1">This will be the first thing they see</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="didWeDance"
                checked={requestData.didWeDance}
                onCheckedChange={(checked) =>
                  setRequestData({ ...requestData, didWeDance: checked as boolean })
                }
                data-testid="checkbox-did-we-dance"
              />
              <Label htmlFor="didWeDance" className="cursor-pointer">We've met!</Label>
            </div>

            {requestData.didWeDance && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                <div>
                  <Label htmlFor="danceLocation">Where did we meet?</Label>
                  <Input
                    id="danceLocation"
                    placeholder="e.g., Buenos Aires, Paris"
                    value={requestData.danceLocation}
                    onChange={(e) =>
                      setRequestData({ ...requestData, danceLocation: e.target.value })
                    }
                    className="mt-1"
                    data-testid="input-dance-location"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowFriendRequestDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitRequest}
                disabled={!requestData.message || sendRequestMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                data-testid="button-submit-friend-request"
              >
                {sendRequestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ComposeMessage 
            onClose={() => setShowMessageDialog(false)} 
            defaultRecipient={user.username || `user_${user.id}`}
            defaultChannel="mt"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
