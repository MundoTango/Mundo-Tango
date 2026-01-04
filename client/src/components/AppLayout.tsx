import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import UnifiedTopBar from "./navigation/UnifiedTopBar";
import TourGuide from "./mrBlue/advanced/TourGuide";
import { useQuery } from "@tanstack/react-query";
import { SelfHealingStatus } from "@/components/SelfHealingStatus";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

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

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: userData } = useQuery<{ user: { id: number; role: string } }>({
    queryKey: ['/api/auth/me']
  });

  const user = userData?.user;

  return (
    <>
      <main className="flex-1 overflow-y-auto pt-2">
        {children}
      </main>
      
      {user && (
        <TourGuide
          feature="app-onboarding"
          userId={user.id}
          autoStart={false}
        />
      )}
      
      <SelfHealingStatus />
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [defaultOpen] = useState(() => getSidebarStateFromCookie());

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider 
      defaultOpen={defaultOpen}
      onOpenChange={(open) => setSidebarCookie(open)}
      style={sidebarStyle as React.CSSProperties}
    >
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <UnifiedTopBar 
            showMenuButton={true}
          />
          <AppLayoutContent>{children}</AppLayoutContent>
        </div>
      </div>
    </SidebarProvider>
  );
}
