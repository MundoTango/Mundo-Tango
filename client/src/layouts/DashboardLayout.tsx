import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import UnifiedTopBar from '@/components/navigation/UnifiedTopBar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  // Update document theme class on mount and theme change
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

  return (
    <div className="min-h-screen bg-bg-primary" data-testid="dashboard-layout">
      {/* Topbar */}
      <UnifiedTopBar 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        theme={theme}
        onThemeToggle={toggleTheme}
        showMenuButton={true}
      />

      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 bg-bg-primary transition-all duration-300">
          <div className={cn(
            "transition-all duration-300",
            sidebarOpen ? "lg:pl-64" : "lg:pl-0"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
