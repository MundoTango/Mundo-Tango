import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Trash2, Download, Upload, Database, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';

interface ContextItem {
  id: string;
  category: string;
  content: string;
  source: string;
  timestamp: Date;
  usage: number;
}

interface ConversationHistory {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
}

export default function ContextMemoryPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: contextItems, isLoading: itemsLoading } = useQuery<ContextItem[]>({
    queryKey: ['/api/mrblue/context', { search, category: selectedCategory }],
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationHistory[]>({
    queryKey: ['/api/mrblue/context/history'],
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest(`/api/mrblue/context/${itemId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/context'] });
      toast({
        title: 'Item Deleted',
        description: 'Context item has been removed.',
      });
    },
  });

  const clearCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return apiRequest(`/api/mrblue/context/clear/${category}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/context'] });
      toast({
        title: 'Category Cleared',
        description: 'All items in this category have been removed.',
      });
    },
  });

  const exportContext = () => {
    const data = JSON.stringify(contextItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mrblue-context-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const categories = ['all', 'code', 'preferences', 'tasks', 'conversations', 'documents'];

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, any> = {
      code: 'default',
      preferences: 'secondary',
      tasks: 'outline',
      conversations: 'default',
      documents: 'secondary',
    };
    return <Badge variant={colors[category] || 'outline'}>{category}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-6" data-testid="page-context-memory">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Context Memory Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage Mr Blue's knowledge base and conversation history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportContext} data-testid="button-export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" data-testid="button-import">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="knowledge" className="space-y-4">
        <TabsList>
          <TabsTrigger value="knowledge" data-testid="tab-knowledge">
            <Database className="h-4 w-4 mr-2" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="conversations" data-testid="tab-conversations">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversation History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="space-y-4">
          <Card data-testid="card-search-filter">
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search context..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      data-testid={`button-category-${cat}`}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-context-items">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <Brain className="h-5 w-5 inline mr-2" />
                    Stored Context ({contextItems?.length || 0})
                  </CardTitle>
                  <CardDescription>RAG knowledge base and learned preferences</CardDescription>
                </div>
                {selectedCategory !== 'all' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => clearCategoryMutation.mutate(selectedCategory)}
                    data-testid="button-clear-category"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear {selectedCategory}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {contextItems?.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border space-y-2"
                      data-testid={`context-item-${item.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryBadge(item.category)}
                            <Badge variant="outline" data-testid={`badge-usage-${item.id}`}>
                              Used {item.usage}x
                            </Badge>
                          </div>
                          <p className="text-sm">{item.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Source: {item.source}</span>
                            <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card data-testid="card-conversation-history">
            <CardHeader>
              <CardTitle>
                <MessageSquare className="h-5 w-5 inline mr-2" />
                Recent Conversations ({conversations?.length || 0})
              </CardTitle>
              <CardDescription>Your conversation history with Mr Blue</CardDescription>
            </CardHeader>
            <CardContent>
              {conversationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations?.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-4 rounded-lg border space-y-3"
                      data-testid={`conversation-${conv.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline">You</Badge>
                          <p className="text-sm flex-1">{conv.query}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="default">Mr Blue</Badge>
                          <p className="text-sm flex-1 text-muted-foreground">{conv.response}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
