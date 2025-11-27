import { useState } from "react";
import Sidebar from "./Sidebar";
import UnifiedTopBar from "./navigation/UnifiedTopBar";
import TourGuide from "./mrBlue/TourGuide";
import { useQuery } from "@tanstack/react-query";
import { SelfHealingStatus } from "@/components/SelfHealingStatus";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: userData } = useQuery<{ user: { id: number; role: string } }>({
    queryKey: ['/api/auth/me']
  });

  const user = userData?.user;

  return (
    <div className="relative flex flex-col h-screen w-full bg-background">
      {/* Top Bar - Fixed */}
      <UnifiedTopBar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      {/* Content Area - Below Top Bar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          </aside>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>

      {user && (
        <TourGuide
          feature="app-onboarding"
          userId={user.id}
          autoStart={false}
        />
      )}
      
      <SelfHealingStatus />
    </div>
  );
}
