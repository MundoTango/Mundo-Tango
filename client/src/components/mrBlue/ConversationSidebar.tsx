import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: number;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}

interface ConversationSidebarProps {
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/mrblue/conversations'],
  });

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await apiRequest(`/api/mrblue/conversations/${id}`, {
        method: 'DELETE',
      });

      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/conversations'] });

      if (currentConversationId === id) {
        onNewConversation();
      }

      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed.',
      });
    } catch (error) {
      console.error('[ConversationSidebar] Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <Button
          onClick={onNewConversation}
          className="w-full"
          data-testid="button-new-conversation"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading conversations...
            </div>
          )}

          {!isLoading && conversations && conversations.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet. Start a new chat!
            </div>
          )}

          {conversations?.map((conv) => (
            <div
              key={conv.id}
              className={`group relative hover-elevate active-elevate-2 rounded-md ${
                currentConversationId === conv.id ? 'bg-accent' : ''
              }`}
              data-testid={`conversation-${conv.id}`}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-left p-3 h-auto no-default-hover-elevate no-default-active-elevate"
                onClick={() => onSelectConversation(conv.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">
                    {conv.title || 'Untitled Conversation'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </div>
                </div>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                data-testid={`button-delete-conversation-${conv.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
