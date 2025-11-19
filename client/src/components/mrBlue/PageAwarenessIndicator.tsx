import { useLocation } from 'wouter';
import { MapPin, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ROUTES as routeConfig } from '@shared/route-config';

export function PageAwarenessIndicator() {
  const [location] = useLocation();
  
  // Find matching route configuration
  const findRouteInfo = (path: string) => {
    // Check exact matches first
    const exactMatch = Object.entries(routeConfig).find(([_, config]) => config.path === path);
    if (exactMatch) {
      return {
        name: exactMatch[1].name,
        path: exactMatch[1].path,
        category: exactMatch[0].split('_')[0],
      };
    }
    
    // Check partial matches for dynamic routes
    const partialMatch = Object.entries(routeConfig).find(([_, config]) => {
      const pattern = config.path.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    });
    
    if (partialMatch) {
      return {
        name: partialMatch[1].name,
        path: path,
        category: partialMatch[0].split('_')[0],
      };
    }
    
    // Default for unknown routes
    return {
      name: path === '/' ? 'Home' : path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
      path: path,
      category: 'general',
    };
  };
  
  const routeInfo = findRouteInfo(location);
  
  return (
    <div 
      className="flex items-center gap-2 px-3 py-2 bg-card border-b border-border"
      data-testid="page-awareness-indicator"
    >
      <MapPin className="w-4 h-4 text-primary" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-medium text-sm text-foreground truncate" data-testid="current-page-name">
          {routeInfo.name}
        </span>
        <Badge variant="outline" className="text-xs no-default-hover-elevate" data-testid="page-category">
          {routeInfo.category}
        </Badge>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <LinkIcon className="w-3 h-3" />
        <code className="truncate max-w-[200px]" data-testid="current-page-path">{routeInfo.path}</code>
      </div>
    </div>
  );
}
