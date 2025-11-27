import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UnifiedTopBar from "./navigation/UnifiedTopBar";
import TourGuide from "./mrBlue/TourGuide";
import { useQuery } from "@tanstack/react-query";
import { SelfHealingStatus } from "@/components/SelfHealingStatus";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function getSidebarStateFromCookie(): boolean {
  if (typeof document === 'undefined') return true;
  const match = document.cookie.match(new RegExp(`(^| )${SIDEBAR_COOKIE_NAME}=([^;]+)`));
  if (match) {
    return match[2] === 'true';
  }
  return true;
}

function setSidebarCookie(isOpen: boolean) {
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${isOpen}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => getSidebarStateFromCookie());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    setSidebarCookie(newState);
  };

  const { data: userData } = useQuery<{ user: { id: number; role: string } }>({
    queryKey: ['/api/auth/me']
  });

  const user = userData?.user;

  return (
    <div className="relative flex flex-col h-screen w-full bg-background">
      {/* Top Bar - Fixed */}
      <UnifiedTopBar 
        onMenuToggle={handleSidebarToggle}
        showMenuButton={true}
      />
      
      {/* Content Area - Below Top Bar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - renders its own positioning */}
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={(open) => {
            setSidebarOpen(open);
            setSidebarCookie(open);
          }}
          isMobile={isMobile}
        />
        
        {/* Main Content - adjusts margin based on sidebar state on desktop */}
        <main 
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
            !isMobile && sidebarOpen ? 'lg:ml-64' : ''
          }`}
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
      
      <SelfHealingStatus />
    </div>
  );
}
