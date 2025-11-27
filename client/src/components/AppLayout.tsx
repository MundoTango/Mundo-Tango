import { useState } from "react";
import Sidebar from "./Sidebar";
import UnifiedTopBar from "./navigation/UnifiedTopBar";
import TourGuide from "./mrBlue/TourGuide";
import { useQuery } from "@tanstack/react-query";
import { SelfHealingStatus } from "@/components/SelfHealingStatus";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: userData } = useQuery<{ user: { id: number; role: string } }>({
    queryKey: ['/api/auth/me']
  });

  const user = userData?.user;

  return (
    <div className="relative flex flex-col h-screen w-full bg-background">
      <UnifiedTopBar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      
      <main className="w-full flex-1 overflow-y-auto pt-16">
        {children}
      </main>

      {/* Pop-out Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </SheetContent>
      </Sheet>

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
