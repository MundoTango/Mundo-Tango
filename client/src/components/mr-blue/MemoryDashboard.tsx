import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Brain, Search, Filter, Trash2, Clock, Star, MessageSquare, Settings, BarChart3 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

interface Memory {
  id: number;
  userId: number;
  content: string;
  memoryType: 'conversation' | 'preference' | 'fact' | 'feedback' | 'decision';
  importance: number;
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
}

interface ConversationSummary {
  id: number;
  userId: number;
  startTime: string;
  endTime: string;
  summary: string;
  messageCount: number;
  topics: string[];
  createdAt: string;
}

interface UserPreference {
  id: number;
  userId: number;
  preferenceKey: string;
  preferenceValue: string;
  confidence: number;
  extractedFrom: string;
  updatedAt: string;
}

interface MemoryStats {
  totalMemories: number;
  memoryBreakdown: Record<string, number>;
  totalConversations: number;
  totalPreferences: number;
  avgImportance: number;
  recentActivity: number;
}

export function MemoryDashboard() {
  const [activeTab, setActiveTab] = useState<string>('memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [memoryTypeFilter, setMemoryTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  // Fetch memories with search
  const { data: memories = [], isLoading: memoriesLoading } = useQuery<Memory[]>({
    queryKey: ['/api/mrblue/memory/search', searchQuery, memoryTypeFilter],
    enabled: activeTab === 'memories' && (searchQuery.length > 0 || memoryTypeFilter !== 'all'),
  });

  // Fetch recent conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationSummary[]>({
    queryKey: ['/api/mrblue/memory/recent'],
    enabled: activeTab === 'conversations',
  });

  // Fetch preferences
  const { data: preferences = [], isLoading: preferencesLoading } = useQuery<UserPreference[]>({
    queryKey: ['/api/mrblue/memory/preferences'],
    enabled: activeTab === 'preferences',
  });

  // Fetch memory stats
  const { data: stats } = useQuery<MemoryStats>({
    queryKey: ['/api/mrblue/memory/stats'],
  });

  // Delete memory mutation
  const deleteMutation = useMutation({
    mutationFn: async (memoryId: number) => {
      return await apiRequest(`/api/mrblue/memory/${memoryId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/memory/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/memory/stats'] });
      toast({
        title: "Memory deleted",
        description: "The memory has been permanently removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete memory. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/memory/search'] });
    }
  };

  const handleDeleteMemory = (memoryId: number) => {
    if (confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      deleteMutation.mutate(memoryId);
    }
  };

  const getMemoryTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      conversation: 'default',
      preference: 'secondary',
      fact: 'outline',
      feedback: 'outline',
      decision: 'outline',
    };
    return colors[type] || 'default';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            Mr Blue Memory System
          </CardTitle>
          <CardDescription>
            Long-term memory, preferences, and conversation history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Memories</div>
                <div className="text-2xl font-bold">{stats.totalMemories}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Conversations</div>
                <div className="text-2xl font-bold">{stats.totalConversations}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Preferences</div>
                <div className="text-2xl font-bold">{stats.totalPreferences}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Avg Importance</div>
                <div className="text-2xl font-bold">{stats.avgImportance.toFixed(1)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="memories" data-testid="tab-memories">
              <Brain className="h-4 w-4 mr-2" />
              Memories
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="conversations" data-testid="tab-conversations">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversations
            </TabsTrigger>
          </TabsList>

          {/* Memories Tab */}
          <TabsContent value="memories" className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-memory-search"
                />
                <Button onClick={handleSearch} data-testid="button-search">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={memoryTypeFilter} onValueChange={setMemoryTypeFilter}>
                <SelectTrigger className="w-40" data-testid="select-memory-type">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="conversation">Conversation</SelectItem>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="fact">Fact</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {memoriesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Searching memories...
                  </div>
                ) : memories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No memories found' : 'Enter a search query to find memories'}
                  </div>
                ) : (
                  memories.map((memory) => (
                    <Card key={memory.id} data-testid={`card-memory-${memory.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getMemoryTypeColor(memory.memoryType) as any}>
                                {memory.memoryType}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {memory.importance}/10
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteMemory(memory.id)}
                            data-testid={`button-delete-memory-${memory.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{memory.content}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Accessed {memory.accessCount} times • Last accessed {formatDistanceToNow(new Date(memory.lastAccessedAt), { addSuffix: true })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {preferencesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading preferences...
                  </div>
                ) : preferences.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No preferences extracted yet. Keep chatting with Mr Blue!
                  </div>
                ) : (
                  preferences.map((pref) => (
                    <Card key={pref.id} data-testid={`card-preference-${pref.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base">{pref.preferenceKey}</CardTitle>
                            <CardDescription className="mt-1">{pref.preferenceValue}</CardDescription>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {Math.round(pref.confidence * 100)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          Extracted from: {pref.extractedFrom} • Updated {formatDistanceToNow(new Date(pref.updatedAt), { addSuffix: true })}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {conversationsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversation summaries yet
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <Card key={conv.id} data-testid={`card-conversation-${conv.id}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-base">Conversation Summary</CardTitle>
                            <CardDescription className="mt-1">
                              {formatDistanceToNow(new Date(conv.startTime), { addSuffix: true })} • {conv.messageCount} messages
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{conv.summary}</p>
                        {conv.topics && conv.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {conv.topics.map((topic, idx) => (
                              <Badge key={idx} variant="outline">{topic}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
