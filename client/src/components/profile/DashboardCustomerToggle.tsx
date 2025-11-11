import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Eye, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleViewMode = 'dashboard' | 'customer';

interface DashboardCustomerToggleProps {
  isOwnProfile: boolean;
  onViewChange?: (view: RoleViewMode) => void;
}

export default function DashboardCustomerToggle({ isOwnProfile, onViewChange }: DashboardCustomerToggleProps) {
  const [activeView, setActiveView] = useState<RoleViewMode>('dashboard');

  // Only show toggle if viewing own profile
  if (!isOwnProfile) {
    return null;
  }

  const handleViewChange = (view: RoleViewMode) => {
    setActiveView(view);
    onViewChange?.(view);
  };

  return (
    <div 
      className="flex items-center gap-2 mb-6 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20 dark:border-primary/30"
      data-testid="container-view-toggle"
    >
      <Info className="w-5 h-5 text-primary flex-shrink-0" />
      <span className="text-sm text-foreground">
        Switch views to see what customers see when booking
      </span>
      <div className="ml-auto flex items-center gap-1 bg-card rounded-lg p-1 border">
        <Button
          variant={activeView === 'dashboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('dashboard')}
          className={cn(
            "text-xs px-3",
            activeView === 'dashboard' && "bg-primary text-primary-foreground"
          )}
          data-testid="button-view-dashboard"
        >
          <Settings className="w-3 h-3 mr-1" />
          Dashboard
        </Button>
        <Button
          variant={activeView === 'customer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('customer')}
          className={cn(
            "text-xs px-3",
            activeView === 'customer' && "bg-primary text-primary-foreground"
          )}
          data-testid="button-view-customer"
        >
          <Eye className="w-3 h-3 mr-1" />
          Customer View
        </Button>
      </div>
    </div>
  );
}
