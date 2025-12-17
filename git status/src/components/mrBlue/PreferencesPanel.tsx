import { useState } from 'react';
import { useQuery, useMutation } from '@tantml:react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Trash2, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface UserPreference {
  id: number;
  category: string;
  key: string;
  value: string;
  confidence: number;
  context: string;
  extractedAt: string;
}

const PREFERENCE_CATEGORIES = [
  'all',
  'ui_preferences',
  'workflow_preferences',
  'communication_style',
  'technical_preferences',
  'feature_usage'
];

export function PreferencesPanel() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPreference, setNewPreference] = useState({
    category: 'ui_preferences',
    key: '',
    value: '',
    confidence: 1.0,
    context: 'Manually added'
  });

  // Query: Get all preferences
  const { data: preferences = [], isLoading } = useQuery<UserPreference[]>({
    queryKey: ['/api/mrblue/preferences', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await fetch(`/api/mrblue/preferences${params}`);
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    }
  });

  // Mutation: Add preference
  const addMutation = useMutation({
    mutationFn: async (pref: typeof newPreference) => {
      return await apiRequest('/api/mrblue/preferences', {
        method: 'POST',
        body: pref
      });
    },
    onSuccess: () => {
      toast({
        title: 'Preference Added',
        description: 'Your preference has been saved successfully.',
      });
      setShowAddForm(false);
      setNewPreference({
        category: 'ui_preferences',
        key: '',
        value: '',
        confidence: 1.0,
        context: 'Manually added'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/preferences'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Add Preference',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation: Delete preference
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/mrblue/preferences/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Preference Deleted',
        description: 'The preference has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/preferences'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Delete',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Mutation: Extract preferences from recent interactions
  const extractMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/mrblue/preferences/extract', {
        method: 'POST',
        body: { interactionText: 'Auto-extract from recent conversations' }
      });
    },
    onSuccess: (data) => {
      if (data.preferences && data.preferences.length > 0) {
        toast({
          title: 'Preferences Extracted',
          description: `Discovered ${data.preferences.length} new preferences from your interactions.`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/mrblue/preferences'] });
      } else {
        toast({
          title: 'No New Preferences',
          description: 'No new preferences were detected from recent interactions.',
        });
      }
    }
  });

  const handleAddPreference = () => {
    if (!newPreference.key || !newPreference.value) {
      toast({
        title: 'Invalid Input',
        description: 'Please provide both key and value for the preference.',
        variant: 'destructive',
      });
      return;
    }
    addMutation.mutate(newPreference);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredPreferences = preferences.filter(pref =>
    selectedCategory === 'all' || pref.category === selectedCategory
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden" data-testid="panel-preferences">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6" />
              User Preferences
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              AI-learned preferences from your interactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => extractMutation.mutate()}
              disabled={extractMutation.isPending}
              data-testid="button-extract-preferences"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {extractMutation.isPending ? 'Extracting...' : 'Auto-Extract'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              data-testid="button-add-preference"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREFERENCE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Add Form */}
          {showAddForm && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Add New Preference</CardTitle>
                <CardDescription>Manually add a preference to your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newPreference.category}
                      onValueChange={(value) => setNewPreference(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger data-testid="select-new-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PREFERENCE_CATEGORIES.filter(c => c !== 'all').map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Key</Label>
                    <Input
                      placeholder="e.g., theme_preference"
                      value={newPreference.key}
                      onChange={(e) => setNewPreference(prev => ({ ...prev, key: e.target.value }))}
                      data-testid="input-preference-key"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    placeholder="e.g., dark"
                    value={newPreference.value}
                    onChange={(e) => setNewPreference(prev => ({ ...prev, value: e.target.value }))}
                    data-testid="input-preference-value"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPreference} disabled={addMutation.isPending} data-testid="button-save-preference">
                    {addMutation.isPending ? 'Saving...' : 'Save Preference'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} data-testid="button-cancel-add">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Detected Preferences ({filteredPreferences.length})
              </CardTitle>
              <CardDescription>
                Preferences learned from your interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredPreferences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Brain className="h-8 w-8 mb-2" />
                    <p className="text-sm">No preferences detected yet</p>
                    <p className="text-xs mt-1">Try using Auto-Extract to discover preferences</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPreferences.map((pref, index) => (
                      <div key={pref.id}>
                        {index > 0 && <Separator className="my-2" />}
                        <div
                          className="flex items-start justify-between gap-4 p-3 rounded-md hover-elevate"
                          data-testid={`preference-${pref.id}`}
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{pref.key}</p>
                              <Badge variant="secondary">{pref.category.replace(/_/g, ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{pref.value}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{pref.context}</span>
                              <span>•</span>
                              <span>{new Date(pref.extractedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getConfidenceColor(pref.confidence)}`} />
                              <span className="text-xs text-muted-foreground">{(pref.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMutation.mutate(pref.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${pref.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
      </div>
    </div>
  );
}
