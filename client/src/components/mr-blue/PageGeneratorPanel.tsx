/**
 * PAGE GENERATOR PANEL - MR BLUE VISUAL EDITOR
 * November 20, 2025
 * 
 * Natural language page generation interface
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PageGeneratorPanel() {
  const [description, setDescription] = useState('');
  const [archetype, setArchetype] = useState<string>('auto');
  const { toast } = useToast();
  
  const generateMutation = useMutation({
    mutationFn: async (data: { description: string; type?: string }) => {
      return await apiRequest('/api/mr-blue/generate-page', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: '✅ Page Generated!',
        description: `Created ${data.page.pageName} at ${data.page.path}`,
      });
      setDescription('');
    },
    onError: (error: any) => {
      toast({
        title: '❌ Generation Failed',
        description: error.message || 'Failed to generate page',
        variant: 'destructive',
      });
    }
  });
  
  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please describe the page you want to create',
        variant: 'destructive',
      });
      return;
    }
    
    generateMutation.mutate({
      description,
      type: archetype === 'auto' ? undefined : archetype
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Page Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe your page</label>
          <Textarea
            data-testid="input-page-description"
            placeholder="Example: Create an events gallery page with card-based layout and filter by date"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={generateMutation.isPending}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Page Type (Optional)</label>
          <Select value={archetype} onValueChange={setArchetype}>
            <SelectTrigger data-testid="select-page-archetype">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">🎯 Auto-detect</SelectItem>
              <SelectItem value="data-display">📊 Data Display (List/Gallery)</SelectItem>
              <SelectItem value="form">📝 Form (Create/Edit)</SelectItem>
              <SelectItem value="detail">🔍 Detail View</SelectItem>
              <SelectItem value="admin">⚙️ Admin Dashboard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {generateMutation.isPending && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-md">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Generating page with AI...</span>
          </div>
        )}
        
        {generateMutation.isSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Page generated successfully!</span>
          </div>
        )}
        
        {generateMutation.isError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Generation failed. Please try again.</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          data-testid="button-generate-page"
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !description.trim()}
          className="w-full"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Page
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
