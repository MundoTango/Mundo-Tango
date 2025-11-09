import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UnifiedTopBar from "./navigation/UnifiedTopBar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  // Start with sidebar open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Auto-open on desktop
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="relative flex h-screen w-full bg-background">
      {/* TopBar spans full width above everything */}
      <UnifiedTopBar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      {/* Sidebar and content below topbar */}
      <div className="flex w-full h-full pt-16">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
