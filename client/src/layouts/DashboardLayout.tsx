import { useState, useEffect, ReactNode } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import UnifiedTopBar from '@/components/navigation/UnifiedTopBar';
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-bg-primary" data-testid="dashboard-layout">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <UnifiedTopBar 
            theme={theme}
            onThemeToggle={toggleTheme}
            showMenuButton={true}
          />
          <main className="flex-1 overflow-y-auto bg-bg-primary">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
