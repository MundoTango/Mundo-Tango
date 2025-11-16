import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Send,
  Users,
  Facebook,
  Link2,
  Unlink,
  Clock,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MessengerConnection {
  pageId: string;
  pageName: string;
  isActive: boolean;
  connectedAt: string;
  lastSyncAt: string | null;
}

interface Conversation {
  conversationId: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface ConnectionStatus {
  success: boolean;
  connected: boolean;
  connection: MessengerConnection | null;
}

export function MessengerIntegration() {
  const { toast } = useToast();
  
  // State
  const [pageId, setPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [inviteMessage, setInviteMessage] = useState(
    "Hi! I'm inviting you to connect with Mr Blue, our AI assistant. Looking forward to chatting! 🤖"
  );
  const [userFacebookId, setUserFacebookId] = useState("");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Fetch connection status
  const { data: statusData, isLoading: statusLoading } = useQuery<ConnectionStatus>({
    queryKey: ['/api/mrblue/messenger/status'],
  });

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery<{
    success: boolean;
    conversations: Conversation[];
    connection: MessengerConnection;
  }>({
    queryKey: ['/api/mrblue/messenger/conversations'],
    enabled: statusData?.connected === true,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Connect page mutation
  const connectMutation = useMutation({
    mutationFn: async (data: { pageId: string; pageName: string; accessToken: string }) => {
      return apiRequest('/api/mrblue/messenger/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Connected!",
        description: `Successfully connected ${pageName} to Mr Blue Messenger`,
      });
      setIsConnectDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations'] });
      
      // Show verify token for webhook setup
      toast({
        title: "Webhook Setup",
        description: `Verify Token: ${data.verifyToken}`,
        duration: 10000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Facebook page",
        variant: "destructive",
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/mrblue/messenger/disconnect', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: "Facebook page has been disconnected from Mr Blue",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect page",
        variant: "destructive",
      });
    },
  });

  // Send invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (data: { userFacebookId: string; inviteMessage: string }) => {
      return apiRequest('/api/mrblue/messenger/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Invite Sent!",
        description: "Successfully sent invitation via Messenger",
      });
      setIsInviteDialogOpen(false);
      setUserFacebookId("");
    },
    onError: (error: any) => {
      toast({
        title: "Invite Failed",
        description: error.message || "Failed to send invite",
        variant: "destructive",
      });
    },
  });

  // Handle connect form submit
  const handleConnect = () => {
    if (!pageId || !pageName || !accessToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    connectMutation.mutate({ pageId, pageName, accessToken });
  };

  // Handle invite submit
  const handleSendInvite = () => {
    if (!userFacebookId || !inviteMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate({ userFacebookId, inviteMessage });
  };

  const isConnected = statusData?.connected === true;
  const connection = statusData?.connection;

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-500" />
              <CardTitle>Facebook Messenger Integration</CardTitle>
            </div>
            {isConnected && (
              <Badge variant="default" className="gap-1" data-testid="badge-connection-status">
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
          <CardDescription>
            Connect your Facebook page to receive and send messages through Mr Blue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              {/* Connected Page Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{connection?.pageName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    Connected {new Date(connection?.connectedAt || '').toLocaleDateString()}
                  </span>
                </div>
                {connection?.lastSyncAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    <span>
                      Last sync: {new Date(connection.lastSyncAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="gap-2" data-testid="button-send-invite">
                      <Send className="h-4 w-4" />
                      Send Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Messenger Invite</DialogTitle>
                      <DialogDescription>
                        Send an invitation to connect with Mr Blue
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook-id">Facebook User ID</Label>
                        <Input
                          id="facebook-id"
                          placeholder="e.g., 123456789"
                          value={userFacebookId}
                          onChange={(e) => setUserFacebookId(e.target.value)}
                          data-testid="input-facebook-id"
                        />
                        <p className="text-xs text-muted-foreground">
                          You can find this in the Facebook profile URL or by asking the user
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="invite-message">Invitation Message</Label>
                        <Textarea
                          id="invite-message"
                          rows={4}
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          data-testid="textarea-invite-message"
                        />
                      </div>
                      <Button
                        onClick={handleSendInvite}
                        disabled={inviteMutation.isPending}
                        className="w-full gap-2"
                        data-testid="button-confirm-send-invite"
                      >
                        {inviteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Send className="h-4 w-4" />
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="gap-2"
                  data-testid="button-disconnect"
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Unlink className="h-4 w-4" />
                  )}
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Not Connected */}
              <div className="text-center space-y-4 py-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-muted p-4">
                    <Facebook className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">No Facebook Page Connected</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect your Facebook page to enable two-way messaging with Mr Blue. 
                    Users will be able to message your page and receive AI-powered responses.
                  </p>
                </div>
                <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-connect-page">
                      <Link2 className="h-4 w-4" />
                      Connect Facebook Page
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Facebook Page</DialogTitle>
                      <DialogDescription>
                        Enter your Facebook page details to enable Messenger integration
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="page-id">Page ID</Label>
                        <Input
                          id="page-id"
                          placeholder="e.g., 123456789012345"
                          value={pageId}
                          onChange={(e) => setPageId(e.target.value)}
                          data-testid="input-page-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="page-name">Page Name</Label>
                        <Input
                          id="page-name"
                          placeholder="e.g., @mundotango1"
                          value={pageName}
                          onChange={(e) => setPageName(e.target.value)}
                          data-testid="input-page-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="access-token">Page Access Token</Label>
                        <Textarea
                          id="access-token"
                          placeholder="Paste your Facebook Page Access Token here"
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value)}
                          rows={3}
                          data-testid="textarea-access-token"
                        />
                        <p className="text-xs text-muted-foreground">
                          Get this from Facebook Developer Console → Your App → Messenger → Settings
                        </p>
                      </div>
                      <Button
                        onClick={handleConnect}
                        disabled={connectMutation.isPending}
                        className="w-full gap-2"
                        data-testid="button-confirm-connect"
                      >
                        {connectMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Link2 className="h-4 w-4" />
                        Connect Page
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Conversations List */}
      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Active Conversations</CardTitle>
            </div>
            <CardDescription>
              Recent messages from your Facebook page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversationsData?.conversations && conversationsData.conversations.length > 0 ? (
              <div className="space-y-2">
                {conversationsData.conversations.map((conv) => (
                  <div
                    key={conv.conversationId}
                    className="flex items-start justify-between p-4 rounded-lg border hover-elevate active-elevate-2"
                    data-testid={`conversation-${conv.conversationId}`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Facebook className="h-3 w-3" />
                          {conv.conversationId}
                        </Badge>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default">{conv.unreadCount} new</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Messages will appear here when users contact your page</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to complete the Messenger integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Create a Facebook App in the{" "}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Facebook Developer Console
              </a>
            </li>
            <li>Add the Messenger product to your app</li>
            <li>Generate a Page Access Token for your Facebook page</li>
            <li>Connect your page using the button above</li>
            <li>
              Configure webhook in Facebook Developer Console:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Callback URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://your-domain.com/api/mrblue/messenger/webhook</code></li>
                <li>Verify Token: (shown after connecting)</li>
                <li>Subscribe to: messages, messaging_postbacks, message_deliveries, message_reads</li>
              </ul>
            </li>
            <li>Save and test your webhook</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
