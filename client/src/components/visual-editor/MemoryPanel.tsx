/**
 * Memory Panel - Long-term conversation memory UI
 * 
 * Features:
 * - Semantic memory search
 * - Recent conversations display
 * - Memory statistics
 * - GDPR-compliant export/delete
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, Search, Clock, Download, Trash2, Loader2, 
  AlertCircle, Info, TrendingUp, MessageSquare 
} from 'lucide-react';

interface Memory {
  memory: {
    id: string;
    content: string;
    memoryType: string;
    importance: number;
    createdAt: number;
    metadata: Record<string, any>;
  };
  similarity: number;
}

interface MemoryStats {
  totalMemories: number;
  byType: Record<string, number>;
  oldestMemory: number;
  newestMemory: number;
}

export function MemoryPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch memory statistics
  const { data: statsData, isLoading: statsLoading } = useQuery<{ success: boolean; stats: MemoryStats }>({
    queryKey: ['/api/mrblue/memory/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = statsData?.stats;

  // Fetch recent conversations
  const { data: recentData, isLoading: recentLoading } = useQuery<{ success: boolean; conversations: any[] }>({
    queryKey: ['/api/mrblue/memory/recent'],
    refetchInterval: 60000, // Refresh every minute
  });

  const recentConversations = recentData?.conversations || [];

  // Search memories mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest('POST', '/api/mrblue/memory/search', {
        query,
        limit: 10,
        minSimilarity: 0.6
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSearchResults(data.results);
        toast({
          title: "Search Complete",
          description: `Found ${data.count} relevant memories`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error.message || "Could not search memories",
      });
    },
  });

  // Export memories mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/mrblue/memory/export', {});
      return await response.json();
    },
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mr-blue-memories-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${data.totalMemories} memories`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "Could not export memories",
      });
    },
  });

  // Delete all memories mutation (GDPR)
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/mrblue/memory/all', {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/memory/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/memory/recent'] });
      setSearchResults([]);

      toast({
        title: "Memories Deleted",
        description: "All memories have been permanently deleted",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete memories",
      });
    },
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Search",
        description: "Please enter a search query",
      });
      return;
    }

    setIsSearching(true);
    searchMutation.mutate(searchQuery);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL memories? This cannot be undone.')) {
      deleteAllMutation.mutate();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMemoryTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      conversation: 'bg-blue-500/10 text-blue-500',
      preference: 'bg-purple-500/10 text-purple-500',
      fact: 'bg-green-500/10 text-green-500',
      feedback: 'bg-yellow-500/10 text-yellow-500',
      decision: 'bg-orange-500/10 text-orange-500',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="flex flex-col h-full" data-testid="memory-panel">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Memory System</h2>
          </div>
          <Badge variant="outline" className="text-xs" data-testid="memory-count">
            {stats?.totalMemories || 0} memories
          </Badge>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
              data-testid="input-memory-search"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            data-testid="button-search-memories"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          
          {/* Statistics Card */}
          {stats && (
            <Card data-testid="memory-stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statistics</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <div className="font-semibold" data-testid="stat-total">{stats.totalMemories}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Conversations</div>
                    <div className="font-semibold" data-testid="stat-conversations">{stats.byType.conversation || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Preferences</div>
                    <div className="font-semibold" data-testid="stat-preferences">{stats.byType.preference || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Facts</div>
                    <div className="font-semibold" data-testid="stat-facts">{stats.byType.fact || 0}</div>
                  </div>
                </div>
                {stats.oldestMemory > 0 && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Oldest: {formatDate(stats.oldestMemory)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card data-testid="search-results-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Search Results ({searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchResults.map((result, index) => (
                  <div 
                    key={result.memory.id} 
                    className="p-3 rounded-md bg-muted/50 space-y-2"
                    data-testid={`search-result-${index}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Badge className={getMemoryTypeColor(result.memory.memoryType)} variant="secondary">
                        {result.memory.memoryType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(result.similarity * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-sm">{result.memory.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(result.memory.createdAt)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Conversations */}
          {recentConversations.length > 0 && (
            <Card data-testid="recent-conversations-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Recent Conversations ({recentConversations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentConversations.slice(0, 5).map((conv, index) => (
                  <div 
                    key={conv.id} 
                    className="p-2 rounded-md hover-elevate active-elevate-2 border cursor-pointer"
                    data-testid={`recent-conversation-${index}`}
                  >
                    <p className="text-sm line-clamp-2">{conv.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(conv.createdAt)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert data-testid="memory-info-alert">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Memories are automatically stored from your conversations and help Mr. Blue provide more personalized assistance.
            </AlertDescription>
          </Alert>

          {/* GDPR Actions */}
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Data Management (GDPR)</h3>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              data-testid="button-export-memories"
            >
              {exportMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export All Memories
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              onClick={handleDeleteAll}
              disabled={deleteAllMutation.isPending}
              data-testid="button-delete-all-memories"
            >
              {deleteAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete All Memories
            </Button>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
