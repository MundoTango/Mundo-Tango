import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Inbox, Bot, AlertTriangle, Info } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";

interface AgentCommunication {
  id: number;
  communicationType: string;
  fromAgentId: number | null;
  toAgentId: number | null;
  fromUserId: number | null;
  toUserId: number | null;
  messageType: string;
  subject: string | null;
  message: string;
  priority: string;
  requiresResponse: boolean;
  createdAt: string;
  fromAgentCode?: string;
  fromAgentName?: string;
  toAgentCode?: string;
  toAgentName?: string;
}

interface CommStats {
  total: number;
  agentToAgent: number;
  agentToUser: number;
  userToAgent: number;
  requiresResponse: number;
}

export default function AgentCommunicationsPage() {
  const { data: communications = [], isLoading } = useQuery<AgentCommunication[]>({
    queryKey: ["/api/platform/esa/communications"],
  });

  const { data: stats } = useQuery<CommStats>({
    queryKey: ["/api/platform/esa/communications/stats"],
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "urgent": return "destructive";
      case "normal": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "activation_notice": return <Info className="w-4 h-4" />;
      case "task_assignment": return <Send className="w-4 h-4" />;
      case "status_update": return <MessageSquare className="w-4 h-4" />;
      case "error_report": return <AlertTriangle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <SelfHealingErrorBoundary pageName="Agent Communications" fallbackRoute="/platform">
        <PageLayout title="Agent Communications" showBreadcrumbs>
<div className="container mx-auto p-6">
        <div className="text-center py-8">Loading communications...</div>
      </div>
        </PageLayout>
      </SelfHealingErrorBoundary>
    );
  }

  const agentToAgent = communications.filter(c => c.communicationType === "agent_to_agent");
  const agentToUser = communications.filter(c => c.communicationType === "agent_to_user");
  const userToAgent = communications.filter(c => c.communicationType === "user_to_agent");

  return (
    <SelfHealingErrorBoundary pageName="Agent Communications" fallbackRoute="/platform">
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Agent Communications</h1>
        <p className="text-muted-foreground mt-1">
          Inter-agent and human-agent communication hub (H2AC Protocol)
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-communications">
              {stats?.total || communications.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent ↔ Agent</CardTitle>
            <Bot className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-agent-to-agent">
              {stats?.agentToAgent || agentToAgent.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent → User</CardTitle>
            <Send className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-agent-to-user">
              {stats?.agentToUser || agentToUser.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User → Agent</CardTitle>
            <Inbox className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-user-to-agent">
              {stats?.userToAgent || userToAgent.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communications Feed */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-communications">
            All ({communications.length})
          </TabsTrigger>
          <TabsTrigger value="agent" data-testid="tab-agent-communications">
            Agent ↔ Agent ({agentToAgent.length})
          </TabsTrigger>
          <TabsTrigger value="to-user" data-testid="tab-agent-to-user">
            Agent → User ({agentToUser.length})
          </TabsTrigger>
          <TabsTrigger value="from-user" data-testid="tab-user-to-agent">
            User → Agent ({userToAgent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Communications</CardTitle>
              <CardDescription>Complete communication history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div 
                    key={comm.id} 
                    className="flex gap-4 p-4 border rounded-lg hover-elevate"
                    data-testid={`communication-${comm.id}`}
                  >
                    <Avatar>
                      <AvatarFallback>
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {comm.fromAgentName || comm.fromAgentCode || `User #${comm.fromUserId}`}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">
                            {comm.toAgentName || comm.toAgentCode || `User #${comm.toUserId}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {comm.requiresResponse && (
                            <Badge variant="outline" className="text-xs">
                              Requires Response
                            </Badge>
                          )}
                          <Badge variant={getPriorityColor(comm.priority) as any}>
                            {comm.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {comm.subject && (
                        <div className="font-medium text-sm">{comm.subject}</div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        {comm.message}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getMessageTypeIcon(comm.messageType)}
                          <span className="capitalize">{comm.messageType.replace('_', ' ')}</span>
                        </div>
                        <span>{new Date(comm.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {communications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No communications found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent">
          <Card>
            <CardHeader>
              <CardTitle>Agent-to-Agent Communications</CardTitle>
              <CardDescription>Internal agent coordination messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentToAgent.map((comm) => (
                  <div key={comm.id} className="p-4 border rounded-lg border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comm.fromAgentCode}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-sm">{comm.toAgentCode}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {comm.messageType.replace('_', ' ')}
                      </Badge>
                    </div>
                    {comm.subject && <div className="font-medium text-sm mb-1">{comm.subject}</div>}
                    <div className="text-sm text-muted-foreground">{comm.message}</div>
                  </div>
                ))}
                {agentToAgent.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No agent-to-agent communications
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="to-user">
          <Card>
            <CardHeader>
              <CardTitle>Agent to User</CardTitle>
              <CardDescription>Messages from agents to users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No agent-to-user messages yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="from-user">
          <Card>
            <CardHeader>
              <CardTitle>User to Agent</CardTitle>
              <CardDescription>User commands and requests to agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No user-to-agent messages yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </SelfHealingErrorBoundary>
  );
}
