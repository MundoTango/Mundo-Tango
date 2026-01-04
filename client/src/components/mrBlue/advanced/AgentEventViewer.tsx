import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Circle, Activity, MessageSquare, RefreshCw, Filter } from 'lucide-react';

interface AgentEvent {
  id: string;
  channel: string;
  data: Record<string, any>;
  metadata: {
    agentId: string;
    timestamp: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

interface AgentActivity {
  agentId: string;
  name: string;
  eventCount: number;
  lastActive: string;
  status: 'active' | 'idle';
}

const EVENT_CATEGORIES = [
  'all',
  'coordination',
  'learning',
  'execution',
  'error',
  'performance'
];

export function AgentEventViewer() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [liveEvents, setLiveEvents] = useState<AgentEvent[]>([]);
  const [debugMode, setDebugMode] = useState(false);

  // Query: Get event history
  const { data: history = [], isLoading } = useQuery<AgentEvent[]>({
    queryKey: ['/api/mrblue/events/history', selectedCategory],
    refetchInterval: 5000,
  });

  // Query: Get active agents
  const { data: agents = [] } = useQuery<AgentActivity[]>({
    queryKey: ['/api/mrblue/events/agents'],
    refetchInterval: 5000,
  });

  // SSE: Real-time events
  useEffect(() => {
    const eventSource = new EventSource('/api/mrblue/events/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveEvents(prev => [data, ...prev].slice(0, 100)); // Keep last 100
      } catch (error) {
        console.error('Failed to parse event:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      coordination: 'bg-blue-500',
      learning: 'bg-purple-500',
      execution: 'bg-green-500',
      error: 'bg-red-500',
      performance: 'bg-yellow-500',
    };
    return colors[channel] || 'bg-gray-500';
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredEvents = selectedCategory === 'all'
    ? history
    : history.filter(e => e.channel === selectedCategory);

  const activeAgentCount = agents.filter(a => a.status === 'active').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="panel-agent-events">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="h-6 w-6" />
              Agent Event Bus
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor real-time communication between {agents.length} agents
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                {activeAgentCount} active
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b">
          <TabsTrigger value="timeline" data-testid="tab-timeline">
            <Activity className="h-4 w-4 mr-2" />
            Event Timeline
          </TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents">
            <MessageSquare className="h-4 w-4 mr-2" />
            Agent Activity
          </TabsTrigger>
          <TabsTrigger value="live" data-testid="tab-live">
            <Radio className="h-4 w-4 mr-2" />
            Live Stream
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="flex-1 overflow-auto p-6 mt-0">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-event-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Event Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Event History ({filteredEvents.length})</CardTitle>
                <CardDescription>
                  Recent agent communications and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Activity className="h-8 w-8 mb-2" />
                      <p className="text-sm">No events in this category</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEvents.map((event, index) => (
                        <div key={event.id}>
                          {index > 0 && <Separator className="my-2" />}
                          <div className="space-y-2" data-testid={`event-${event.id}`}>
                            <div className="flex items-center gap-2">
                              <Badge className={getChannelColor(event.channel)}>
                                {event.channel}
                              </Badge>
                              <Badge variant="outline">{event.metadata.agentId}</Badge>
                              {event.metadata.priority && (
                                <Badge variant="secondary" className={getPriorityColor(event.metadata.priority)}>
                                  {event.metadata.priority}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(event.metadata.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-sm bg-muted/30 rounded p-2">
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="flex-1 overflow-auto p-6 mt-0">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Agent Activity ({agents.length} agents)</CardTitle>
                <CardDescription>
                  Activity metrics for all registered agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-2 gap-3">
                    {agents.map((agent) => (
                      <Card key={agent.agentId} className="hover-elevate" data-testid={`agent-${agent.agentId}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Circle
                                className={`h-2 w-2 ${
                                  agent.status === 'active'
                                    ? 'fill-green-500 text-green-500'
                                    : 'fill-gray-500 text-gray-500'
                                }`}
                              />
                              <CardTitle className="text-sm">{agent.name}</CardTitle>
                            </div>
                            <Badge variant="secondary">{agent.eventCount}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Last active: {new Date(agent.lastActive).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="live" className="flex-1 overflow-auto p-6 mt-0">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
                      Live Event Stream
                    </CardTitle>
                    <CardDescription>
                      Real-time events ({liveEvents.length} recent)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {liveEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <Radio className="h-8 w-8 mb-2" />
                      <p className="text-sm">Waiting for events...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {liveEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-2 p-2 rounded-md bg-muted/30 animate-in fade-in slide-in-from-top-1"
                          data-testid={`live-event-${event.id}`}
                        >
                          <Badge className={getChannelColor(event.channel)} className="mt-0.5">
                            {event.channel}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono truncate">
                              {event.metadata.agentId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {JSON.stringify(event.data).substring(0, 100)}...
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.metadata.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
