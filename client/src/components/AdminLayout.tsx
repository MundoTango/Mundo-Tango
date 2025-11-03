import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { GlobalTopbar } from "./GlobalTopbar";

/**
 * AdminLayout - Layout component for admin pages
 * 
 * Features:
 * - GlobalTopbar (always visible, consistent across site)
 * - AdminSidebar (dedicated admin navigation with 38+ admin pages organized into 8 categories)
 * - Design token based (easily customizable when design is finalized)
 * 
 * Usage: Wrap admin pages in this layout component
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
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
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
