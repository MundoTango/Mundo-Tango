import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { getBreadcrumbs, RouteConfig } from '@shared/route-config';

export function useBreadcrumbs(): RouteConfig[] {
  const [location] = useLocation();
  
  const breadcrumbs = useMemo(() => {
    return getBreadcrumbs(location);
  }, [location]);
  
  return breadcrumbs;
}
