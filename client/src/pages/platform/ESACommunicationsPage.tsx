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
import { SelfHealingErrorBoundary } from "@/components/SelfHealingErrorBoundary";
import { useState } from "react";
import { motion } from "framer-motion";

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
      {/* Hero Section - 16:9 Aspect Ratio */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-green-500/20">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
          >
            <Badge variant="outline" className="mb-4 text-white border-white/30 bg-white/10 backdrop-blur-sm">
              <MessageSquare className="w-4 h-4 mr-2 inline" />
              Communication Network
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white font-bold leading-tight" data-testid="text-page-title">
              Inter-Agent Communications
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              H2A · A2A · A2H Message Logs and Communication Graph
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { title: "Total Messages", value: stats?.totalMessages?.toLocaleString() || 0, subtitle: "All channels", icon: MessageSquare, testId: "text-total-messages" },
              { title: "H2A Messages", value: stats?.h2aMessages || 0, subtitle: "Human to Agent", icon: User, testId: "text-h2a-messages", color: "text-blue-600" },
              { title: "A2A Messages", value: stats?.a2aMessages || 0, subtitle: "Agent to Agent", icon: Bot, testId: "text-a2a-messages", color: "text-purple-600" },
              { title: "Active Conversations", value: stats?.activeConversations || 0, subtitle: `${stats?.messagesPerHour || 0} msg/hr`, icon: Activity, testId: "text-active-conversations" }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="hover-elevate">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className={`text-3xl font-serif font-bold ${stat.color || ''}`} data-testid={stat.testId}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages, agents, or users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-messages"
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
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
                <Card className="hover-elevate">
                  <CardHeader className="p-8">
                    <CardTitle className="text-3xl font-serif font-bold">Communication Log</CardTitle>
                    <CardDescription className="text-base mt-2">
                      All inter-agent and human-agent communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {commsLoading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Loading communications...
                      </div>
                    ) : filteredCommunications.length > 0 ? (
                      <div className="space-y-4">
                        {filteredCommunications.map((comm, index) => (
                          <motion.div
                            key={comm.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Card 
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
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-muted-foreground">
                        <MessageSquare className="mx-auto h-16 w-16 mb-6 opacity-50" />
                        <p className="text-lg font-medium">No communications found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {['h2a', 'a2a', 'a2h'].map((type) => (
                <TabsContent key={type} value={type} className="mt-6">
                  <Card className="hover-elevate">
                    <CardHeader className="p-8">
                      <CardTitle className="text-3xl font-serif font-bold uppercase">{type} Communications</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {type === 'h2a' && 'Human to Agent messages'}
                        {type === 'a2a' && 'Agent to Agent messages'}
                        {type === 'a2h' && 'Agent to Human messages'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="text-center py-16 text-muted-foreground">
                        Filtered view for {type.toUpperCase()} communications
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* Communication Graph Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <Card className="hover-elevate">
              <CardHeader className="p-8">
                <CardTitle className="text-3xl font-serif font-bold">Communication Graph</CardTitle>
                <CardDescription className="text-base mt-2">
                  Visual representation of agent communication patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-96 bg-gradient-to-br from-muted/20 to-muted/50 rounded-xl flex items-center justify-center border border-border">
                  <div className="text-center space-y-4">
                    <Activity className="mx-auto h-20 w-20 text-primary/50 animate-pulse" />
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-2">Interactive Graph Coming Soon</h3>
                      <p className="text-base text-muted-foreground max-w-md mx-auto">
                        Real-time visualization of agent communication networks with D3.js or Cytoscape
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
    </SelfHealingErrorBoundary>
  );
}
