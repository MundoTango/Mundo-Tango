import { useEffect } from 'react';
import { perfMonitor } from '@/lib/performance';

export function usePerformance(componentName: string) {
  useEffect(() => {
    const mountTime = `${componentName}-mount`;
    perfMonitor.start(mountTime);

    return () => {
      perfMonitor.end(mountTime);
    };
  }, [componentName]);
}

export function useQueryPerformance(queryKey: string) {
  useEffect(() => {
    perfMonitor.start(`query-${queryKey}`);
    return () => {
      perfMonitor.end(`query-${queryKey}`);
    };
  }, [queryKey]);
}
