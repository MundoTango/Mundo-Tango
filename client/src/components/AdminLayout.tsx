import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { GlobalTopbar } from "./GlobalTopbar";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * AdminLayout - Layout component for admin pages
 * 
 * Features:
 * - GlobalTopbar (always visible, consistent across site)
 * - AdminSidebar (dedicated admin navigation with 38+ admin pages organized into 8 categories)
 * - Mobile-responsive with collapsible sidebar and hamburger menu
 * - Design token based (easily customizable when design is finalized)
 * 
 * Usage: Wrap admin pages in this layout component
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['navigation', 'common']);
  const style = {
    "--sidebar-width": "18rem",  // Slightly wider for admin content
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full flex-col" data-testid="admin-layout">
        {/* Global top bar - consistent across entire site */}
        <GlobalTopbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Admin-specific sidebar */}
          <AdminSidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile header with sidebar trigger */}
            <div className="md:hidden flex items-center gap-2 p-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger data-testid="button-admin-sidebar-toggle">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle admin menu</span>
              </SidebarTrigger>
              <span className="text-sm font-semibold">Admin Center</span>
            </div>
            
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
