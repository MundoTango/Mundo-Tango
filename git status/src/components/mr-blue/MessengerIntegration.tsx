import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Search,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Zap,
  X,
  Plus,
  ExternalLink,
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

interface Message {
  id: number;
  senderId: string;
  recipientId: string;
  message: string;
  messageType: string;
  sentAt: string;
  readAt: string | null;
  isFromPage: boolean;
}

interface Contact {
  id: string;
  name: string;
  profilePic?: string;
}

interface ConnectionStatus {
  success: boolean;
  connected: boolean;
  connection: MessengerConnection | null;
}

interface QuickReply {
  title: string;
  payload: string;
}

interface MessageButton {
  type: 'web_url' | 'postback';
  title: string;
  url?: string;
  payload?: string;
}

// OAuth Wizard Steps
enum WizardStep {
  INTRO = 0,
  CREDENTIALS = 1,
  VERIFY = 2,
  SUCCESS = 3,
}

export function MessengerIntegration() {
  const { toast } = useToast();

  // State
  const [pageId, setPageId] = useState("");
  const [pageName, setPageName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [wizardStep, setWizardStep] = useState(WizardStep.INTRO);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [buttons, setButtons] = useState<MessageButton[]>([]);
  const [newQuickReply, setNewQuickReply] = useState({ title: "", payload: "" });
  const [newButton, setNewButton] = useState<MessageButton>({ type: 'web_url', title: "", url: "" });

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
    refetchInterval: 10000,
  });

  // Fetch conversation messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery<{
    success: boolean;
    messages: Message[];
    conversationId: string;
  }>({
    queryKey: ['/api/mrblue/messenger/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation,
    refetchInterval: 5000,
  });

  // Fetch contacts
  const { data: contactsData, isLoading: contactsLoading } = useQuery<{
    success: boolean;
    contacts: Contact[];
  }>({
    queryKey: ['/api/mrblue/messenger/contacts'],
    enabled: statusData?.connected === true && showContactSelector,
  });

  // Connect page mutation
  const connectMutation = useMutation({
    mutationFn: async (data: { pageId: string; pageName: string; accessToken: string }) => {
      return apiRequest('/api/mrblue/messenger/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setWizardStep(WizardStep.SUCCESS);
      setConnectionError(null);
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations'] });

      toast({
        title: "Connected Successfully!",
        description: `${pageName} is now connected to Mr Blue Messenger`,
      });
    },
    onError: (error: any) => {
      setConnectionError(error.message || "Failed to connect Facebook page");
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
      setSelectedConversation(null);
    },
    onError: (error: any) => {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect page",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { recipientId: string; message: string }) => {
      return apiRequest('/api/mrblue/messenger/send', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations', selectedConversation, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations'] });
      toast({
        title: "Message Sent",
        description: "Your message has been delivered",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Send template message mutation
  const sendTemplateMutation = useMutation({
    mutationFn: async (data: {
      recipientId: string;
      text?: string;
      quickReplies?: QuickReply[];
      buttons?: MessageButton[];
    }) => {
      return apiRequest('/api/mrblue/messenger/send-template', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setMessageText("");
      setQuickReplies([]);
      setButtons([]);
      setShowTemplateBuilder(false);
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations', selectedConversation, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations'] });
      toast({
        title: "Template Message Sent",
        description: "Your template message has been delivered",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send template message",
        variant: "destructive",
      });
    },
  });

  const handleNextStep = () => {
    if (wizardStep === WizardStep.INTRO) {
      setWizardStep(WizardStep.CREDENTIALS);
    } else if (wizardStep === WizardStep.CREDENTIALS) {
      if (!pageId || !pageName || !accessToken) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      setWizardStep(WizardStep.VERIFY);
    }
  };

  const handlePreviousStep = () => {
    if (wizardStep > WizardStep.INTRO) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleConnect = () => {
    connectMutation.mutate({ pageId, pageName, accessToken });
  };

  const handleSendMessage = () => {
    if (!selectedConversation || !messageText.trim()) {
      toast({
        title: "Cannot Send",
        description: "Please select a conversation and enter a message",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: selectedConversation,
      message: messageText,
    });
  };

  const handleSendTemplate = () => {
    if (!selectedConversation) {
      toast({
        title: "Cannot Send",
        description: "Please select a conversation",
        variant: "destructive",
      });
      return;
    }

    sendTemplateMutation.mutate({
      recipientId: selectedConversation,
      text: messageText || undefined,
      quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
      buttons: buttons.length > 0 ? buttons : undefined,
    });
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedConversation(contactId);
    setShowContactSelector(false);
  };

  const handleAddQuickReply = () => {
    if (newQuickReply.title && newQuickReply.payload) {
      setQuickReplies([...quickReplies, newQuickReply]);
      setNewQuickReply({ title: "", payload: "" });
    }
  };

  const handleAddButton = () => {
    if (newButton.title && (newButton.type === 'web_url' ? newButton.url : newButton.payload)) {
      setButtons([...buttons, newButton]);
      setNewButton({ type: 'web_url', title: "", url: "" });
    }
  };

  const resetWizard = () => {
    setWizardStep(WizardStep.INTRO);
    setPageId("");
    setPageName("");
    setAccessToken("");
    setConnectionError(null);
    setIsWizardOpen(false);
  };

  const filteredConversations = conversationsData?.conversations?.filter(conv =>
    conv.conversationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredContacts = contactsData?.contacts?.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
            <div className="flex items-center gap-2">
              {isConnected && (
                <Badge variant="default" className="gap-1" data-testid="badge-connection-status">
                  <CheckCircle2 className="h-3 w-3" />
                  Connected
                </Badge>
              )}
              {!isConnected && (
                <Badge variant="outline" className="gap-1" data-testid="badge-connection-status">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Connect your Facebook page to receive and send messages through Mr Blue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="space-y-3">
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
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/conversations'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/mrblue/messenger/contacts'] });
                  }}
                  className="gap-2"
                  data-testid="button-refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
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
                </p>
              </div>
              <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={() => setIsWizardOpen(true)} data-testid="button-connect-page">
                    <Link2 className="h-4 w-4" />
                    Connect Facebook Page
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Connect Facebook Page</DialogTitle>
                    <DialogDescription>
                      Step {wizardStep + 1} of 4: {
                        wizardStep === WizardStep.INTRO ? "Introduction" :
                          wizardStep === WizardStep.CREDENTIALS ? "Enter Credentials" :
                            wizardStep === WizardStep.VERIFY ? "Verify Connection" : "Success"
                      }
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-2">
                    <Progress value={(wizardStep / 3) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className={wizardStep >= WizardStep.INTRO ? "text-primary font-medium" : ""}>Intro</span>
                      <span className={wizardStep >= WizardStep.CREDENTIALS ? "text-primary font-medium" : ""}>Credentials</span>
                      <span className={wizardStep >= WizardStep.VERIFY ? "text-primary font-medium" : ""}>Verify</span>
                      <span className={wizardStep >= WizardStep.SUCCESS ? "text-primary font-medium" : ""}>Complete</span>
                    </div>
                  </div>

                  <div className="space-y-4 py-4">
                    {wizardStep === WizardStep.INTRO && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                          <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="space-y-2">
                            <h4 className="font-semibold">Quick Setup</h4>
                            <p className="text-sm text-muted-foreground">
                              This wizard will guide you through connecting your Facebook page to Mr Blue.
                            </p>
                            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                              <li>A Facebook Page you manage</li>
                              <li>A Facebook Developer App with Messenger enabled</li>
                              <li>A Page Access Token from your app</li>
                            </ul>
                          </div>
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Before You Start</AlertTitle>
                          <AlertDescription>
                            Make sure you have your Facebook Page Access Token ready.
                            You can generate one from the{" "}
                            <a
                              href="https://developers.facebook.com/apps"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-medium"
                            >
                              Facebook Developer Console
                            </a>.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {wizardStep === WizardStep.CREDENTIALS && (
                      <div className="space-y-4">
                        {connectionError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Error</AlertTitle>
                            <AlertDescription>{connectionError}</AlertDescription>
                          </Alert>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="page-id">Page ID</Label>
                          <Input
                            id="page-id"
                            placeholder="e.g., 123456789012345"
                            value={pageId}
                            onChange={(e) => setPageId(e.target.value)}
                            data-testid="input-page-id"
                          />
                          <p className="text-xs text-muted-foreground">
                            Find this in your Facebook Page settings under "About"
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="page-name">Page Name (Username)</Label>
                          <Input
                            id="page-name"
                            placeholder="e.g., @mundotango1"
                            value={pageName}
                            onChange={(e) => setPageName(e.target.value)}
                            data-testid="input-page-name"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your Facebook Page username (with or without @)
                          </p>
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
                        </div>
                      </div>
                    )}

                    {wizardStep === WizardStep.VERIFY && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-muted space-y-3">
                          <h4 className="font-semibold">Review Your Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Page ID:</span>
                              <span className="font-mono">{pageId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Page Name:</span>
                              <span className="font-medium">{pageName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Token:</span>
                              <span className="font-mono text-xs">
                                {accessToken.substring(0, 10)}...{accessToken.substring(accessToken.length - 10)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {wizardStep === WizardStep.SUCCESS && (
                      <div className="text-center space-y-4 py-6">
                        <div className="flex justify-center">
                          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Successfully Connected!</h3>
                          <p className="text-sm text-muted-foreground">
                            Your Facebook page is now connected to Mr Blue Messenger
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={wizardStep === WizardStep.SUCCESS ? resetWizard : handlePreviousStep}
                      disabled={wizardStep === WizardStep.INTRO || connectMutation.isPending}
                      data-testid="button-wizard-back"
                    >
                      {wizardStep === WizardStep.SUCCESS ? 'Close' : (
                        <>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </>
                      )}
                    </Button>
                    {wizardStep !== WizardStep.SUCCESS && (
                      <Button
                        onClick={wizardStep === WizardStep.VERIFY ? handleConnect : handleNextStep}
                        disabled={connectMutation.isPending}
                        data-testid="button-wizard-next"
                      >
                        {connectMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : wizardStep === WizardStep.VERIFY ? (
                          'Connect'
                        ) : (
                          <>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messaging Interface */}
      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowContactSelector(true)}
                  className="gap-2"
                  data-testid="button-new-conversation"
                >
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                  data-testid="input-search-conversations"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conv) => (
                      <button
                        key={conv.conversationId}
                        onClick={() => setSelectedConversation(conv.conversationId)}
                        className={cn(
                          "w-full text-left p-4 transition-colors hover-elevate",
                          selectedConversation === conv.conversationId && "bg-muted"
                        )}
                        data-testid={`conversation-${conv.conversationId}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conv.conversationId.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate">
                                {conv.conversationId}
                              </p>
                              {conv.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.lastMessageAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message View */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    {selectedConversation ? `Chat: ${selectedConversation}` : 'Select a conversation'}
                  </CardTitle>
                </div>
                {selectedConversation && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowTemplateBuilder(!showTemplateBuilder)}
                      className="gap-2"
                      data-testid="button-toggle-templates"
                    >
                      <Zap className="h-4 w-4" />
                      Templates
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-4">
                  {/* Message History */}
                  <ScrollArea className="h-[350px] border rounded-lg p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : !messagesData?.messages || messagesData.messages.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messagesData.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              msg.isFromPage ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-4 py-2",
                                msg.isFromPage
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className={cn(
                                "text-xs mt-1",
                                msg.isFromPage ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {new Date(msg.sentAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Template Builder */}
                  {showTemplateBuilder && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Message Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Quick Replies */}
                        <div className="space-y-2">
                          <Label>Quick Replies</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Title"
                              value={newQuickReply.title}
                              onChange={(e) => setNewQuickReply({ ...newQuickReply, title: e.target.value })}
                              data-testid="input-quick-reply-title"
                            />
                            <Input
                              placeholder="Payload"
                              value={newQuickReply.payload}
                              onChange={(e) => setNewQuickReply({ ...newQuickReply, payload: e.target.value })}
                              data-testid="input-quick-reply-payload"
                            />
                            <Button size="sm" onClick={handleAddQuickReply} data-testid="button-add-quick-reply">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {quickReplies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {quickReplies.map((qr, i) => (
                                <Badge key={i} variant="secondary" className="gap-2">
                                  {qr.title}
                                  <button
                                    onClick={() => setQuickReplies(quickReplies.filter((_, idx) => idx !== i))}
                                    className="hover-elevate"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="space-y-2">
                          <Label>Buttons</Label>
                          <div className="space-y-2">
                            <Select
                              value={newButton.type}
                              onValueChange={(value: 'web_url' | 'postback') =>
                                setNewButton({ ...newButton, type: value })
                              }
                            >
                              <SelectTrigger data-testid="select-button-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web_url">Web URL</SelectItem>
                                <SelectItem value="postback">Postback</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Button Title"
                                value={newButton.title}
                                onChange={(e) => setNewButton({ ...newButton, title: e.target.value })}
                                data-testid="input-button-title"
                              />
                              {newButton.type === 'web_url' ? (
                                <Input
                                  placeholder="URL"
                                  value={newButton.url || ''}
                                  onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
                                  data-testid="input-button-url"
                                />
                              ) : (
                                <Input
                                  placeholder="Payload"
                                  value={newButton.payload || ''}
                                  onChange={(e) => setNewButton({ ...newButton, payload: e.target.value })}
                                  data-testid="input-button-payload"
                                />
                              )}
                              <Button size="sm" onClick={handleAddButton} data-testid="button-add-button">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {buttons.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {buttons.map((btn, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                  <span className="text-sm flex-1">{btn.title}</span>
                                  {btn.type === 'web_url' && (
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <button
                                    onClick={() => setButtons(buttons.filter((_, idx) => idx !== i))}
                                    className="hover-elevate"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={handleSendTemplate}
                          disabled={sendTemplateMutation.isPending || (!messageText && quickReplies.length === 0 && buttons.length === 0)}
                          className="w-full gap-2"
                          data-testid="button-send-template"
                        >
                          {sendTemplateMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending Template...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Send Template Message
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Message Composer */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!showTemplateBuilder) {
                            handleSendMessage();
                          }
                        }
                      }}
                      data-testid="textarea-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="gap-2"
                      data-testid="button-send-message"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Selector Dialog */}
      <Dialog open={showContactSelector} onOpenChange={setShowContactSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Contact</DialogTitle>
            <DialogDescription>
              Choose a contact to start a new conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="input-search-contacts"
              />
            </div>

            <ScrollArea className="h-[400px]">
              {contactsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No contacts found. Contacts appear here after they message your page.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectContact(contact.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover-elevate text-left"
                      data-testid={`contact-${contact.id}`}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          PSID: {contact.id}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
