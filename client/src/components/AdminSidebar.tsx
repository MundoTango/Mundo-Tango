import { 
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Settings,
  Server,
  Activity,
  Database,
  Lock,
  Bell,
  TrendingUp,
  FileCheck,
  GitBranch,
  Layout,
  BarChart3,
  Workflow,
  ListChecks,
  Network,
  Brain,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  LogOut,
  Heart,
  PlusCircle,
  Folder,
  Inbox,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

// Dashboard & Overview (2 items)
const dashboardItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/platform/analytics", icon: BarChart3 },
];

// User Management (4 items)
const userManagementItems = [
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Review Queue", url: "/admin/feedback-queue", icon: Inbox },
  { title: "Moderation", url: "/admin/moderation", icon: Shield },
  { title: "Reports", url: "/admin/reports", icon: AlertTriangle },
];

// Content & System (5 items)
const contentItems = [
  { title: "Content Moderation", url: "/admin/moderation", icon: FileCheck },
  { title: "Data Quality", url: "/admin/data-quality", icon: Database },
  { title: "Self-Healing", url: "/admin/self-healing", icon: Activity },
  { title: "Agent Health", url: "/admin/agent-health", icon: Activity },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

// Platform & Infrastructure (6 items)
const platformItems = [
  { title: "Platform", url: "/platform", icon: Server },
  { title: "Monitoring", url: "/platform/monitoring", icon: Activity },
  { title: "Database", url: "/platform/database", icon: Database },
  { title: "Git Repository", url: "/platform/git", icon: GitBranch },
  { title: "Secrets", url: "/platform/secrets", icon: Lock },
  { title: "API Logs", url: "/platform/logs", icon: FileText },
];

// Business & Finance (4 items)
const businessItems = [
  { title: "Pricing Manager", url: "/admin/pricing-manager", icon: DollarSign },
  { title: "Billing", url: "/admin/billing", icon: DollarSign },
  { title: "Ads Manager", url: "/admin/ads", icon: TrendingUp },
  { title: "Metrics", url: "/admin/metrics", icon: TrendingUp },
];

// Development Tools (4 items)
const devToolsItems = [
  { title: "Visual Editor", url: "/admin/visual-editor", icon: Layout },
  { title: "Talent Pipeline", url: "/admin/talent-pipeline", icon: Users },
  { title: "Task Board", url: "/admin/task-board", icon: ListChecks },
  { title: "Project Tracker", url: "/admin/project-tracker", icon: Workflow },
];

// ESA Framework (God/Super Admin only) (3 items)
const esaItems = [
  { title: "ESA Dashboard", url: "/platform/esa", icon: Brain },
  { title: "ESA Tasks", url: "/platform/esa/tasks", icon: ListChecks },
  { title: "ESA Communications", url: "/platform/esa/communications", icon: Network },
];

// Crowdfunding (Admin-only feature) (3 items)
const crowdfundingItems = [
  { title: "Campaigns", url: "/crowdfunding", icon: Heart },
  { title: "Create Campaign", url: "/crowdfunding/create", icon: PlusCircle },
  { title: "My Campaigns", url: "/crowdfunding/my", icon: Folder },
];

// Settings (1 item)
const settingsItems = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { t } = useTranslation(['navigation', 'common']);
  const [location] = useLocation();
  const { user, profile, logout } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  // Close sidebar on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Use profile data for display, fallback to user email
  const displayName = profile?.name || user?.email?.split('@')[0] || "Admin";
  const username = profile?.username || user?.email?.split('@')[0] || "admin";
  const avatarUrl = profile?.profileImage;

  // Check if user is God/Super Admin (only 'god' role for ESA access)
  const isGodAdmin = user?.role === 'god';

  // Reusable menu item renderer
  const renderMenuItem = (item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton 
        asChild 
        data-active={location === item.url} 
        data-testid={`admin-sidebar-item-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <Link to={item.url} onClick={handleNavClick}>
          <>
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar data-testid="admin-sidebar">
      <SidebarContent>
        {/* Admin Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-serif font-bold text-foreground">
            {t('navigation:admin.adminCenter', 'Admin Center')}
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Dashboard & Overview */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation:admin.dashboard', 'Dashboard')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Management */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation:admin.userManagement', 'User Management')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userManagementItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content & System */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation:admin.contentSystem', 'Content & System')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Platform & Infrastructure */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation:admin.platform', 'Platform')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business & Finance */}
        <SidebarGroup>
          <SidebarGroupLabel>Business</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Development Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Development</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devToolsItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Crowdfunding (Admin feature) */}
        <SidebarGroup>
          <SidebarGroupLabel>Crowdfunding</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crowdfundingItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ESA Framework (God/Super Admin only) */}
        {isGodAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>ESA Framework</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {esaItems.map(renderMenuItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Admin Profile */}
      <SidebarFooter className="p-4 border-t" data-testid="admin-sidebar-footer">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {displayName?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-admin-username">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{username} • {user?.role === 'god' ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>
        
        {/* Back to Main Site */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="w-full mb-2"
          data-testid="button-back-to-site"
          onClick={handleNavClick}
        >
          <Link to="/memories">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Back to Site
          </Link>
        </Button>
        
        {/* Logout */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full"
          data-testid="button-admin-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
