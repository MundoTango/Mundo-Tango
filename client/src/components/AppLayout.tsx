import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UnifiedTopBar from "./navigation/UnifiedTopBar";
import TourGuide from "./mrBlue/TourGuide";
import { useQuery } from "@tanstack/react-query";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: userData } = useQuery<{ user: { id: number; role: string } }>({
    queryKey: ['/api/auth/me']
  });

  const user = userData?.user;

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="relative flex h-screen w-full bg-background">
      <UnifiedTopBar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      <div className="flex w-full h-full pt-16">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main 
          className="w-full overflow-y-auto transition-all duration-300 ease-in-out"
          style={{
            marginLeft: sidebarOpen ? '256px' : '0',
          }}
        >
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
    </div>
  );
}
