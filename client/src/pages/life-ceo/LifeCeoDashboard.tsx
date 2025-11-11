import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, Heart, DollarSign, Users, Book, Palette, 
  Home, Plane, Sun, Tv, Clock, Dumbbell, Apple, Moon, Shield, Target,
  MessageSquare, Sparkles, TrendingUp, Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const iconMap: Record<string, any> = {
  briefcase: Briefcase,
  heart: Heart,
  'dollar-sign': DollarSign,
  users: Users,
  book: Book,
  palette: Palette,
  home: Home,
  plane: Plane,
  sun: Sun,
  tv: Tv,
  clock: Clock,
  dumbbell: Dumbbell,
  apple: Apple,
  moon: Moon,
  shield: Shield,
  target: Target,
};

interface Agent {
  id: string;
  name: string;
  domain: string;
  icon: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
}

interface DailyInsight {
  agentId: string;
  agentName: string;
  domain: string;
  insight: string;
  priority: 'high' | 'medium' | 'low';
}

export default function LifeCeoDashboard() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/life-ceo/agents'],
  });

  const { data: dailyInsights = [], isLoading: insightsLoading } = useQuery<DailyInsight[]>({
    queryKey: ['/api/life-ceo/insights/daily'],
  });

  const handleSendMessage = async () => {
    if (!selectedAgent || !chatMessage.trim()) return;

    const newMessage = { role: 'user', content: chatMessage };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setChatMessage("");

    try {
      const res = await apiRequest('POST', `/api/life-ceo/agents/${selectedAgent.id}/chat`, {
        message: chatMessage,
        conversationHistory: chatHistory,
      });

      const response = await res.json();
      const assistantMessage = { role: 'assistant', content: response.response };
      setChatHistory([...updatedHistory, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    if (priority === 'medium') return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Life CEO
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your personal AI team of 16 specialized agents to help you excel in every area of life
          </p>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="agents" data-testid="tab-agents">
              <Sparkles className="h-4 w-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">
              <TrendingUp className="h-4 w-4 mr-2" />
              Daily Insights
            </TabsTrigger>
            <TabsTrigger value="chat" data-testid="tab-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            {agentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(16)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-32 bg-muted" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((agent) => {
                  const IconComponent = iconMap[agent.icon] || Target;
                  return (
                    <Card
                      key={agent.id}
                      data-testid={`card-agent-${agent.id}`}
                      className="group hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 border-2 hover:border-primary/50"
                      onClick={() => setSelectedAgent(agent)}
                      style={{
                        borderTopColor: agent.color,
                        borderTopWidth: '4px',
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div
                            className="p-2.5 rounded-xl shrink-0 shadow-md"
                            style={{
                              background: `linear-gradient(135deg, ${agent.color}15, ${agent.color}30)`,
                              border: `1px solid ${agent.color}40`,
                            }}
                          >
                            <IconComponent
                              className="h-6 w-6"
                              style={{ color: agent.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate">
                              {agent.name}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 line-clamp-1">
                              {agent.domain}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1.5">
                          {agent.capabilities.slice(0, 3).map((cap) => (
                            <Badge
                              key={cap}
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              {cap.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{agent.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights">
            {insightsLoading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-muted" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {dailyInsights.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        No daily insights yet. Start chatting with agents to build personalized recommendations!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  dailyInsights.map((insight, index) => (
                    <Card
                      key={`${insight.agentId}-${index}`}
                      data-testid={`card-insight-${insight.agentId}`}
                      className="hover-elevate transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">{insight.agentName}</CardTitle>
                            <CardDescription>{insight.domain}</CardDescription>
                          </div>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {insight.insight}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            {!selectedAgent ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium text-center mb-2">Select an Agent to Chat</p>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose one of the 16 specialized agents from the Agents tab to start a personalized conversation
                  </p>
                  <Button
                    className="mt-6"
                    onClick={() => {
                      const tabs = document.querySelector('[value="agents"]');
                      if (tabs instanceof HTMLElement) tabs.click();
                    }}
                    data-testid="button-select-agent"
                  >
                    Browse Agents
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const IconComponent = iconMap[selectedAgent.icon] || Target;
                          return (
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                background: `linear-gradient(135deg, ${selectedAgent.color}15, ${selectedAgent.color}30)`,
                              }}
                            >
                              <IconComponent
                                className="h-5 w-5"
                                style={{ color: selectedAgent.color }}
                              />
                            </div>
                          );
                        })()}
                        <div>
                          <CardTitle>{selectedAgent.name}</CardTitle>
                          <CardDescription>{selectedAgent.domain}</CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAgent(null);
                          setChatHistory([]);
                        }}
                        data-testid="button-close-chat"
                      >
                        Change Agent
                      </Button>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-6">
                      {chatHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            Start a conversation with {selectedAgent.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatHistory.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              data-testid={`message-${msg.role}-${i}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                  msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                  <Separator />
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Ask ${selectedAgent.name} anything...`}
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 px-4 py-2 rounded-lg border bg-background"
                        data-testid="input-chat-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        data-testid="button-send-message"
                      >
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Agent Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedAgent.capabilities.map((cap) => (
                        <Badge
                          key={cap}
                          variant="outline"
                          className="w-full justify-start text-xs"
                        >
                          {cap.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
