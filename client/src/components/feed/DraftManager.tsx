import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Trash2, Clock, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Draft {
  id: number;
  content: string;
  richContent?: any;
  lastSaved: string;
  createdAt: string;
}

interface DraftManagerProps {
  currentDraft: {
    content: string;
    richContent?: any;
    mediaGallery?: any;
    videoUrl?: string;
    mentions?: string[];
    hashtags?: string[];
    tags?: string[];
    location?: string;
    coordinates?: any;
  };
  onLoadDraft: (draft: Draft) => void;
  onAutoSave: () => void;
  autoSaveInterval?: number;
  className?: string;
}

export function DraftManager({ 
  currentDraft, 
  onLoadDraft, 
  onAutoSave,
  autoSaveInterval = 30000,
  className = "" 
}: DraftManagerProps) {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeDraftId, setActiveDraftId] = useState<number | null>(null);

  // Fetch user's drafts
  const { data: drafts, isLoading } = useQuery<Draft[]>({
    queryKey: ['/api/posts/drafts'],
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (activeDraftId) {
        return apiRequest(`/api/posts/drafts/${activeDraftId}`, {
          method: 'PUT',
          body: JSON.stringify(currentDraft),
        });
      } else {
        return apiRequest('/api/posts/drafts', {
          method: 'POST',
          body: JSON.stringify(currentDraft),
        });
      }
    },
    onSuccess: (data) => {
      if (!activeDraftId && data.id) {
        setActiveDraftId(data.id);
      }
      setLastSaved(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/posts/drafts'] });
      
      // Save to localStorage as backup
      localStorage.setItem('post_draft', JSON.stringify({
        ...currentDraft,
        lastSaved: new Date().toISOString(),
      }));
    },
    onError: (error) => {
      console.error('Error saving draft:', error);
      toast({
        title: "Failed to save draft",
        description: "Your draft was saved locally but couldn't sync to server",
        variant: "destructive",
      });
      
      // Save to localStorage as fallback
      localStorage.setItem('post_draft', JSON.stringify({
        ...currentDraft,
        lastSaved: new Date().toISOString(),
      }));
      setLastSaved(new Date());
    },
  });

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: number) => {
      return apiRequest(`/api/posts/drafts/${draftId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/drafts'] });
      toast({
        title: "Draft deleted",
        description: "Your draft has been removed",
      });
    },
  });

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentDraft.content && currentDraft.content.length > 0) {
        saveDraftMutation.mutate();
        onAutoSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [currentDraft, autoSaveInterval]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('post_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.content && draft.content.length > 0) {
          const shouldRestore = window.confirm(
            'You have an unsaved draft. Would you like to restore it?'
          );
          if (shouldRestore) {
            onLoadDraft(draft);
          } else {
            localStorage.removeItem('post_draft');
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('post_draft');
      }
    }
  }, []);

  const handleLoadDraft = (draft: Draft) => {
    onLoadDraft(draft);
    setActiveDraftId(draft.id);
  };

  const handleDeleteDraft = (draftId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteDraftMutation.mutate(draftId);
      if (activeDraftId === draftId) {
        setActiveDraftId(null);
      }
    }
  };

  return (
    <div className={className}>
      {/* Auto-save status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveDraftMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving draft...</span>
            </>
          ) : lastSaved ? (
            <>
              <Clock className="h-4 w-4" />
              <span data-testid="text-last-saved">
                Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
              </span>
            </>
          ) : null}
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => saveDraftMutation.mutate()}
          disabled={saveDraftMutation.isPending || !currentDraft.content}
          data-testid="button-save-draft"
        >
          Save Draft
        </Button>
      </div>

      {/* Saved drafts list */}
      {drafts && drafts.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Saved Drafts
          </h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {drafts.map((draft) => (
                <Card
                  key={draft.id}
                  className={`p-3 cursor-pointer hover-elevate ${
                    activeDraftId === draft.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleLoadDraft(draft)}
                  data-testid={`card-draft-${draft.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {draft.content.substring(0, 50)}
                        {draft.content.length > 50 ? '...' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(draft.lastSaved), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => handleDeleteDraft(draft.id, e)}
                      className="h-8 w-8 shrink-0"
                      data-testid={`button-delete-draft-${draft.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
