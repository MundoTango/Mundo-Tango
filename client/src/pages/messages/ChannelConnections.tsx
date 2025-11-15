import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, RefreshCw, Unplug, CheckCircle2, XCircle } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const channelConfig = {
  mt: {
    icon: MessageCircle,
    label: "MT Messages",
    description: "Internal Mundo Tango messaging",
    color: "hsl(var(--primary))",
    canDisconnect: false,
  },
  gmail: {
    icon: Mail,
    label: "Gmail",
    description: "Connect your Gmail account to manage emails",
    color: "hsl(0, 72%, 51%)",
    canDisconnect: true,
    oauthUrl: "/api/messages/channels/gmail/connect",
  },
  facebook: {
    icon: SiFacebook,
    label: "Facebook Messenger",
    description: "Connect Facebook to message your contacts",
    color: "hsl(221, 44%, 41%)",
    canDisconnect: true,
    oauthUrl: "/api/messages/channels/facebook/connect",
  },
  instagram: {
    icon: SiInstagram,
    label: "Instagram Direct",
    description: "Manage Instagram direct messages",
    color: "hsl(329, 70%, 58%)",
    canDisconnect: true,
    oauthUrl: "/api/messages/channels/instagram/connect",
  },
  whatsapp: {
    icon: SiWhatsapp,
    label: "WhatsApp",
    description: "Connect WhatsApp Business account",
    color: "hsl(142, 70%, 49%)",
    canDisconnect: true,
    oauthUrl: "/api/messages/channels/whatsapp/connect",
  },
};

export default function ChannelConnections() {
  const { toast } = useToast();
  const [disconnectChannel, setDisconnectChannel] = useState<string | null>(null);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["/api/messages/channels"],
  });

  const connectMutation = useMutation({
    mutationFn: async (channel: string) => {
      const config = channelConfig[channel as keyof typeof channelConfig];
      if (config.oauthUrl) {
        window.location.href = config.oauthUrl;
        return;
      }
      return apiRequest("POST", "/api/messages/channels/connect", { channel });
    },
    onSuccess: () => {
      toast({
        title: "Channel connected",
        description: "Your channel has been connected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/channels"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to connect channel",
        description: error.message,
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (channel: string) => {
      return apiRequest("DELETE", `/api/messages/channels/${channel}`);
    },
    onSuccess: () => {
      toast({
        title: "Channel disconnected",
        description: "Your channel has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/channels"] });
      setDisconnectChannel(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to disconnect channel",
        description: error.message,
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (channel: string) => {
      return apiRequest("POST", `/api/messages/channels/${channel}/sync`);
    },
    onSuccess: () => {
      toast({
        title: "Sync started",
        description: "Your messages are being synced.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/channels"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to sync",
        description: error.message,
      });
    },
  });

  const getChannelConnection = (channelKey: string) => {
    return channels?.find((c: any) => c.channel === channelKey);
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Channel Connections</h1>
        <p className="text-muted-foreground">
          Connect and manage your messaging channels
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading channels...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(channelConfig).map(([key, config]) => {
            const connection = getChannelConnection(key);
            const isConnected = connection?.isActive;
            const Icon = config.icon;

            return (
              <Card key={key} data-testid={`channel-card-${key}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: config.color }} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {config.label}
                          {isConnected ? (
                            <Badge variant="default" className="gap-1" data-testid={`badge-status-${key}`}>
                              <CheckCircle2 className="h-3 w-3" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1" data-testid={`badge-status-${key}`}>
                              <XCircle className="h-3 w-3" />
                              Not Connected
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {isConnected ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Account</div>
                          <div className="font-medium" data-testid={`text-account-${key}`}>
                            {connection.accountName || connection.accountId}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Sync</div>
                          <div className="font-medium" data-testid={`text-lastsync-${key}`}>
                            {connection.lastSyncAt
                              ? format(new Date(connection.lastSyncAt), "MMM d, h:mm a")
                              : "Never"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncMutation.mutate(key)}
                          disabled={syncMutation.isPending}
                          data-testid={`button-sync-${key}`}
                        >
                          <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                          Sync Now
                        </Button>
                        
                        {config.canDisconnect && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDisconnectChannel(key)}
                            data-testid={`button-disconnect-${key}`}
                          >
                            <Unplug className="mr-2 h-4 w-4" />
                            Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Button
                        onClick={() => connectMutation.mutate(key)}
                        disabled={connectMutation.isPending}
                        data-testid={`button-connect-${key}`}
                      >
                        Connect {config.label}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!disconnectChannel} onOpenChange={() => setDisconnectChannel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this channel? You will no longer receive messages from this source.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-disconnect">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnectChannel && disconnectMutation.mutate(disconnectChannel)}
              data-testid="button-confirm-disconnect"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
