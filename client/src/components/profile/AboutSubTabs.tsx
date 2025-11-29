import { useState } from "react";
import { User, MapPin, Music, Languages, Shield, Bell, Lock, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type AboutSubTab = 
  | 'profile' 
  | 'location' 
  | 'tango' 
  | 'languages' 
  | 'privacy' 
  | 'notifications' 
  | 'security' 
  | 'subscription';

interface TabDefinition {
  id: AboutSubTab;
  label: string;
  icon: typeof User;
  ownerOnly?: boolean;
}

const tabs: TabDefinition[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'tango', label: 'Tango', icon: Music },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'privacy', label: 'Privacy', icon: Shield, ownerOnly: true },
  { id: 'notifications', label: 'Notifications', icon: Bell, ownerOnly: true },
  { id: 'security', label: 'Security', icon: Lock, ownerOnly: true },
  { id: 'subscription', label: 'Subscription', icon: Crown, ownerOnly: true },
];

interface AboutSubTabsProps {
  activeTab: AboutSubTab;
  onTabChange: (tab: AboutSubTab) => void;
  isOwnProfile: boolean;
  hasSubscription?: boolean;
}

export function AboutSubTabs({ 
  activeTab, 
  onTabChange, 
  isOwnProfile,
  hasSubscription = false
}: AboutSubTabsProps) {
  const visibleTabs = tabs.filter(tab => {
    if (tab.ownerOnly && !isOwnProfile) return false;
    if (tab.id === 'subscription' && !hasSubscription && !isOwnProfile) return false;
    return true;
  });

  return (
    <div className="flex flex-wrap gap-1 mb-6 p-1 bg-muted/50 rounded-lg" data-testid="about-sub-tabs">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Button
            key={tab.id}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "gap-2 transition-all",
              isActive && "shadow-sm"
            )}
            data-testid={`subtab-${tab.id}`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

interface AboutSubTabContentProps {
  activeTab: AboutSubTab;
  children: {
    profile?: React.ReactNode;
    location?: React.ReactNode;
    tango?: React.ReactNode;
    languages?: React.ReactNode;
    privacy?: React.ReactNode;
    notifications?: React.ReactNode;
    security?: React.ReactNode;
    subscription?: React.ReactNode;
  };
}

export function AboutSubTabContent({ activeTab, children }: AboutSubTabContentProps) {
  return (
    <div className="min-h-[200px]" data-testid={`subtab-content-${activeTab}`}>
      {activeTab === 'profile' && children.profile}
      {activeTab === 'location' && children.location}
      {activeTab === 'tango' && children.tango}
      {activeTab === 'languages' && children.languages}
      {activeTab === 'privacy' && children.privacy}
      {activeTab === 'notifications' && children.notifications}
      {activeTab === 'security' && children.security}
      {activeTab === 'subscription' && children.subscription}
    </div>
  );
}
