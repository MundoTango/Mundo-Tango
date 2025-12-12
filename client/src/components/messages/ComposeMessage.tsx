import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface UserResult {
  id: string;
  type: string;
  display: string;
  name: string;
  username: string;
  avatar: string | null;
  subtitle: string;
}

interface SelectedUser {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
}

interface ComposeMessageProps {
  onClose?: () => void;
  onSendSuccess?: (data: { 
    to: string; 
    recipientId: number;
    recipientName: string;
    recipientAvatar: string | null;
    channel: string; 
    body: string 
  }) => void;
}

export function ComposeMessage({ onClose, onSendSuccess }: ComposeMessageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["/api/mentions/users/search", { q: debouncedQuery }],
    enabled: debouncedQuery.length >= 2 && !selectedUser,
    select: (data: any) => data?.data || [],
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMutation = useMutation({
    mutationFn: async (data: { recipientId: number; content: string }) => {
      return apiRequest("POST", "/api/messages/send", data);
    },
    onSuccess: (response) => {
      toast({
        title: "Message sent",
        description: `Your message to ${selectedUser?.name} was sent successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unified"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      
      if (selectedUser) {
        onSendSuccess?.({ 
          to: selectedUser.username, 
          recipientId: selectedUser.id,
          recipientName: selectedUser.name,
          recipientAvatar: selectedUser.avatar,
          channel: "mt", 
          body: messageBody 
        });
      }
      
      setSelectedUser(null);
      setMessageBody("");
      setSearchQuery("");
      onClose?.();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message,
      });
    },
  });

  const handleSelectUser = (user: UserResult) => {
    const userId = parseInt(user.id.replace("user_", ""));
    setSelectedUser({
      id: userId,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
    });
    setSearchQuery("");
    setShowResults(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!selectedUser || !messageBody.trim()) return;
    sendMutation.mutate({
      recipientId: selectedUser.id,
      content: messageBody.trim(),
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-4 space-y-4" data-testid="compose-message-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">New Message</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-compose"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">To:</label>
          {selectedUser ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">@{selectedUser.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={handleClearUser}
                data-testid="button-clear-recipient"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search for a user..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                data-testid="input-recipient-search"
              />
              
              {showResults && debouncedQuery.length >= 2 && (
                <div 
                  ref={resultsRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden"
                >
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Searching...</span>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <ScrollArea className="max-h-64">
                      {searchResults.map((user: UserResult) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-3 cursor-pointer hover-elevate"
                          onClick={() => handleSelectUser(user)}
                          data-testid={`user-result-${user.id}`}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message:</label>
          <Textarea
            placeholder="Write your message..."
            className="min-h-[120px] resize-none"
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                handleSend();
              }
            }}
            data-testid="textarea-message"
          />
          <p className="text-xs text-muted-foreground">Press Cmd+Enter to send</p>
        </div>

        <div className="flex justify-end gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!selectedUser || !messageBody.trim() || sendMutation.isPending}
            data-testid="button-send"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
