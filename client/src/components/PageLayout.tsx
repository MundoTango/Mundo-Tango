import { ReactNode } from 'react';
import { Link } from 'wouter';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';
import { ChevronRight, Home } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBreadcrumbs?: boolean;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  showBreadcrumbs = true,
  className = ''
}: PageLayoutProps) {
  const breadcrumbs = useBreadcrumbs();
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 1 && (
        <div className="px-4 py-3 border-b bg-card/50">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isHome = crumb.path === '/';
                
                return (
                  <div key={crumb.path} className="flex items-center">
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage data-testid={`breadcrumb-current`}>
                          {isHome ? <Home className="w-4 h-4" /> : crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.path} data-testid={`breadcrumb-link-${crumb.path.replace(/\//g, '-') || 'home'}`}>
                            <>
                              {isHome ? <Home className="w-4 h-4" /> : crumb.label}
                            </>
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="w-4 h-4" />
                      </BreadcrumbSeparator>
                    )}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
      
      {/* Page Title */}
      {title && (
        <div className="px-4 py-4 border-b">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      )}
      
      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
