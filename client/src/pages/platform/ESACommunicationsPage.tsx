import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare,
  Send,
  ArrowRight,
  Bot,
  User,
  Activity,
  TrendingUp,
  Filter,
  Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useState } from "react";

interface Communication {
  id: number;
  messageType: 'H2A' | 'A2A' | 'A2H';
  fromType: 'human' | 'agent';
  fromId: number;
  fromName: string;
  toType: 'human' | 'agent';
  toId: number;
  toName: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  metadata?: {
    taskId?: number;
    priority?: string;
  };
}

interface CommunicationStats {
  totalMessages: number;
  h2aMessages: number;
  a2aMessages: number;
  a2hMessages: number;
  messagesPerHour: number;
  avgResponseTime: number;
  activeConversations: number;
}

const messageTypeColors = {
  'H2A': 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  'A2A': 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  'A2H': 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
};

const statusColors = {
  sent: 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400',
  delivered: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  read: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
  failed: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
};

export default function ESACommunicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: stats, isLoading: statsLoading } = useQuery<CommunicationStats>({
    queryKey: ["/api/platform/esa/communications/stats"],
  });

  const { data: communications = [], isLoading: commsLoading } = useQuery<Communication[]>({
    queryKey: ["/api/platform/esa/communications"],
  });

  const filteredCommunications = communications.filter(comm =>
    comm.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comm.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comm.toName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SelfHealingErrorBoundary pageName="ESA Communications" fallbackRoute="/platform/esa">
      <PageLayout title="ESA Communications" showBreadcrumbs>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
              <MessageSquare className="h-8 w-8 text-primary" />
              Inter-Agent Communications
            </h1>
            <p className="text-muted-foreground mt-1">
              H2A, A2A, and A2H message logs and communication graph
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-messages">
                  {stats?.totalMessages?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All channels
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">H2A Messages</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-h2a-messages">
                  {stats?.h2aMessages || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Human to Agent
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">A2A Messages</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600" data-testid="text-a2a-messages">
                  {stats?.a2aMessages || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Agent to Agent
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-conversations">
                  {stats?.activeConversations || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.messagesPerHour || 0} msg/hr
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages, agents, or users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-messages"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="all" data-testid="tab-all">
                All
              </TabsTrigger>
              <TabsTrigger value="h2a" data-testid="tab-h2a">
                H2A
              </TabsTrigger>
              <TabsTrigger value="a2a" data-testid="tab-a2a">
                A2A
              </TabsTrigger>
              <TabsTrigger value="a2h" data-testid="tab-a2h">
                A2H
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Log</CardTitle>
                  <CardDescription>
                    All inter-agent and human-agent communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {commsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading communications...
                    </div>
                  ) : filteredCommunications.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCommunications.map((comm) => (
                        <Card 
                          key={comm.id} 
                          className="hover-elevate"
                          data-testid={`communication-${comm.id}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  {comm.fromType === 'human' ? (
                                    <User className="h-5 w-5 text-blue-600" />
                                  ) : (
                                    <Bot className="h-5 w-5 text-purple-600" />
                                  )}
                                  <span className="font-medium" data-testid={`text-from-${comm.id}`}>
                                    {comm.fromName}
                                  </span>
                                </div>
                                
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                
                                <div className="flex items-center gap-2">
                                  {comm.toType === 'human' ? (
                                    <User className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Bot className="h-5 w-5 text-purple-600" />
                                  )}
                                  <span className="font-medium" data-testid={`text-to-${comm.id}`}>
                                    {comm.toName}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge className={messageTypeColors[comm.messageType]}>
                                  {comm.messageType}
                                </Badge>
                                <Badge className={statusColors[comm.status]}>
                                  {comm.status}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-3" data-testid={`text-message-${comm.id}`}>
                              {comm.message}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(comm.createdAt), { addSuffix: true })}
                              </span>
                              {comm.metadata?.taskId && (
                                <span className="font-mono">
                                  Task #{comm.metadata.taskId}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-50" />
                      <p>No communications found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {['h2a', 'a2a', 'a2h'].map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="uppercase">{type} Communications</CardTitle>
                    <CardDescription>
                      {type === 'h2a' && 'Human to Agent messages'}
                      {type === 'a2a' && 'Agent to Agent messages'}
                      {type === 'a2h' && 'Agent to Human messages'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      Filtered view for {type.toUpperCase()} communications
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Communication Graph Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Graph</CardTitle>
              <CardDescription>
                Visual representation of agent communication patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-muted/20 to-muted/50 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center space-y-3">
                  <Activity className="mx-auto h-16 w-16 text-primary/50 animate-pulse" />
                  <div>
                    <h3 className="font-semibold mb-1">Interactive Graph Coming Soon</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Real-time visualization of agent communication networks with D3.js or Cytoscape
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </SelfHealingErrorBoundary>
  );
}
