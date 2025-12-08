import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bot, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Agent {
  id: string;
  name: string;
  specialization: string;
  status: 'active' | 'inactive' | 'working';
}

export function ActiveAgentsPanel() {
  const [location] = useLocation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const fetchActiveAgents = async () => {
      setLoading(true);
      try {
        // Simulate agent activation (in real impl, call backend API)
        // For now, show hardcoded agents based on page
        const mockAgents: Agent[] = [
          { id: 'AGENT_1', name: 'Security Expert', specialization: 'Security audits, CSRF, XSS detection', status: 'active' },
          { id: 'AGENT_6', name: 'Routing Specialist', specialization: 'Navigation, 404 detection', status: 'active' },
          { id: 'EXPERT_11', name: 'UI/UX Master', specialization: 'Layout, responsiveness, visual hierarchy', status: 'active' },
          { id: 'AGENT_38', name: 'Integration Monitor', specialization: 'API calls, external services', status: 'active' },
          { id: 'AGENT_52', name: 'Performance Auditor', specialization: 'Load time, resource optimization', status: 'active' },
          { id: 'AGENT_53', name: 'Accessibility Guardian', specialization: 'ARIA, keyboard navigation, screen readers', status: 'active' },
        ];
        
        // Add more agents for specific pages
        if (location.includes('/register')) {
          mockAgents.push(
            { id: 'AGENT_14', name: 'Form Validator', specialization: 'Form validation, input sanitization', status: 'active' },
            { id: 'AGENT_29', name: 'Auth Flow Manager', specialization: 'Registration flow, password strength', status: 'active' },
          );
        }
        
        setAgents(mockAgents);
      } catch (error) {
        console.error('Failed to fetch active agents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveAgents();
  }, [location]);
  
  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'working':
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case 'inactive':
        return <AlertCircle className="w-3 h-3 text-muted-foreground" />;
    }
  };
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      data-testid="active-agents-panel"
    >
      <div className="flex items-center gap-1">
        <CollapsibleTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover-elevate"
                data-testid="toggle-agents-panel"
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <div className="relative">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="absolute -top-1 -right-1 text-[9px] font-bold text-primary">
                      {agents.length}
                    </span>
                  </div>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{agents.length} agents monitoring this page</p>
            </TooltipContent>
          </Tooltip>
        </CollapsibleTrigger>
        {isOpen && (
          <span className="text-xs text-muted-foreground">Active Agents</span>
        )}
      </div>
      
      <CollapsibleContent>
        <ScrollArea className="max-h-[200px]">
          <div className="px-3 py-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">
                No agents active on this page
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-start gap-2 p-2 rounded-md hover-elevate transition-colors"
                  data-testid={`agent-${agent.id.toLowerCase()}`}
                >
                  {getStatusIcon(agent.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground">
                        {agent.id}
                      </code>
                      <span className="text-xs text-muted-foreground truncate">
                        {agent.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {agent.specialization}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}
