import { useQuery } from '@tanstack/react-query';

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'maintenance';
  version: string;
  category?: string;
}

export function useAgentRegistry() {
  return useQuery<Agent[]>({
    queryKey: ['/api/mrblue/orchestration/a2a/agents'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}
